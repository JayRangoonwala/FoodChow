"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { useServiceStore } from "@/store/serviceStore";
import { toast } from "sonner";

import { format, parse, isSameDay, isEqual, isBefore } from "date-fns";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TableBookingForm from "../Forms/table-booking-form";
import { MoveLeft } from "lucide-react";

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

export default function BookTableModal({
  countryCodes,
  parsedShopData,
}: {
  parsedShopData: any;
  countryCodes: any;
}) {
  const { service } = useServiceStore();
  const [activeTab, setActiveTab] = useState(1);
  const [selectedDay, setSelectedDay] = useState<any>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<any>(null);
  const [selectedAvailableSlot, setSelectedAvailableSlot] = useState<any>(null);
  const [selectedGuest, setSelectedGuest] = useState<any>(null);
  const [timeSlots, setSelectedTimeSlots] = useState<string[]>([]);
  const [generatedSlots, setGeneratedSlots] = useState<string[]>([]);
  const [days, setDays] = useState<DayObject[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [selectionData, setSelectionData] = useState<any>();

  useEffect(() => {
    setDays(getNext7Days());
  }, []);

  const selectTimeSlotForDate = (date: Date) => {
    const dayName = format(date, "EEE");
    const timing = parsedShopData.FoodShopTimingList.find(
      (d: any) => d.dayname === dayName
    );

    if (!timing || timing.closeDay === 1) {
      setSelectedTimeSlots(["Closed"]);
      return;
    }

    if (timing.HrsDay === 1) {
      setSelectedTimeSlots(["Open 24 hours"]);
      return;
    }

    const slotRanges: string[] = [];
    if (timing.openTime1 && timing.closeTime1)
      slotRanges.push(`${timing.openTime1} - ${timing.closeTime1}`);
    if (timing.openTime2 && timing.closeTime2)
      slotRanges.push(`${timing.openTime2} - ${timing.closeTime2}`);

    setSelectedTimeSlots(slotRanges);
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

  const tableBookingProceed = () => {
    if (!selectedDay) {
      toast.error("Please select a date");
      return;
    }

    if (!selectedTimeSlot) {
      toast.error("Please select a time slot");
      return;
    }

    if (!selectedAvailableSlot) {
      toast.error("Please select an available slot");
      return;
    }

    if (!selectedGuest) {
      toast.error("Please select the number of guests");
      return;
    }

    setActiveTab(2);
    setSelectionData({
      date: selectedDay,
      timeSlot: selectedTimeSlot,
      availableSlot: selectedAvailableSlot,
      guests: selectedGuest,
      shop_id: parsedShopData.ShopId,
      shop_name: parsedShopData.ShopName,
      shop_owner_mail: parsedShopData.ShopOwenerEmail,
    });
  };

  if (service) {
    return;
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant={"outline"}>Book Now</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="space-x-2">
            {activeTab != 1 && (
              <Button
                variant={"outline"}
                onClick={() => {
                  setActiveTab(1);
                }}
              >
                <MoveLeft />
              </Button>
            )}
            <span>Book a table</span>
          </DialogTitle>
        </DialogHeader>
        <div className="w-full flex flex-col gap-4 items-center">
          {activeTab == 1 ? (
            <>
              <h3 className="text-lg font-semibold text-center">
                Select date & time
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full border rounded-md p-6">
                <div className="w-full *:w-full">
                  <label>Select Date</label>
                  <Select
                    value={selectedDay || ""}
                    onValueChange={(value) => {
                      setSelectedDay(value);
                      setSelectedTimeSlot(null);
                      selectTimeSlotForDate(
                        parse(value, "dd/MM/yyyy", new Date())
                      );
                      generateSlotsForDate(
                        parse(value, "dd/MM/yyyy", new Date())
                      );
                    }}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select date" />
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
                  <label>Select Time Slot</label>
                  <Select
                    value={selectedTimeSlot || ""}
                    onValueChange={(value) => {
                      setSelectedTimeSlot(value);
                      setSelectedAvailableSlot(null);
                    }}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select time slot" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedDay &&
                        timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <h3 className="text-lg font-semibold">
                Select slots & no. of guests
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full border rounded-md p-6">
                <div className="w-full *:w-full ">
                  <label>Available slot</label>
                  <Select
                    onValueChange={(value) => {
                      setSelectedAvailableSlot(value);
                      setSelectedGuest(null);
                    }}
                    value={selectedAvailableSlot || ""}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select available slot" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedTimeSlot &&
                        generatedSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full *:w-full">
                  <label>No Of Guests</label>
                  <Select
                    value={selectedGuest || ""}
                    onValueChange={setSelectedGuest}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select no. of guests" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedAvailableSlot &&
                        Array.from({ length: 10 }, (_, i) => i + 1).map(
                          (number) => (
                            <SelectItem key={number} value={String(number)}>
                              {number}
                            </SelectItem>
                          )
                        )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          ) : (
            <div className="w-full">
              <div className="*:flex *:border *:rounded-md *:p-4 *:my-2 *:justify-between">
                <p>
                  <span>Selected Date:</span>
                  <span>{selectedDay}</span>
                </p>
                <p>
                  <span>Selected Time Slot:</span>
                  <span>{selectedTimeSlot}</span>
                </p>
                <p>
                  <span>Selected Time:</span>
                  <span>{selectedAvailableSlot}</span>
                </p>
                <p>
                  <span>Selected Guest:</span>
                  <span>{selectedGuest}</span>
                </p>
              </div>
              <div className="border rounded-md p-4">
                <TableBookingForm
                  parsedCountryCodes={countryCodes}
                  selectionData={selectionData}
                  setDialogOpen={setDialogOpen}
                />
              </div>
            </div>
          )}
        </div>
        {activeTab == 1 && (
          <DialogFooter className="place-self-center">
            <Button onClick={() => tableBookingProceed()}>Proceed</Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
