"use client";
import { Button } from "@/components/ui/button";
import { MyContext } from "@/context/MyContext";
import { Trash2 } from "lucide-react";
import React, { useContext, useEffect } from "react";

export default function CartItem({
  item,
  shopData,
  onRemove,
  onIncrement,
  onDecrement,
}: {
  item: any;
  shopData: any;
  onRemove: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
}) {
  const currencySymbol = shopData?.currency_symbol;

  const { saveLocal, setsaveLocal } = useContext(MyContext);

  return (
    <div className="flex py-2 overflow-auto">
      <div className="left-side flex flex-1 flex-col gap-1">
        <h4 className="font-semibold text-lg text-start">
          {item.order_itemname}
        </h4>

        

        <div className="flex flex-col text-muted-foreground text-start">
          {/* SIZES */}
          {item.order_size && (
            <span className="text-[#999] font-medium text-md">
              {item.order_size} (+{currencySymbol}
              {item.subTotal})
            </span>
          )}

          {/* CUST OPTIONS */}
          {item.custom_ids &&
            item.custom_ids.length >= 1 &&
            item.custom_ids[0].item_cust_values &&
            item.custom_ids[0].item_cust_values
              .split(",")
              .slice(0, -1)
              .map((item: any, index: any) => <span key={index} className="text-[#999] font-medium text-md">{item}</span>)}

          {/* PREFERENCES */}

          {item.preference_names &&
            item.preference_names !== "" &&
            item.preference_names
              .split(",")
              // .slice(0, -1)
              .map((item: any, index: any) => <span key={index} className="text-[#999] font-medium text-md">{item}</span>)}
              
          {item.item_notes && item.item_notes !== "" && (
            <span className="text-muted-foreground">
              Item Note: {item.item_notes}
            </span>
          )}
        </div>
      </div>
      <div className="right-side flex flex-col">
        <span className="text-primary font-semibold self-end text-lg">
          {currencySymbol}
          {Number(item.itemCartSubTotal * item.order_item_qty).toFixed(2)}
        </span>
        <div className="flex gap-1 items-center">
          <Button
            variant={"outline"}
            className="rounded-full h-8 w-8"
            onClick={onRemove}
          >
            <Trash2 />
          </Button>
          <div className="flex h-10 text-center items-center">
            <Button
              variant={"outline"}
              className="font-bold text-2xl rounded-none w-[30px] rounded-l-md border-r-0 border-input pt-1"
              onClick={onDecrement}
            >
              -
            </Button>
            <div className="border-y border-input w-[30px] shadow-xs h-9 content-center">
              {item.order_item_qty}
            </div>
            <Button
              variant={"outline"}
              className="font-bold text-xl rounded-none w-[30px] rounded-r-md border-l-0 border-input"
              onClick={onIncrement}
            >
              +
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
