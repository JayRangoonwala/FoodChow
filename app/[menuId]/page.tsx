// app/layout.tsx or components/Layout.tsx

import MainMenuSkeleton from "@/components/Loading/MainMenuSkeleton";
import MainMenuPage from "@/components/MainMenu";
import { getSubdomainFromHeaders } from "@/lib/getSubdomain";
import {
  fetchAllShopMenuType,
  fetchShopIdBySubdomain,
} from "@/lib/shopService";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function Page({
  params,
}: {
  params: Promise<{ menuId: string }>;
}) {
  const qryParams = await params;
  const subdomain = await getSubdomainFromHeaders();
  const shopId = await fetchShopIdBySubdomain(subdomain);

  const shopMenuType = await fetchAllShopMenuType(shopId);

  const parsedShopMenuType = shopMenuType.data
    ? JSON.parse(shopMenuType.data)
    : null;

  const menuId = parsedShopMenuType?.menu.find(
    (item: any) => item.menu_url === qryParams.menuId
  )?.id;

  if (!menuId) {
    return redirect("/");
  }

  return (
    <>
      <Suspense fallback={<MainMenuSkeleton />}>
        <MainMenuPage mainMenu={false} menuId={menuId} />
      </Suspense>
    </>
  );
}
