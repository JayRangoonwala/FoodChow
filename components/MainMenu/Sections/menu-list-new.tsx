import {
    fetchRestaurantMenuWDWidget_multi,
    fetchShopDetails,
  } from "@/lib/shopService";
  import { cn } from "@/lib/utils";
  import React from "react";
  import ClientMenuList from "./Client/client-menu-list-new";
  
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
        className={cn(
          "border border-gray-200 rounded-xl p-2",
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
  