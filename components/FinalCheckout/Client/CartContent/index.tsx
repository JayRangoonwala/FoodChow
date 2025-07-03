"use client";

import React, { useEffect, useState } from "react";
import CartItem from "./cart-item";
import { useShopDataStore } from "@/store/shopDataStore";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/store/cartStore";
import RemoveItemModal from "@/components/Modal/remove-item-modal";
import { formatAmount } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCheckoutStore } from "@/store/checkoutStore";
import { Eye } from "lucide-react";

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

  const { setItemTotal, setSubItemTotal } = useCheckoutStore();

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

      if (cartData) {
        const { value, expiry } = JSON.parse(cartData);
        const now = Date.now();

        if (expiry && now > expiry) {
          console.warn("Cart Data has Expired !!");
          localStorage.removeItem("cartItems");
          setCartItems([]);
        } else {
          setCartItems(Array.isArray(value) ? value : []);
        }
      }
    } catch (error) {
      console.log("Error in parsing", error);
    }

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
        setWithExpiry("cartItems", updatedItems, 7200000);
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
      setWithExpiry("cartItems", updatedItems, 7200000);
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

  const itemTotal = cartItems.reduce(
    (total: number, item: CartItem) =>
      total + item.itemCartSubTotal * item.order_item_qty,
    0
  );

  const grandTotal =
    itemTotal +
    excludedTaxTotal +
    Number(orderMethod && otherServices && otherServices?.amount);

  useEffect(() => {
    setItemTotal(grandTotal);
    setSubItemTotal(itemTotal);
  }, [grandTotal, itemTotal]);

  return (
    <>
      {cartItems && cartItems.length >= 1 ? (
        <div className="flex flex-col gap-2 md:h-[600px] bg-white rounded-lg p-4 shadow-sm">
          {/* Header */}
          <div className="flex justify-between items-center">

            <h2 className="text-lg font-semibold text-primary">Your Card</h2>
            <Button
              variant="outline"
              className="border-red-500 text-red-500 hover:bg-red-600 px-3 py-1 rounded-full text-sm"
              // onClick={clearCart}
            >
              Clear Cart
            </Button>
          </div>
          <div className="flex justify-between items-center border-t-2 border-dashed border-red-300 pt-2"></div>

          {/* Cart Items List */}
          <div className="flex-1 max-h-72 overflow-y-auto space-y-3">
            {cartItems.map((cartItem: CartItem, index: number) => (
              <div key={index}>
                <CartItem
                  item={cartItem}
                  shopData={shopData}
                  onRemove={() => askRemoveItem(cartItem.itemString)}
                  onIncrement={() => updateItemQty(cartItem.itemString, 1)}
                  onDecrement={() => updateItemQty(cartItem.itemString, -1)}
                />
                {/* {index + 1 !== cartItems.length && (
                  // <Separator className="bg-gray-200 my-2" />
                )} */}
              </div>
            ))}
          </div>

          <Separator className="h-0.5 bg-gray-200 my-2" />

          {/* Item Total */}
          <div className="flex justify-between text-sm font-medium">
            <span className="text-gray-500">Item Total</span>
            <span>
              {shopData?.currency_symbol}
              {formatAmount(itemTotal)}
            </span>
          </div>

          {/* Tax Breakdown */}
          {Object.entries(taxDetails).length > 0 && (
            <>
              {Object.entries(taxDetails).map(
                ([taxName, amount]: [string, number]) => (
                  <div
                    key={taxName}
                    className="flex justify-between text-sm font-medium text-gray-500"
                  >
                    <span>{taxName}:</span>
                    <span>
                      {shopData?.currency_symbol}
                      {formatAmount(amount)}
                    </span>
                  </div>
                )
              )}
            </>
          )}

          {/* Other Service Charges */}
          {orderMethod && otherServices && (
            <div className="flex justify-between text-sm font-medium text-gray-500">
              <span>{otherServices.label}</span>
              <span>
                {shopData?.currency_symbol}
                {formatAmount(otherServices.amount)}
              </span>
            </div>
          )}

          {/* Coupon Code Input */}
          <div className="flex items-center mt-2 gap-2">
            <div className="relative w-full">
              <Input placeholder="Coupon Code" className="pr-10 text-sm" />
              <Eye className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
            <Button className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-full text-sm">
              Apply
            </Button>
          </div>

          <Separator className="!h-0.5 bg-gray-300 mt-3" />

          {/* Grand Total */}
          <div className="flex justify-between text-lg font-semibold">
            <span>Total</span>
            <span>
              {shopData?.currency_symbol}
              {formatAmount(grandTotal)}
            </span>
          </div>
        </div>
      ) : (
        <div className="p-4 h-full content-center">
          <div className="flex flex-col items-center text-center">
            <img src="/empty.png" alt="empty-cart" className="w-32" />
            <p className="mt-4 text-gray-500 text-lg font-semibold">
              Your cart is empty! Add some delicious food items and satisfy your
              cravings. 🍽️😋
            </p>
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
