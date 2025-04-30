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

  return (
    <Card>
      <CardContent>
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
