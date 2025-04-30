// hooks/useDynamicTheme.ts
import { useEffect, useState } from "react";
import { fetchThemeColors } from "@/lib/fetch-theme";
import { applyThemeVariables } from "@/lib/theme-util";

export function useDynamicTheme(shopId: any) {
  const [theme, setTheme] = useState<{ [key: string]: string } | null>(null);

  useEffect(() => {
    async function initTheme() {
      const themeData = await fetchThemeColors(shopId);
      setTheme(themeData);
      applyThemeVariables(themeData);
    }

    initTheme();
  }, []);

  return theme;
}
