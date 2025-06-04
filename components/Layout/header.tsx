import { FoodChowData } from "@/lib/config";
import {
  fetchCountryWithCountryCode,
  fetchShopDetails,
  fetchShopTiming,
} from "@/lib/shopService";
import React from "react";
import { Button } from "../ui/button";
import LocationLogo from "../Svgs/location";
import { cn } from "@/lib/utils";
import Link from "next/link";
import PhoneLogo from "../Svgs/phone";
import { MobileDrawer } from "./mobile-drawer";
import InfoModal from "../Modal/info-modal";
import HeaderBtns from "./Client/header-btns";

interface ShopTiming {
  dayname: string;
  HrsDay: number;
  openTime1?: string;
  closeTime1?: string;
  openTime2?: string;
  closeTime2?: string;
  openTime3?: string;
  closeTime3?: string;
}

export default async function Header({
  shopData,
  shopOpenData,
}: {
  shopData: Awaited<ReturnType<typeof fetchShopDetails>>;
  shopOpenData: Awaited<ReturnType<typeof fetchShopTiming>>;
}) {
  if (!shopData) {
    return <div>Shop data not found</div>;
  }

  if (!shopOpenData) {
    return <div>Shop open data not found</div>;
  }

  const parsedShopData = JSON.parse(shopData.data);

  let parsedShopOpenData;

  if (
    !shopOpenData ||
    typeof shopOpenData.data !== "string" ||
    shopOpenData.data.startsWith("Object reference")
  ) {
    // Fallback static data
    parsedShopOpenData = [
      {
        online_ordering: 1, // 1 = online ordering enabled
        ClosedOrNot: 0, // 0 = open
        b_hours_settings: 1, // 1 = normal business hours
      },
    ];
  } else {
    parsedShopOpenData = JSON.parse(shopOpenData.data);
  }

  const countryCodes = await fetchCountryWithCountryCode();

  let parsedCountryCodes;

  if (countryCodes.data) {
    parsedCountryCodes = JSON.parse(countryCodes.data);
  }

  // right after:
  const { online_ordering, ClosedOrNot, b_hours_settings } =
    parsedShopOpenData[0];

  // Determine shop status (existing logic)
  let shopStatus = "Unable to determine shop status.";

  if (online_ordering === 0) {
    shopStatus = "Sorry, We are not accepting Online Orders right now.";
  } else if (ClosedOrNot === 1) {
    shopStatus =
      b_hours_settings === 0 ? "Open for Pre Order" : "Restaurant is Close";
  } else if (ClosedOrNot === 0) {
    shopStatus = "Restaurant is Open";
  }

  // === 👇 NEW: Get today's timing ===
  const dayMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const todayName = dayMap[new Date().getDay()];
  const todayTimingData = parsedShopData.FoodShopTimingList.find(
    (item: ShopTiming) => item.dayname === todayName
  );

  let todayTiming = "Closed";

  if (todayTimingData) {
    if (todayTimingData.HrsDay === 1) {
      todayTiming = "Open 24 hours";
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

      todayTiming = ranges.length ? ranges.join(", ") : "Closed";
    }
  }

  return (
    <header className="h-16 bg-white fixed w-full lg:px-6 px-3 z-10 shadow-md">
      <div className="h-full flex items-center justify-between lg:hidden">
        <MobileDrawer
          parsedShopData={parsedShopData}
          shopStatus={shopStatus}
          todayTiming={todayTiming}
        />
        <Link href={"/"} className="w-full justify-items-center">
          <img
            src={`${FoodChowData.imageStore}${parsedShopData.ShopLogo}`}
            alt={`Shop Logo ${parsedShopData.ShopLogo}`}
            className="h-12 rounded mr-[40px]"
          />
        </Link>
      </div>
      <div className="h-full w-full gap-4 lg:flex hidden items-center">
        <Link href={"/"}>
          <img
            src={`${FoodChowData.imageStore}${parsedShopData.ShopLogo}`}
            alt={`Shop Logo ${parsedShopData.ShopLogo}`}
            className="h-12 rounded"
          />
        </Link>
        <div className="flex-1 flex gap-4 justify-between items-center">
          <div>
            <h3 className="text-xl font-semibold">{parsedShopData.ShopName}</h3>
            <div className="flex gap-1 items-center">
              <LocationLogo className="h-2 w-2" />
              <span className="text-sm">
                {parsedShopData.shop_city}, {parsedShopData.shop_state},{" "}
                {parsedShopData.shop_country}
              </span>
            </div>
          </div>
          <div className="place-items-center">
            <p
              className={cn("text-base ", {
                "text-green-500":
                  shopStatus === "Restaurant is Open" ||
                  shopStatus === "Open for Pre Order",
                "text-red-500":
                  shopStatus === "Restaurant is Close" ||
                  shopStatus ===
                    "Sorry, We are not accepting Online Orders right now.",
              })}
            >
              {shopStatus}
            </p>
            <div className="flex gap-2 items-center">
              <p className="text-muted-foreground text-sm font-medium">
                Timing:{" "}
                {todayTiming.includes(",")
                  ? todayTiming.split(",")[0]
                  : todayTiming}
              </p>
              <InfoModal
                parsedShopData={parsedShopData}
                countryCodes={parsedCountryCodes}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <HeaderBtns
              parsedShopData={parsedShopData}
              shopStatus={shopStatus}
              parsedCountryCodes={parsedCountryCodes}
            />

            <Link href={`tel:${parsedShopData.MobileNo}`}>
              <Button variant={"outline"} className="group">
                <PhoneLogo className="group-hover:fill-white fill-primary" />
                {parsedShopData.MobileNo}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
