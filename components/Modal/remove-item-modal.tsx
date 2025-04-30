import React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";

export default function RemoveItemModal({
  isOpen,
  setOpen,
  onConfirm,
}: {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove Item</DialogTitle>
        </DialogHeader>
        <div>
          <p>Are you sure you want to remove this item from your cart?</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onConfirm}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
