import Cart from "@/components/MainMenu/Sections/cart";
import React from "react";
import { CategorySkeleton } from "./Sections/categories";
import { MenuSkeleton } from "./Sections/menu-list";

export default function MainMenuSkeleton() {
  return (
    <section className="grid h-full w-full grid-cols-1 lg:grid-cols-8 grid-rows-1 gap-2 lg:px-6 px-3 py-4">
      <CategorySkeleton className="col-span-2 hidden lg:block" />
      <MenuSkeleton className="col-span-4" />
      <Cart className="col-span-2 hidden lg:block" />
    </section>
  );
}
