"use client";

import ClearCartModal from "@/components/Modal/clear-cart-modal";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cartStore";
import { Trash } from "lucide-react";
import React, { useEffect, useState } from "react";

export default function ClearCrtBtn() {
  const { newItem, cartCleared, itemRemoved, setItemRemoved } = useCartStore();

  const [itemsInCart, setItemsInCart] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    if (itemRemoved) {
      setItemRemoved(false);
    }
    const cartData = localStorage.getItem("cartItems");
    if (cartData) {
      const parsedData = JSON.parse(cartData);

      if (parsedData) {
        if (parsedData.length > 0) {
          setItemsInCart(true);
        } else {
          setItemsInCart(false);
          return;
        }
      }
    } else {
      setItemsInCart(false);
      return;
    }
    if (newItem) {
      setItemsInCart(true);
    }
  }, [newItem, cartCleared, itemRemoved]);

  // if (!itemsInCart) {
  //   return;
  // }

  return (
    <>
      {itemsInCart && (
        <>
          <Button variant={"outline"} onClick={() => setOpen(true)}>
            <Trash />
            Clear Cart
          </Button>
          <ClearCartModal open={open} setOpen={setOpen} />
        </>
      )}
    </>
  );
}
