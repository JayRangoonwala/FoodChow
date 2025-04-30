"use client";

import { fetchAllShopMenuType } from "@/lib/shopService";
import React from "react";
import MenuButtons from "./Client/menu-buttons";
import { usePathname } from "next/navigation";

export default function SubHeader({
  shopMenuType,
}: {
  shopMenuType: Awaited<ReturnType<typeof fetchAllShopMenuType>>;
}) {
  const pathname = usePathname();

  if (
    ["final-checkout", "order-status"].some((path) => pathname?.includes(path))
  ) {
    return "";
  }

  if (!shopMenuType.data) {
    return;
  }
  const parsedShopMenuType = JSON.parse(shopMenuType.data);

  return (
    <div className="pt-[72px] fixed bg-white px-3 lg:px-6 py-2 w-full flex flex-col gap-2">
      <span className="text-lg font-medium block lg:hidden">
        Additional Menu
      </span>
      <div className="flex gap-2 justify-start lg:justify-center overflow-x-auto">
        <MenuButtons parsedShopMenuType={parsedShopMenuType} />
      </div>
    </div>
  );
}
