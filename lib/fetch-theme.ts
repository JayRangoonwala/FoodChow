import { fetchWidgetSettings } from "./shopService";

// lib/theme/fetch-theme.ts
export async function fetchThemeColors(
  shopId: any
): Promise<Record<string, string>> {
  const widgetData = await fetchWidgetSettings(shopId);
  const parsedWidgetData = JSON.parse(widgetData.data);

  const primaryColor = parsedWidgetData[0].color_picker;

  return {
    primary: primaryColor,
    "primary-foreground": primaryColor,
    secondary: primaryColor,
    "secondary-foreground": primaryColor,
    border: primaryColor,
    "accent-foreground": "#ffffff",
    accent: primaryColor,
    // Add more as needed
  };
}
