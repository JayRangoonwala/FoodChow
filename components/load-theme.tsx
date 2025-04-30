"use client";

import { useDynamicTheme } from "@/hooks/useDynamicColor";
import { useShopDataStore } from "@/store/shopDataStore";
import React, { useEffect } from "react";

export default function LoadTheme({
  shopId,
  shopData,
}: {
  shopId: any;
  shopData: any;
}) {
  const { setShopData } = useShopDataStore();

  useDynamicTheme(shopId);

  useEffect(() => {
    setShopData(shopData);
  }, [shopData]);

  if (typeof window !== "undefined" && document) {
    localStorage.setItem("shopId", shopId);
  }
  return <div className="hidden" id="theme-variables"></div>;
}
