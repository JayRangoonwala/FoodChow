import FinalCheckoutPage from "@/components/FinalCheckout";
import { fetchCountryWithCountryCode } from "@/lib/shopService";
import NextTopLoader from "nextjs-toploader";
import React from "react";

export default async function FinalCheckout() {
  const countryCodes = await fetchCountryWithCountryCode();

  let parsedCountryCodes;

  if (countryCodes.data) {
    parsedCountryCodes = JSON.parse(countryCodes.data);
  }
  return <FinalCheckoutPage parsedCountryCodes={parsedCountryCodes} />;
}
