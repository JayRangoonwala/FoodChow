"use client";

import { Button } from "@/components/ui/button";
import { fetchAllShopMenuType } from "@/lib/shopService";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

export default function MenuButtons({
  parsedShopMenuType,
}: {
  parsedShopMenuType: Awaited<ReturnType<typeof fetchAllShopMenuType>>;
}) {
  const pathname = usePathname();

  return (
    <>
      <Link href={"/"}>
        <Button className="rounded-full p-1 px-3 md:px-5 text-xs h-7 font-normal " variant={pathname === "/" ? "default" : "outline"}>
          Main Menu
        </Button>
      </Link>
      {parsedShopMenuType.menu.map((item: any, id: any) => (
        <Link href={`/${item.menu_url}`} key={id}>
          <Button 
            className="rounded-full p-1 px-3 md:px-5 text-xs h-7 font-normal"
            variant={pathname.includes(item.menu_url) ? "default" : "outline"}
          >
            {item.menu_name}
          </Button>
        </Link>
      ))}
    </>
  );
}
