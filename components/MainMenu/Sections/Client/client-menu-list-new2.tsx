"use client";

import SearchLogo from "@/components/Svgs/search";
import { Input } from "@/components/ui/input";
import React, { useDeferredValue, useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FoodChowData } from "@/lib/config";
import MenuImage from "../menu-image";
import { Separator } from "@/components/ui/separator";
import DealCaraousel from "./deal-caraousel";
import { Button } from "@/components/ui/button";
import NoItemsLogo from "@/components/Svgs/no-items";
import { X } from "lucide-react";
import Image from "next/image";
import TakeAwayLogo from "@/components/Svgs/takeaway";
import DeliveryLogo from "@/components/Svgs/delivery";
import DineInLogo from "@/components/Svgs/dinein";
import AddItemModal from "@/components/Modal/add-item-modal-new";
import { Dialog } from "@/components/ui/dialog";
import { useServiceStore } from "@/store/serviceStore";
import ChooseServiceModal from "@/components/Modal/choose-service-modal";
import {
  fetchShopDetails,
  fetchShopIdBySubdomain,
  fetchShopTiming,
} from "@/lib/shopService";
import { getSubdomainFromHeaders } from "@/lib/getSubdomain";
import DealModal from "@/components/Modal/DealModalBox/DealModal";
import { useSubdomainStore } from "@/store/subDomainStore";

export default function ClientMenuList({
  dealList,
  dealListImage,
  dealsWithoutImage,
  categoryList,
  parsedShopData,
  shopStatus,
}: {
  dealList: any;
  dealListImage: any;
  dealsWithoutImage: any;
  categoryList: any;
  parsedShopData: any;
  shopStatus: string;
}) {
  const [query, setQuery] = useState<string>("");
  const qry = useDeferredValue(query.replaceAll(" ", "").toLowerCase());
  const [openAddItem, setOpenAddItem] = useState<any>(null);
  const [openServiceStore, setOpenServiceStore] = useState<boolean>(false);
  const [openDealModal, setOpenDealModal] = useState<any>(null);
  const { service: storeService, setService: setServiceStore } =
    useServiceStore();
 const subdomainStore = useSubdomainStore((state) => state.subdomain);
  console.log(subdomainStore)
  // console.log(parsedShopData)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };
  const filteredList = categoryList
    .map((cat: any) => ({
      ...cat,
      ItemListWidget: cat.ItemListWidget.filter(
        (item: any) =>
          item.ItemName.toLowerCase().replaceAll(" ", "").includes(qry) ||
          item.Description.toLowerCase().replaceAll(" ", "").includes(qry)
      ),
    }))
    .filter((cat: any) => cat.ItemListWidget.length > 0);

  const filteredDealsWithImage = dealListImage.filter(
    (deal: any) =>
      deal.DealName.toLowerCase().replaceAll(" ", "").includes(qry) ||
      deal.DealDesc.toLowerCase().replaceAll(" ", "").includes(qry)
  );

  const filteredDealsWithoutImage = dealsWithoutImage.filter(
    (deal: any) =>
      deal.DealName.toLowerCase().replaceAll(" ", "").includes(qry) ||
      deal.DealDesc.toLowerCase().replaceAll(" ", "").includes(qry)
  );
  // console.log(height);

  return (
    <>
      {/* Search Bar */}
      <div className="flex items-center justify-center w-full sm:w-1/2 mx-auto mt-1 sm:mb-1 mb-2 border border-black rounded-full bg-gray-100 px-3">
        <Input
          className="w-full h-7 2xl:h-10 focus-visible:ring-0 rounded-full border-none bg-gray-100 shadow-none placeholder:text-gray-500"
          placeholder="Search For Dishes"
          value={query}
          onChange={handleChange}
        />
        {qry.length > 0 ? (
          <X
            className="h-5 w-5 stroke-primary ml-2 cursor-pointer hover:opacity-80"
            onClick={() => setQuery("")}
          />
        ) : (
          <SearchLogo className="h-5 w-5 fill-primary ml-2" />
        )}
      </div>

      <div
        className="h-[calc(100vh-265px)] overflow-y-auto space-y-14 font-sans pb-3"
        id="menu-scroll-container"
      >
        {filteredDealsWithImage.length > 0 ||
        filteredDealsWithoutImage.length > 0 ||
        filteredList.length > 0 ? (
          <>
            {/* Deals Section */}
            {(filteredDealsWithImage.length > 0 ||
              filteredDealsWithoutImage.length > 0) && (
              <div className="mb-8">
                <div className="flex items-center mb-2 px-2">
                  <span className="text-xl font-semibold mr-2">Deals</span>
                  <span className="font-semibold text-lg">
                    ({dealList.length})
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
                  {filteredDealsWithImage.map((deal: any, key: any) => (
                    <Card
                      key={key}
                      className="rounded-xl shadow-md border-0 flex flex-col gap-3 py-2"
                      id={`category-deals`}
                    >
                      <div className="w-full h-40 rounded-t-xl overflow-hidden bg-gray-100 group">
                        <img
                          src={`${FoodChowData.dealImages}${deal.DealImage}`}
                          alt={deal.DealName}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <CardContent className="flex-1 flex flex-col p-3">
                        <span className="text-lg font-semibold mb-1">
                          {deal.DealName}
                        </span>
                        <span className="text-muted-foreground text-sm mb-2">
                          {deal.DealDesc}
                        </span>
                        <div className="flex gap-2 text-xs items-center py-2">
                          {deal.OrderMethod.split(",").includes("1") && (
                            <div className="flex items-center gap-1">
                              <span className="inline-block w-2 h-2 rounded-full bg-primary mr-1"></span>
                              <span>Take away</span>
                            </div>
                          )}
                          {deal.OrderMethod.split(",").includes("2") && (
                            <div className="flex items-center gap-1">
                              <span className="inline-block w-2 h-2 rounded-full bg-primary mr-1"></span>
                              <span>Dine in</span>
                            </div>
                          )}
                          {deal.OrderMethod.split(",").includes("5") && (
                            <div className="flex items-center gap-1">
                              <span className="inline-block w-2 h-2 rounded-full bg-primary mr-1"></span>
                              <span>Delivery</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-auto border-t border-gray-200 pt-2">
                          <span className="font-bold text-primary text-lg">
                            {parsedShopData.currency_symbol}
                            {Number(deal.DealPrice).toFixed(2)}
                          </span>
                          <Button
                            variant="outline"
                            className="rounded-full px-5 py-1 xl:px-3 font-bold flex items-center gap-1 border-primary text-primary hover:bg-primary"
                            onClick={() => {setOpenDealModal(deal);}}
                          >
                            + ADD
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Menu Items Section */}
            {filteredList.length > 0 &&
              filteredList.map((cartItem: any, key: any) => (
                <div key={key} className="mb-12">
                  <div className="flex items-center mb-2 px-2">
                    <span className="text-xl font-semibold mr-2">
                      {cartItem.CategryName}
                    </span>
                    <span className="text-muted-foreground font-medium text-lg">
                      ({cartItem.ItemListWidget.length})
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
                    {cartItem.ItemListWidget.map((menuItem: any, idx: any) => {
                      const imageUrl =
                        FoodChowData.menuImages + menuItem.ItemImage;
                      const price = Number(
                        menuItem.Price == null
                          ? menuItem?.SizeListWidget[0]?.Price
                          : menuItem?.Price
                      ).toFixed(2);
                      return (
                        <Card
                          key={idx}
                          className="rounded-xl shadow-md border-0 flex flex-col gap-3 py-2"
                          id={`category-${cartItem.CategryName}`}
                        >
                          <div className="w-full h-40 rounded-t-xl  overflow-hidden flex group">
                            <img
                              src={imageUrl}
                              alt={menuItem.ItemName}
                              className="object-cover w-full h-full"
                            />
                          </div>
                          <CardContent className="flex-1 flex flex-col p-3">
                            <span className="text-lg font-semibold mb-1">
                              {menuItem.ItemName}
                            </span>
                            <span className="text-muted-foreground text-sm mb-2">
                              {menuItem.Description}
                            </span>
                            <div className="flex items-center justify-between mt-auto border-t border-gray-200 pt-2">
                              <span className="font-bold text-primary text-lg">
                                {parsedShopData.currency_symbol}
                                {price}
                              </span>
                              <Button
                                variant="outline"
                                className="rounded-full px-5 py-1 font-bold flex items-center gap-1 border-primary text-primary hover:bg-primary"
                                onClick={() => setOpenAddItem(menuItem)}
                              >
                                + ADD
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full py-24">
            <div className="col-md-12 text-center">
              <NoItemsLogo />
            </div>
            <div className="col-md-12 text-center mt-4 text-lg font-semibold">
              <label>No Items Available in Menu</label>
            </div>
          </div>
        )}
      </div>

      {
        // storeService ? (
        openAddItem && (
          <Dialog
            open={!!openAddItem}
            onOpenChange={() => setOpenAddItem(null)}
          >
            <AddItemModal
              itemData={openAddItem}
              exists={openAddItem.ItemImage !== "" ? true : false}
              ctgId={openAddItem.CategryId}
              open={!!openAddItem}
              onClose={() => setOpenAddItem(null)}
            />
          </Dialog>
        )
      }
      {
        openDealModal && (
          <DealModal
            open={!!openDealModal}
            onClose={() => setOpenDealModal(null)}
            deal={openDealModal}
            />
        )
      }
      {/* // // ) : (
      // //   <ChooseServiceModal
      // //     Open={openServiceStore}
      // //     shopStatus={shopStatus}
      // //     parsedShopData={parsedShopData}
      // //     onNext={openAddItem(true)}
      // //   />
      // )} */}
    </>
  );
}
