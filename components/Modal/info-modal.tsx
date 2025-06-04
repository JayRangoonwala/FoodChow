import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import InfoLogo from "../Svgs/info";
import ContactUsForm from "../Forms/contact-us-form";
import { cn } from "@/lib/utils";

export default function InfoModal({
  parsedShopData,
  countryCodes,
}: {
  parsedShopData: any;
  countryCodes: any;
}) {
  const parsedShopOpenData = parsedShopData.FoodShopTimingList;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <InfoLogo className="h-4 w-4 fill-black" />
      </DialogTrigger>
      <DialogContent className="lg:!max-w-3xl max-h-svh overflow-auto">
        <DialogHeader>
          <DialogTitle className="self-start text-xl font-semibold">
            {parsedShopData.ShopName}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col lg:flex-row py-4 gap-2">
          <div className="flex flex-1 flex-col gap-2 border rounded-md border-gray-300 p-2">
            <div>
              <h3 className="text-lg text-primary font-medium">
                Restaurant Address
              </h3>
              <span>{parsedShopData.ShopAddress}</span>
            </div>
            <div>
              <h3 className="text-lg text-primary font-medium">Timing</h3>
              {Array.isArray(parsedShopOpenData) && parsedShopOpenData.map((todayTimingData: any, key: any) => {
                let timing = "";
                if (todayTimingData.HrsDay === 1) {
                  timing = "Open 24 hours";
                } else {
                  const ranges = [];
                  if (todayTimingData.openTime1 && todayTimingData.closeTime1)
                    ranges.push(
                      `${todayTimingData.openTime1} - ${todayTimingData.closeTime1}`
                    );
                  if (todayTimingData.openTime2 && todayTimingData.closeTime2)
                    ranges.push(
                      `${todayTimingData.openTime2} - ${todayTimingData.closeTime2}`
                    );
                  if (todayTimingData.openTime3 && todayTimingData.closeTime3)
                    ranges.push(
                      `${todayTimingData.openTime3} - ${todayTimingData.closeTime3}`
                    );

                  timing = ranges.length ? ranges.join(", ") : "Closed";
                }

                return (
                  <div
                    key={key}
                    className={cn("flex gap-2 items-center justify-between")}
                  >
                    <span className="text-sm self-start">
                      {todayTimingData.dayname}
                    </span>
                    {timing.includes(",") ? (
                      <div className="flex flex-col">
                        {timing.split(",").map((tim, index) => (
                          <span className="text-sm" key={index}>
                            {tim}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm">{timing} </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-2 border rounded-md border-gray-300 p-2">
            <div>
              <h3 className="text-lg text-primary font-medium">Contact Us</h3>
              <ContactUsForm parsedCountryCodes={countryCodes} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
