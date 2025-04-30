"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useRef, useState } from "react";

export default function CategoryItem({
  restaurantMenuList,
}: {
  restaurantMenuList: any;
}) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categoryRefs = useRef<Record<string, HTMLLIElement | null>>({});

  const handleCategoryClick = (categoryName: string) => {
    const container = document.getElementById("menu-scroll-container");
    const id =
      categoryName === "Deals" ? "category-deals" : `category-${categoryName}`;
    const target = document.getElementById(id);

    if (!container || !target) return;

    const offset = 60;
    const targetPosition = target.offsetTop - container.offsetTop;

    container.scrollTo({
      top: targetPosition - offset,
      behavior: "smooth",
    });

    setActiveCategory(categoryName); // Update immediately on click
  };

  useEffect(() => {
    const container = document.getElementById("menu-scroll-container");
    if (!container) return;

    const onScroll = () => {
      let current: string | null = null;

      const dealsSection = document.getElementById("category-deals");
      if (dealsSection) {
        const sectionTop = dealsSection.offsetTop - container.offsetTop;
        if (container.scrollTop >= sectionTop - 90) {
          current = "Deals";
        }
      }

      for (const item of restaurantMenuList.CategoryList) {
        const section = document.getElementById(`category-${item.CategryName}`);
        if (section) {
          const sectionTop = section.offsetTop - container.offsetTop;
          if (container.scrollTop >= sectionTop - 90) {
            current = item.CategryName;
          }
        }
      }

      if (current !== activeCategory) {
        setActiveCategory(current);
      }
    };

    container.addEventListener("scroll", onScroll);
    return () => container.removeEventListener("scroll", onScroll);
  }, [restaurantMenuList.CategoryList, activeCategory]);

  useEffect(() => {
    if (activeCategory && categoryRefs.current[activeCategory]) {
      categoryRefs.current[activeCategory]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      });
    }
  }, [activeCategory]);

  return (
    <ul>
      {restaurantMenuList.DealList &&
        restaurantMenuList.DealList.length > 0 && (
          <li
            ref={(el) => {
              categoryRefs.current["Deals"] = el;
            }}
            id="deals"
            className={cn(
              activeCategory === "Deals" && "bg-primary text-white",
              "flex justify-between font-medium cursor-pointer hover:bg-primary/60 rounded-sm hover:text-white duration-200 transition-all p-3"
            )}
            onClick={() => handleCategoryClick("Deals")}
          >
            <span>Deals</span>
            <span className="block lg:hidden">
              {restaurantMenuList.DealList.length}
            </span>
          </li>
        )}
      {restaurantMenuList.CategoryList.map((item: any, key: any) => {
        const isActive = activeCategory === item.CategryName;

        return (
          <li
            key={key}
            ref={(el) => {
              categoryRefs.current[item.CategryName] = el;
            }}
            onClick={() => handleCategoryClick(item.CategryName)}
            className={cn(
              isActive && "bg-primary text-white",
              `flex justify-between font-medium cursor-pointer hover:bg-primary/60 rounded-sm hover:text-white duration-200 transition-all p-3`
            )}
          >
            <span>{item.CategryName}</span>
            <span className="block lg:hidden">
              {item.ItemListWidget.length}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
