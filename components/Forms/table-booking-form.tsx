"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import { phone } from "phone";

const tableBookingFormSchema = z.object({
  country_code: z.string({
    required_error: "Please select a country",
  }),
  firstname: z
    .string({
      required_error: "Fullname is required",
    })
    .min(2, {
      message: "Fullname must not be empty",
    })
    .max(50, {
      message: "Fullname must not exceed 50 characters",
    }),
  lastname: z
    .string({
      required_error: "Fullname is required",
    })
    .min(2, {
      message: "Fullname must not be empty",
    })
    .max(50, {
      message: "Fullname must not exceed 50 characters",
    }),
  email: z
    .string({
      required_error: "Email is required",
    })
    .email(),
  mobile: z.coerce
    .number({
      required_error: "Mobile Number is required",
    })
    .refine((val) => !isNaN(val), {
      message: "Mobile Number is required",
    }),
  message: z
    .string({
      required_error: "Message is required",
      message: "Message is required",
    })
    .min(0)
    .max(750),
});

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronsUpDown, Loader, Loader2 } from "lucide-react";
import { sendBookTableQuery } from "@/lib/shopService";
import { toast } from "sonner";

export default function TableBookingForm({
  parsedCountryCodes,
  selectionData,
  setDialogOpen,
}: {
  parsedCountryCodes: any;
  selectionData: any;
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [open, setOpen] = useState(false);
  const [isSendingQuery, setIsSendingQuery] = useState(false);

  const tblBookingForm = useForm<z.infer<typeof tableBookingFormSchema>>({
    resolver: zodResolver(tableBookingFormSchema),
    defaultValues: {
      firstname: "",
      lastname: "",
      email: "",
      message: "",
    },
    disabled: isSendingQuery,
  });

  async function onSubmit(values: z.infer<typeof tableBookingFormSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    setIsSendingQuery(true);
    const mobile = "+" + values.country_code + values.mobile;
    if (!phone("+" + values.country_code + values.mobile).isValid) {
      tblBookingForm.setError("mobile", {
        message: "Invalid number",
      });
    }
    const queryObj: any = {};

    queryObj["fname"] = values.firstname;
    queryObj["lname"] = values.lastname;
    queryObj["mo"] = mobile;
    queryObj["email"] = values.email;
    queryObj["description"] = values.message;
    queryObj["noguest"] = selectionData.guests;
    queryObj["timeslot"] = selectionData.timeSlot;
    queryObj["finaltime"] = selectionData.availableSlot;
    queryObj["ReservationDate"] = selectionData.date;
    queryObj["shop_id"] = selectionData.shop_id;
    queryObj["ShopName"] = selectionData.shop_name;
    queryObj["ownerEmail"] = selectionData.shop_owner_mail;

    try {
      const shopId = localStorage.getItem("shopId");
      const res = await sendBookTableQuery(queryObj, shopId);

      if (res.message === "SUCCESS" && res.data === "Insert Data Successs") {
        tblBookingForm.reset({
          firstname: "",
          lastname: "",
          email: "",
          message: "",
          country_code: "",
          mobile: "" as any,
        });
      }

      setDialogOpen(false);
      setIsSendingQuery(false);

      toast.success(
        "Your booking request has been sent successfully. We will contact you soon."
      );
    } catch (err) {
      setIsSendingQuery(false);
      console.error("Error sending query:", err);
    }
  }

  return (
    <Form {...tblBookingForm}>
      <form
        onSubmit={tblBookingForm.handleSubmit(onSubmit)}
        className="space-y-2"
      >
        <div className="flex flex-col md:flex-row gap-2 *:md:w-1/2 *:w-full">
          <FormField
            control={tblBookingForm.control}
            name="firstname"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Firstname</FormLabel>
                <FormControl>
                  <Input placeholder="Enter Your First Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={tblBookingForm.control}
            name="lastname"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lastname</FormLabel>
                <FormControl>
                  <Input placeholder="Enter Your Last Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={tblBookingForm.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Enter Your eMail Address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-col md:flex-row gap-2">
          <FormField
            control={tblBookingForm.control}
            name="country_code"
            render={({ field }) => (
              <FormItem className="flex flex-col w-full md:w-[40%]">
                <FormLabel>Country</FormLabel>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "justify-between border-0 overflow-hidden text-ellipsis",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value
                          ? "+" +
                            parsedCountryCodes.find(
                              (item: any) => item.code === field.value
                            )?.code +
                            " " +
                            parsedCountryCodes.find(
                              (item: any) => item.code === field.value
                            )?.country
                          : "Select country"}
                        <ChevronsUpDown className="opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="p-0">
                    <Command>
                      <CommandInput
                        placeholder="Search country..."
                        className="h-9"
                      />
                      <CommandList>
                        <CommandEmpty>No country found.</CommandEmpty>
                        <CommandGroup>
                          {parsedCountryCodes.map((item: any) => (
                            <CommandItem
                              value={item.code + item.country}
                              key={item.country}
                              onSelect={() => {
                                tblBookingForm.setValue(
                                  "country_code",
                                  item.code
                                );
                                setOpen(false);
                              }}
                            >
                              +{item.code} {item.country}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={tblBookingForm.control}
            name="mobile"
            render={({ field }) => (
              <FormItem className="flex-5/6">
                <FormLabel>Mobile Number</FormLabel>
                <FormControl>
                  <Input placeholder="Enter Your Mobile Number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={tblBookingForm.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter Your Message" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isSendingQuery}>
          {isSendingQuery ? (
            <>
              <Loader className="animate-spin" />
              <span>Sending...</span>
            </>
          ) : (
            "Submit"
          )}
        </Button>
      </form>
    </Form>
  );
}
