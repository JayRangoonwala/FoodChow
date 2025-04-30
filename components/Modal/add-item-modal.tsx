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
}: {
  exists: boolean;
  itemData: any;
  ctgId: number;
}) {
  // const [loading, setLoading] = useState(false);
  const { setServiceModalOpen } = useToggleModalStore();
  const { service } = useServiceStore();

  const [openAddItem, setOpenAddItem] = useState<boolean>(false);
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
      setOpenAddItem(true);
      fetchCustomizationOptions(itemData.ItemId);
      setPendingAddItemId(null);
    }
  }, [service, pendingAddItemId]);

  const handleAddButtonClick = async () => {
    setPendingAddItemId(null);
    if (service) {
      setOpenAddItem(true);
      fetchCustomizationOptions(itemData.ItemId);
    } else {
      setPendingAddItemId(itemData.ItemId);
      setServiceModalOpen(true);
    }
  };

  return (
    <>
      <Dialog open={openAddItem} onOpenChange={setOpenAddItem}>
        <Button
          variant={"outline"}
          className={cn(exists && "absolute top-[112px] left-[34px]")}
          onClick={handleAddButtonClick}
          id="add-item-button"
          // disabled={loading}
        >
          {/* {loading ? <Loader2 className="animate-spin" /> : "Add"} */}
          Add
        </Button>
        <DialogContent className="max-h-[85%] pb-0">
          <AddItemModalContent
            itemData={itemData}
            customizationOptions={customizationOptions}
            exists={exists}
            ctgId={ctgId}
            setOpenAddItem={setOpenAddItem}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
