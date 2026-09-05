import React, { Suspense } from "react";
import { Metadata } from "next";
import { getSpeciesList } from "@/lib/services/speciesService";
import { SearchClient } from "@/components/search/SearchClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ค้นหาและคัดเลือกพันธุ์ไม้ | TreeForLife",
  description: "กรองต้นไม้ตามสภาพแสง ความถี่การรดน้ำ ความปลอดภัยกับสัตว์เลี้ยง และสถานะพร้อมส่งจากเรือนเพาะชำ",
};

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    light?: string;
    water?: string;
    placement?: string;
    diff?: string;
    pet?: string;
    size?: string;
    stock?: string;
    sort?: "relevance" | "in_stock_first" | "easiest_first" | "name";
    fav?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedParams = await searchParams;

  const species = await getSpeciesList({
    search: resolvedParams.q,
    light: resolvedParams.light,
    waterNeed: resolvedParams.water,
    placement: resolvedParams.placement,
    difficulty: resolvedParams.diff ? Number(resolvedParams.diff) : undefined,
    petSafe: resolvedParams.pet,
    matureSize: resolvedParams.size,
    stockStatus: resolvedParams.stock,
    sort: resolvedParams.sort,
  });

  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-stone-500">กำลังโหลด...</div>}>
      <SearchClient
        initialSpecies={species}
        searchParams={resolvedParams}
      />
    </Suspense>
  );
}

