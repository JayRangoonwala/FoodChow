"use client";

import MobileCartModal from "@/components/Modal/mobile-cart-modal";
import { Button } from "@/components/ui/button";
import { formatAmount } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import { useShopDataStore } from "@/store/shopDataStore";
import React, { useEffect, useState } from "react";

export default function MobileMenuFooter() {
  const [open, setOpen] = useState<boolean>(false);
  const { shopData } = useShopDataStore();

  const { newItem, cartCleared, itemRemoved } = useCartStore();

  const [cartItems, setCartItems] = useState<any[]>([]);
  const [otherServices, setOtherServices] = useState<{
    label: string;
    amount: number;
  } | null>(null);

  useEffect(() => {
    // Get cart items
    const cartData = localStorage.getItem("cartItems");
    setCartItems(cartData ? JSON.parse(cartData) : []);

    // Get order method/charges
    const orderMethodData = localStorage.getItem("orderMethod");
    const parsedOrderMethod = orderMethodData
      ? JSON.parse(orderMethodData)
      : null;

    if (parsedOrderMethod) {
      setOtherServices({
        label: parsedOrderMethod.order_method_charge_label,
        amount: Number(parsedOrderMethod.order_method_charge_amount) || 0,
      });
    }
  }, [open, newItem, cartCleared, itemRemoved]); // re-read when modal opens (cart may have changed)

  useEffect(() => {
    // Calculate tax details
    const taxMap = new Map<string, number>();
    cartItems.forEach((item: any) => {
      if (item.item_tax && item.item_tax.length > 0) {
        item.item_tax.forEach((tax: any) => {
          const key = tax.taxname;
          const taxAmount =
            Number(item.itemCartSubTotal) *
            (tax.tax_percentage / 100) *
            item.order_item_qty;
          if (taxMap.has(key)) {
            taxMap.set(key, taxMap.get(key)! + taxAmount);
          } else {
            taxMap.set(key, taxAmount);
          }
        });
      }
    });
  }, [cartItems, newItem]);

  // Calculate totals
  const itemCount = cartItems.length;
  const itemTotal = cartItems.reduce(
    (total, item) =>
      total + (item.itemCartSubTotal || 0) * (item.order_item_qty || 0),
    0
  );

  const chargeTotal = otherServices?.amount || 0;
  const totalPrice = itemTotal + chargeTotal;

  return (
    <>
      <p className="text-white text-lg font-semibold">
        {itemCount === 0
          ? `${shopData && shopData.currency_symbol}0.00`
          : `${itemCount} items | ${shopData.currency_symbol}${formatAmount(
              totalPrice
            )}`}
      </p>
      <Button
        className="bg-white text-primary"
        onClick={() => {
          setOpen(true);
        }}
      >
        View Cart
      </Button>
      <MobileCartModal open={open} onOpenChange={setOpen} />
    </>
  );
}
