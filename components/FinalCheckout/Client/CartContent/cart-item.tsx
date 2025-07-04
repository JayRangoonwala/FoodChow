"use client";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import React from "react";

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

  return (
    <div className="flex py-2 overflow-auto border-1 border-gray-200 p-2 shadow-sm rounded-lg items-center justify-between gap-2">
      <div className="left-side flex flex-1 flex-col gap-1">
        <h4 className="font-medium text-base text-start">
          {item.order_itemname}
        </h4>
        <div className="flex flex-col text-muted-foreground text-start">
          {/* SIZES */}
          {item.order_size && (
            <span>
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
              .map((item: any, index: any) => <span key={index}>{item}</span>)}

          {/* PREFERENCES */}
          {item.preference_names &&
            item.preference_names !== "" &&
            item.preference_names
              .split(",")
              .slice(0, -1)
              .map((item: any, index: any) => <span key={index}>{item}</span>)}

          {item.item_notes && item.item_notes !== "" && (
            <span className="text-muted-foreground text-xs">
              Item Note: {item.item_notes}
            </span>
          )}
        </div>
      </div>
      <div className="right-side flex items-center justify-center gap-3">
        <Button
            // variant={"outline"}
            className="rounded-full h-6 w-6 bg-red-400"
            onClick={onRemove}
          >
            <Trash2 className="text-white"/>
          </Button>
        <div className="flex gap-0 items-center flex-col ">
          <span className="text-primary font-semibold text-sm text-center">
          {currencySymbol}
          {Number(item.itemCartSubTotal * item.order_item_qty).toFixed(2)}
        </span>
          <div className="flex h-6 text-center justify-center items-center">
            <Button
              variant={"outline"}
              className="font-bold text-xl rounded-none pt-1 box-border h-6 w-[30px] rounded-l-md border-r-0 border-input "
              onClick={onDecrement}
            >
              -
            </Button>
            <div className="border-y border-input w-[30px] shadow-xs h-6 text-xs content-center">
              {item.order_item_qty}
            </div>
            <Button
              variant={"outline"}
              className="font-bold text-xl rounded-none p-0 h-6 w-[30px] rounded-r-md border-l-0 border-input"
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
