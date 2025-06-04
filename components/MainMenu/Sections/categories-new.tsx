import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { fetchRestaurantMenuWDWidget_multi } from "@/lib/shopService";
import { cn } from "@/lib/utils";
import React from "react";
import CategoryItem from "./Client/category-item-new";

export default function Categories({
  className,
  restaurantMenu,
}: {
  className?: string;
  restaurantMenu?: Awaited<
    ReturnType<typeof fetchRestaurantMenuWDWidget_multi>
  >;
}) {
  const restaurantMenuList = restaurantMenu.data
    ? JSON.parse(restaurantMenu.data)
    : null;

  return (
    <div className={cn(className, "w-full")}>
      <CategoryItem restaurantMenuList={restaurantMenuList} />
    </div>
  );
}
