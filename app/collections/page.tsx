import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import {
  Wind,
  ShieldCheck,
  Sprout,
  Sun,
  Droplets,
  Moon,
  Laptop,
  Building2,
  ArrowRight,
  Sparkles,
  ChevronRight,
  MessageCircle,
  CheckCircle2,
} from "lucide-react";
import { COLLECTIONS } from "@/lib/collections";
import { getAllSpecies } from "@/lib/services/speciesService";
import { CollectionsDirectoryClient } from "@/components/collections/CollectionsDirectoryClient";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "คอลเลกชันพันธุ์ไม้คัดสรรตามการใช้ชีวิต | Curated Botanical Collections — TreeForLife",
  description:
    "ค้นหาต้นไม้ที่เหมาะกับไลฟ์สไตล์และพื้นที่ของคุณ ไม่ว่าจะเป็นห้องแอร์ แดดจัด ปลอดภัยกับสัตว์เลี้ยง หรือต้นไม้สำหรับมือใหม่ คัดสรรโดยนักพฤกษศาสตร์",
  alternates: {
    canonical: "https://treeforlife.shop/collections",
  },
  openGraph: {
    title: "คอลเลกชันพันธุ์ไม้คัดสรรตามการใช้ชีวิต — TreeForLife",
    description:
      "ค้นหาต้นไม้ที่เหมาะกับไลฟ์สไตล์และพื้นที่ของคุณ ไม่ว่าจะเป็นห้องแอร์ แดดจัด หรือปลอดภัยกับสัตว์เลี้ยง",
    url: "https://treeforlife.shop/collections",
    siteName: "TreeForLife",
    locale: "th_TH",
    type: "website",
  },
};

export default async function CollectionsDirectoryPage() {
  // Fetch plant counts for each collection
  const collectionsWithStats = await Promise.all(
    COLLECTIONS.map(async (collection) => {
      const plants = await getAllSpecies(collection.filter);
      const inStockCount = plants.filter((p) => p.stockStatus === "in_stock").length;
      const previewThumbnails = plants.slice(0, 3).map((p) => p.primaryImage).filter(Boolean);
      return {
        ...collection,
        totalPlants: plants.length,
        inStockCount,
        previewThumbnails,
      };
    })
  );

  return <CollectionsDirectoryClient initialCollections={collectionsWithStats} />;
}
