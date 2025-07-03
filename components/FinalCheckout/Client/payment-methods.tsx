"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { fetchShopPayment, saveCartWD } from "@/lib/shopService";
import { useCheckoutStore } from "@/store/checkoutStore";
import { useShopDataStore } from "@/store/shopDataStore";
import { format } from "date-fns";
import { Loader } from "lucide-react";
import React, { useEffect, useState } from "react";

export function mergeTaxesForCart(
  cartItemList: any[],
  DealItemList?: any[]
): any[] {
  const mergedTaxes: Record<string, any> = {};

  cartItemList.forEach((cartItem: any) => {
    cartItem.item_tax?.forEach((tax: any) => {
      const taxKey = tax.taxname;
      const taxAmount =
        (cartItem.order_item_price *
          cartItem.order_item_qty *
          tax.tax_percentage) /
        100;

      if (mergedTaxes[taxKey]) {
        mergedTaxes[taxKey].tax_amount += taxAmount;
      } else {
        mergedTaxes[taxKey] = {
          tax_name: tax.taxname,
          tax_percentage: tax.tax_percentage,
          taxType: tax.taxType,
          tax_amount: taxAmount,
        };
      }
    });
  });

  DealItemList?.forEach((dealItem: any) => {
    dealItem.deal_taxes?.forEach((tax: any) => {
      const taxKey = tax.taxname;
      const taxAmount =
        (dealItem.order_deal_qty *
          dealItem.order_total_deal_price *
          tax.tax_percentage) /
        100;

      if (mergedTaxes[taxKey]) {
        mergedTaxes[taxKey].tax_amount += taxAmount;
      } else {
        mergedTaxes[taxKey] = {
          tax_name: tax.taxname,
          tax_percentage: tax.tax_percentage,
          taxType: tax.taxType,
          tax_amount: taxAmount,
        };
      }
    });
  });

  return Object.values(mergedTaxes);
}

export default function PaymentMetod() {
  const { shopData } = useShopDataStore();
  const { itemTotal, itemSubTotal } = useCheckoutStore();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<any>(null);
  const [orderMethod, setOrderMethod] = useState<any>(null);
  const [paymentMethods, setPaymentMethods] = useState<any>();
  const [isFetching, setIsFetching] = useState(false);

  const [orderNotes, setOrderNotes] = useState<any>();
  const [cartItems,setCartItems] = useState<any>([]);
  const [placingOrder, setIsPlacingOrder] = useState<any>();

  useEffect(() => {
    (async () => {
      setIsFetching(true);
      const orderMethod = localStorage.getItem("orderMethod");
      const parsedOrderMethod = orderMethod ? JSON.parse(orderMethod) : null;

      if (parsedOrderMethod) {
        setOrderMethod(parsedOrderMethod);
        const res = await fetchShopPayment(
          shopData?.ShopId,
          parsedOrderMethod.order_method_id
        );

        if (res.message === "SUCCESS") {
          if (res.data && res.data !== "") {
            const parsedData = JSON.parse(res.data);
            setPaymentMethods(parsedData);
            setIsFetching(false);
          }
        }
        setIsFetching(false);
      }
    })();
  }, []);

  const handlePlaceOrder = () => {
    try {
      setIsPlacingOrder(true);
      const orderModel: any = {};

      const cartData = localStorage.getItem("cartItems");
      if(cartData){
        const {value} = JSON.parse(cartData);
        setCartItems(value ? value : []);
      }

      // const cartItems = localStorage.getItem("cartItems")
      //   ? JSON.parse(localStorage.getItem("cartItems") || "")
      //   : [];

      const email = localStorage.getItem("xEmail")
        ? localStorage.getItem("xEmail") || ""
        : null;
      const mobile = localStorage.getItem("xMobile")
        ? localStorage.getItem("xMobile") || ""
        : null;
      const firstName = localStorage.getItem("xFirstName")
        ? localStorage.getItem("xFirstName") || ""
        : null;
      const lastName = localStorage.getItem("xLastName")
        ? localStorage.getItem("xLastName") || ""
        : null;
      const countryCode = localStorage.getItem("xCountryCode")
        ? localStorage.getItem("xCountryCode") || ""
        : null;

      const time = localStorage.getItem("selectedOption")
        ? JSON.parse(localStorage.getItem("selectedOption") || "{}")
        : null;

      console.log(selectedPaymentMethod.split(":")[0]);
      const paymentType = selectedPaymentMethod.split(":");

      orderModel.extra_charge_label = orderMethod.order_method_charge_label;
      // TODO: coupon code
      orderModel.couponCode = "";
      orderModel.currency = shopData.currency_symbol;
      // TODO: calculate decimal point and delivery charges
      orderModel.decimal_point = orderModel.delivery_charges = "0";
      orderModel.delivery_method = orderMethod.method_name;
      orderModel.delivery_method_id = orderMethod.order_method_id;
      orderModel.payment_method_id = paymentType[0];
      orderModel.custom_menu_id = "0";
      orderModel.device_id = "0";
      orderModel.device_token = "0";
      orderModel.device_type = "3";
      // TODO: add deals
      orderModel.deals = "";
      orderModel.notes = orderNotes;
      orderModel.payment_charges = orderMethod.order_method_charge_amount
        ? orderMethod.order_method_charge_amount
        : 0;
      orderModel.payment_method =
        paymentType[1] == "Pay Online" ? "Online" : paymentType[1];
      orderModel.shop_id = shopData.ShopId;
      orderModel.food_shop_address_id = null;
      orderModel.subtotal_amount = itemSubTotal;
      // TODO: discounted amount
      orderModel.discounted_amount = "0.00";
      orderModel.table_no = localStorage.getItem("selectedTable")
        ? localStorage.getItem("selectedTable") || null
        : null;
      orderModel.taxes = mergeTaxesForCart(cartItems);
      orderModel.total_amount = Number(itemTotal).toFixed(2);
      // console.log('orderModel', orderModel.total_amount);
      orderModel.trans_status = "0";
      orderModel.user_address = orderMethod
        ? orderMethod.delivery_address || ""
        : "";
      orderModel.user_email = email;
      orderModel.user_id = null;
      orderModel.user_mobile = mobile;
      if (firstName && firstName.trim().toString() != "") {
        orderModel.user_name = firstName;
      } else {
        orderModel.user_name = "Guest";
      }
      orderModel.user_last_name = lastName;
      orderModel.user_type = "G";
      orderModel.delivery_datetime =
        time == "now"
          ? format(new Date(), "dd MMM yyyy h:mm a")
          : orderMethod.takeawayPickupLaterDate;
      orderModel.order_menu_type = "catering";
      orderModel.order_status_time = time;
      orderModel.items = [...cartItems];
      orderModel.user_country_code = countryCode;

      orderModel.custom_menu_id = localStorage.getItem("xSelectedMenuId")
        ? JSON.parse(localStorage.getItem("xSelectedMenuId") || "")
        : 0;
      orderModel.order_menu_type = localStorage.getItem("xSelectedMenu")
        ? JSON.parse(localStorage.getItem("xSelectedMenu") || "")
        : "normal";

      console.log(orderModel);

      placeOrder(orderModel);
    } catch (err) {
      console.error("Error placing order:", err);
    }
  };

  const placeOrder = async (orderObj: any) => {
    try {
      const res = await saveCartWD(orderObj);
      console.log(res);
      setIsPlacingOrder(false);
    } catch (err) {
      console.error("Error placing order:", err);
    }
  };

  return (
    <>
      {/* Remove the form tag here since StripeWrapper will handle its own form */}
      <div className="border rounded-lg border-gray-400 py-4">
        <RadioGroup
          value={selectedPaymentMethod}
          onValueChange={(value) => setSelectedPaymentMethod(value)}
        >
          {!isFetching ? (
            paymentMethods && paymentMethods.length > 0 ? (
              paymentMethods.map((pymntMthd: any, index: any) => (
                <div
                  key={index}
                  className="flex items-center px-4  pb-3 space-x-2 border-gray-300 border-b last:pb-0 last:border-b-0"
                >
                  <RadioGroupItem
                    value={`${pymntMthd.payment_method_id}:${pymntMthd.payment_method}`}
                    id={`${pymntMthd.payment_method_id}:${pymntMthd.payment_method}`}
                  />

                  <Label
                    htmlFor={`${pymntMthd.payment_method_id}:${pymntMthd.payment_method}`}
                  >
                    {pymntMthd.payment_method.toLowerCase() === "card" ||
                    pymntMthd.payment_method.toLowerCase() === "cash"
                      ? pymntMthd.payment_method + " at the counter"
                      : pymntMthd.payment_method}
                  </Label>
                </div>
              ))
            ) : (
              <div className="flex items-center px-4  pb-3 space-x-2 border-gray-300 border-b last:pb-0 last:border-b-0">
                <RadioGroupItem
                  value="No Payment Method Available"
                  id="No Payment Method Available"
                  disabled
                />
                <Label htmlFor="No Payment Method Available">
                  No Payment Method Available
                </Label>
              </div>
            )
          ) : (
            Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center px-4  pb-3 space-x-2 border-gray-300 border-b last:pb-0 last:border-b-0"
              >
                <RadioGroupItem
                  value="No Payment Method Available"
                  id="No Payment Method Available"
                  disabled
                />
                <Label htmlFor="No Payment Method Available">
                  <Skeleton className="h-4 w-40" />
                </Label>
              </div>
            ))
          )}
        </RadioGroup>
      </div>

      <Label htmlFor="r4" className="my-4 font-extrabold text-gray-700 text-lg ">
        Comments (Optional)
      </Label>
      <Textarea
        id="r4"
        placeholder="Any Notes (Optional)"
        className="mt-5 md:h-40 font-medium text-[20px] pt-3 sm:text-[10px]"
        onChange={(e) => setOrderNotes(e.target.value)}
        value={orderNotes}
      />

      <div className="text-center text-[#0aa861] font-bold mt-4 mb-2 text-lg">
        <h3>
          {orderMethod && orderMethod.custom_notes
            ? orderMethod.custom_notes
            : "Thank You"}
        </h3>
      </div>

      <div className="w-full *:w-full">
        <Button
          disabled={
            (!(paymentMethods && paymentMethods.length > 0) &&
              !paymentMethods) ||
            placingOrder
          }
          onClick={() => handlePlaceOrder()}
          className="bg-[#0AA89E]"
        >
          {placingOrder ? (
            <>
              <Loader className="animate-spin" />
              Placing order...
            </>
          ) : (
            "Place Order"
          )}
        </Button>
      </div>

      {/* <Dialog open={stripeWrapperOpen} onOpenChange={setStripeWrapperOpen}>
     <DialogTrigger asChild>
       <Button
         className={clsx(
           "w-full mt-4",
           selectedPaymentMethod
             ? "bg-orange-600 hover:bg-orange-500"
             : "bg-gray-400 cursor-not-allowed"
         )}
         disabled={!selectedPaymentMethod}
         onClick={handlePayClick} // this sets stripeWrapperOpen = true
       >
         Pay <strong>Rs.{grandTotal}</strong>
       </Button>
     </DialogTrigger>

     {clientSecret && (
       <DialogContent className="max-w-lg w-full">
         <DialogHeader>
           <DialogTitle>Online Payment</DialogTitle>
         </DialogHeader>
         <StripeWrapper clientSecret={clientSecret} />
       </DialogContent>
     )}
   </Dialog> */}
    </>
  );
}
