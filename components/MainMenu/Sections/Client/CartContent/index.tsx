"use client";

import React, { useEffect, useState } from "react";
import CartItem from "./cart-item";
import { useShopDataStore } from "@/store/shopDataStore";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui/button";
import RemoveItemModal from "@/components/Modal/remove-item-modal";
import { formatAmount } from "@/lib/utils";
import Link from "next/link";

interface CartItem {
  itemString: string;
  order_item_qty: number;
  itemCartSubTotal: number;
  item_tax: Array<{
    taxname: string;
    taxamount: string;
    tax_percentage: number;
    taxType: number | string;
  }>;
  [key: string]: any;
}

interface OtherServices {
  label: string;
  amount: number;
}

export default function CartContent() {
  const { shopData } = useShopDataStore();
  const {
    setNewItem,
    newItem,
    cartCleared,
    setCartCleared,
    setItemRemoved,
    itemRemoved,
  } = useCartStore();

  const [orderMethod, setOrderMethod] = useState();
  const [otherServices, setOtherServices] = useState<OtherServices>();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [taxDetails, setTaxDetails] = useState<Record<string, number>>({});
  const [excludedTaxTotal, setExcludedTaxTotal] = useState(0);

  const [isRemoveDialogOpen, setRemoveDialogOpen] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<string | null>(null);
  
  useEffect(() => {
    try {
      const cartData = localStorage.getItem("cartItems");
      // const dealsData = localStorage.getItem("DealItems")

      if (cartData) {
        const { value, expiry } = JSON.parse(cartData);
        const now = Date.now();

        // Check if the data has expired
        if (expiry && now > expiry) {
          console.warn("Cart data has expired");
          localStorage.removeItem("cartItems");
          setCartItems([]);
        } else {
          setCartItems(Array.isArray(value) ? value : []);
        }
      }
      // if(dealsData){
      //   const dealArray = JSON.parse(dealsData);
      //   setCartItems([...cartItems,...(Array.isArray(dealArray) ? dealArray : [])]);
      // }
    } catch (err) {
      console.error("Error parsing cart data:", err);
      setCartItems([]);
    }

    console.log(cartItems)

    const orderMethod = localStorage.getItem("orderMethod");
    const parsedOrderMethod = orderMethod ? JSON.parse(orderMethod) : null;
    setOrderMethod(parsedOrderMethod);

    if (parsedOrderMethod) {
      const otherServicesLabel = parsedOrderMethod.order_method_charge_label;
      const otherServicesAmount = parsedOrderMethod.order_method_charge_amount;
      setOtherServices({
        label: otherServicesLabel,
        amount: otherServicesAmount,
      });
    }
  }, [newItem, cartCleared, itemRemoved]);

  const addItemToCart = (item: CartItem) => {
    setCartItems((prevItems: CartItem[]) => {
      const existingItemIndex = prevItems.findIndex(
        (cartItem) => cartItem.itemString === item.itemString
      );

      if (existingItemIndex !== -1) {
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          order_item_qty:
            updatedItems[existingItemIndex].order_item_qty +
            item.order_item_qty,
        };
        return updatedItems;
      } else {
        return [item, ...prevItems];
      }
    });
  };

  const askRemoveItem = (itemString: string) => {
    setItemToRemove(itemString);
    setRemoveDialogOpen(true);
  };

  const setWithExpiry = (key: string, value: any, ttl: number) => {
    const now = new Date();
    const item = {
      value: value,
      expiry: now.getTime() + ttl, // ttl in milliseconds
    };
    localStorage.setItem(key, JSON.stringify(item));
  };


  const confirmRemoveItem = () => {
    if (itemToRemove) {
      setCartItems((prevItems: CartItem[]) => {
        const updatedItems = prevItems.filter(
          (item) => item.itemString !== itemToRemove
        );
        setWithExpiry("cartItems", updatedItems,7200000);
        return updatedItems;
      });
      setItemToRemove(null);
      setRemoveDialogOpen(false);
      setItemRemoved(true);
    }
  };

  const cancelRemoveItem = () => {
    setItemToRemove(null);
    setRemoveDialogOpen(false);
  };

  const updateItemQty = (itemString: string, delta: number) => {
    setCartItems((prevItems: CartItem[]) => {
      const item = prevItems.find((item) => item.itemString === itemString);
      if (item && item.order_item_qty === 1 && delta === -1) {
        setItemToRemove(itemString);
        setRemoveDialogOpen(true);
        return prevItems;
      }
      const updatedItems = prevItems.map((item) => {
        if (item.itemString === itemString) {
          const newQty = item.order_item_qty + delta;
          return { ...item, order_item_qty: newQty > 0 ? newQty : 1 };
        }
        return item;
      });
      setWithExpiry("cartItems", updatedItems,7200000);
      return updatedItems;
    });
  };

  // Then useEffect only to *trigger* it safely
  useEffect(() => {
    if (newItem) {
      addItemToCart(newItem);
      setNewItem(null);
    }

    if (cartCleared) {
      setCartItems([]);
      localStorage.removeItem("cartItems");
      setCartCleared(false);
    }
  }, [newItem, cartCleared]);

  useEffect(() => {
    // Calculate tax details
    const taxMap = new Map<string, number>();
    let excludedTaxSum = 0;
    cartItems.forEach((item: CartItem) => {
      if (item.item_tax && item.item_tax.length > 0) {
        item.item_tax.forEach((tax) => {
          const key = tax.taxname;
          const taxAmount =
            Number(item.itemCartSubTotal) *
            (tax.tax_percentage / 100) *
            item.order_item_qty;

          // Add to tax map for display
          if (taxMap.has(key)) {
            taxMap.set(key, taxMap.get(key)! + taxAmount);
          } else {
            taxMap.set(key, taxAmount);
          }

          // Add to excluded tax sum if taxType == 0
          if (tax.taxType === 0 || tax.taxType === "0") {
            excludedTaxSum += taxAmount;
          }
        });
      }
    });
    setTaxDetails(Object.fromEntries(taxMap));
    setExcludedTaxTotal(excludedTaxSum);
  }, [cartItems]);

  // console.log(cartItems);

  const itemTotal = cartItems.reduce(
    (total: number, item: CartItem) =>
      total + item.itemCartSubTotal * item.order_item_qty,
    0
  );

  const grandTotal =
    itemTotal +
    excludedTaxTotal +
    Number(orderMethod && otherServices && otherServices?.amount);

  return (
    <>
      {cartItems && cartItems.length >= 1 ? (
        <div className="flex flex-col gap-2 h-full">
          <div className="flex-1 overflow-y-auto text-sm pr-1 pb-6">
            {cartItems.map((cartItem: CartItem, index: number) => (
              <React.Fragment key={index}>
                <CartItem
                  item={cartItem}
                  shopData={shopData}
                  onRemove={() => askRemoveItem(cartItem.itemString)}
                  onIncrement={() => updateItemQty(cartItem.itemString, 1)}
                  onDecrement={() => updateItemQty(cartItem.itemString, -1)}
                />
                {index + 1 !== cartItems.length && (
                  <Separator className="bg-muted" />
                )}
              </React.Fragment>
            ))}
          </div>
          {/* Summary and Checkout Section (always visible) */}
          <div>
            <Separator className="h-1 bg-muted" />
            <div className="flex justify-between items-center text-base font-medium text-gray-500 mb-1">
              <span>Item Total</span>
              <span>
                {shopData?.currency_symbol}
                {formatAmount(itemTotal)}
              </span>
            </div>
            <Separator className="h-1 bg-muted" />
            {/* Tax Details */}
            {Object.entries(taxDetails).length > 0 && (
              <>
                {Object.entries(taxDetails).map(
                  ([taxName, amount]: [string, number]) => (
                    <div
                      key={taxName}
                      className="flex justify-between items-center text-base font-medium text-gray-500 mb-1"
                    >
                      <span>{taxName}</span>
                      <span>
                        {shopData?.currency_symbol}
                        {formatAmount(amount)}
                      </span>
                    </div>
                  )
                )}
                <Separator className="h-1 bg-muted" />
              </>
            )}
            <div className="space-y-1">
              {orderMethod && otherServices && (
                <>
                  <div className="flex justify-between items-center text-base font-medium text-gray-500 mb-1">
                    <span>{otherServices.label}</span>
                    <span>
                      {shopData?.currency_symbol}
                      {formatAmount(otherServices.amount)}
                    </span>
                  </div>
                  <Separator className="h-1 bg-muted" />
                </>
              )}
              <div className="flex justify-between items-center text-base font-extrabold text-gray-800 mt-2 mb-2 tracking-tight">
                <span>Total</span>
                <span className="text-primary text-lg font-black">{shopData?.currency_symbol}{formatAmount(grandTotal)}</span>
              </div>
              <Link href={"/final-checkout"} className="w-full">
                <Button className="w-full bg-[#34678D] text-white font-bold rounded-md py-2 text-xs tracking-wide shadow-md uppercase">Proceed to Checkout</Button>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 h-full content-center">
          <div className="col-md-12 place-items-center">
            <img src="/empty.png" alt="empty-cart" />
          </div>
          <div className="col-md-12 text-center mt-4 fs-18 fw-600">
            <label className="text-muted-foreground text-xl">
              Your cart is empty! Add some delicious food items and satisfy your
              cravings. 🍽️😋
            </label>
          </div>
        </div>
      )}
      <RemoveItemModal
        isOpen={isRemoveDialogOpen}
        setOpen={cancelRemoveItem}
        onConfirm={confirmRemoveItem}
      />
    </>
  );
}
