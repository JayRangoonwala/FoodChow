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

    console.log("containerRect", containerRect);
    console.log("targetRect", targetRect);
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
    <div className="flex flex-row flex-nowrap items-center px-2 py-2 overflow-x-auto font-sans bg-[#e6f6fa] border-b border-gray-200">
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
                "relative px-1 pb-1 lg:text-sm text-xs outline-none bg-transparent border-none transition-colors duration-150",
                isActive
                  ? "text-black font-bold"
                  : "text-gray-800 font-medium hover:text-[#009688]"
              )}
              style={{ minWidth: 60 }}
            >
              {cat.name}
              {isActive && (
                <span className="absolute left-1/2 -bottom-1.5 -translate-x-1/2 w-6 h-[3px] bg-[#009688] rounded-full" />
              )}
            </button>
            {idx < categories.length - 1 && (
              <span className="h-8 w-px bg-gray-400 mx-2" />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
