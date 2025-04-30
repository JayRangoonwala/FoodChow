"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BadgeAlert, MoveLeft } from "lucide-react";
import ServicePickupLogo from "../Svgs/service-pickup";
import DineInLogo from "../Svgs/dinein";
import DeliveryLogo from "../Svgs/delivery";
import { toast } from "sonner";
import { fetchOrderingMethod } from "@/lib/shopService";
import { useServiceStore } from "@/store/serviceStore";
import { format, parse, isSameDay, isEqual, isBefore } from "date-fns";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useShopDataStore } from "@/store/shopDataStore";
import { useToggleModalStore } from "@/store/toggleModalStore";
import { useCartStore } from "@/store/cartStore";

const steps = [
  "choose_service",
  "choose_order_time",
  "select_table",
  "later_time",
  "select_address",
] as const;
type Step = (typeof steps)[number];

type DayObject = {
  Date: string;
  Day: string;
};

const getNext7Days = (): DayObject[] => {
  const days: DayObject[] = [];
  const currentDate = new Date();

  for (let i = 0; i < 7; i++) {
    const nextDay = new Date();
    nextDay.setDate(currentDate.getDate() + i);

    const dayOfWeek = new Intl.DateTimeFormat("en-US", {
      weekday: "short",
    }).format(nextDay);
    const day = new Intl.DateTimeFormat("en-GB").format(nextDay); // dd/MM/yyyy

    days.push({ Date: day, Day: dayOfWeek });
  }

  return days;
};

const services = [
  {
    type: "Take Away",
    label: "Pickup",
    Logo: ServicePickupLogo,
  },
  {
    type: "Dine In",
    label: "Dine-In",
    Logo: DineInLogo,
  },
  {
    type: "Home Delivery",
    label: "Delivery",
    Logo: DeliveryLogo,
  },
];

export default function ChooseServiceModal({
  shopStatus,
  parsedShopData,
}: {
  shopStatus: string;
  parsedShopData: any;
}) {
  const { service: storeService, setService: setServiceStore } =
    useServiceStore();
  const { setCartCleared } = useCartStore();

  const { serviceModalOpen, setServiceModalOpen } = useToggleModalStore();

  const {
    setShopStatus,
    shopStatus: storeShopStatus,
    setShopData,
  } = useShopDataStore();

  const [parsedOrderMethod, setParsedOrderMethod] = useState([]);
  const [service, setService] = useState<any>();
  const [activeStep, setActiveStep] = useState<Step>("choose_service");
  const [selectedTable, setSelectedTable] = useState<string | null>();
  const [open, setOpen] = useState(false);

  const [days, setDays] = useState<DayObject[]>([]);
  const [selectedDay, setSelectedDay] = useState<any>(null);
  const [selectedTime, setSelectedTime] = useState<any>(null);
  const [generatedSlots, setGeneratedSlots] = useState<string[]>([]);

  useEffect(() => {
    if (serviceModalOpen) {
      setOpen(true);
      setServiceModalOpen(false);
    }
  }, [serviceModalOpen]);

  useEffect(() => {
    const orderMethod = localStorage.getItem("orderMethod")
      ? JSON.parse(localStorage.getItem("orderMethod")!)
      : undefined;
    setServiceStore(orderMethod);
    setService(orderMethod);

    setShopStatus(shopStatus);
    setShopData(parsedShopData);

    setDays(getNext7Days());

    (async () => {
      try {
        const shopId = localStorage.getItem("shopId");
        const res = await fetchOrderingMethod(shopId);
        if (res.data && res.data != "" && res.message === "SUCCESS") {
          const parsedData = JSON.parse(res.data);
          setParsedOrderMethod(parsedData);

          // if (
          //   !["final-checkout", "order-status"]x.some((path) =>
          //     pathname.includes(path)
          //   ) &&
          //   !orderMethod
          // ) {
          //   setOpen(true);
          // }
        }
      } catch (err) {
        toast.error("Error fetching order method");
      }
    })();
  }, []);

  const next = (type: any, time?: string) => {
    if (time === "later") {
      setActiveStep("later_time");
      return;
    }
    if (type.toLowerCase().replaceAll(" ", "") === "homedelivery") {
      setActiveStep("select_address");
      return;
    } else if (type.toLowerCase().replaceAll(" ", "") === "dinein") {
      setActiveStep("select_table");
      return;
    } else {
      setActiveStep("choose_order_time");
    }
  };

  const previous = () => {
    // If we're on choose_order_time, go back based on service type
    if (activeStep === "choose_order_time") {
      if (service?.method_name.toLowerCase() === "dine in") {
        setActiveStep("select_table");
        return;
      }
      if (service?.method_name.toLowerCase() === "home delivery") {
        setActiveStep("select_address");
        return;
      }
      setActiveStep("choose_service");
      return;
    }

    // If on select_table or select_address, go back to choose_service
    if (activeStep === "select_table" || activeStep === "select_address") {
      setActiveStep("choose_service");
      return;
    }

    // Reset service if we're on the first step
    if (activeStep === "choose_service") {
      setService(undefined);
      return;
    }

    if (activeStep === "later_time") {
      setActiveStep("choose_order_time");
      return;
    }
  };

  const serviceNow = () => {
    const formattedDate = format(new Date(), "dd MMM yyyy h:mm a");
    (service as any)["now"] = formattedDate;
    const selectedService = service!["custom_label_method"];

    localStorage.setItem("selectedService", JSON.stringify(selectedService));
    localStorage.setItem("orderMethod", JSON.stringify(service));
    localStorage.setItem("selectedOption", JSON.stringify("now"));
    localStorage.setItem(
      "selectedTable",
      selectedTable ? JSON.stringify(selectedTable) : ""
    );
    setServiceStore(service);
    setOpen(false);
    setActiveStep("choose_service");
  };

  const serviceLater = () => {
    // Parse the selected date (from dd/MM/yyyy format)
    if (!selectedDay) {
      toast.error("Please select a date");
      return;
    }

    if (!selectedTime) {
      toast.error("Please select a time");
      return;
    }

    const selectedDate = parse(selectedDay, "dd/MM/yyyy", new Date());

    // Parse the selected time (from h:mm a format)
    const [timeStr, period] = selectedTime.split(" ");
    const [hours, minutes] = timeStr.split(":").map(Number);

    // Convert to 24-hour format
    let hours24 = hours;
    if (period.toLowerCase() === "pm" && hours !== 12) {
      hours24 = hours + 12;
    } else if (period.toLowerCase() === "am" && hours === 12) {
      hours24 = 0;
    }

    // Set the time on the selected date
    selectedDate.setHours(hours24, minutes, 0, 0);

    // Format the final datetime
    const formattedDate = format(selectedDate, "dd MMM yyyy h:mm a");
    (service as any)["takeawayPickupLaterDate"] = formattedDate;
    const selectedService = service!["custom_label_method"];

    localStorage.setItem("selectedService", JSON.stringify(selectedService));
    localStorage.setItem("orderMethod", JSON.stringify(service));
    localStorage.setItem("selectedOption", JSON.stringify("later"));
    localStorage.setItem(
      "selectedTable",
      selectedTable ? JSON.stringify(selectedTable) : ""
    );
    setServiceStore(service);
    setOpen(false);
    setActiveStep("choose_service");
    setSelectedDay(null);
    selectedTime(null);
  };

  const resetService = () => {
    setService(null);
    localStorage.removeItem("orderMethod");
    localStorage.removeItem("selectedService");
    localStorage.removeItem("selectedOption");
    localStorage.removeItem("selectedTable");
    setOpen(true);
    setCartCleared(true);
    setServiceStore(null);
  };

  const generateSlotsForDate = (date: Date) => {
    const dayName = format(date, "EEE");
    const timing = parsedShopData.FoodShopTimingList.find(
      (d: any) => d.dayname === dayName
    );

    // Check if closed or no timing found
    if (!timing || timing.closeDay === 1) {
      setGeneratedSlots(["Closed"]);
      return;
    }

    // Handle 24-hour operation
    if (timing.HrsDay === 1) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 30, 0, 0);

      // If today, start from current time
      const now = new Date();
      const isToday = isSameDay(now, date);
      const startTime = isToday ? now : start;

      const slots = generateTimeSlots(startTime, end, 30);
      setGeneratedSlots(slots);
      return;
    }

    // Handle regular operation hours
    const slotRanges: [string, string][] = [];
    if (timing.openTime1 && timing.closeTime1)
      slotRanges.push([timing.openTime1, timing.closeTime1]);
    if (timing.openTime2 && timing.closeTime2)
      slotRanges.push([timing.openTime2, timing.closeTime2]);

    let allSlots: string[] = [];
    const now = new Date();
    const isToday = isSameDay(now, date);

    for (const [startStr, endStr] of slotRanges) {
      // Convert opening and closing times to 24-hour Date objects
      const startTime = convertTo24Hour(startStr, date);
      const endTime = convertTo24Hour(endStr, date);

      if (!startTime || !endTime) continue;

      // Determine the effective start time based on whether it's today
      let effectiveStartTime: Date;

      if (isToday) {
        // If current time is before opening time, use opening time
        if (isBefore(now, startTime)) {
          effectiveStartTime = startTime;
        }
        // If current time is after opening but before closing, use current time
        else if (isBefore(now, endTime)) {
          effectiveStartTime = now;
        }
        // If current time is after closing, no slots available for this range
        else {
          continue;
        }
      } else {
        // Not today, just use the regular opening time
        effectiveStartTime = startTime;
      }

      // Calculate the last valid slot time (30 min before closing)
      const lastSlotTime = new Date(endTime);
      lastSlotTime.setMinutes(lastSlotTime.getMinutes() - 30);

      // Only generate slots if there's still time available
      if (
        isBefore(effectiveStartTime, lastSlotTime) ||
        isEqual(effectiveStartTime, lastSlotTime)
      ) {
        const slots = generateTimeSlots(effectiveStartTime, lastSlotTime, 30);
        allSlots = [...allSlots, ...slots];
      }
    }

    setGeneratedSlots(allSlots.length > 0 ? allSlots : ["No slots available"]);
  };

  const generateTimeSlots = (
    startTime: Date,
    endTime: Date,
    interval: number
  ): string[] => {
    const slots: string[] = [];
    const currentTime = new Date(startTime);

    while (currentTime <= endTime) {
      // Convert the 24-hour time back to 12-hour format for display
      const formattedTime = format(currentTime, "h:mm a");
      slots.push(formattedTime);
      currentTime.setMinutes(currentTime.getMinutes() + interval);
    }

    return slots;
  };

  const convertTo24Hour = (time12h: string, date: Date): Date => {
    // Parse the 12-hour time (e.g., "9:00 AM" or "2:30 PM")
    const [timeStr, period] = time12h.split(" ");
    const [hours, minutes] = timeStr.split(":").map(Number);

    // Convert to 24-hour format
    let hours24 = hours;
    if (period === "pm" && hours !== 12) {
      hours24 = hours + 12;
    } else if (period === "am" && hours === 12) {
      hours24 = 0;
    }

    // Create a new date object with the correct time
    const result = new Date(date);
    result.setHours(hours24, minutes, 0, 0);
    return result;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger onClick={resetService} asChild>
        {!storeService ? (
          <Button variant="outline" onClick={resetService}>
            Choose Service
          </Button>
        ) : (
          <div className="flex">
            <Button
              variant="outline"
              className="rounded-r-none"
              onClick={resetService}
            >
              Restart
            </Button>
            {/* Render as span to avoid nesting buttons */}
            <span className="pointer-events-none">
              <Button asChild className="rounded-l-none pointer-events-none">
                <span>{service && service.custom_label_method}</span>
              </Button>
            </span>
          </div>
        )}
      </DialogTrigger>
      <DialogContent className="pb-0">
        {shopStatus.toLowerCase().includes("open") ? (
          <>
            <DialogHeader>
              <DialogTitle className="space-x-2 text-xl">
                {activeStep !== "choose_service" && (
                  <Button
                    variant={"outline"}
                    onClick={() => {
                      previous();
                    }}
                  >
                    <MoveLeft />
                  </Button>
                )}
                <span>
                  {activeStep === "choose_service"
                    ? "Choose a service"
                    : service
                    ? service!["method_name"]
                    : "Choose a service"}
                </span>
              </DialogTitle>
            </DialogHeader>
            <Tabs
              value={activeStep}
              onValueChange={(val) => {
                setActiveStep(val.toLowerCase() as Step);
              }}
            >
              {/* Hidden Tabs List */}
              <TabsList className="hidden">
                {steps.map((s) => (
                  <TabsTrigger key={s} value={s}>
                    {s}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="choose_service">
                <div className="p-4 flex justify-evenly items-center rounded-lg">
                  {services.map(({ type, label, Logo }) => {
                    const isEnabled = parsedOrderMethod.some(
                      (item: any) =>
                        item.method_name.toLowerCase() === type.toLowerCase() &&
                        item.method_status === 1
                    );

                    if (!isEnabled) return null;

                    const item = parsedOrderMethod.find(
                      (item: any) =>
                        item.method_name.toLowerCase() === type.toLowerCase()
                    );

                    return (
                      <Button
                        key={type}
                        variant="ghost"
                        className="flex flex-col gap-2 group h-full"
                        onClick={() => {
                          next(type);
                          setService(item!);
                        }}
                      >
                        <Logo className="fill-primary !h-16 !w-16 group-hover:fill-white" />
                        <span className="text-black group-hover:text-white">
                          {label}
                        </span>
                      </Button>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent
                value="select_table"
                className="justify-items-center"
              >
                Select table no
                {parsedShopData &&
                  parsedShopData.FoodShopDineInTableList &&
                  parsedShopData.FoodShopDineInTableList.length > 0 && (
                    <div className="grid grid-cols-3 md:grid-cols-5 gap-4 p-4">
                      {parsedShopData.FoodShopDineInTableList.map(
                        (table: any, index: number) => (
                          <Button
                            key={index}
                            variant="outline"
                            onClick={() => {
                              setSelectedTable(table.table_no);
                              next("");
                            }}
                          >
                            {table.table_no}
                          </Button>
                        )
                      )}
                    </div>
                  )}
              </TabsContent>

              <TabsContent value="choose_order_time">
                <div className="space-y-4 p-4 rounded-lg">
                  <h2 className="text-xl font-semibold justify-self-center">
                    When would you like your order?
                  </h2>
                  <div className="justify-self-center space-x-2">
                    <Button variant={"outline"} onClick={serviceNow}>
                      Now
                    </Button>
                    {service?.["preorder_status"] === 1 && (
                      <Button
                        variant={"outline"}
                        onClick={() => next("", "later")}
                      >
                        Later
                      </Button>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="later_time">
                <div className="w-full flex flex-col gap-4 items-center">
                  <h3 className="text-lg font-semibold">
                    Select order date & time
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full">
                    <div className="w-full *:w-full">
                      <label>Select Date</label>
                      <Select
                        onValueChange={(value) => {
                          setSelectedDay(value);
                          setSelectedTime(null);
                          generateSlotsForDate(
                            parse(value, "dd/MM/yyyy", new Date())
                          );
                        }}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select order date" />
                        </SelectTrigger>
                        <SelectContent>
                          {days.map((day) => (
                            <SelectItem key={day.Date} value={day.Date}>
                              {day.Date}, {day.Day}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-full *:w-full">
                      <label>Select Time</label>
                      <Select
                        onValueChange={(value) => {
                          setSelectedTime(value);
                        }}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select order date" />
                        </SelectTrigger>
                        <SelectContent>
                          {generatedSlots.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button onClick={serviceLater}>Start Ordering</Button>
                </div>
              </TabsContent>

              <TabsContent value="select_address">
                Map will be displayed here
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex gap-2 items-center">
                <BadgeAlert />
                <span>Restaurant is closed!</span>
              </DialogTitle>
            </DialogHeader>
            <div className="justify-self-center p-4">
              <p className="text-muted-foreground">
                We are currently closed. Please check back later.
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
