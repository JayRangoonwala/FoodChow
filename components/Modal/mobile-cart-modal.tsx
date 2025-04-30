"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import CartContent from "../MainMenu/Sections/Client/CartContent";
import ClearCrtBtn from "../MainMenu/Sections/Client/CartContent/clear-crt-btn";

export default function MobileCartModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-full h-full rounded-none">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center mr-12">
            <span>Your Cart</span>
            <ClearCrtBtn />
          </DialogTitle>
          <div className="h-full pb-2">
            <CartContent />
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
