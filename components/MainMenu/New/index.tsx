import React from "react";
import Categories from "../Sections/categories-new";
import Cart from "../Sections/cart-new";
import {
  fetchRestaurantMenuForShopMenuWD,
  fetchRestaurantMenuWDWidget_multi,
  fetchShopDetails,
  fetchShopIdBySubdomain,
} from "@/lib/shopService";
import MenuList from "../Sections/menu-list-new";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { Button } from "../../ui/button";
import CategoryItem from "../Sections/Client/category-item-new";
import MenuLogo from "../../Svgs/menu";
import { getSubdomainFromHeaders } from "@/lib/getSubdomain";
import MobileMenuFooter from "../Sections/Client/mobile-menu-footer";

const MainMenuNew = async ({
  mainMenu,
  menuId,
}: {
  mainMenu: boolean;
  menuId?: string;
}) => {
  const subdomain = await getSubdomainFromHeaders();
  const shopId = await fetchShopIdBySubdomain(subdomain);
  const shopData = await fetchShopDetails(shopId);

  const parsedShopData =
    shopData && shopData.data ? JSON.parse(shopData.data) : null;

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
      {/* Top Navigation Bar */}
      <div className="w-full max-lg:hidden bg-[#e6f6fa] max-h-[55px] border-y border-gray-200 sticky top-26 z-50">
        <Categories restaurantMenu={restaurantMenu} />
      </div>
      <div className="flex h-screen bg-[#f7fafc] overflow-hidden">
        <section className="flex flex-1 h-screen w-full mx-auto gap-6 px-2 lg:px-6 py-6">
          {/* Main Menu List */}
          <div className="flex-1 lg:basis-2/3 xl:basis-3/5">
            <MenuList
              className=""
              menuList={restaurantMenu}
              shopData={shopData}
            />
          </div>
          {/* Cart Sidebar */}
          <aside className="hidden lg:flex flex-col basis-1/3 xl:basis-2/5 max-w-[400px] min-w-[320px]">
            <div className="sticky top-6">
              <Cart className="shadow-lg rounded-xl border border-gray-200 bg-white" />
            </div>
          </aside>
        </section>
        <Popover>
          <div className="fixed left-1/2 -translate-x-1/2 bottom-[80px] justify-self-center z-50 lg:hidden">
            <PopoverTrigger asChild>
              <Button className="flex h-14 w-32 rounded-full shadow-lg bg-primary hover:bg-primary/90 transition-colors">
                <div className="h-full w-full place-items-center content-center">
                  <MenuLogo className="!w-7 !h-7 text-white" />
                </div>
                <span className="text-white font-medium">Menu</span>
              </Button>
            </PopoverTrigger>
          </div>
          <PopoverContent className="w-80 h-[320px] lg:hidden overflow-auto border-0 rounded-xl shadow-xl bg-white p-0 mt-2">
            <CategoryItem restaurantMenuList={restaurantMenuList} />
          </PopoverContent>
        </Popover>
        {/* Mobile Footer */}
        <div className="w-full fixed bottom-0 px-3 pb-2 left-0 gap-2 flex lg:hidden z-40">
          <div className="bg-primary flex items-center justify-between w-full p-2 rounded-md">
            <MobileMenuFooter />
          </div>
        </div>
      </div>
    </>
  );
};

export default MainMenuNew;
