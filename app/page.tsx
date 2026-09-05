import React from "react";
import { getSpeciesList } from "@/lib/services/speciesService";
import { HomeClient } from "@/components/home/HomeClient";

export const revalidate = 60; // ISR cache 60 seconds

export default async function HomePage() {
  const inStockSpecies = await getSpeciesList({
    stockStatus: "in_stock",
    limit: 8,
    sort: "in_stock_first",
  });

  return <HomeClient inStockSpecies={inStockSpecies} />;
}
