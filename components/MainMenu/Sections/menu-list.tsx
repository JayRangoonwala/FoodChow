import {
  fetchRestaurantMenuWDWidget_multi,
  fetchShopDetails,
} from "@/lib/shopService";
import { cn } from "@/lib/utils";
import React from "react";
import ClientMenuList from "./Client/client-menu-list";

export default function MenuList({
  className,
  menuList,
  shopData,
}: {
  className?: string;
  menuList?: Awaited<ReturnType<typeof fetchRestaurantMenuWDWidget_multi>>;
  shopData: Awaited<ReturnType<typeof fetchShopDetails>>;
}) {
  const parsedMenuList = menuList.data ? JSON.parse(menuList.data) : null;
  const parsedShopData = JSON.parse(shopData.data);

  const categoryList = parsedMenuList.CategoryList;
  const dealList = parsedMenuList.DealList;

  const dealListImage = parsedMenuList.DealList.filter(
    (dealItem: any) => dealItem.DealImage && dealItem.DealImage !== ""
  );

  const dealsWithoutImage = parsedMenuList.DealList.filter(
    (dealItem: any) => !dealItem.DealImage || dealItem.DealImage === ""
  );

  return (
    <div
      id="menu-scroll-container"
      className={cn(
        "flex flex-col gap-2 overflow-y-scroll mb-[50px] lg:mb-0",
        className
      )}
    >
      <ClientMenuList
        dealList={dealList}
        dealListImage={dealListImage}
        dealsWithoutImage={dealsWithoutImage}
        categoryList={categoryList}
        parsedShopData={parsedShopData}
      />
    </div>
  );
}
