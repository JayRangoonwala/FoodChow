import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import React from "react";
// import CartContent from "./Client/CartContent";
import CartContent from "./Client/CartContentNew";
import ClearCrtBtn from "./Client/CartContent/clear-crt-btn";
import { useScreenSize } from "@/hooks/screenSize";

export default function Cart({ className }: { className?: string }) {
  return (
    <Card className={cn(className, "gap-2 p-2 border border-gray-200 border-t-2 border-t-dashed shadow-lg rounded-xl bg-white h-[calc(100vh-200px)]")}>
      <CardHeader className="flex-shrink-0">
        <CardTitle className="text-primary font-medium flex justify-between items-center text-base">
          <span className="text-black">Your Cart</span> <ClearCrtBtn />
        </CardTitle>
      </CardHeader>
      <Separator className="bg-gray-300 flex-shrink-0" />
      <CardContent className="px-1 pb-6 h-full overflow-y-auto">
        <div className="h-full pb-2">
          <CartContent />
        </div>
      </CardContent>
    </Card>
  );
}
