import React from "react";
import { getAllSpecies } from "@/lib/services/speciesService";
import { SearchClient, type FilterState } from "@/components/search/SearchClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ค้นหาและเลือกซื้อพันธุ์ไม้ | Catalog & Plant Finder | TreeForLife",
  description:
    "ค้นหาพันธุ์ไม้ตามความต้องการแสง รอบรดน้ำ ความปลอดภัยต่อสัตว์เลี้ยง หรือตำแหน่งที่วางในบ้าน | Boutique plant search with faceted filters.",
};

export const dynamic = "force-dynamic";

interface SearchPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const sp = await searchParams;

  const getString = (val: string | string[] | undefined): string => {
    if (Array.isArray(val)) return val[0] || "";
    return val || "";
  };

  const q = getString(sp.q || sp.search);
  const light = getString(sp.light) || "all";
  const water = getString(sp.water || sp.waterNeed) || "all";
  const placement = getString(sp.placement) || "all";
  const difficulty = getString(sp.difficulty) || "all";
  const pet = getString(sp.pet || sp.petSafe) || "all";
  const size = getString(sp.size || sp.matureSize) || "all";
  const stock = getString(sp.stock || sp.stockStatus) || "all";
  const sort = getString(sp.sort) || "relevance";

  const initialFilters: FilterState = {
    q,
    light,
    water,
    placement,
    difficulty,
    pet,
    size,
    stock,
    sort,
  };

  // Build filter parameters for speciesService
  const serviceParams = {
    search: q.trim() ? q.trim() : undefined,
    light: light !== "all" ? light : undefined,
    waterNeed: water !== "all" ? water : undefined,
    placement: placement !== "all" ? placement : undefined,
    difficulty: difficulty !== "all" ? Number(difficulty) : undefined,
    petSafe: pet !== "all" ? pet : undefined,
    matureSize: size !== "all" ? size : undefined,
    stockStatus: stock !== "all" ? stock : undefined,
    sort: (sort as "relevance" | "in_stock_first" | "easiest_first" | "name") || "relevance",
  };

  const speciesList = await getAllSpecies(serviceParams);

  return (
    <SearchClient
      initialSpecies={speciesList}
      initialFilters={initialFilters}
    />
  );
}
