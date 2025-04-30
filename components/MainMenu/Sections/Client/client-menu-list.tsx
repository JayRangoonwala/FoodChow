"use client";

import SearchLogo from "@/components/Svgs/search";
import { Input } from "@/components/ui/input";
import React, { useDeferredValue, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FoodChowData } from "@/lib/config";
import MenuImage from "../menu-image";
import { Separator } from "@/components/ui/separator";
import DealCaraousel from "./deal-caraousel";
import { Button } from "@/components/ui/button";
import NoItemsLogo from "@/components/Svgs/no-items";
import { X } from "lucide-react";

export default function ClientMenuList({
  dealList,
  dealListImage,
  dealsWithoutImage,
  categoryList,
  parsedShopData,
}: {
  dealList: any;
  dealListImage: any;
  dealsWithoutImage: any;
  categoryList: any;
  parsedShopData: any;
}) {
  const [query, setQuery] = useState<string>("");
  const qry = useDeferredValue(query.replaceAll(" ", "").toLowerCase());

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

  return (
    <>
      <div className="container max-w-7xl sticky top-0 z-10 flex items-center rounded-md bg-white border-2 border-primary">
        <Input
          className="w-full h-12 border-none focus-visible:ring-0 focus-visible:border-none"
          placeholder="Search for dishes"
          value={query}
          onChange={handleChange}
        />

        {qry.length > 0 ? (
          <X
            className="h-6 w-6 stroke-primary mr-3 cursor-pointer"
            onClick={() => setQuery("")}
          />
        ) : (
          <SearchLogo className="h-6 w-6 fill-primary mr-3" />
        )}
      </div>

      <div className="h-full space-y-4">
        {filteredDealsWithImage.length > 0 ||
        filteredDealsWithoutImage.length > 0 ||
        filteredList.length > 0 ? (
          <>
            {/* Deals Section */}
            {(filteredDealsWithImage.length > 0 ||
              filteredDealsWithoutImage.length > 0) && (
              <Card className="border-0 gap-2" id="category-deals">
                <CardHeader className="px-4 lg:px-6">
                  <CardTitle className="font-medium flex flex-col">
                    <span className="text-xl">Deals</span>
                    <span className="text-muted-foreground">
                      {dealList.length} Items
                    </span>
                  </CardTitle>
                </CardHeader>
                <Separator className="bg-muted" />
                <CardContent className="space-x-4 px-0">
                  <DealCaraousel
                    dealListImage={filteredDealsWithImage}
                    parsedShopData={parsedShopData}
                  />

                  {filteredDealsWithoutImage.map((dealItem: any, key: any) => (
                    <React.Fragment key={key}>
                      <div className="flex gap-2 items-center mr-4 px-4 lg:px-6">
                        <div className="h-full flex flex-1 flex-col py-4 ">
                          <span className="text-lg font-semibold">
                            {dealItem.DealName}
                          </span>
                          <span className="text-muted-foreground">
                            {dealItem.DealDesc}
                          </span>
                          <span className="font-semibold text-primary">
                            {parsedShopData.currency_symbol}
                            {Number(dealItem.DealPrice).toFixed(2)}
                          </span>
                        </div>
                        <Button variant={"outline"}>Add</Button>
                      </div>
                      {key + 1 !== dealsWithoutImage.length && (
                        <Separator className="bg-muted" />
                      )}
                    </React.Fragment>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Menu Items Section */}
            {filteredList.length > 0 &&
              filteredList.map((cartItem: any, key: any) => (
                <Card
                  key={key}
                  className="border-0 gap-2"
                  id={`category-${cartItem.CategryName}`}
                >
                  <CardHeader className="px-4 lg:px-6">
                    <CardTitle className="font-medium flex flex-col">
                      <span className="text-xl">{cartItem.CategryName}</span>
                      <span className="text-muted-foreground">
                        {cartItem.ItemListWidget.length} Items
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <Separator className="bg-muted" />
                  <CardContent className="space-x-4 px-0">
                    {cartItem.ItemListWidget.map((menuItem: any, key: any) => {
                      const imageUrl =
                        FoodChowData.menuImages + menuItem.ItemImage;
                      const price = Number(
                        menuItem.Price == null
                          ? menuItem?.SizeListWidget[0]?.Price
                          : menuItem?.Price
                      ).toFixed(2);

                      return (
                        <React.Fragment key={key}>
                          <div className="flex gap-2 m-4 mt-2 lg:mt-2 lg:m-6 py-4">
                            <div className="h-full flex flex-1 flex-col mr-4">
                              <span className="text-lg font-semibold">
                                {menuItem.ItemName}
                              </span>
                              <span className="text-muted-foreground">
                                {menuItem.Description}
                              </span>
                              <span className="font-semibold text-primary">
                                {parsedShopData.currency_symbol}
                                {price}
                              </span>
                            </div>
                            <MenuImage
                              imageUrl={imageUrl}
                              item={menuItem}
                              ctgId={cartItem.CategryId}
                            />
                          </div>
                          {key + 1 !== cartItem.ItemListWidget.length && (
                            <Separator className="bg-muted" />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </CardContent>
                </Card>
              ))}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="col-md-12 text-center">
              <NoItemsLogo />
            </div>
            <div className="col-md-12 text-center mt-4 fs-18 fw-600">
              <label>No Items Available in Menu</label>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
