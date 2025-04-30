"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { FoodChowData } from "@/lib/config";
import { fetchTaxAndCharges } from "@/lib/shopService";
import { useCartStore } from "@/store/cartStore";
import { useShopDataStore } from "@/store/shopDataStore";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { Loader } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

type IngredientSelection = {
  ingredientId: number;
  name: string;
  quantity: number;
  price: string;
};

type CustomizationMap = {
  [customCatName: string]: {
    items: IngredientSelection[];
    CustomCatId: number;
  };
};

export default function AddItemModalContent({
  customizationOptions,
  itemData,
  exists,
  ctgId,
  setOpenAddItem,
}: {
  customizationOptions: any;
  itemData: any;
  exists: any;
  ctgId: number;
  setOpenAddItem: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { shopData } = useShopDataStore();
  const { setNewItem } = useCartStore();

  const sizeListWidget = itemData.SizeListWidget;
  const fooditemprefrencewidgetList = itemData.FooditemprefrencewidgetList;
  const foodItemCustomizationwidgetList = customizationOptions
    ? customizationOptions.FoodItemCustomizationwidgetList
    : null;

  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [itemPrice, setItemPrice] = useState(
    sizeListWidget && sizeListWidget.length > 0
      ? Number(sizeListWidget[0].Price || sizeListWidget[0].basePrice)
      : Number(itemData.Price) || 0
  );

  const [checkedPreferences, setCheckedPreferences] = useState<{
    [groupName: string]: { items: Set<string>; order: number };
  }>({});
  const [selectedRadioPreferences, setSelectedRadioPreferences] = useState<{
    [groupName: string]: { value: string; order: number };
  }>({});
  const [customizations, setCustomizations] = useState<CustomizationMap>({});

  const [itemQty, setItemQty] = useState(1);
  const [totalPrice, setTotalPrice] = useState(
    sizeListWidget && sizeListWidget.length > 0
      ? Number(sizeListWidget[0].Price || sizeListWidget[0].basePrice) * itemQty
      : itemData.Price > 0
      ? itemData.Price
      : 0
  );
  const [selectedSize, setSelectedSize] = useState(
    sizeListWidget && sizeListWidget.length > 0 ? sizeListWidget[0] : null
  );
  const [itemNotes, setItemNotes] = useState<string>();

  const currencySymbol = shopData.currency_symbol;

  const [errors, setErrors] = useState<{
    [key: string]: string | null | undefined;
  }>({});

  const increaseQty = () => {
    const qty = itemQty + 1;
    setItemQty(qty);
    setTotalPrice(totalPrice + itemPrice);
  };

  const decreaseQty = () => {
    if (itemQty <= 1) {
      return;
    }
    const qty = itemQty - 1;
    setItemQty(qty);
    setTotalPrice(totalPrice - itemPrice);
  };

  const resetStates = () => {
    setItemQty(1);
    setCheckedPreferences({});
    setSelectedRadioPreferences({});
    setCustomizations({});
  };

  const updateCustomization = (
    custId: number,
    customCatName: string,
    ingredient: any,
    change: number,
    maxTotal: number,
    price: number
  ) => {
    const ingredientId = ingredient.IngredientId;
    const pricePerUnit = Number(price || 0);

    setCustomizations((prev) => {
      const group = (prev[customCatName] && prev[customCatName].items) || [];
      const existing = group.find((g) => g.ingredientId === ingredientId);
      const totalSelected = group.reduce((sum, item) => sum + item.quantity, 0);

      if (change > 0 && totalSelected >= maxTotal) return prev;

      let newGroup: IngredientSelection[];

      if (!existing) {
        if (change <= 0) return prev;

        newGroup = [
          ...group,
          {
            ingredientId,
            name: ingredient.IngredientName,
            quantity: change,
            price: pricePerUnit.toFixed(2),
          },
        ];
        setTotalPrice(totalPrice + pricePerUnit * change);
        setErrors((prev) => ({ ...prev, [customCatName]: undefined }));
      } else {
        const newQty = existing.quantity + change;
        if (newQty < 0) return prev;

        if (newQty === 0) {
          newGroup = group.filter((g) => g.ingredientId !== ingredientId);
          setTotalPrice(totalPrice - pricePerUnit * existing.quantity);
          if (newGroup.length === 0) {
            const custItem = foodItemCustomizationwidgetList?.find(
              (item: any) => item.CustomCatName === customCatName
            );
            if (custItem?.IsMandatory == 1) {
              setErrors((prev) => ({
                ...prev,
                [customCatName]: `Please select at least one option for ${customCatName}`,
              }));
            }
          }
        } else {
          newGroup = group.map((g) =>
            g.ingredientId === ingredientId
              ? {
                  ...g,
                  quantity: newQty,
                }
              : g
          );
          setTotalPrice(totalPrice + pricePerUnit * change);
        }
      }

      return {
        ...prev,
        [customCatName]: { items: newGroup, CustomCatId: custId },
      };
    });
  };

  useEffect(() => {
    if (!selectedSize) return;
    setItemPrice(selectedSize.Price || selectedSize.basePrice);
  }, [selectedSize]);

  const saveItemToCart = async () => {
    // Create an errors object first instead of updating state immediately
    const newErrors: { [key: string]: string } = {};
    let hasErrors = false;

    if (sizeListWidget?.length > 0 && !selectedSize) {
      newErrors.variants = "Please select a variant";
      hasErrors = true;
    }

    if (fooditemprefrencewidgetList?.length > 0) {
      fooditemprefrencewidgetList.forEach((prefItem: any) => {
        const prefName = prefItem.Name;
        const isMandatory = prefItem.IsMandatory == 1;
        const maxSelection = prefItem.max_selection || 1;

        if (isMandatory) {
          if (maxSelection === 1) {
            if (!selectedRadioPreferences[prefName]) {
              newErrors[prefName] = `Please select an option for ${prefName}`;
              hasErrors = true;
            }
          } else {
            if (
              !checkedPreferences[prefName] ||
              checkedPreferences[prefName].items.size === 0
            ) {
              newErrors[
                prefName
              ] = `Please select at least one option for ${prefName}`;
              hasErrors = true;
            }
          }
        }
      });
    }

    if (foodItemCustomizationwidgetList?.length > 0) {
      foodItemCustomizationwidgetList.forEach((custItem: any) => {
        const custName = custItem.CustomCatName;
        const isMandatory = custItem.IsMandatory == 1;

        if (isMandatory) {
          const selections = customizations[custName].items || [];
          if (selections.length === 0) {
            newErrors[
              custName
            ] = `Please select at least one option for ${custName}`;
            hasErrors = true;
          }
        }
      });
    }

    if (hasErrors) {
      // Update errors state and use useEffect to handle scrolling
      setErrors(newErrors);
      // Use setTimeout to ensure DOM is updated
      setTimeout(() => {
        const firstErrorElement = document.querySelector(
          '[data-has-error="true"]'
        );
        if (firstErrorElement) {
          firstErrorElement.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 0);
      return;
    }

    // If no errors, proceed with adding to cart
    // console.log("checked pref", checkedPreferences);
    // console.log("selected radio pref", selectedRadioPreferences);
    // console.log("customization quantities", customizations);
    // Add your cart logic here

    setIsAdding(true);
    const cartData = await curatedCartObject();
    saveItemsInLocalStorage(cartData);
    setIsAdding(false);
  };

  const formatPreferenceName = () => {
    const mergedList = [
      ...Object.entries(checkedPreferences).flatMap(
        ([groupName, { items, order }]) =>
          Array.from(items).map((itemName) => ({
            Name: itemName,
            isChecked: true,
            FlistName: groupName,
            order,
          }))
      ),
      ...Object.entries(selectedRadioPreferences).map(
        ([groupName, { value, order }]) => ({
          Name: value,
          isChecked: true,
          FlistName: groupName,
          order,
        })
      ),
    ]
      .sort((a, b) => a.order - b.order)
      .map(({ order, ...rest }) => rest); // remove `order` from final output

    let preferenceName = "";

    mergedList.map(
      (item) => (preferenceName += `${item.FlistName}:${item.Name},`)
    );

    preferenceName = preferenceName.slice(0, -1);

    const mergedNames = new Set(mergedList.map((item) => item.Name));

    const FooditemprefrencewidgetList = fooditemprefrencewidgetList.map(
      (item: any) => ({
        ...item,
        PrefOptionList: item.PrefOptionList.map((prefOptItm: any) => ({
          ...prefOptItm,
          isChecked: mergedNames.has(prefOptItm.Name),
        })),
      })
    );

    return {
      preferenceName,
      mergedList,
      FooditemprefrencewidgetList,
    };
  };

  const formatCustOptions = () => {
    const custom_desc = [];
    const custom_id = [];

    for (const category in customizations) {
      const { items, CustomCatId } = customizations[category];
      if (!(items.length >= 1)) {
        return {
          custom_desc,
          custom_id,
        };
      }
      const values =
        items
          .map(
            (item) =>
              `${item.quantity} x ${item.name}(${currencySymbol}${item.price})`
          )
          .join(", ") + ", ";
      const ids = items.map((item) => `${item.ingredientId},`).join("");

      for (const item of items) {
        custom_desc.push({
          item_cust_category: category,
          item_cust_values: `${item.quantity} x ${item.name}(+${currencySymbol}${item.price}), `,
        });
      }

      custom_id.push({
        CustomCatId,
        custom_item_id: ids,
        item_cust_category: category,
        item_cust_values: values,
      });
    }

    return {
      custom_desc,
      custom_id,
    };
  };

  const curatedCartObject = async () => {
    try {
      const res = await fetchTaxAndCharges(
        itemData.ItemId,
        shopData.ShopId,
        ""
      );

      if (res.message.toLowerCase() === "success") {
        const responseData = JSON.parse(res.data);

        const sizeFromTax = responseData.food_item_list
          .flatMap((foodItem: any) => foodItem.item_size_list)
          .find(
            (size: any) =>
              Number(size.size_id) ===
              Number(selectedSize?.SizeId || itemData.SizeId)
          );

        const taxDetails = sizeFromTax.item_tax_list.map((tax: any) => ({
          taxType: tax.tax_type,
          taxname:
            tax.tax_type == "0"
              ? `${tax.taxname}`
              : `${tax.taxname}(${tax.taxpercentage}% included)`,
          taxamount: Number(
            (selectedSize
              ? selectedSize.Price || selectedSize.basePrice
              : itemData.Price) *
              (tax.taxpercentage / 100)
          ).toFixed(2),
          tax_percentage: tax.taxpercentage,
        }));

        const { FooditemprefrencewidgetList, mergedList, preferenceName } =
          formatPreferenceName();

        const custOptsData = formatCustOptions();

        const cartObj: any = {};

        cartObj.itemCartSubTotal = Number((totalPrice / itemQty).toFixed(2));
        cartObj.order_itemCategory = ctgId;
        cartObj.order_item_price = Number((totalPrice / itemQty).toFixed(2));
        cartObj.order_item_cust_price = 0;
        cartObj.subTotal = selectedSize ? selectedSize.Price : itemData.Price;
        cartObj.order_item_qty = itemQty;
        cartObj.order_itemid = itemData.ItemId;
        cartObj.order_itemname = itemData.ItemName;
        if (itemNotes) {
          cartObj.item_notes = itemNotes;
        }
        cartObj.preference_names = preferenceName;
        cartObj.order_item_subtype_id = selectedSize
          ? selectedSize.SizeId
          : itemData.SizeId;
        cartObj.itemsPrefOptionList = mergedList;
        cartObj.itemString =
          (selectedSize ? selectedSize.SizeId : itemData.SizeId) +
          "_" +
          (itemNotes || "") +
          itemData.ItemName +
          preferenceName;
        cartObj.item_shop_id = Number(shopData.ShopId);
        cartObj.minQty = 1;
        cartObj.item_tax = taxDetails;
        cartObj.FooditemprefrencewidgetList = FooditemprefrencewidgetList;
        cartObj.custom_ids = custOptsData.custom_id || [];
        cartObj.custom_desc = custOptsData.custom_desc || [];
        cartObj.size_id = selectedSize ? selectedSize.SizeId : "";
        cartObj.order_size = selectedSize ? selectedSize.SizeName : "";
        return cartObj;
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error parsing itemData:", error);

      return null;
    }
  };

  const saveItemsInLocalStorage = (cartItem: any) => {
    if (!cartItem) {
      toast.error("Error adding item to cart");
      return;
    }

    const cartItems = JSON.parse(
      localStorage.getItem("cartItems") || "[]"
    ) as any[];

    // Check if item with same itemString already exists
    const existingItemIndex = cartItems.findIndex(
      (item) => item.itemString === cartItem.itemString
    );

    if (existingItemIndex !== -1) {
      // Item exists, update quantity and total price
      const existingItem = cartItems[existingItemIndex];
      const newQty = existingItem.order_item_qty + cartItem.order_item_qty;

      cartItems[existingItemIndex] = {
        ...cartItem,
        order_item_qty: newQty,
      };
    } else {
      // New item, just add to cart
      cartItems.unshift(cartItem);
      toast.success("Item added to cart");
    }

    localStorage.setItem("cartItems", JSON.stringify(cartItems));
    setNewItem(cartItem);
    setOpenAddItem(false);
  };

  return (
    <div>
      <div className="overflow-auto">
        {!exists ? (
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {itemData.ItemName}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {itemData.Description ||
                currencySymbol + Number(itemData.Price).toFixed(2)}
            </DialogDescription>
          </DialogHeader>
        ) : (
          <div className="flex flex-col text-center">
            <img
              src={FoodChowData.menuImages + itemData.ItemImage}
              alt={itemData.ItemName}
              className="w-full h-[200px] rounded-md object-cover"
            />
            <h3 className="text-xl font-semibold">{itemData.ItemName}</h3>
            <p className="text-muted-foreground">{itemData.Description}</p>
            <div className="flex w-[150px] self-center mt-2">
              <Button
                variant={"outline"}
                className="font-bold text-2xl rounded-none rounded-l-md border-input pt-1"
                onClick={() => {
                  decreaseQty();
                }}
              >
                -
              </Button>
              <Input
                type="number"
                min={1}
                max={1000}
                onWheel={(e) => e.currentTarget.blur()}
                value={itemQty}
                className="[&::-webkit-inner-spin-button]:appearance-none text-center rounded-none shadow-xs border-x-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:shadow-none"
                onChange={(e) => {
                  let newQty = Number(e.target.value);
                  // Enforce min and max limits
                  if (newQty < 1) newQty = 1;
                  if (newQty > 1000) newQty = 1000;

                  setItemQty(newQty);

                  // Calculate base price
                  const basePrice = itemPrice * newQty;

                  // Calculate customization prices
                  let customizationPrice = 0;
                  Object.values(customizations).forEach((customization) => {
                    customization.items.forEach((item) => {
                      customizationPrice += Number(item.price) * item.quantity;
                    });
                  });

                  // Set total price including customizations
                  setTotalPrice(basePrice + customizationPrice);
                }}
              />
              <Button
                variant={"outline"}
                className="font-bold text-xl rounded-none rounded-r-md border-input"
                onClick={() => {
                  increaseQty();
                }}
              >
                +
              </Button>
            </div>
          </div>
        )}
        <div className="flex flex-col gap-2">
          {/* VARIANTS */}
          {sizeListWidget && sizeListWidget.length > 0 && (
            <div className="py-2" data-has-error={!!errors.variants}>
              {errors.variants && (
                <p className="text-red-500 text-sm mb-2">{errors.variants}</p>
              )}
              <h4 className="text-xl font-semibold space-y-2">
                Variants<span className="text-red-500">*</span>
              </h4>
              <RadioGroup
                className="gap-0"
                defaultValue={selectedSize}
                onValueChange={(value: any) => {
                  setSelectedSize(value);
                  setTotalPrice(value.Price || value.basePrice * itemQty);
                  resetStates();
                  setErrors((prev) => ({ ...prev, variants: undefined }));
                }}
              >
                {sizeListWidget.map((item: any, index: number) => {
                  const sizeName = item.SizeName;
                  const price = Number(item.Price || item.basePrice).toFixed(2);

                  return (
                    <div className="w-full flex items-center" key={index}>
                      <RadioGroupItem value={item} id={`${index}${sizeName}`} />
                      <Label
                        htmlFor={`${index}${sizeName}`}
                        className="flex justify-between items-center w-full p-1 text-md cursor-pointer font-normal"
                      >
                        <span>{sizeName}</span>
                        <span className="text-primary">
                          {currencySymbol}
                          {price}
                        </span>
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            </div>
          )}

          {/* PREFERENCES */}
          {fooditemprefrencewidgetList &&
            fooditemprefrencewidgetList.length > 0 && (
              <div className="space-y-2">
                {fooditemprefrencewidgetList.map(
                  (prefItem: any, prefIndex: any) => {
                    const prefName = prefItem.Name;
                    const isMandatory = prefItem.IsMandatory == 1;
                    const maxSelection = prefItem.max_selection || 1;

                    const groupKey = prefName;

                    return (
                      <div
                        className="flex flex-col"
                        key={prefIndex}
                        data-has-error={!!errors[prefName]}
                      >
                        {errors[prefName] && (
                          <p className="text-red-500 text-sm mb-2">
                            {errors[prefName]}
                          </p>
                        )}
                        <h4 className="text-xl font-semibold space-y-2">
                          {prefName}
                          {isMandatory && (
                            <span className="text-red-500">*</span>
                          )}{" "}
                          <span className="text-gray-400 text-sm">
                            (Select Any {maxSelection})
                          </span>
                        </h4>
                        {maxSelection == 1 ? (
                          <RadioGroup
                            className="gap-0"
                            value={
                              (selectedRadioPreferences[groupKey] &&
                                selectedRadioPreferences[groupKey].value) ||
                              ""
                            }
                            onValueChange={(selectedValue) => {
                              setSelectedRadioPreferences((prev) => ({
                                ...prev,
                                [groupKey]: {
                                  value: selectedValue.substring(
                                    0,
                                    selectedValue.length
                                  ),
                                  order: prefIndex,
                                },
                              }));
                              setErrors((prev) => ({
                                ...prev,
                                [groupKey]: undefined,
                              }));
                            }}
                          >
                            {prefItem.PrefOptionList.map(
                              (item: any, index: any) => {
                                const itemId =
                                  item.id?.toString() || `${item.Name}`;
                                const htmlId = `${index}${item.Name}${prefName}`;
                                if (!item.Name) {
                                  return;
                                }

                                return (
                                  <div
                                    key={index}
                                    className="flex items-center"
                                  >
                                    <RadioGroupItem
                                      value={itemId}
                                      id={htmlId}
                                    />
                                    <Label
                                      htmlFor={htmlId}
                                      className="flex justify-between items-center w-full p-1 text-md cursor-pointer font-normal"
                                    >
                                      <span>{item.Name}</span>
                                    </Label>
                                  </div>
                                );
                              }
                            )}
                          </RadioGroup>
                        ) : (
                          prefItem.PrefOptionList.map(
                            (item: any, index: any) => {
                              const groupKey = prefName;
                              const itemKey = item.Name;

                              if (!item.Name) {
                                return;
                              }
                              return (
                                <div
                                  key={index}
                                  className="flex gap-1 items-center"
                                >
                                  <Checkbox
                                    id={`${index}${item.Name}${prefName}`}
                                    checked={
                                      checkedPreferences[groupKey]?.items.has(
                                        itemKey
                                      ) || false
                                    }
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        if (
                                          checkedPreferences[groupKey] &&
                                          checkedPreferences[groupKey].items
                                            .size >= maxSelection
                                        ) {
                                          toast.error(
                                            `You can select only ${maxSelection} options`
                                          );
                                          return;
                                        }
                                      }
                                      setCheckedPreferences((prev) => {
                                        const group = new Set(
                                          prev[groupKey]?.items || []
                                        );
                                        if (checked) {
                                          group.add(itemKey);
                                          setErrors((prev) => ({
                                            ...prev,
                                            [groupKey]: undefined,
                                          }));
                                        } else {
                                          group.delete(itemKey);
                                          if (group.size === 0 && isMandatory) {
                                            setErrors((prev) => ({
                                              ...prev,
                                              [groupKey]: `Please select at least one option for ${groupKey}`,
                                            }));
                                          }
                                        }
                                        return {
                                          ...prev,
                                          [groupKey]: {
                                            items: group,
                                            order: prefIndex,
                                          },
                                        };
                                      });
                                    }}
                                  />
                                  <Label
                                    htmlFor={`${index}${item.Name}${prefName}`}
                                    className="flex justify-between items-center w-full p-1 text-md cursor-pointer font-normal"
                                  >
                                    <span>{item.Name}</span>
                                  </Label>
                                </div>
                              );
                            }
                          )
                        )}
                      </div>
                    );
                  }
                )}
              </div>
            )}

          {/* CUSTOM OPTIONS */}
          {foodItemCustomizationwidgetList &&
            foodItemCustomizationwidgetList.length > 0 &&
            foodItemCustomizationwidgetList.map((custItem: any, index: any) => {
              const custName = custItem.CustomCatName;
              const custId = custItem.CustomItemId;
              const isMandatory = custItem.IsMandatory == 1;
              const maxSelection = custItem.MaxVal || 1;

              return (
                <div
                  className="flex flex-col"
                  key={index}
                  data-has-error={!!errors[custName]}
                >
                  {errors[custName] && (
                    <p className="text-red-500 text-sm mb-2">
                      {errors[custName]}
                    </p>
                  )}
                  <h4 className="text-xl font-semibold space-y-2">
                    {custName}
                    {isMandatory && (
                      <span className="text-red-500">*</span>
                    )}{" "}
                    <span className="text-gray-400 text-sm">
                      (Select Up To {maxSelection || 1})
                    </span>
                  </h4>
                  {custItem.ingredientwidgetList.map(
                    (item: any, index: any) => {
                      const ingrediantName = item.IngredientName;
                      const price = !item.Price
                        ? item.FoodSubTypeList.find(
                            (itm: any) =>
                              itm.SizeName.toLowerCase() ==
                              selectedSize.SizeName.toLowerCase()
                          ).Price
                        : item.Price;
                      const ingredientId = item.IngredientId;
                      const quantity =
                        customizations[custName]?.items?.find(
                          (sel) => sel.ingredientId === ingredientId
                        )?.quantity || 0;
                      return (
                        <div key={index} className="flex justify-between">
                          <div className="flex flex-col">
                            <p>{ingrediantName}</p>
                            <span className="text-sm text-primary">
                              {currencySymbol}
                              {Number(price).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex h-10 text-center items-center">
                            <Button
                              variant={"outline"}
                              className="font-bold text-2xl rounded-none rounded-l-md border-r-0 border-input pt-1"
                              onClick={() =>
                                updateCustomization(
                                  custId,
                                  custName,
                                  item,
                                  -1,
                                  maxSelection,
                                  price
                                )
                              }
                            >
                              -
                            </Button>
                            <div className="border-y border-input w-[50px] shadow-xs h-9 content-center">
                              {quantity}
                            </div>
                            <Button
                              variant={"outline"}
                              className="font-bold text-xl rounded-none rounded-r-md border-l-0 border-input"
                              onClick={() =>
                                updateCustomization(
                                  custId,
                                  custName,
                                  item,
                                  1,
                                  maxSelection,
                                  price
                                )
                              }
                            >
                              +
                            </Button>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              );
            })}
          <div className="py-2">
            <h4 className="text-lg font-semibold space-y-2">
              Special Instructions
            </h4>
            <Textarea
              rows={5}
              value={itemNotes}
              onChange={(e) => setItemNotes(e.target.value)}
            />
          </div>
        </div>
      </div>
      <DialogFooter className="sticky bottom-0 left-0 bg-background pt-4 mt-4 pb-6">
        <div className="flex flex-col gap-2 w-full">
          {!exists && <Separator className="my-2 bg-gray-200" />}
          {!exists && (
            <div className="w-full flex justify-between items-center">
              <span className="font-semibold">Enter QTY:</span>
              <div className="flex w-[150px]">
                <Button
                  variant={"outline"}
                  className="font-bold text-2xl rounded-none rounded-l-md border-input pt-1"
                  onClick={() => {
                    decreaseQty();
                  }}
                >
                  -
                </Button>
                <Input
                  type="number"
                  min={1}
                  max={1000}
                  onWheel={(e) => e.currentTarget.blur()}
                  value={itemQty}
                  className="[&::-webkit-inner-spin-button]:appearance-none text-center rounded-none shadow-xs border-x-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:shadow-none"
                  onChange={(e) => {
                    let newQty = Number(e.target.value);
                    // Enforce min and max limits
                    if (newQty < 1) newQty = 1;
                    if (newQty > 1000) newQty = 1000;

                    setItemQty(newQty);

                    // Calculate base price
                    const basePrice = itemPrice * newQty;

                    // Calculate customization prices
                    let customizationPrice = 0;
                    Object.values(customizations).forEach((customization) => {
                      customization.items.forEach((item) => {
                        customizationPrice +=
                          Number(item.price) * item.quantity;
                      });
                    });

                    // Set total price including customizations
                    setTotalPrice(basePrice + customizationPrice);
                  }}
                />
                <Button
                  variant={"outline"}
                  className="font-bold text-xl rounded-none rounded-r-md border-input"
                  onClick={() => {
                    increaseQty();
                  }}
                >
                  +
                </Button>
              </div>
            </div>
          )}
          <div className="bg-primary flex items-center justify-between p-2 rounded-md w-full">
            <p className="text-white font-semibold text-lg">
              Total: {shopData.currency_symbol}
              {Number(totalPrice).toFixed(2)}
            </p>
            <Button
              className="bg-white text-primary min-w-[125px]"
              onClick={() => saveItemToCart()}
              disabled={isAdding}
            >
              {isAdding ? (
                <>
                  <Loader className="animate-spin" />
                </>
              ) : (
                "Add Item"
              )}
            </Button>
          </div>
        </div>
      </DialogFooter>
    </div>
  );
}
