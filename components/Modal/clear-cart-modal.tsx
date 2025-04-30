import React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { useCartStore } from "@/store/cartStore";

export default function ClearCartModal({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const { setCartCleared } = useCartStore();

  const handleClearCart = () => {
    setCartCleared(true);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Clear Cart</DialogTitle>
        </DialogHeader>
        <div>
          <p>Are you sure you want to clear your cart?</p>
        </div>
        <DialogFooter>
          <Button variant={"outline"} onClick={handleClearCart}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
