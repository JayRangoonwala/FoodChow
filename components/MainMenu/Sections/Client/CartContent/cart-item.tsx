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
    <div className="flex py-1 px-1 mb-1 bg-white border border-gray-100 rounded-md shadow-sm items-center">
      <div className="flex-1 flex flex-col gap-0.5">
        <h4 className="font-semibold text-xs text-start leading-tight mb-0.5">{item.order_itemname}</h4>
        <div className="flex flex-col text-muted-foreground text-[11px] text-start leading-tight">
          {/* SIZES */}
          {item.order_size && (
            <span>
              {item.order_size} (+{currencySymbol}{item.subTotal})
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
            <span className="text-muted-foreground">Item Note: {item.item_notes}</span>
          )}
        </div>
      </div>
      <div className="flex flex-col items-end gap-1 min-w-[90px]">
        <span className="text-[#d32f2f] font-bold self-end text-xs leading-tight">
          {currencySymbol}{Number(item.itemCartSubTotal * item.order_item_qty).toFixed(2)}
        </span>
        <div className="flex items-center gap-0.5 mt-0.5">
          <Button
            variant={"outline"}
            className="rounded-full h-6 w-6 p-0 border-0 text-[#d32f2f] hover:bg-[#ffeaea] flex items-center justify-center"
            onClick={onRemove}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
          <div className="flex h-7 text-center items-center">
            <Button
              variant={"outline"}
              className="font-bold text-base rounded-none w-6 h-6 rounded-l-md border-r-0 border-input p-0"
              onClick={onDecrement}
            >
              -
            </Button>
            <div className="border-y border-input w-6 h-6 flex items-center justify-center text-xs font-bold bg-white">
              {item.order_item_qty}
            </div>
            <Button
              variant={"outline"}
              className="font-bold text-base rounded-none w-6 h-6 rounded-r-md border-l-0 border-input p-0"
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
