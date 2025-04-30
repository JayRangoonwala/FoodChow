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

const contactFormSchema = z.object({
  country_code: z.string({
    required_error: "Please select a country",
  }),
  fullname: z
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
    .min(10)
    .max(750),
});

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronsUpDown, Loader } from "lucide-react";
import { sendQuery } from "@/lib/shopService";
import { toast } from "sonner";

export default function ContactUsForm({
  parsedCountryCodes,
}: {
  parsedCountryCodes: any;
}) {
  const [open, setOpen] = useState(false);
  const [isSendingQuery, setIsSendingQuery] = useState(false);

  const contactForm = useForm<z.infer<typeof contactFormSchema>>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      fullname: "",
      email: "",
      message: "",
    },
  });

  async function onSubmit(values: z.infer<typeof contactFormSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    const shopId = localStorage.getItem("shopId");
    setIsSendingQuery(true);
    const mobile = "+" + values.country_code + values.mobile;
    if (!phone("+" + values.country_code + values.mobile).isValid) {
      contactForm.setError("mobile", {
        message: "Invalid number",
      });
    }
    const queryObj: any = {};

    queryObj["Contact_No"] = mobile;
    queryObj["CountryCode"] = values.country_code;
    queryObj["CusQuery"] = values.message;
    queryObj["query"] = values.message;
    queryObj["Email"] = values.email;
    queryObj["Name"] = values.fullname;

    try {
      const res = await sendQuery(queryObj, shopId);

      if (res.message === "SUCCESS" && res.data === "Data Inserted") {
        contactForm.reset({
          fullname: "",
          email: "",
          message: "",
          country_code: "",
          mobile: "" as any,
        });
      }
      toast.success(
        "Your query has been sent successfully, you will soon hear from us."
      );
      setIsSendingQuery(false);
    } catch (err) {
      setIsSendingQuery(false);
      console.error("Error sending query:", err);
    }
  }

  return (
    <Form {...contactForm}>
      <form onSubmit={contactForm.handleSubmit(onSubmit)} className="space-y-2">
        <FormField
          control={contactForm.control}
          name="fullname"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fullname</FormLabel>
              <FormControl>
                <Input placeholder="Enter Your Full Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={contactForm.control}
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
            control={contactForm.control}
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
                                contactForm.setValue("country_code", item.code);
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
            control={contactForm.control}
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
          control={contactForm.control}
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
