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

    const containerRect = container.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();

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
    <div className="w-full bg-[#e6f6fa] border-y border-[#0AA89E] overflow-x-auto">
      <div className="flex flex-col lg:flex-row items-start lg:items-center px-3 py-2 gap-2 lg:gap-0 min-w-full lg:min-w-max">
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
                  "relative px-3 py-1 max-lg:w-full max-lg:text-start text-base lg:text-sm whitespace-nowrap font-medium transition-colors duration-150",
                  isActive
                    ? "text-black font-semibold"
                    : "text-gray-700 hover:text-[#009688]"
                )}
              >
                {cat.name}
                {isActive && (
                  <span className={
                    "absolute left-0 lg:left-1/2 " +
                    "-bottom-0 lg:-bottom-1.5 w-1 h-6 lg:w-6 lg:h-[3px] " +
                    "bg-[#009688] rounded-full " +
                    "lg:-translate-x-1/2"
                  } />
                )}
              </button>
              {idx < categories.length - 1 && (
                <span className="hidden lg:inline-block mx-2 h-4 w-px bg-gray-400" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
