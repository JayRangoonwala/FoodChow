"use server";

// lib/utils.ts
import { headers } from "next/headers";
import { cache } from "react";

export const getSubdomainFromHeaders = cache(async () => {
  const headersList = await headers();
  const host = headersList.get("host") || "";

  if (host === "foodchow.in") {
    return ""; // default or homepage
  }

  // keep it cover as comment for temporary deployment
  // const parts = host.split(".");
  // if (parts.length > 2) {
  //   return parts[0] === "www" ? parts[1] : parts[0];
  // }

  return "foodchowdemoindia"; // fallback
});
