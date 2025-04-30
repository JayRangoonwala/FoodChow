"use client";

import DeliveryLogo from "@/components/Svgs/delivery";
import DineInLogo from "@/components/Svgs/dinein";
import TakeAwayLogo from "@/components/Svgs/takeaway";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { FoodChowData } from "@/lib/config";
import { cn } from "@/lib/utils";
import Autoplay from "embla-carousel-autoplay";
import React from "react";

export default function DealCaraousel({
  dealListImage,
  parsedShopData,
}: {
  dealListImage: any;
  parsedShopData: any;
}) {
  if (!(dealListImage.length > 0)) {
    return <></>;
  }
  return (
    <Carousel
      opts={{
        loop: true,
      }}
      plugins={[
        Autoplay({
          delay: 3000,
        }),
      ]}
      className="w-full px-4 lg:px-6 border-b border-b-gray-100 py-3"
    >
      <CarouselContent>
        {dealListImage.map((dealItem: any) => {
          const { DealImage, DealName, DealDesc, DealPrice, OrderMethod } =
            dealItem;

          const imageUrl = DealImage
            ? `${FoodChowData.dealImages}${DealImage}`
            : null;
          const orderMethods = OrderMethod?.split(",") || [];

          if (!imageUrl) return null;

          return (
            <CarouselItem
              className={cn(
                "space-y-2",
                dealListImage.length > 1 ? "sm:basis-1/2" : "w-full"
              )}
              key={dealItem.DealId || DealImage} // Prefer a unique ID
            >
              <div className="relative rounded-md h-[225px] md:h-[200px] overflow-hidden">
                <img
                  src={imageUrl}
                  alt={DealName || "deal"}
                  className="object-cover h-full w-full rounded-md"
                />
                <div className="absolute bottom-0 w-full">
                  <div className="bg-black/50 backdrop-blur-sm text-white text-lg font-semibold p-2 rounded-b-md">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-1 flex-col pr-2">
                        <span className="truncate">{DealName}</span>
                        <span className="text-muted text-sm truncate w-[200px]">
                          {DealDesc}
                        </span>
                      </div>
                      <span className="whitespace-nowrap">
                        {parsedShopData.currency_symbol}
                        {Number(DealPrice).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  {orderMethods.includes("1") && (
                    <TakeAwayLogo className="fill-primary h-8 w-8" />
                  )}
                  {orderMethods.includes("2") && (
                    <DineInLogo className="fill-primary h-8 w-8" />
                  )}
                  {orderMethods.includes("5") && (
                    <DeliveryLogo className="fill-primary h-8 w-8" />
                  )}
                </div>
                <Button variant="outline">Add</Button>
              </div>
            </CarouselItem>
          );
        })}
      </CarouselContent>
    </Carousel>
  );
}
