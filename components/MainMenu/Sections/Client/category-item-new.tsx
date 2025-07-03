"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useRef, useState } from "react";

export default function CategoryItem({
  restaurantMenuList,
}: {
  restaurantMenuList: any;
}) {
  const [activeCategory, setActiveCategory] = useState<string | null>("Deals");

  const categoryRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const handleCategoryClick = (categoryName: string) => {
    const container = document.getElementById("menu-scroll-container");

    const id =
      categoryName === "Deals" ? "category-deals" : `category-${categoryName}`;
    const target = document.getElementById(id);

    if (!container || !target) return;

    const offset = 60;

    // Get the target's position relative to the container
    const containerRect = container.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();

    // console.log("containerRect", containerRect);
    // console.log("targetRect", targetRect);
    // Calculate the scroll position needed
    const targetPosition =
      targetRect.top - containerRect.top + container.scrollTop - offset;

    container.scrollTo({
      top: targetPosition,
      behavior: "smooth",
    });

    setActiveCategory(categoryName);
  };

  useEffect(() => {
    if (activeCategory && categoryRefs.current[activeCategory]) {
      categoryRefs.current[activeCategory]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [activeCategory]);

  // Compose the categories list
  const categories = [
    ...(restaurantMenuList.DealList && restaurantMenuList.DealList.length > 0
      ? [{ name: "Deals", count: restaurantMenuList.DealList.length }]
      : []),
    ...restaurantMenuList.CategoryList.map((item: any) => ({
      name: item.CategryName,
      count: item.ItemListWidget.length,
    })),
  ];

  return (
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center px-2 py-2 overflow-y-auto lg:overflow-x-auto font-sans bg-[#e6f6fa] border-b border-gray-200 gap-1 lg:gap-0">
      {categories.map((cat, idx) => {
        const isActive = activeCategory === cat.name;
        return (
          <React.Fragment key={cat.name}>
            <button
              ref={(el) => {
                categoryRefs.current[cat.name] = el;
              }}
              onClick={() => handleCategoryClick(cat.name)}
              className={cn(
                "relative w-full lg:w-auto text-left px-3 py-2 lg:px-2 lg:py-1 text-sm outline-none bg-transparent border-none transition-colors duration-150",
                isActive
                  ? "text-black font-bold bg-white rounded-md lg:bg-transparent lg:rounded-none"
                  : "text-gray-800 font-medium hover:text-[#009688]"
              )}
              style={{ minWidth: 60 }}
            >
              {cat.name}
              {isActive && (
                <span
                  className={
                    "absolute left-0 lg:left-1/2 " +
                    "-bottom-0 lg:-bottom-1.5 w-1 h-6 lg:w-6 lg:h-[3px] " +
                    "bg-[#009688] rounded-full " +
                    "lg:-translate-x-1/2"
                  }
                />
              )}
            </button>
            {idx < categories.length - 1 && (
              <span className="hidden lg:inline h-8 w-px bg-gray-400 mx-2" />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
