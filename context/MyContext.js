"use client";
import { createContext, useState } from "react";

const MyContext = createContext();

export const MyContextProvider = ({ children }) => {
  const [Deals, setDeals] = useState([]);
  const [removeDealItems, setremoveDealItems] = useState(false);
  const [isRemoveDialogOpen, setRemoveDialogOpen] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const [saveLocal, setsaveLocal] = useState([]);
  const [totalCartAmount, settotalCartAmount] = useState(null);
  const [couponCode, setcouponCode] = useState("");
  const [couponPrice, setcouponPrice] = useState(0);
  const [autoApplonSaveBtn, setautoApplonSaveBtn] = useState(false);
  const [autoAppliedonSave, setautoAppliedonSave] = useState(false);
  const [newuser, setnewuser] = useState(false);
  const [ApplyNewUserCoupon, setApplyNewUserCoupon] = useState(false);
  const [OrderId, setOrderId] = useState("");
  const [payAtCounter, setPayatCounter] = useState(false);
    const [tableNotAvailable,setTableNotAvailable]=useState(false)
  const [pendingDeal, setPendingDeal] = useState(null);
    const [deliverFood,setDeliverFood]=useState(false)
    const [reOrder,setReOrder]=useState(false)
    const [chooseService,setChooseService]=useState(false)
  


  const sendData = {
    Deals,
    setDeals,
    removeDealItems,
    setremoveDealItems,
    summaryData,
    setSummaryData,
    isRemoveDialogOpen,
    setRemoveDialogOpen,
    saveLocal,
    setsaveLocal,
    totalCartAmount,
    settotalCartAmount,
    couponCode,
    setcouponCode,
    couponPrice,
    setcouponPrice,
    autoApplonSaveBtn,
    setautoApplonSaveBtn,
    autoAppliedonSave,
    setautoAppliedonSave,
    newuser,
    setnewuser,
    ApplyNewUserCoupon,
    setApplyNewUserCoupon,
    OrderId,
    setOrderId,
    payAtCounter,
    setPayatCounter,
    tableNotAvailable,setTableNotAvailable,
    pendingDeal, setPendingDeal,
    deliverFood,setDeliverFood,
    reOrder,setReOrder,
    chooseService,setChooseService,
  };

  return <MyContext.Provider value={sendData}>{children}</MyContext.Provider>;
};

export { MyContext }; // named export
