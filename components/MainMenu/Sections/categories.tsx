import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { fetchRestaurantMenuWDWidget_multi } from "@/lib/shopService";
import { cn } from "@/lib/utils";
import React from "react";
import CategoryItem from "./Client/category-item";

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
    <Card className={cn(className, "border-0")}>
      <CardHeader>
        <CardTitle className="text-primary font-medium">CATEGORIES</CardTitle>
      </CardHeader>
      <Separator className="bg-muted" />
      <CardContent className="overflow-scroll px-3 h-full">
        <CategoryItem restaurantMenuList={restaurantMenuList} />
      </CardContent>
    </Card>
  );
}
