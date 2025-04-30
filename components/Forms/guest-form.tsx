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

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronsUpDown } from "lucide-react";
import { Checkbox } from "../ui/checkbox";
import { useCheckoutStore } from "@/store/checkoutStore";

const guestFormSchema = z.object({
  country_code: z
    .string({
      required_error: "Please select a country",
    })
    .optional(),
  firstname: z
    .string({
      required_error: "Firstname is required",
    })
    .optional(),
  lastname: z
    .string({
      required_error: "Lastname is required",
    })
    .optional(),
  email: z
    .string()
    .email({ message: "Invalid email address" })
    .or(z.literal(""))
    .optional(),
  mobile: z.coerce
    .number({
      required_error: "Mobile Number is required",
    })
    .nullable()
    .optional(),
  term: z.boolean().default(true).optional(),
});

const emailValidator = z.string().email();

export default function GuestForm({
  parsedCountryCodes,
  parsedUserOptions,
}: {
  parsedCountryCodes: any;
  parsedUserOptions: any;
}) {
  const [open, setOpen] = useState(false);
  const [isSendingQuery, setIsSendingQuery] = useState(false);

  const [firstname, setFirstname] = useState<any>(
    () => localStorage.getItem("xFirstName") || ""
  );
  const [lastname, setLastname] = useState<any>(
    () => localStorage.getItem("xLastName") || ""
  );
  const [email, setEmail] = useState<any>(
    () => localStorage.getItem("xEmail") || ""
  );
  const [countryCode, setCountryCode] = useState<any>(
    () => localStorage.getItem("xCountryCode") || ""
  );
  const [mobile, setMobile] = useState<any>(
    () => localStorage.getItem("xMobile") || ""
  );

  const { setGstDetailsSaved } = useCheckoutStore();

  const guestForm = useForm<z.infer<typeof guestFormSchema>>({
    resolver: zodResolver(guestFormSchema),
    defaultValues: {
      firstname: "",
      lastname: "",
      email: "",
      term: true,
    },
    disabled: isSendingQuery,
  });

  async function onSubmit(values: z.infer<typeof guestFormSchema>) {
    guestForm.clearErrors();

    let hasErrors = false;
    if (parsedUserOptions?.first_name == "1" && !firstname) {
      guestForm.setError("firstname", {
        type: "manual",
        message: "Required Firstname",
      });
      hasErrors = true;
    }
    if (parsedUserOptions?.last_name == "1" && !lastname) {
      guestForm.setError("lastname", {
        type: "manual",
        message: "Required lastname",
      });
      hasErrors = true;
    }
    if (parsedUserOptions?.email === "1" && !email) {
      const result = emailValidator.safeParse(values.email);
      if (!result.success) {
        guestForm.setError("email", {
          type: "manual",
          message: result.error.issues[0].message,
        });
        hasErrors = true;
      }
    }

    if (parsedUserOptions?.phone_no == "1" && !mobile) {
      guestForm.setError("mobile", {
        type: "manual",
        message: "Required email",
      });
      hasErrors = true;
    }
    if (parsedUserOptions?.phone_no == "1" && !countryCode) {
      guestForm.setError("country_code", {
        type: "manual",
        message: "Required country code",
      });
      hasErrors = true;
    }

    if (!phone("+" + countryCode + mobile).isValid) {
      guestForm.setError("mobile", {
        message: "Invalid number",
      });
      hasErrors = true;
    }

    if (hasErrors) {
      setGstDetailsSaved(0);
      return;
    }

    localStorage.setItem("xFirstName", firstname || "");
    localStorage.setItem("xLastName", lastname || "");
    localStorage.setItem("xEmail", email || "");
    localStorage.setItem("xMobile", mobile || "");
    localStorage.setItem("xCountryCode", countryCode || "");

    setGstDetailsSaved();
  }

  return (
    <Form {...guestForm}>
      <form onSubmit={guestForm.handleSubmit(onSubmit)} className="space-y-2">
        <div className="flex flex-col lg:flex-row gap-2 *:w-full *:lg:w-1/2">
          <FormField
            control={guestForm.control}
            name="firstname"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Firstname</FormLabel>
                <FormControl>
                  <Input
                    placeholder={`Enter Your First Name ${
                      parsedUserOptions?.first_name == "0" ? "(Optional)" : ""
                    }`}
                    {...field}
                    value={firstname}
                    onChange={(e) => {
                      setFirstname(e.target.value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={guestForm.control}
            name="lastname"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lastname</FormLabel>
                <FormControl>
                  <Input
                    placeholder={`Enter Your Last Name ${
                      parsedUserOptions?.last_name == "0" ? "(Optional)" : ""
                    }`}
                    {...field}
                    onChange={(e) => {
                      setLastname(e.target.value);
                    }}
                    value={lastname}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex gap-2 flex-col lg:flex-row *:lg:w-1/2 *:w-full">
          <FormField
            control={guestForm.control}
            name="country_code"
            render={({ field }) => (
              <FormItem className="flex flex-col ">
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
                        {countryCode
                          ? "+" +
                            parsedCountryCodes.find(
                              (item: any) => item.code === countryCode
                            )?.code +
                            " " +
                            parsedCountryCodes.find(
                              (item: any) => item.code === countryCode
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
                                guestForm.setValue("country_code", item.code);
                                setOpen(false);
                                setCountryCode(item.code);
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
            control={guestForm.control}
            name="mobile"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mobile Number</FormLabel>
                <FormControl>
                  <Input
                    placeholder={`Enter Your Mobile Number ${
                      parsedUserOptions?.phone_no == "0" ? "(Optional)" : ""
                    }`}
                    {...field}
                    onChange={(e) => setMobile(e.target.value)}
                    value={mobile}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={guestForm.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  placeholder={`Enter Your eMail Address ${
                    parsedUserOptions?.email == "0" ? "(Optional)" : ""
                  }`}
                  {...field}
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={guestForm.control}
          name="term"
          render={({ field }) => (
            <FormItem className="flex items-start py-2">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  You agree to be remembered on this device and to receive
                  money-off coupons & exclusive offers
                </FormLabel>
              </div>
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isSendingQuery}>
          Save
        </Button>
      </form>
    </Form>
  );
}
