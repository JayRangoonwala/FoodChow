// app/layout.tsx or components/Layout.tsx
import MainMenuSkeleton from "@/components/Loading/MainMenuSkeleton";
import MainMenuPage from "@/components/MainMenu";
import MainMenuNew from "@/components/MainMenu/New";
import { Suspense } from "react";
import MainMenuNew2 from "@/components/MainMenu/New2";


export default function Page() {
 
  return (
    <>
      {/* <Suspense fallback={<MainMenuSkeleton />}>
        <MainMenuPage mainMenu={true} />
      </Suspense> */}

      {/* <div className="w-full">
        <MainMenuNew mainMenu={true} />
      </div> */}
      <MainMenuNew2 mainMenu={true}/>
    </>
  );
}
