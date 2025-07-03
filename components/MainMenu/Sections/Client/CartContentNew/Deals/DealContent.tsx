"use client";

import "@/src/app/globals.css";
import styles from "./DealContent.module.css";
import Image from "next/image";
import { useCallback, useContext, useEffect, useState } from "react";
import { Button, CircularProgress } from "@mui/material";
import DealModal from "@/components/Modal/DealModalBox/DealModal";

import DeliveryLogo from "@/components/Svgs/delivery";
import DineInLogo from "@/components/Svgs/dinein";
import TakeAwayLogo from "@/components/Svgs/takeaway";
import { useToggleModalStore } from "@/store/toggleModalStore";
import { useServiceStore } from "@/store/serviceStore";
import { usePendingAddItemStore } from "@/store/addItemStore";
import { MyContext } from "@/context/MyContext";
import DealNotAvailableModal from "@/components/Modal/DealModalBox/DealNotAvailableModal";

type Deal = {
  DealId: string | number;
  DealName: string;
  DealDesc: string;
  DealImage: string;
  DealPrice: number | string;
  OrderMethod: string;
};

type DealContentProps = {
  dealList: Deal[];
  qry: string;
};

export default function DealContent({ dealList, qry }: DealContentProps) {

  const { setServiceModalOpen } = useToggleModalStore();
  const { service } = useServiceStore();
  const [open, setOpen] = useState(false);
  const [skipDeal, setSkipDeal] = useState<boolean>(false)
  const [rejectedDealMethod, setRejectedDealMethod] = useState<string>("");


  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState<string | number | null>(null);
  const [serviceSelected, setServiceSelected] = useState<boolean>(false)
  // const [pendingDeal, setPendingDeal] = useState<Deal | null>(null);
  const { pendingDeal, setPendingDeal,chooseService,setChooseService } = useContext(MyContext)
  const { pendingAddItemId, setPendingAddItemId } = usePendingAddItemStore();
  //  const [serviceChoosed,setServiceChoosed]=useState(localStorage.getItem("selectedService"))



  // useEffect(() => {
  //   const isService = localStorage.getItem("selectedService");
  //   console.log("get", isService);

  //   if (isService) {
  //     setServiceSelected(true);

  //   }
  // }, []);

  // useEffect(()=>{
  // if(localStorage.getItem("selectedService")){
  //   console.log("service selected");
  //   }

  // },[pendingDeal])


  //   useEffect(() => {
  //     if (serviceSelected && pendingDeal) {
  //       setLoading(pendingDeal.DealId);
  //       setTimeout(() => {
  //         // setSelectedDeal(pendingDeal);
  //         setOpen(true);
  //         setLoading(null);
  //         // setPendingDeal(null);
  //       }, 500);
  //     }
  //   }, [serviceSelected]);


  //   const handleOpen = useCallback((deal: Deal) => {
  //     const isService = localStorage.getItem("selectedService");

  //     if (!isService) {
  //       setPendingAddItemId(null)
  //       setServiceModalOpen(true);
  //       setPendingDeal(deal); // store to open later

  //       return;
  //     }

  //     // if service already selected
  //     setLoading(deal.DealId);
  //     setTimeout(() => {
  //       setSelectedDeal(deal);
  //       setOpen(true);
  //       setLoading(null);
  //     }, 500);
  //   }, []);



  useEffect(() => {
    if (service && pendingDeal) {

      const method = localStorage.getItem("orderMethod")

      if (method) {
        const orderMethod = JSON.parse(method)
        const selectedMethod = orderMethod.order_method_id?.toString()
        // const selectedMethod="5"

        if (selectedMethod && !pendingDeal.OrderMethod.split(",").includes(selectedMethod)) {
          console.log("This deal does not support selected method:", pendingDeal.OrderMethod);
          setRejectedDealMethod(pendingDeal.OrderMethod);
          setSkipDeal(true)
          return; // skip this deal or show an alert
        }

      }
      setPendingAddItemId(null)
      if(!chooseService){

      setLoading(pendingDeal.DealId);
      setTimeout(() => {
        setSelectedDeal(pendingDeal);
        setOpen(true);
        setLoading(null);
      }, 500);
      // setPendingDeal(false)
    }

    }
  }, [service, pendingDeal]);

  const handleOpen = useCallback((deal: Deal) => {
    console.log("deal", deal);

    const method = localStorage.getItem("orderMethod")


    if (method) {
      const orderMethod = JSON.parse(method)
      const selectedMethod = orderMethod.order_method_id?.toString()
      // const selectedMethod="5"

      if (selectedMethod && !deal.OrderMethod.split(",").includes(selectedMethod)) {
        setRejectedDealMethod(deal.OrderMethod);
        setSkipDeal(true)
        return; // skip this deal
      }

    }
    setPendingAddItemId(null)

    if (service && !chooseService) {
      setPendingAddItemId(null)
      setLoading(deal.DealId);
      setTimeout(() => {
        setSelectedDeal(deal);
        setOpen(true);
        setLoading(null);
      }, 500);

    } else {



      setPendingDeal(deal);

      setServiceModalOpen(true);
      // setPendingDeal(false)
    }
  }, [service]);

  const handleClose = useCallback(
    (
      setSelectedPreferences?: (value: Record<string, unknown>) => void,
      setSelectedPrefOptions?: (value: unknown[]) => void,
      setshowError?: (value: boolean) => void
    ) => {
      setSelectedDeal(null);
      setOpen(false);
      if (typeof setSelectedPreferences === "function")
        setSelectedPreferences({});
      if (typeof setSelectedPrefOptions === "function")
        setSelectedPrefOptions([]);
      if (typeof setshowError === "function") setshowError(false);
    },
    []
  );
  const filteredDeals = dealList?.filter(
    (deal) =>
      deal.DealName.toLowerCase().replaceAll(" ", "").includes(qry) ||
      deal.DealDesc.toLowerCase().replaceAll(" ", "").includes(qry)
  );

  // const handleOpen = useCallback((deal: Deal) => {

  //   if(!serviceSelected){
  //     setServiceModalOpen(true)

  //   }



  //   setLoading(deal.DealId);
  //   setTimeout(() => {
  //     setSelectedDeal(deal);
  //     setOpen(true);
  //     setLoading(null);
  //   }, 500);


  // }, []);


  // if (!dealList || dealList.length === 0) {
  //   return null;
  // }
  if (!filteredDeals || filteredDeals.length === 0) {
    return null;
  }


  return (
    <div id="category-deals" className={styles.dealMainContainer}>
      <div className={styles.dealContainer}>
        <div className={styles.dealsAvailable}>
          <div className={styles.heading}>
            <h3>Deals</h3>
            <p>{dealList.length} items</p>
          </div>

          <div className={styles.gridBox}>
            {filteredDeals.map((deal) => (
              <div className={styles.content} key={deal.DealId}>
                <div className={styles.imgDiv}>
                  <div className={styles.img}>
                    <Image
                      src={`https://www.foodchow.com/DealImage/${deal.DealImage}`}
                      alt={deal.DealName}
                      width={200}
                      height={150}
                      // priority
                     unoptimized
                    />
                    <div className={styles.details}>
                      <div className={styles.miniDetails}>
                        <div className={styles.specialDeal}>
                          <h6>{deal.DealName}</h6>
                          <p>{deal.DealDesc}</p>
                        </div>
                        <div className={styles.price}>
                          <p>Rs.{Number(deal.DealPrice).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.features}>
                  <div className={styles.logoDiv}>
                    {deal.OrderMethod.includes("1") && (
                      <div className={styles.orderMethod}>
                        <TakeAwayLogo className={styles.pickupLogo} />
                        <label>Take Away</label>
                      </div>
                    )}
                    {deal.OrderMethod.includes("2") && (
                      <div className={styles.orderMethod}>
                        <DineInLogo className={styles.pickupLogo} />
                        <label>Dine-In</label>
                      </div>
                    )}
                    {deal.OrderMethod.includes("5") && (
                      <div className={styles.orderMethod}>
                        <DeliveryLogo className={styles.pickupLogo} />
                        <label>Delivery</label>
                      </div>
                    )}
                  </div>

                  <div className={styles.addBtn}>
                    <Button
                      variant="contained"
                      onClick={() => handleOpen(deal)}
                    >
                      Add
                      {loading === deal.DealId && (
                        <CircularProgress
                          className={styles.muiLoader}
                          size="12px"
                        />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <DealNotAvailableModal open={skipDeal} setSkipDeal={setSkipDeal} orderMethods={rejectedDealMethod} />
      <DealModal open={open} onClose={handleClose} deal={selectedDeal} />
    </div>
  );
}
