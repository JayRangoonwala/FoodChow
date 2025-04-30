"use client";

import BookTableModal from "@/components/Modal/book-table-modal";
import ChooseServiceModal from "@/components/Modal/choose-service-modal";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

export default function HeaderBtns({
  parsedShopData,
  shopStatus,
  parsedCountryCodes,
}: {
  parsedShopData: any;
  shopStatus: any;
  parsedCountryCodes: any;
}) {
  const pathname = usePathname();

  return (
    <>
      {!["final-checkout", "order-status"].some((path) =>
        pathname?.includes(path)
      ) ? (
        <>
          <ChooseServiceModal
            shopStatus={shopStatus}
            parsedShopData={parsedShopData}
          />
          <BookTableModal
            parsedShopData={parsedShopData}
            countryCodes={parsedCountryCodes}
          />
        </>
      ) : (
        <Link href={"/"} className="order-2 lg:order-1">
          <Button variant={"outline"}>Back To Menu</Button>
        </Link>
      )}
    </>
  );
}
