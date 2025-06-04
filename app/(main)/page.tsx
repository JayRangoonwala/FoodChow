// app/layout.tsx or components/Layout.tsx

import MainMenuSkeleton from "@/components/Loading/MainMenuSkeleton";
import MainMenuPage from "@/components/MainMenu";
import MainMenuNew from "@/components/MainMenu/New";
import { Suspense } from "react";


export default async function Page() {
  return (
    <>
      {/* <Suspense fallback={<MainMenuSkeleton />}>
        <MainMenuPage mainMenu={true} />
      </Suspense> */}

      <div className="w-full">
        <MainMenuNew mainMenu={true} />
      </div>
    </>
  );
}
