"use server";

// lib/utils.ts
import { headers } from "next/headers";
import { cache } from "react";

export const getSubdomainFromHeaders = cache(async () => {
  const headersList = await headers();
  const host = headersList.get("host") || "";

  console.log(headersList)
  console.log(host)

  if(host.includes("food-chow-84vy3a9rn-jayrangoonwalas-projects")){
    return "foodchowdemoindia"
  }

  if (
    host === "foodchow.in" || 
    host === "www.foodchow.in" || 
    host === "food-chow.vercel.app"
  ) {
    return ""; // This is the default homepage or dev link
  }

  const parts = host.split(".");
  if (parts.length > 2) {
    return parts[0] === "www" ? parts[1] : parts[0];
  }
  console.log(parts)

  return "foodchowdemoindia"; // fallback subdomain
});
