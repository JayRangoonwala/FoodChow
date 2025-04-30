/* eslint-disable @next/next/no-img-element */
"use client";

import AddItemModal from "@/components/Modal/add-item-modal";
import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";

export default function MenuImage({
  imageUrl,
  item,
  ctgId,
}: {
  imageUrl: string;
  item: any;
  ctgId: number;
}) {
  const [exists, setExists] = useState<boolean>(false);

  useEffect(() => {
    if (!imageUrl) {
      setExists(false);
      return;
    }

    const img = new Image();
    img.onload = () => setExists(true);
    img.onerror = () => setExists(false);
    img.src = imageUrl;
  }, [imageUrl]);

  if (!exists) {
    return (
      <div className="flex w-[130px] items-center justify-center">
        <AddItemModal itemData={item} exists={exists} ctgId={ctgId} />
      </div>
    );
  }

  return (
    <div className="flex h-[130px] w-[130px] items-center justify-center">
      <div className={cn(exists ? "relative" : "block")}>
        <img
          src={imageUrl}
          alt={item.ItemName}
          className="w-[130px] h-[130px] rounded-md object-cover cursor-pointer"
          onClick={() => {
            const addItemModalElement =
              document.querySelector("#add-item-button");
            if (addItemModalElement) {
              (addItemModalElement as HTMLButtonElement).click();
            }
          }}
        />
        <AddItemModal itemData={item} exists={exists} ctgId={ctgId} />
      </div>
    </div>
  );
}
