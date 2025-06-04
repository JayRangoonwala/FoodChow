"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent } from "../ui/dialog";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { useServiceStore } from "@/store/serviceStore";
import { useToggleModalStore } from "@/store/toggleModalStore";
import { fetchMenuCustomization } from "@/lib/shopService";
import AddItemModalContent from "./Sections/add-item-modal-content";
import { usePendingAddItemStore } from "@/store/addItemStore";

export default function AddItemModal({
  exists,
  itemData,
  ctgId,
  open,
  onClose,
}: {
  exists: boolean;
  itemData: any;
  ctgId: number;
  open: boolean;
  onClose: () => void;
}) {
  console.log(itemData);
  // const [loading, setLoading] = useState(false);
  const { setServiceModalOpen } = useToggleModalStore();
  const { service } = useServiceStore();

  const [customizationOptions, setCustomizationOptions] = useState<any>();
  const { pendingAddItemId, setPendingAddItemId } = usePendingAddItemStore();

  const fetchCustomizationOptions = async (id: any) => {
    try {
      const response = await fetchMenuCustomization(id);
      if (response.data && response.message.toLowerCase() !== "error") {
        setCustomizationOptions(JSON.parse(response.data));
      }
    } catch (error) {
      console.error("Error fetching customization options:", error);
    }
  };

  // When service gets selected and we were waiting to open AddItem modal
  useEffect(() => {
    if (!pendingAddItemId) return;

    if (service && pendingAddItemId === itemData.ItemId) {
      fetchCustomizationOptions(itemData.ItemId);
      setPendingAddItemId(null);
    }
  }, [service, pendingAddItemId]);

  useEffect(() => {
    if (open && itemData?.ItemId) {
      fetchCustomizationOptions(itemData.ItemId);
    }
  }, [open, itemData]);

  const handleAddButtonClick = async () => {
    setPendingAddItemId(null);
    if (service) {
      fetchCustomizationOptions(itemData.ItemId);
      onClose();
    } else {
      setPendingAddItemId(itemData.ItemId);
      setServiceModalOpen(true);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[85%] pb-0">
        <AddItemModalContent
          itemData={itemData}
          customizationOptions={customizationOptions}
          exists={exists}
          ctgId={ctgId}
          setOpenAddItem={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
