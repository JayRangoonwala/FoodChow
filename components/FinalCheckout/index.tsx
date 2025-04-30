"use client";

import React, { useEffect, useState } from "react";
import FinalCheckoutCart from "./final-checkout-cart";
import LeftSection from "./Client/left-section";
import { useCartStore } from "@/store/cartStore";
import Link from "next/link";
import { Button } from "../ui/button";
import { useShopDataStore } from "@/store/shopDataStore";
import { fetchUserOptions } from "@/lib/shopService";

export default function FinalCheckoutPage({
  parsedCountryCodes,
}: {
  parsedCountryCodes: any;
}) {
  const { shopData } = useShopDataStore();
  const [parsedUserOptions, setParsedUserOptions] = useState<any>(null);

  const [cartItems, setCartItems] = useState<any>([]);
  const { cartCleared, itemRemoved } = useCartStore();

  useEffect(() => {
    // Get cart items
    const cartData = localStorage.getItem("cartItems");
    setCartItems(cartData ? JSON.parse(cartData) : []);
  }, [cartCleared, itemRemoved]);

  useEffect(() => {
    (async () => {
      try {
        if (shopData) {
          const shopId = shopData?.ShopId;
          const userOptions = await fetchUserOptions(shopId);

          if (userOptions.data) {
            const parsedUserOptions = JSON.parse(userOptions.data);
            setParsedUserOptions(parsedUserOptions[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching user options:", error);
      }
    })();
  }, [shopData]);

  return (
    <>
      {cartItems && cartItems.length >= 1 ? (
        <div className="flex justify-start lg:justify-center flex-col lg:flex-row w-full gap-4 h-full lg:pb-11 p-0 px-3">
          <div className="w-full lg:w-2/5 order-2">
            <LeftSection
              parsedCountryCodes={parsedCountryCodes}
              parsedUserOptions={parsedUserOptions}
            />
          </div>
          <div className="w-full lg:w-1/4 lg:order-2">
            <FinalCheckoutCart />
          </div>
        </div>
      ) : (
        <div className="p-4 h-full content-center justify-items-center">
          <div className="col-md-12 place-items-center">
            <img src="/empty.png" alt="empty-cart" />
          </div>
          <div className="col-md-12 text-center mt-4 fs-18 fw-600">
            <label className="text-muted-foreground text-xl">
              Your cart is empty! Add some delicious food items and satisfy your
              cravings. 🍽️😋
            </label>
          </div>
          <Link href="/">
            <Button variant={"outline"}>Back To Menu</Button>
          </Link>
        </div>
      )}
    </>
  );
}
