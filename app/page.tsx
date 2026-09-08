import React from "react";
import { getAllSpecies } from "@/lib/services/speciesService";
import { HomeClient } from "@/components/home/HomeClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ร้านต้นไม้และระบบดูแลต้นไม้อัจฉริยะ | TreeForLife",
  description:
    "ค้นพบต้นไม้ที่ชอบ พร้อมตารางดูแลที่คำนวณตาม 3 ฤดูกาลไทย ชนิดกระถาง และตำแหน่งที่ตั้ง | Authentic boutique plant shop & smart care schedules.",
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Fetch up to 8 in-stock species for the homepage carousel/grid
  let featuredPlants = await getAllSpecies({
    stockStatus: "in_stock",
    limit: 8,
    sort: "in_stock_first",
  });

  // If fewer than 8 in-stock species exist, fallback to general non-hidden species
  if (featuredPlants.length < 8) {
    featuredPlants = await getAllSpecies({
      limit: 8,
      sort: "in_stock_first",
    });
  }

  return <HomeClient featuredPlants={featuredPlants} />;
}
