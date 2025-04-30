import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import MenuBar from "../Svgs/menubar";
import Link from "next/link";
import PhoneLogo from "../Svgs/phone";
import LocationLogo from "../Svgs/location";
import { cn } from "@/lib/utils";
import InfoModal from "../Modal/info-modal";
import { fetchCountryWithCountryCode } from "@/lib/shopService";
import HeaderBtns from "./Client/header-btns";

export async function MobileDrawer({
  parsedShopData,
  shopStatus,
  todayTiming,
}: {
  parsedShopData: any;
  shopStatus: any;
  todayTiming: any;
}) {
  const res = await fetchCountryWithCountryCode();

  let parsedCountryCodes;

  if (res.data) {
    parsedCountryCodes = JSON.parse(res.data);
  }

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant={"outline"} className="border-gray-100 group">
          <MenuBar className="group-hover:fill-white" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="border-none">
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle className="text-2xl font-semibold">
              {parsedShopData.ShopName}
            </DrawerTitle>
            <DrawerDescription>
              <div className="flex gap-1 items-center">
                <LocationLogo className="h-2 w-2" />
                <span className="text-sm text-black">
                  {parsedShopData.shop_city}, {parsedShopData.shop_state},{" "}
                  {parsedShopData.shop_country}
                </span>
              </div>
              <div>
                <span
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
                </span>
                <div className="flex gap-2 items-center">
                  <span className="text-muted-foreground text-sm font-medium">
                    Timing:
                    {todayTiming.includes(",")
                      ? todayTiming.split(",")[0]
                      : todayTiming}
                  </span>
                  <InfoModal
                    parsedShopData={parsedShopData}
                    countryCodes={parsedCountryCodes}
                  />
                </div>
              </div>
            </DrawerDescription>
          </DrawerHeader>

          <DrawerFooter className="justify-center items-center flex-col">
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
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
