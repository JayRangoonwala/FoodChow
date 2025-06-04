"use client";

import React, { useEffect, useState } from "react";
import FinalCheckoutCart from "./final-checkout-cart";
import LeftSection from "./Client/left-section";
import { useCartStore } from "@/store/cartStore";
import Link from "next/link";
import { Button } from "../ui/button";
import { useShopDataStore } from "@/store/shopDataStore";
import { fetchUserOptions } from "@/lib/shopService";
import { Lock } from "lucide-react";
import UserLoginModal from "../Modal/User-Login";

export default function FinalCheckoutPage({
  parsedCountryCodes,
}: {
  parsedCountryCodes: any;
}) {
  const { shopData } = useShopDataStore();
  const [parsedUserOptions, setParsedUserOptions] = useState<any>(null);

  const [cartItems, setCartItems] = useState<any>([]);
  const { cartCleared, itemRemoved } = useCartStore();
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  useEffect(() => {
    // Get cart items
    try {
      const cartData = localStorage.getItem("cartItems");

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
    } catch (err) {
      console.error("Error parsing cart data:", err);
      setCartItems([]);
    }
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
        <div className="w-full max-w-6xl font-sans mx-auto px-4 lg:px-6">
          {/* Main Content Layout */}
          <div className="flex flex-col lg:flex-row w-full gap-6 h-full pb-11">
            {/* Left Section */}
            <div className="w-full lg:w-2/3">
              <div className="left-section flex flex-col gap-4">
                {/* LOGIN BAR */}
                <div className="w-full bg-white text-green-600 border-2 border-gray-200 px-4 py-2 rounded-xl flex items-center justify-between">
                  <span className="font-medium">
                    Sign in to unlock exclusive rewards, or continue as a guest.
                  </span>
                  <button
                    className="bg-green-500 text-white px-4 py-2 rounded-2xl flex items-center gap-1"
                    onClick={() => setIsLoginOpen(true)}
                  >
                    <Lock className="w-4 h-4" />
                    <span>Login</span>
                  </button>
                </div>
                <LeftSection
                  parsedCountryCodes={parsedCountryCodes}
                  parsedUserOptions={parsedUserOptions}
                />
              </div>
            </div>

            {/* Cart Section */}
            <div className="w-full lg:w-1/3 h-full">
              <FinalCheckoutCart />
            </div>
          </div>
          <UserLoginModal
            open={isLoginOpen}
            onClose={() => setIsLoginOpen(false)}
            parsedCountryCodes={parsedCountryCodes}
          />
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
