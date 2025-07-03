import React from "react";
import Categories from "../Sections/categories-new";

import Cart from "../Sections/cart-new";
import {
  fetchRestaurantMenuForShopMenuWD,
  fetchRestaurantMenuWDWidget_multi,
  fetchShopDetails,
  fetchShopIdBySubdomain,
  fetchShopTiming,
} from "@/lib/shopService";
import MenuList from "../Sections/menu-list-new";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { Button } from "../../ui/button";
// import CategoryItem from "../Sections/Client/category-item-new";
import MenuLogo from "../../Svgs/menu";
import { getSubdomainFromHeaders } from "@/lib/getSubdomain";
import MobileMenuFooter from "../Sections/Client/mobile-menu-footer";
import CategoryItem from "../Sections/Client/category-item-new2";

const MainMenuNew2 = async ({
  mainMenu,
  menuId,
}: {
  mainMenu: boolean;
  menuId?: string;
}) => {
  
  const subdomain = await getSubdomainFromHeaders();
  const shopId = await fetchShopIdBySubdomain(subdomain);
  const shopData = await fetchShopDetails(shopId);

  const shopOpenData = await fetchShopTiming(shopId);

  const parsedShopData =
    shopData && shopData.data ? JSON.parse(shopData.data) : null;

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

  let restaurantMenu;

  if (mainMenu) {
    restaurantMenu = await fetchRestaurantMenuWDWidget_multi(shopId);
  } else if (menuId) {
    restaurantMenu = await fetchRestaurantMenuForShopMenuWD(menuId);
  }
  
  const restaurantMenuList = restaurantMenu.data
    ? JSON.parse(restaurantMenu.data)
    : null;
  return (
    <>
      <div className="max-lg:hidden">
        <CategoryItem restaurantMenuList={restaurantMenuList} />
      </div>
      <div className="flex gap-3 sm:p-5 pb-0 p-2">
        <MenuList
          className=""
          menuList={restaurantMenu}
          shopData={shopData}
          shopStatus={shopStatus}
        />
        <aside className="hidden lg:flex flex-col basis-1/3 xl:basis-2/5 max-w-[400px] min-w-[320px]">
          <div className="sticky top-6">
            <Cart className="shadow-lg rounded-xl border border-gray-200 bg-white" />
          </div>
        </aside>
      </div>
      <Popover>
        <div className="fixed left-1/2 -translate-x-1/2 bottom-[75px] justify-self-center z-50 lg:hidden">
          <PopoverTrigger asChild>
            <Button className="flex h-10 w-24 p-0 rounded-full shadow-lg bg-primary gap-3 hover:bg-primary/90 transition-colors">
              <div className="h-fit w-fit place-items-center content-center">
                <MenuLogo className="!w-6 !h-6 text-white" />
              </div>
              <span className="text-white text-xs font-medium">Menu</span>
            </Button>
          </PopoverTrigger>
        </div>
        <PopoverContent className="w-80 h-fit max-h-[320px] lg:hidden overflow-auto border-0 rounded-xl shadow-xl bg-white p-0 mt-2">
          <CategoryItem restaurantMenuList={restaurantMenuList} />
        </PopoverContent>
      </Popover>
      {/* Mobile Footer */}
      <div className="w-full fixed bottom-0 px-3 pb-2 left-0 gap-2 flex lg:hidden z-40">
        <div className="bg-primary flex items-center justify-between w-full p-2 rounded-md">
          <MobileMenuFooter />
        </div>
      </div>
    </>
  );
};

export default MainMenuNew2;
