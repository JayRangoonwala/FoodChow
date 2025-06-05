import { cache } from "react";
// lib/shopService.ts
import apiClient from "./apiClient";

interface ShopIdResponse {
  shop_id: number;
}

export const fetchShopIdBySubdomain = cache(
  async (subDomain: string): Promise<number | null> => {
    try {
      const res = await apiClient.get(
        `FoodChowWD/GetShopIdByMainDomain?maindomain=${subDomain}&flag=0`
      );
      const parsedData: ShopIdResponse[] = JSON.parse(res.data.data);
      return parsedData[0]?.shop_id || null;
    } catch (err) {
      console.error("Error getting shopId:", err);
      return null;
    }
  }
);

export const fetchShopDetails = async (shopId: any) => {
  try {
    const res = await apiClient.get(
      `FoodChowWD/GetShopDetailsWD?ShopId=${shopId}`
    );
    return res.data;
  } catch (err) {
    console.error("Error fetching shop details:", err);
    return null;
  }
};

export const fetchShopTiming = async (shopId: any) => {
  try {
    const currentTime = new Date().toLocaleTimeString("en-US", {
      hour12: false,
    });
    const res = await apiClient.get(
      `FoodChowWD/CheckTimeShop?shop_id=${shopId}&curr_time=${currentTime}`
    );
    return res.data;
  } catch (err) {
    console.error("Error fetching shop timing details:", err);
    return null;
  }
};

export const fetchWidgetSettings = async (shopId: any) => {
  try {
    const res = await apiClient.get(
      `FoodChowWD/GetWidgetSetting?shpid=${shopId}`
    );
    return res.data;
  } catch (err) {
    console.error("Error fetching widget settings details:", err);
    return null;
  }
};

export const fetchAllShopMenuType = async (shopId: any) => {
  try {
    const res = await apiClient.get(
      `FoodChowWD/GetAllShopMenuTypeWDForOrder?ShopId=${shopId}`
    );
    return res.data;
  } catch (err) {
    console.error("Error fetching widget settings details:", err);
    return null;
  }
};

export const fetchRestaurantMenuWDWidget_multi = async (shopId: any) => {
  try {
    const res = await apiClient.get(
      `FoodChowWD/GetRestaurantMenuWDWidget_multi?ShopId=${shopId}&locale_id=`
    );
    return res.data;
  } catch (err) {
    console.error("Error fetching widget settings details:", err);
    return null;
  }
};

export const fetchRestaurantMenuForShopMenuWD = async (menuId: string) => {
  try {
    const res = await apiClient.get(
      `FoodChowWD/GetRestaurantMenuForShopMenuWD?MenuId=${menuId}`
    );
    return res.data;
  } catch (err) {
    console.error("Error fetching widget settings details:", err);
    return null;
  }
};

export const fetchCountryWithCountryCode = async () => {
  try {
    const res = await apiClient.get(`FoodChowWD/GetCountryWithCountryCode`);
    return res.data;
  } catch (err) {
    console.error("Error fetching widget settings details:", err);
    return null;
  }
};

export const fetchOrderingMethod = async (shopId: any) => {
  try {
    const res = await apiClient.get(
      `FoodChowWD/GetOrderingMethodForShop?shop_id=${shopId}&menu_id=0`
    );
    return res.data;
  } catch (err) {
    console.error("Error fetching ordering method details:", err);
    return null;
  }
};

export const sendQuery = async (data: any, shopId: any) => {
  try {
    data["Id"] = shopId;
    const res = await apiClient.post(`FoodChowWD/SendQuery`, data);
    return res.data;
  } catch (err) {
    console.error("Error sending query:", err);
    return null;
  }
};

export const sendBookTableQuery = async (data: any, shopId: any) => {
  try {
    data["Id"] = shopId;
    const queryString = new URLSearchParams(data).toString();
    const res = await apiClient.get(
      `FoodChowRMS/GetSaveTableReservationRequest?${queryString}`
    );
    return res.data;
  } catch (err) {
    console.error("Error sending query:", err);
    return null;
  }
};

export const fetchMenuCustomization = async (itemId: any) => {
  try {
    const res = await apiClient.get(
      `FoodChowWD/GetCustomizationDetailsOfItemWD_multi?item_id=${itemId}&locale_id=null`
    );
    return res.data;
  } catch (err) {
    console.error("Error sending query:", err);
    return null;
  }
};

export const checkItemAvaialbility = async (itemId: any, shopId: any) => {
  try {
    const res = await apiClient.get(
      `foodchowWD/getItemNameById?item_id=${itemId}&shop_id=${shopId}`
    );
    return res.data;
  } catch (err) {
    console.error("Error sending query:", err);
    return null;
  }
};

export const fetchTaxAndCharges = async (
  itemId: any,
  shopId: any,
  dealId?: any
) => {
  try {
    const res = await apiClient.get(
      `FoodChowWD/GetTaxAndchargesMenuWD?itemId=${itemId}&shopId=${shopId}&dealId=${dealId}`
    );
    return res.data;
  } catch (err) {
    console.error("Error sending query:", err);
    return null;
  }
};

export const fetchShopPayment = async (shopId: any, orderMethodId: any) => {
  try {
    const res = await apiClient.get(
      `FoodChowWD/GetShopPaymentMethodFromOrderMethod?shop_id=${shopId}&order_method_id=${orderMethodId}&menu_id=0`
    );
    return res.data;
  } catch (err) {
    console.error("Error sending query:", err);
    return null;
  }
};

export const fetchUserOptions = async (shopId: any) => {
  try {
    const res = await apiClient.get(
      `FoodChowWD/getUserOptionDetails?shop_id=${shopId}`
    );
    return res.data;
  } catch (err) {
    console.error("Error sending query:", err);
    return null;
  }
};

export const saveCartWD = async (data: any) => {
  try {
    const res = await apiClient.post(`FoodChowWD/SaveCartWD_web`, data);
    return res.data;
  } catch (err) {
    console.error("Error sending query:", err);
    return null;
  }
};
