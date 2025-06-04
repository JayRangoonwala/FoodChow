import { Poppins } from "next/font/google";
import "./globals.css";
import Header from "@/components/Layout/header";
import {
  fetchAllShopMenuType,
  fetchShopDetails,
  fetchShopIdBySubdomain,
  fetchShopTiming,
} from "@/lib/shopService";
import SubHeader from "@/components/Layout/sub-header";
import { cn } from "@/lib/utils";
import LoadTheme from "@/components/load-theme";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "@/components/ui/sonner";
import { getSubdomainFromHeaders } from "@/lib/getSubdomain";
import { Providers } from "./Provider";
import SlowConnectionPopup from "./SlowConnection";

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const subdomain = await getSubdomainFromHeaders();
  const shopId = await fetchShopIdBySubdomain("foodchowdemoindia");
  // console.log(subdomain)
  if (!shopId) {
    console.log("Error in Fetching ShopId", subdomain);
  }

  const shopData = await fetchShopDetails(shopId);
  const shopOpenData = await fetchShopTiming(shopId);
  const shopMenuType = await fetchAllShopMenuType(shopId);

  const parsedShopMenuType = shopMenuType.data
    ? JSON.parse(shopMenuType.data)
    : null;

  const parsedShopData = shopData ? JSON.parse(shopData.data) : null;

  return (
    <html lang="en">
      {/* <head>
        <script
          crossOrigin="anonymous"
          src="//unpkg.com/react-scan/dist/auto.global.js"
        />
      </head> */}
      <body
        className={`${poppins.variable} --font-poppins antialiased bg-[#f4f7fb]`}
      >
        <NextTopLoader showSpinner={false} color="var(--primary)" />

        <Header shopData={shopData} shopOpenData={shopOpenData} />
        <SubHeader shopMenuType={shopMenuType} />
        <LoadTheme shopId={shopId} shopData={parsedShopData} />

        <main
          className={cn(
            shopMenuType &&
              parsedShopMenuType &&
              parsedShopMenuType.menu.length >= 1
              ? "pt-36 lg:pt-28"
              : "pt-16",
            "lg:max-w-full h-full w-full justify-self-center"
          )}
        >
          <SlowConnectionPopup />
          <Providers>{children}</Providers>
        </main>
        <Toaster position="top-center" duration={3000} />
      </body>
    </html>
  );
}

export async function generateMetadata() {
  const subdomain = await getSubdomainFromHeaders();
  const shopId = await fetchShopIdBySubdomain(subdomain);

  if (!shopId) {
    console.log("Error in Fetching ShopId", subdomain);
  }

  const shopData = await fetchShopDetails(shopId);
  const parsedShopData = shopData ? JSON.parse(shopData.data) : null;

  return {
    title: `Order Online from ${parsedShopData.ShopName} ${parsedShopData.shop_area}`,
    description: `Online ordering system for ${parsedShopData.ShopName} powered by FoodChow`,
  };
}
