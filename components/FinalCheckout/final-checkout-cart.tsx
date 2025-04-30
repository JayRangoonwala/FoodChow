import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import React from "react";
import CartContent from "./Client/CartContent";
import ClearCrtBtn from "./Client/CartContent/clear-crt-btn";

export default function FinalCheckoutCart({
  className,
}: {
  className?: string;
}) {
  return (
    <Card className={cn(className, "border-0 h-full gap-0 pb-0")}>
      <CardHeader className="flex-shrink-0">
        <CardTitle className="text-primary font-medium flex justify-between items-center">
          <span>YOUR CART</span> <ClearCrtBtn />
        </CardTitle>
      </CardHeader>
      <Separator className="bg-muted flex-shrink-0" />
      <CardContent className="px-3 h-full">
        <div className="h-full pb-2">
          <CartContent />
        </div>
      </CardContent>
    </Card>
  );
}
