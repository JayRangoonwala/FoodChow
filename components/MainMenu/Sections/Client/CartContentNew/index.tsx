"use client";

import React, { useContext, useEffect, useState } from "react";
import CartItem from "@/components/MainMenu/Sections/Client/CartContentNew/cart-item";
import { useShopDataStore } from "@/store/shopDataStore";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/store/cartStore";

import { Button } from "@/components/ui/button";
import RemoveItemModal from "@/components/Modal/remove-item-modal";
import { formatAmount } from "@/lib/utils";
import Link from "next/link";
import { MyContext } from "@/context/MyContext";
import DealItemCart from "@/components/MainMenu/Sections/Client/CartContentNew/Deals/DealItemCart";

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
  const { setNewItem, newItem, cartCleared, setCartCleared, setItemRemoved } =
    useCartStore();

  const [orderMethod, setOrderMethod] = useState();
  const [otherServices, setOtherServices] = useState<OtherServices>();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [taxDetails, setTaxDetails] = useState<Record<string, number>>({});
  const [excludedTaxTotal, setExcludedTaxTotal] = useState(0);
  // const [isRemoveDialogOpen, setRemoveDialogOpen] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<string | null>(null);

  const {
    Deals,
    setDeals,
    isRemoveDialogOpen,
    setRemoveDialogOpen,
    removeDealItems,
    setremoveDealItems,
  } = useContext(MyContext);

  // Load cart data only once on mount
  useEffect(() => {
    const cartData = localStorage.getItem("cartItems");
    const storedItems = localStorage.getItem("DealItems");

    if (storedItems) {
      const storedData = JSON.parse(storedItems);
      setDeals(storedData);
    }

    if (cartData) {
      const parsedData = JSON.parse(cartData);
      setCartItems(parsedData);
    }

    // console.log(item)

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
  }, []); // <--- empty dependency: only on initial mount

  // Handle new item addition
  useEffect(() => {
    if (newItem) {
      addItemToCart(newItem);
      setNewItem(null);
      console.log("new item added:", newItem);
    }
  }, [newItem]);

  // Handle new Deal addition for LocalStorage

  useEffect(() => {
    localStorage.setItem("DealItems", JSON.stringify(Deals));
  }, [Deals]);

  // Handle cart cleared
  useEffect(() => {
    if (cartCleared) {
      setCartItems([]);
      setDeals([]);

      localStorage.removeItem("cartItems");
      localStorage.removeItem("DealItems");

      setCartCleared(false);
    }
  }, [cartCleared]);

  // handle Add Items in Cart

  const addItemToCart = (item: CartItem) => {
    setCartItems((prevItems: CartItem[]) => {
      const existingItemIndex = prevItems.findIndex(
        (cartItem) => cartItem.itemString === item.itemString
      );

      let updatedItems;

      if (existingItemIndex !== -1) {
        updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          order_item_qty:
            updatedItems[existingItemIndex].order_item_qty +
            item.order_item_qty,
        };
      } else {
        updatedItems = [item, ...prevItems];
      }

      localStorage.setItem("cartItems", JSON.stringify(updatedItems));
      return updatedItems;
    });
  };

  const askRemoveItem = (itemString: string) => {
    setItemToRemove(itemString);
    setRemoveDialogOpen(true);
  };

  const confirmRemoveItem = () => {
    // if (itemToRemove) {
    //   setCartItems((prevItems: CartItem[]) => {
    //     const updatedItems = prevItems.filter(
    //       (item) => item.itemString !== itemToRemove
    //     );
    //     localStorage.setItem("cartItems", JSON.stringify(updatedItems));
    //     return updatedItems;
    //   });
    //   setItemToRemove(null);
    //   setRemoveDialogOpen(false);
    //   setItemRemoved(true);
    // }

    // if(removeDealItems){
    // setDeals((prevDeals: Array<{ id: number }>) =>{

    // const updatedDeals=  prevDeals.filter((deal) => deal.id !== removeDealItems)
    //         localStorage.setItem("DealItems", JSON.stringify(updatedDeals));

    // return updatedDeals
    // }
    // );

    // setremoveDealItems(null)
    //       setRemoveDialogOpen(false);
    //             // setItemRemoved(true);

    // }

    // if(removeDealItem){
    // setDealItems((prevItems:DealItem[]) => {
    //         const updatedItems = prevItems.filter(
    //           (item) => item.order_dealid !== removeDealItem
    //         );
    //         localStorage.setItem("dealItems", JSON.stringify(updatedItems));
    //         return updatedItems;
    //       });
    //       setremoveDealItem(null);
    //       setRemoveDialogOpen(false);
    //       // setItemRemoved(true);
    //     }

    confirmRemoveCartItem();
    confirmRemoveDealItem();
  };

  const confirmRemoveCartItem = () => {
    if (!itemToRemove) return;
    setCartItems((prevItems: CartItem[]) => {
      const updatedItems = prevItems.filter(
        (item) => item.itemString !== itemToRemove
      );
      localStorage.setItem("cartItems", JSON.stringify(updatedItems));
      return updatedItems;
    });
    setItemToRemove(null);
    setRemoveDialogOpen(false);
    setItemRemoved(true);
  };

  const confirmRemoveDealItem = () => {
    if (!removeDealItems) return;

    setDeals((prevDeals: Array<{ deal_item_string: string }>) => {
      const updatedDeals = prevDeals.filter(
        (deal) => deal.deal_item_string !== removeDealItems
      );
      localStorage.setItem("DealItems", JSON.stringify(updatedDeals));
      return updatedDeals;
    });

    setremoveDealItems(null);
    setRemoveDialogOpen(false);
  };

  const cancelRemoveItem = () => {
    setItemToRemove(null);
    setremoveDealItems(null);

    setRemoveDialogOpen(false);
  };

  //handle update quantity for items only

  const updateItemQty = (itemString: string, delta: number) => {
    setCartItems((prevItems: CartItem[]) => {
      const item = prevItems.find((item) => item.itemString === itemString);
      if (item) {
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

        localStorage.setItem("cartItems", JSON.stringify(updatedItems));
        // setsaveLocal(updatedItems);
        return updatedItems;
      }
      return prevItems;
    });
  };

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

  // const itemTotal = cartItems?.reduce(
  //   (total: number, item: CartItem) => {
  //     if (!item || item.order_item_qty == null) {
  //       console.warn('Item or item quantity is null:', item);
  //       return total; // skip this item if there's a problem
  //     }
  //     return total + item?.itemCartSubTotal * item.order_item_qty;
  //   },
  //   0
  // );
  console.log("cartItems", cartItems);
  const itemTotal = cartItems?.reduce(
    (total: number, item: CartItem) =>
      total + item.itemCartSubTotal * item.order_item_qty,
    0
  );

  const dealTotal = Deals?.reduce(
    (total: number, item: CartItem) =>
      total + item.order_total_deal_price * item.order_deal_qty,
    0
  );

  const grandTotal =
    itemTotal +
    dealTotal +
    excludedTaxTotal +
    Number(orderMethod && otherServices && otherServices?.amount);

  return (
    <>
      {cartItems?.length >= 1 || Deals?.length >= 1 ? (
        <div className="flex flex-col gap-2 h-full">
          <div className="flex-1 overflow-scroll">
            <DealItemCart />

            {cartItems &&
              cartItems.length >= 1 &&
              cartItems.map((cartItem: CartItem, index: number) => (
                <React.Fragment key={cartItem.itemString}>
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

          {/* <Separator className="h-1 bg-muted" /> */}
          <div className="flex justify-between items-center text-lg font-semibold">
            <span className="text-muted-foreground">Item Total:</span>
            <span className="text-muted-foreground">
              {shopData?.currency_symbol}
              {formatAmount(itemTotal + dealTotal)}
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
                    className="flex justify-between items-center text-lg font-semibold text-muted-foreground"
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
          <div className="space-y-2">
            {orderMethod && otherServices && (
              <>
                <div className="flex justify-between items-center text-lg font-semibold text-muted-foreground">
                  <span>{otherServices.label}</span>
                  <span>
                    {shopData?.currency_symbol}
                    {formatAmount(otherServices.amount)}
                  </span>
                </div>
                <Separator className="h-1 bg-muted" />
              </>
            )}
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Total:</span>
              <span>
                {shopData?.currency_symbol}
                {formatAmount(grandTotal)}
              </span>
            </div>
            <Link href={"/order/final-checkout"} className="w-full">
              <Button className="w-full">Proceed to Checkout</Button>
            </Link>
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
