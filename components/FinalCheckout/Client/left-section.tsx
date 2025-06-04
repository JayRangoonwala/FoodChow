"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "../../ui/card";
import { cn } from "@/lib/utils";
import PaymentMetod from "./payment-methods";
import GuestForm from "@/components/Forms/guest-form";
import { useCheckoutStore } from "@/store/checkoutStore";
import { Mail, PhoneCall, User } from "lucide-react";

export default function LeftSection({
  parsedCountryCodes,
  parsedUserOptions,
}: {
  parsedCountryCodes: any;
  parsedUserOptions: any;
}) {
  const [currentActive, setCurrentActive] = useState<any>("contact_form");

  const [selectedOrderType, setSelectedOrderType] = useState<any>(null);
  const [accActivated, setAccActivated] = useState<any>(null);

  const { gstDetailsSaved, setGstDetailsSaved } = useCheckoutStore();

  const [userInfo, setUserInfo] = useState<null | {
    firstName: string;
    lastName: string;
    email: string;
    mobile: string;
    countryCode: string;
  }>(null);

  useEffect(() => {
    const selectedOption = localStorage.getItem("selectedOption");
    const selectedService = localStorage.getItem("selectedService");

    if (selectedOption) {
      const parsedOption = JSON.parse(selectedOption);
      setSelectedOrderType((prev: any) => {
        return { ...prev, parsedOption };
      });
    }

    if (selectedService) {
      const parsedService = JSON.parse(selectedService);
      setSelectedOrderType((prev: any) => {
        return { ...prev, parsedService };
      });
    }
  }, []);

  useEffect(() => {
    if (gstDetailsSaved > 0) {
      setCurrentActive("payment_method");
      setAccActivated(true);
    }
  }, [gstDetailsSaved]);

  useEffect(() => {
    // Function to load userInfo from localStorage
    const loadUserInfo = () => {
      const stored = localStorage.getItem("userInfo");
      if (stored) {
        setUserInfo(JSON.parse(stored));
        setAccActivated(true);
        setCurrentActive("payment_method");
      } else {
        setUserInfo(null);
      }
    };

    // Load on mount
    loadUserInfo();

    // Listen for updates
    window.addEventListener("userInfoUpdated", loadUserInfo);

    // Cleanup
    return () => {
      window.removeEventListener("userInfoUpdated", loadUserInfo);
    };
  }, []);

  return (
    <Card>
      <CardContent>
        {userInfo && (
          <div className="border rounded-lg p-4 mb-4 bg-white flex flex-col gap-2 max-sm:text-sm">
            <div className="flex items-center gap-2  max-sm:gap-3">
              <span className="font-semibold flex items-center gap-2 flex-1">
                <User className="w-4 h-4" />
                {userInfo.firstName} {userInfo.lastName}
              </span>
              <span className="flex items-center gap-1">
                <PhoneCall className="w-4 h-4" />
                {userInfo.mobile}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span>{userInfo.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked readOnly className="mr-2" />
              <span className="text-xs">
                You agree to be remembered on this device and to receive
                money-off coupons & exclusive offers
              </span>
            </div>
          </div>
        )}
        <Accordion
          type="single"
          collapsible
          className="w-full space-y-2"
          value={currentActive}
          onValueChange={(value) => {
            setCurrentActive(value);
          }}
          defaultValue={gstDetailsSaved ? "payment_method" : "contact_form"}
        >
          {!userInfo && (
            <AccordionItem value="contact_form">
              <AccordionTrigger
                className={cn(
                  "h-3 text-lg py-8 px-3 bg-primary text- text-white *:stroke-white items-center",
                  currentActive === "contact_form" && "rounded-b-none"
                )}
              >
                CONTACT
              </AccordionTrigger>
              <AccordionContent className="border p-3 border-t-0 border-gray-300 rounded-b-md">
                {parsedUserOptions && (
                  <GuestForm
                    parsedCountryCodes={parsedCountryCodes}
                    parsedUserOptions={parsedUserOptions}
                  />
                )}
              </AccordionContent>
            </AccordionItem>
          )}
          <AccordionItem value="selected_method" disabled={!accActivated}>
            <AccordionTrigger
              className={cn(
                "h-3 text-lg py-8 px-3 bg-primary text-white *:stroke-white items-center",
                currentActive === "selected_method" && "rounded-b-none"
              )}
            >
              SELECTED ORDER TYPE: {selectedOrderType?.parsedService} (
              {selectedOrderType?.parsedOption})
            </AccordionTrigger>
          </AccordionItem>
          <AccordionItem value="payment_method" disabled={!accActivated}>
            <AccordionTrigger
              className={cn(
                "h-3 text-lg py-8 px-3 bg-primary text-white *:stroke-white items-center",
                currentActive === "payment_method" && "rounded-b-none"
              )}
            >
              PAYMENT METHOD
            </AccordionTrigger>
            <AccordionContent className="border p-3 border-t-0 border-gray-300 rounded-b-md">
              <PaymentMetod />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
