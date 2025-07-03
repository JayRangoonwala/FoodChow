"use client";

// import Hooks
import { useContext, useEffect, useState } from "react";

// import CSS Files
import "@/components/Modal/DealModalBox/DealModal.module.css";
import styles from "./DealModal.module.css";

// import Components
import { MaxQuantity } from "./MaxQuantity";

// import React Icons
import { IoIosClose } from "react-icons/io";
import { PiWarningCircleLight } from "react-icons/pi";

//  Import MUI concepts
import {
  Modal,
  Box,
  Typography,
  Button,
  Alert,
  Fade,
  Grow,
  Slide,
} from "@mui/material";
import Radio from "@mui/material/Radio";
import Checkbox from "@mui/material/Checkbox";
import { styled } from "@mui/material/styles";

// Importing Images
import Image from "next/image";
import dealTick from "@/public/deal-tick.png";

// Import State from Context
import { MyContext, MyContextProvider } from "@/context/MyContext";

// IMport Store from /store/cartStore
import { useCartStore } from "@/store/cartStore";

//  import customization api from /lib/shopService
import { fetchMenuCustomization } from "@/lib/shopService";

import { Button as CustomButton } from "@/components/ui/button";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  borderRadius: "20px",
  boxShadow: 24,
};

const CustomRadio = styled(Radio)(({ theme }) => ({
  padding: 0,
  "& .MuiSvgIcon-root": {
    display: "none",
  },
  "&:before": {
    content: '""',
    display: "inline-block",
    width: "20px",
    height: "20px",
    border: "2px solid var(--primary)",
    borderRadius: "50%",
    backgroundColor: "#fff",
    verticalAlign: "middle",
  },
  "&.Mui-checked:after": {
    content: '""',
    position: "absolute",
    width: "10px",
    height: "10px",
    backgroundColor: "var(--primary)",
    borderRadius: "50%",
    top: "5px",
    left: "5px",
  },
  position: "relative",
}));

const CustomCheckbox = styled(Checkbox)(({ theme }) => ({
  padding: 0,
  "& .MuiSvgIcon-root": {
    display: "none",
  },
  "&:before": {
    content: '""',
    display: "inline-block",
    width: "20px",
    height: "20px",
    border: "2px solid #097733",
    borderRadius: "4px",
    backgroundColor: "#fff",
    verticalAlign: "middle",
  },
  "&.Mui-checked:after": {
    content: '""',
    position: "absolute",
    width: "10px",
    height: "10px",
    backgroundColor: "#097733",
    top: "5px",
    left: "5px",
    borderRadius: "2px",
  },
  position: "relative",
}));

export default function DealModal({ open, onClose, deal }) {
  const [visibleGroupIndex, setVisibleGroupIndex] = useState(0);
  const [selectedItems, setSelectedItems] = useState({});
  const [isNestedModalOpen, setIsNestedModalOpen] = useState(false);
  const [selectedItemData, setSelectedItemData] = useState(null);
  const [finalSelectedItems, setFinalSelectedItems] = useState([]);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const { newItem, setNewItem } = useCartStore();
  const [customizationData, setCustomizationData] = useState(null);
  const [itemSelects, setitemSelects] = useState([]);
  const [isCustomizationLoading, setIsCustomizationLoading] = useState(false);
  const [customizationPrefrences, setCustomizationPrefrences] = useState(null);

  const [selectedPrefOptions, setSelectedPrefOptions] = useState({});
  const [selectedPreferences, setSelectedPreferences] = useState({});
  const [selectedSizes, setSelectedSizes] = useState({});
  const [prefCheck, setprefCheck] = useState([]);
  const [prefAlert, setprefAlert] = useState(false);
  const [itemObj, setitemObj] = useState(null);
  const [allitemString, setallitemString] = useState([]);
  const [itemPreferences, setItemPreferences] = useState([]);
  // const [cusomizeQty, setcusomizeQty] = useState(0);
  const [cusomizeQty, setcusomizeQty] = useState({});

  const [customizeData, setcustomizeData] = useState([]);
  const [maxQuantity, setmaxQuantity] = useState(false);
  const { Deals, setDeals } = useContext(MyContext);
  const [showError, setshowError] = useState(false);
  const [ingridientList, setIngridientList] = useState([]);
  // Fixed ingredient state - using object instead of array for better management
  const [ingredientQuantities, setIngredientQuantities] = useState({});

  // Reset states when modal opens
  useEffect(() => {
    if (open) {
      setVisibleGroupIndex(0);
      setSelectedItems({});
      setitemSelects([]);
      setSelectedSizes({});
      setprefCheck([]);
      setshowError(false);
      setIngredientQuantities({}); // Reset ingredient quantities
    }
    return () => {
      setIsNestedModalOpen(false);
      setSelectedItemData(null);
      setitemSelects([]);
    };
  }, [open]);

  useEffect(() => {
    if (maxQuantity) {
      const timer = setTimeout(() => {
        setmaxQuantity(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [maxQuantity]);

  useEffect(() => {
    console.log("Ingridient List", ingridientList);
  }, [ingridientList]);

  const handleChecked = (pref, optionId, optionName, itemId) => {
    const manadatoryData = {
      name: pref.Name,
      value: optionName,
    };

    setprefCheck((prev) => {
      const filtered = prev.filter((item) => item.name !== manadatoryData.name);
      return [...filtered, manadatoryData];
    });

    setSelectedPreferences((prev) => {
      const currentPrefs = prev[itemId] || {};

      if (pref.max_selection === 1) {
        const updated = {
          ...prev,
          [itemId]: {
            ...currentPrefs,
            [pref.Name]: optionName,
          },
        };
        return updated;
      }

      const existingOptions = currentPrefs[pref.Name] || [];
      const updatedOptions = existingOptions.includes(optionName)
        ? existingOptions.filter((name) => name !== optionName)
        : [...existingOptions, optionName];

      const updated = {
        ...prev,
        [itemId]: {
          ...currentPrefs,
          [pref.Name]: updatedOptions,
        },
      };
      return updated;
    });

    setprefAlert(false);
  };

  const handleItemSelect = async (groupIndex, catIndex, itemIndex) => {
    const key = `${groupIndex}-${catIndex}`;
    setSelectedItems((prev) => ({
      ...prev,
      [key]: itemIndex,
    }));

    const selectedItem =
      deal.ItemGroupList[groupIndex].CategoryList[catIndex].ItemListWidget[
        itemIndex
      ];
    setSelectedItemData(selectedItem);

    setIsCustomizationLoading(true);

    try {
      const response = await fetchMenuCustomization(selectedItem.ItemId);
      const parsedData = JSON.parse(response.data);

      setCustomizationData(parsedData.FoodItemCustomizationwidgetList || []);

      setCustomizationPrefrences(selectedItem);
    } catch (error) {
      console.error("Error fetching customization data:", error);
      setCustomizationData([]); // fallback
    } finally {
      setIsCustomizationLoading(false);
    }

    setIsNestedModalOpen(true); // Open after setting customization
    setshowError(false);
  };

  const validateMandatoryPreferences = (
    foodItemPreferenceList = [],
    selectedPrefs = []
  ) => {
    const mandatoryPrefs = foodItemPreferenceList.filter(
      (pref) => pref.IsMandatory !== 0
    );

    const selectedPrefNames = selectedPrefs.map((pref) => pref.name);

    const missingPrefs = mandatoryPrefs.filter(
      (pref) => !selectedPrefNames.includes(pref.Name)
    );

    return {
      isValid: missingPrefs.length === 0,
      missingPrefs,
    };
  };

  //  Size mandatory check function
  const isSizeSelectionValid = (isSizeAvailable, selectedSizes, itemId) => {
    if (isSizeAvailable) {
      const selectedSize = selectedSizes[itemId];
      return !!selectedSize; // true if size is selected
    }
    return true; // size not required, so valid
  };

  const handleAddItem = (mandatory) => {
    const isVariantAvailable = customizationPrefrences?.IsSizeAvailable !== 0;
    const itemId = selectedItemData?.ItemId;

    if (!isSizeSelectionValid(isVariantAvailable, selectedSizes, itemId)) {
      setprefAlert(true);
      return;
    }
    setprefAlert(false);

    const isLastGroup = visibleGroupIndex + 1 === deal.ItemGroupList.length;

    // Gather selected items
    const selections = deal?.ItemGroupList?.flatMap((group, groupIndex) =>
      group.CategoryList.flatMap((category, catIndex) => {
        const key = `${groupIndex}-${catIndex}`;
        const selectedIndex = selectedItems[key];
        if (selectedIndex !== undefined) {
          const selectedItem = category.ItemListWidget[selectedIndex];
          return [
            {
              id: selectedItem.ItemId, // <- Important for preference lookup
              itemname: selectedItem.ItemName,
              price: selectedItem.Price,
            },
          ];
        }
        return [];
      })
    );

    const itemPrefs =
      customizationPrefrences?.FooditemprefrencewidgetList || [];
    const selectedPrefNames = prefCheck || [];

    const { isValid, missingPrefs } = validateMandatoryPreferences(
      itemPrefs,
      selectedPrefNames
    );

    if (!isValid) {
      console.log("🚨 Missing mandatory preferences:", missingPrefs);
      setprefAlert(true); // or show toast
      return;
    }

    setprefAlert(false);

    // Group selections
    const groupedSelections = Object.values(
      selections.reduce((acc, curr) => {
        if (!acc[curr.id]) {
          acc[curr.id] = { id: curr.id, itemname: [], price: 0 };
        }
        acc[curr.id].itemname.push(curr.itemname);
        acc[curr.id].price += curr.price;
        return acc;
      }, {})
    );

    if (customizationPrefrences?.FooditemprefrencewidgetList) {
      const currentPreferences =
        customizationPrefrences.FooditemprefrencewidgetList.map(
          (item) => item.Name
        );

      // Merge previous with new ones
      setItemPreferences((prev) =>
        Array.from(new Set([...prev, ...currentPreferences]))
      );
    }

    const currentCustomization = customizationData;

    // Save all customize data for reference
    const updatedCustomizeData = [
      ...customizeData,
      {
        itemId: selectedItemData.ItemId,
        customizationData: currentCustomization,
      },
    ];

    setcustomizeData(updatedCustomizeData);

    if (isLastGroup) {
      const selected = deal?.ItemGroupList?.flatMap((itemGroup, itemIndex) =>
        itemGroup.CategoryList?.flatMap((category, categoryIndex) => {
          const key = `${itemIndex}-${categoryIndex}`;
          const selectedIndex = selectedItems[key];

          if (selectedIndex !== undefined) {
            const selectedItem = category.ItemListWidget[selectedIndex];

            const id = selectedItem.ItemId;

            let newdata = [];
            let realdata = [];
            let custom_idss = [];

            newdata = updatedCustomizeData.find((c) => c.itemId == id);

            if (newdata?.customizationData) {
              // realdata = newdata.customizationData.flatMap((custData) =>
              //   custData.ingredientwidgetList.map((ing) => ({
              //     item_cust_category: custData.CustomCatName,
              //     item_cust_values: `${ing.IngredientName}(+Rs.${ing.Price})`,
              //   }))
              // );
              realdata = newdata?.customizationData.flatMap((custData) =>
                custData.ingredientwidgetList
                  .filter(
                    (ing) =>
                      (cusomizeQty[
                        `${custData.CustomItemId}_${ing.IngredientId}`
                      ] || 0) > 0
                  )
                  .map((ing) => ({
                    item_cust_category: custData.CustomCatName,
                    item_cust_values: `${ing.IngredientName}(+Rs.${ing.Price})`,
                    qty:
                      cusomizeQty[
                        `${custData.CustomItemId}_${ing.IngredientId}`
                      ] || 0,
                  }))
              );

              custom_idss = newdata?.customizationData.flatMap((custData) =>
                custData.ingredientwidgetList
                  .filter(
                    (ing) =>
                      (cusomizeQty[
                        `${custData.CustomItemId}_${ing.IngredientId}`
                      ] || 0) > 0
                  )
                  .map((ing) => ({
                    item_cust_category: custData.CustomCatName,
                    item_cust_values: `${ing.IngredientName}(+Rs.${ing.Price})`,
                    qty:
                      cusomizeQty[
                        `${custData.CustomItemId}_${ing.IngredientId}`
                      ] || 0,
                  }))
              );
            }
            // if (cusomizeQty > 0) {
            // }

            const prefs = selectedPreferences[id] || {};

            const preferences = Object.entries(prefs)
              .map(
                ([prefName, options]) =>
                  `${prefName}: ${
                    Array.isArray(options) ? options.join(", ") : options
                  }`
              )
              .join(",");

            const allPrefs = preferences;

            const customIngredientValuesString =
              custom_idss
                ?.map((c) => `1 x ${c.item_cust_values}_${c.custom_item_id}`)
                .join("") || "";
            // const ingredientTotalPrice = newdata?.customizationData?.reduce(
            //   (total, custData) => {
            //     return (
            //       total +
            //       custData.ingredientwidgetList.reduce(
            //         (sum, ing) => sum + (ing.Price || 0),
            //         0
            //       )
            //     );
            //   },
            //   0
            // );

            // ✅ Filter only selected options from selectedPreferences

            const ingredientTotalPrice = newdata?.customizationData?.reduce(
              (total, custData) => {
                return (
                  total +
                  custData.ingredientwidgetList.reduce((sum, ing) => {
                    const qty =
                      cusomizeQty[
                        `${custData.CustomItemId}_${ing.IngredientId}`
                      ] || 0;
                    return sum + (ing.Price || 0) * qty;
                  }, 0)
                );
              },
              0
            );

            const itemsPrefOptionList =
              selectedItem?.FooditemprefrencewidgetList?.flatMap((pref) => {
                const selectedPref = prefs[pref.Name];
                if (!selectedPref) return [];

                // Radio button (single selection)
                if (pref.max_selection === 1) {
                  return pref.PrefOptionList.filter(
                    (option) => option.Name === selectedPref
                  ).map((option) => ({
                    FlistName: pref.Name,
                    Name: option.Name,
                    isChecked: true,
                    option_id: option.option_id,
                    preference_option_id: option.preference_option_id,
                    sold_out_flag: option.sold_out_flag,
                    status: option.status,
                  }));
                }

                // Checkbox (multi-selection)
                return pref.PrefOptionList.filter((option) =>
                  selectedPref.includes(option.Name)
                ).map((option) => ({
                  FlistName: pref.Name,
                  Name: option.Name,
                  isChecked: true,
                  option_id: option.option_id,
                  preference_option_id: option.preference_option_id,
                  sold_out_flag: option.sold_out_flag,
                  status: option.status,
                }));
              }) || [];

            return {
              baseprice: 0,
              custom_desc: realdata,
              custom_ids: custom_idss,
              deal_id: deal.DealId,
              group_no: itemGroup.GroupNo,
              itemCartSubTotal: deal.DealPrice,
              itemString: `${selectedItem.ItemId}_${
                selectedSizes?.[id]?.SizeName || ""
              }${selectedItem.ItemName}${
                allPrefs ? allPrefs : ""
              }${customIngredientValuesString}`,
              item_notes: null,
              order_itemCategory: category.CategryId,
              order_item_cust_price: 0,
              order_item_price: ingredientTotalPrice,
              order_item_qty: 1,
              order_item_subtype_id: selectedItem.SizeId,
              order_itemid: selectedItem.ItemId,
              order_itemname: selectedItem.ItemName,
              order_size: selectedSizes?.[id]?.SizeName || "",
              preference_names: allPrefs,
              subTotal: deal.DealPrice,
              totalDealIngredientPrice: 0,
              itemsPrefOptionList,
            };
          }

          return [];
        })
      );

      setitemObj(selected);

      const totalIngredientPrice = selected.reduce(
        (sum, item) => sum + (item.order_item_price || 0),
        0
      );

      setDeals((prev) => {
        const itemStringKey =
          selected.map((item) => item.itemString).join("_") +
          `_deal_${deal.DealId}`;

        const existingIndex = prev.findIndex(
          (item) => item.deal_item_string === itemStringKey
        );

        if (existingIndex !== -1) {
          return prev.map((item, index) => {
            if (index === existingIndex) {
              const newQty = item.order_deal_qty + 1;
              // const newSubTotal = newQty * deal.DealPrice;
              return {
                ...item,
                order_deal_qty: newQty,
              };
            }
            return item;
          });
        } else {
          // Add new item
          const updatedItem = {
            order_dealid: deal.DealId,
            order_dealdesc: deal.DealDesc,
            applyDiscount: deal.applyDiscount,
            order_dealname: deal.DealName,
            deal_taxes: [],
            order_deal_discount_amount: "",
            order_deal_discount_percent: "",
            order_deal_price: deal.DealPrice,
            order_total_deal_price: deal.DealPrice + totalIngredientPrice,
            order_deal_qty: 1,
            min_deal_quantity: 1,
            subTotal: deal.DealPrice,
            total_tax_price: "0.00",
            with_customize_price: deal.DealPrice + totalIngredientPrice,
            deal_item_string: itemStringKey,
            items: selected,
          };

          return [...prev, updatedItem];
        }
      });

      setSelectedPreferences({});
      setSelectedPrefOptions([]);

      setcusomizeQty({});

      onClose();
    } else {
      setVisibleGroupIndex(visibleGroupIndex + 1);
      setSelectedPrefOptions([]);
    }

    setIsNestedModalOpen(false);
    setSpecialInstructions("");
  };
  useEffect(() => {
    localStorage.setItem("DealItems", JSON.stringify(Deals));
    // console.log("saved successfully",Deals)
  }, [Deals]);

  function handleCloseNestedModal() {
    setSelectedPreferences({});
    setSelectedPrefOptions([]);
    setprefAlert(false);
    setIsNestedModalOpen(false);
    setSpecialInstructions("");
    closeNestedModal();
    setprefCheck([]);
    setSelectedSizes({});
    setcusomizeQty({});
    setIngredientQuantities({}); // Reset ingredient quantities
    setshowError(true);
  }

  const closeNestedModal = () => {
    if (selectedItemData) {
      const groupIndex = visibleGroupIndex;
      const categoryIndex = deal.ItemGroupList[
        groupIndex
      ].CategoryList.findIndex((category) =>
        category.ItemListWidget.some(
          (item) => item.ItemName === selectedItemData.ItemName
        )
      );
      const key = `${groupIndex}-${categoryIndex}`;

      setSelectedItems((prev) => {
        const updated = { ...prev };
        delete updated[key];
        return updated;
      });

      setSelectedItemData(null);
    }
  };

  // Fixed ingredient quantity functions

  // const increasequantity = () => {
  //   if (cusomizeQty < 1) {
  //     setcusomizeQty(cusomizeQty + 1);
  //   } else {
  //     setmaxQuantity(true);
  //   }
  // };
  // const decreasequantity = () => {
  //   if (cusomizeQty !== 0) {
  //     setcusomizeQty(cusomizeQty - 1);
  //   }
  // };
  // const getQuantity = (ingredientId) => ingredientQuantities[ingredientId] || 0;

  const increasequantity = (customId, ingId) => {
    const key = `${customId}_${ingId}`;
    setcusomizeQty((prev) => {
      const current = prev[key] || 0;
      if (current < 1) {
        return { ...prev, [key]: current + 1 };
      } else {
        setmaxQuantity(true);
        return prev;
      }
    });
  };

  const decreasequantity = (customId, ingId) => {
    const key = `${customId}_${ingId}`;
    setcusomizeQty((prev) => {
      const current = prev[key] || 0;
      if (current > 0) {
        return { ...prev, [key]: current - 1 };
      }
      return prev;
    });
  };

  if (!deal || !deal.ItemGroupList) return null;

  return (
    <>
      <Modal
        open={open}
        onClose={() => {
          handleClose(
            setSelectedPreferences,
            setSelectedPrefOptions,
            showError
          );
        }}
      >
        <Box sx={style} className={styles.modalBox}>
          <div className={styles.modalContainer}>
            <div className={styles.specialDeal}>
              <div className={styles.specialData}>
                <Typography variant="h6">{deal.DealName}</Typography>
                <p>Rs. {deal.DealPrice}</p>
              </div>

              <div className={styles.closeModalBtn}>
                <div>
                  <IoIosClose onClick={onClose} className={styles.closeIcon} />
                </div>
              </div>
            </div>

            <div className={styles.selectItem}>
              <div className={styles.center}>
                <p>You can select any item for combo</p>
                <div className={styles.itemButton}>
                  {deal?.ItemGroupList?.map((Item, buttonIndex) => {
                    return (
                      <Button
                        variant="contained"
                        key={buttonIndex}
                        className={
                          buttonIndex <= visibleGroupIndex
                            ? styles.activeButton
                            : ""
                        }
                      >
                        {selectedItems?.[`${buttonIndex}-0`] !== undefined && (
                          <Image
                            height={20}
                            width={20}
                            src={dealTick}
                            style={{ marginRight: "5px" }}
                            alt="Selected"
                          />
                        )}
                        Item {buttonIndex + 1}
                      </Button>
                    );
                  })}
                </div>
              </div>
              {showError && (
                <div className={styles.errorMessage}>
                  <p style={{ color: "red" }}>
                    Please select and add atleast one item to proceed!
                  </p>
                </div>
              )}
              {deal?.ItemGroupList?.[visibleGroupIndex] &&
                (() => {
                  const group = deal.ItemGroupList[visibleGroupIndex];
                  return (
                    <div>
                      {group.CategoryList?.map((category, catIndex) => (
                        <div key={catIndex} className={styles.itemDetails}>
                          <div className={styles.itemTitle}>
                            <p>
                              {category.CategryName} - Select Item From Below
                            </p>
                          </div>

                          {category.ItemListWidget?.map((item, itemIndex) => (
                            <div key={itemIndex} className={styles.itemTypes}>
                              <div className={styles.selectTypes}>
                                <CustomRadio
                                  checked={
                                    selectedItems[
                                      `${visibleGroupIndex}-${catIndex}`
                                    ] === itemIndex
                                  }
                                  onChange={() => {
                                    handleItemSelect(
                                      visibleGroupIndex,
                                      catIndex,
                                      itemIndex
                                    );
                                    setSelectedItemData(item);
                                    setIsNestedModalOpen(true);
                                  }}
                                  value={itemIndex}
                                  name={`group-${visibleGroupIndex}-category-${catIndex}`}
                                  // id={`group-${visibleGroupIndex}-category-${catIndex}-item-${itemIndex}`}
                                  id={`group-${visibleGroupIndex}-category-${catIndex}-item-${itemIndex}`}
                                />
                                <label
                                  htmlFor={`group-${visibleGroupIndex}-category-${catIndex}-item-${itemIndex}`}
                                >
                                  {item.ItemName} - Rs. {item.Price}
                                </label>
                              </div>
                              <p>{item.Description}</p>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  );
                })()}
            </div>

            {
              isNestedModalOpen && selectedItemData && (
                // !isCustomizationLoading && (
                <Modal
                  open={isNestedModalOpen}
                  onClose={handleCloseNestedModal}
                  aria-labelledby="nested-modal-title"
                >
                  <Box
                    className={styles.nestedModalBox}
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      bgcolor: "background.paper",
                      borderRadius: "20px",
                      boxShadow: 24,
                    }}
                  >
                    <div className={styles.selectItemDetails}>
                      <div className="info">
                        <h3>{selectedItemData.ItemName}</h3>
                        <p>{selectedItemData.Description}</p>
                        {prefAlert && (
                          <div className="alert-message">
                            <Alert icon={false} className={styles.checkAlert}>
                              "Please select a size" or "Choose all required
                              preferences"
                            </Alert>
                          </div>
                        )}
                      </div>
                      <div className={styles.closeModalBtn}>
                        <div>
                          <IoIosClose
                            onClick={() => {
                              setIsNestedModalOpen(false);
                              setcusomizeQty({});
                              setSelectedItems({});
                              setSelectedPreferences({});
                              setSelectedPrefOptions([]);
                            }}
                            className={styles.closeIcon}
                          />
                        </div>
                      </div>
                    </div>

                    <div className={styles.nestedScrollModal}>
                      {/* Variants */}

                      {isCustomizationLoading &&
                      selectedItemData?.IsSizeAvailable !== 0 ? (
                        <div className="px-2 my-2">
                          <div>
                            <label>
                              <div className="mb-2 h-4 bg-gray-200 rounded w-1/2"></div>
                            </label>
                          </div>
                          <h5 className="mb-2">
                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                          </h5>
                          <h5 className="mb-2">
                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                          </h5>
                        </div>
                      ) : (
                        selectedItemData?.IsSizeAvailable !== 0 && (
                          <div className={styles.customizePrefernces}>
                            <h5>
                              Variants{" "}
                              <span className={styles.mandatory}>*</span>
                            </h5>
                            {customizationPrefrences?.SizeListWidget?.map(
                              (size, sizeIndex) => (
                                <div
                                  key={sizeIndex}
                                  className={styles.selectTypes}
                                >
                                  {/* <CustomRadio /> */}
                                  <CustomRadio
                                    id={`size-${selectedItemData?.ItemId}-${sizeIndex}`}
                                    checked={
                                      selectedSizes[selectedItemData?.ItemId]
                                        ?.SizeName === size.SizeName
                                    }
                                    onChange={() => {
                                      setSelectedSizes((prev) => ({
                                        ...prev,
                                        [selectedItemData?.ItemId]: size,
                                      }));

                                      setprefAlert(false);
                                    }}
                                  />
                                  <label
                                    htmlFor={`size-${selectedItemData?.ItemId}-${sizeIndex}`}
                                  >
                                    {size.SizeName}
                                  </label>
                                </div>
                              )
                            )}
                          </div>
                        )
                      )}

                      {/* Prefernces */}

                      {isCustomizationLoading &&
                      selectedItemData?.FooditemprefrencewidgetList?.length >
                        0 ? (
                        <div className="px-2 my-2">
                          <div>
                            <label>
                              <div className="mb-2 h-4 bg-gray-200 rounded w-1/2"></div>
                            </label>
                          </div>
                          <h5 className="mb-2">
                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                          </h5>
                          <h5 className="mb-2">
                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                          </h5>
                        </div>
                      ) : (
                        selectedItemData?.FooditemprefrencewidgetList?.length >
                          0 &&
                        customizationPrefrences?.FooditemprefrencewidgetList?.map(
                          (pref) => (
                            <div
                              key={pref.Id || pref.Name}
                              className={styles.customizePrefernces}
                            >
                              <h5>
                                {pref.Name}{" "}
                                {pref?.IsMandatory !== 0 && (
                                  <span className={styles.mandatory}>*</span>
                                )}
                                {pref?.max_selection === 1 && (
                                  <span className={styles.maxSelection}>
                                    (select any {pref.max_selection})
                                  </span>
                                )}
                              </h5>
                              {pref?.PrefOptionList?.map((option, idx) => (
                                <div
                                  key={`${option.option_id}-${option.Name}`}
                                  className={styles.optionContainer}
                                >
                                  {pref.max_selection === 1 ? (
                                    <CustomRadio
                                      id={`option-${pref.Id}-${option.option_id}-${idx}`}
                                      // checked={selectedPreferences?.[selectedItemData?.ItemId]?.[pref.Name] === option.Name}
                                      checked={
                                        selectedPreferences?.[
                                          selectedItemData?.ItemId
                                        ]?.[pref.Name] === option.Name || false
                                      }
                                      onChange={() =>
                                        handleChecked(
                                          pref,
                                          option.option_id,
                                          option.Name,
                                          selectedItemData?.ItemId,
                                          option
                                        )
                                      }
                                    />
                                  ) : (
                                    <CustomCheckbox
                                      // id={`option-${option.option_id}`}
                                      id={`option-${pref.Id}-${option.option_id}-${idx}`}
                                      // checked={selectedPreferences?.[selectedItemData?.ItemId]?.[pref.Name]?.includes(option.Name)}

                                      checked={
                                        selectedPreferences?.[
                                          selectedItemData?.ItemId
                                        ]?.[pref.Name]?.includes(option.Name) ||
                                        false
                                      }
                                      onChange={() =>
                                        handleChecked(
                                          pref,
                                          option.option_id,
                                          option.Name,
                                          selectedItemData?.ItemId
                                        )
                                      }
                                    />
                                  )}
                                  <label
                                    htmlFor={`option-${pref.Id}-${option.option_id}-${idx}`}
                                  >
                                    {option.Name}
                                  </label>
                                </div>
                              ))}
                            </div>
                          )
                        )
                      )}

                      {/* Additional Customization */}
                      {!isCustomizationLoading &&
                        // customizationData?.length > 0 ?

                        // <div className="mb-2 px-2 sm:px-2 lg:px-2 animate-pulse">

                        //   <div>

                        //     <div>
                        //       <label>
                        //         <div className="mb-2 h-4 bg-gray-200 rounded w-1/2"></div>
                        //       </label>
                        //     </div>
                        //   </div>
                        //   <div className="mb-2">
                        //     <div>
                        //       <div className="mb-2 h-10 bg-gray-200 rounded"></div>
                        //     </div>
                        //     <div>
                        //       <div className="mb-2 h-4 bg-gray-200 rounded w-1/4"></div>
                        //     </div>

                        //   </div>
                        // </div>
                        // :
                        customizationData?.length > 0 &&
                        customizationData.map((custom, idx) => (
                          <div
                            key={idx}
                            className={styles.customizationSection}
                          >
                            <div className={styles.customBlock}>
                              <h5>{custom.CustomCatName}</h5>

                              {custom?.ingredientwidgetList?.length > 0 &&
                                custom.ingredientwidgetList.map((ing, i) => {
                                  const key = `${custom.CustomItemId}_${ing.IngredientId}`;
                                  const qty = cusomizeQty[key] || 0;

                                  return (
                                    <div
                                      key={i}
                                      className={styles.IngridientContainer}
                                    >
                                      <p className={styles.ingridient}>
                                        {ing.IngredientName}
                                        <br />
                                        <span>Rs. {ing.Price.toFixed(2)}</span>
                                      </p>
                                      <div className="right-side flex flex-col">
                                        <div className="flex gap-1 items-center">
                                          <div className="flex h-10 text-center items-center">
                                            <CustomButton
                                              variant={"outline"}
                                              className="font-bold text-2xl rounded-none w-[30px] rounded-l-md border-r-0 border-input pt-1"
                                              onClick={() =>
                                                decreasequantity(
                                                  custom.CustomItemId,
                                                  ing.IngredientId
                                                )
                                              }
                                            >
                                              -
                                            </CustomButton>
                                            <div
                                              className={`border-y border-input w-[30px] shadow-xs h-9 content-center ${styles.custbtn}`}
                                            >
                                              {qty}
                                            </div>
                                            <CustomButton
                                              variant={"outline"}
                                              className="font-bold text-xl rounded-none w-[30px] rounded-r-md border-l-0 border-input"
                                              onClick={() =>
                                                increasequantity(
                                                  custom.CustomItemId,
                                                  ing.IngredientId
                                                )
                                              }
                                            >
                                              +
                                            </CustomButton>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                            </div>
                          </div>
                        ))}

                      {/* Additional Customization */}

                      {/* Special Instructions */}
                      <div className={styles.inputDiv}>
                        <h5>Special Instructions</h5>
                        <div className={styles.input}>
                          <textarea
                            value={specialInstructions}
                            onChange={(e) =>
                              setSpecialInstructions(e.target.value)
                            }
                            placeholder="Any Suggestions for us? We will keep it in mind"
                            rows={3}
                          />
                        </div>
                      </div>

                      {/* Add Item Button */}
                      <div className={styles.btnAdd}>
                        <Button
                          variant="contained"
                          onClick={() =>
                            handleAddItem(
                              customizationPrefrences?.FooditemprefrencewidgetList
                            )
                          }
                          fullWidth
                          disabled={!selectedItemData}
                        >
                          Add Item
                        </Button>
                      </div>

                      {maxQuantity && (
                        <Modal
                          open={maxQuantity}
                          onClose={() => setmaxQuantity(false)}
                          closeAfterTransition
                          aria-labelledby="modal-modal-title"
                          aria-describedby="modal-modal-description"
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Grow in={maxQuantity} timeout={500}>
                            <Box
                              sx={{
                                width: "300px",
                                bgcolor: "background.paper",
                                borderRadius: 0,
                                boxShadow: 0,
                                p: 2,
                                transformOrigin: "center center",
                              }}
                            >
                              <div className={styles.maximumModal}>
                                <div className={styles.maximumIcon}>
                                  <PiWarningCircleLight
                                    className={styles.icon}
                                  />
                                </div>
                                <h4 className="uppercase font-[poppins] font-bold text-[90%] text-center">
                                  YOU HAVE REACHED MAXIMUM QUANTITY
                                </h4>
                              </div>
                            </Box>
                          </Grow>
                        </Modal>
                      )}
                    </div>
                  </Box>
                </Modal>
              )
              // )
            }
          </div>
        </Box>
      </Modal>
    </>
  );
}
