import { MyContext } from "@/context/MyContext";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import React, { useContext } from "react";

const DealItemCart = () => {
  const { Deals, setDeals } = useContext(MyContext);
  const { setremoveDealItems } = useContext(MyContext);
  const { setRemoveDialogOpen } = useContext(MyContext);

  const handleDecrementQty = (string) => {
    setDeals((prevDeals) =>
      prevDeals.map((deal) => {
        if (deal.deal_item_string === string) {
          if (deal.order_deal_qty <= 1) {
            setRemoveDialogOpen(true);
            setremoveDealItems(deal.deal_item_string);
            return deal;
          }
          return {
            ...deal,
            order_deal_qty: deal.order_deal_qty - 1,
          };
        }
        return deal;
      })
    );
  };

  const handleIncrementQty = (string) => {
    setDeals((prevDeals) =>
      prevDeals.map((deal) =>
        deal.deal_item_string === string
          ? { ...deal, order_deal_qty: deal.order_deal_qty + 1 }
          : deal
      )
    );
  };

  return (
    <>
      {Deals &&
        Deals.length > 0 &&
        Deals.map((item, index) => (
          <div key={index} className="flex py-2 overflow-auto">
            <div className="left-side flex flex-1 flex-col gap-1">
              <h4 className="font-semibold text-lg text-start">
                {item.order_dealname}
              </h4>
              {/* <div className="text-[#999] font-medium text-sm"> */}
              <div className="flex flex-col text-muted-foreground text-start">
                {Array.isArray(item.items) &&
                  item.items.map((dealItem, idx) => (
                    <div key={idx}>
                      <p className="text-[#999] font-medium text-sm">
                        1 x {dealItem.order_itemname}
                      </p>
                      {dealItem.order_size && (
                        <p className="text-[#999] text-[12px] font-medium">
                          {dealItem.order_size}
                        </p>
                      )}
                      {dealItem?.custom_desc &&
                        dealItem?.custom_desc?.map(
                          (customdesc, customIndex) => (
                            <p
                              key={customIndex}
                              className="text-[#999] text-[12px] font-medium"
                            >
                              {customdesc.item_cust_values}
                            </p>
                          )
                        )}
                      {dealItem.preference_names && (
                        <p className="text-[#999] text-[12px] font-medium">
                          {dealItem.preference_names}
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            </div>

            <div className="right-side flex flex-col">
              <span className="text-primary font-semibold self-end text-lg">
                Rs.{" "}
                {Number(
                  item.order_total_deal_price * item.order_deal_qty
                ).toFixed(2)}
              </span>

              <div className="flex gap-1 items-center">
                <Button
                  variant="outline"
                  className="rounded-full h-8 w-8"
                  onClick={() => {
                    setremoveDealItems(item.deal_item_string);
                    setRemoveDialogOpen(true);
                  }}
                >
                  <Trash2 />
                </Button>

                <div className="flex h-10 text-center items-center">
                  <Button
                    variant="outline"
                    className="font-bold text-2xl rounded-none w-[30px] rounded-l-md border-r-0 border-input pt-1"
                    onClick={() => handleDecrementQty(item.deal_item_string)}
                  >
                    -
                  </Button>
                  <div className="border-y border-input w-[30px] shadow-xs h-9 content-center flex items-center justify-center">
                    {item.order_deal_qty}
                  </div>
                  <Button
                    variant="outline"
                    className="font-bold text-xl rounded-none w-[30px] rounded-r-md border-l-0 border-input"
                    onClick={() => handleIncrementQty(item.deal_item_string)}
                  >
                    +
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
    </>
  );
};

export default DealItemCart;
