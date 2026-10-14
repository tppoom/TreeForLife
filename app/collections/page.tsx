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

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Wind,
  ShieldCheck,
  Sprout,
  Sun,
  Droplets,
  Moon,
  Laptop,
  Building2,
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

  return (
    <main className="min-h-screen bg-sand-50 dark:bg-forest-950 text-forest-950 dark:text-sand-50 transition-colors pb-24">
      {/* Top Breadcrumb */}
      <div className="border-b border-sand-200 dark:border-forest-800 bg-sand-100/50 dark:bg-forest-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-xs text-sand-600 dark:text-sand-400" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-forest-700 dark:hover:text-sand-200 transition-colors">
              หน้าแรก
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-forest-900 dark:text-sand-100 font-semibold" aria-current="page">
              คอลเลกชันพันธุ์ไม้
            </span>
          </nav>
        </div>
      </div>

      {/* Hero Header */}
      <section className="relative overflow-hidden pt-10 sm:pt-16 pb-12 sm:pb-16 border-b border-sand-200 dark:border-forest-800 bg-gradient-to-b from-sand-100/60 to-transparent dark:from-forest-900/50 dark:to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-forest-100 dark:bg-forest-900 text-forest-800 dark:text-forest-200 border border-forest-200 dark:border-forest-700 mb-4">
              <Sparkles className="w-3.5 h-3.5 text-forest-600 dark:text-forest-400" />
              <span>CURATED BOTANICAL DIRECTORY</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-forest-950 dark:text-sand-50 mb-4">
              เลือกพันธุ์ไม้ที่ใช่ <br className="hidden sm:inline" />
              ตามพื้นที่และไลฟ์สไตล์ของคุณ
            </h1>
            <p className="text-sm sm:text-base text-forest-800/80 dark:text-sand-300 leading-relaxed max-w-2xl">
              เรารวบรวม 8 คอลเลกชันพิเศษที่คัดสรรโดยนักพฤกษศาสตร์ของ TreeForLife
              เพื่อให้คุณได้ต้นไม้ที่เติบโตได้จริงในสภาพแวดล้อมของคุณ ทั้งในห้องแอร์ ระเบียงแดดจัด
              หรือบ้านที่มีสัตว์เลี้ยง พร้อมคู่มือการดูแลเฉพาะต้น
            </p>
          </div>
        </div>
      </section>

      {/* Directory Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-sand-500 dark:text-sand-400">
              8 คอลเลกชันแนะนำ
            </h2>
            <p className="font-serif text-xl sm:text-2xl font-bold text-forest-950 dark:text-sand-50">
              หมวดหมู่พันธุ์ไม้ยอดนิยม
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {collectionsWithStats.map((item) => {
            const Icon = ICON_MAP[item.icon] || Sparkles;
            return (
              <Link
                key={item.slug}
                href={`/collections/${item.slug}`}
                className="group flex flex-col justify-between rounded-2xl border border-sand-200 dark:border-forest-800 bg-white dark:bg-forest-900/80 p-6 shadow-soft hover:shadow-card hover:-translate-y-1 transition-all"
              >
                <div>
                  {/* Top Bar: Icon + Badge */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-forest-50 dark:bg-forest-800 text-forest-700 dark:text-forest-300 flex items-center justify-center shrink-0 border border-forest-100 dark:border-forest-700 group-hover:bg-forest-700 group-hover:text-sand-50 transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-sand-100 dark:bg-forest-800/80 text-forest-800 dark:text-sand-200 border border-sand-200 dark:border-forest-700">
                      {item.badge}
                    </span>
                  </div>

                  {/* Titles */}
                  <h3 className="font-serif text-lg font-bold text-forest-950 dark:text-sand-50 group-hover:text-forest-600 dark:group-hover:text-forest-400 transition-colors mb-1">
                    {item.titleTh}
                  </h3>
                  <p className="text-xs text-sand-500 dark:text-sand-400 font-sans italic mb-3">
                    {item.titleEn}
                  </p>

                  {/* Intro Preview */}
                  <p className="text-xs text-forest-700/90 dark:text-sand-300 leading-relaxed line-clamp-3 mb-5">
                    {item.introTh}
                  </p>
                </div>

                {/* Footer: Plant Counter & Arrow */}
                <div className="pt-4 border-t border-sand-100 dark:border-forest-800/80 flex items-center justify-between">
                  <span className="text-xs font-semibold text-forest-800 dark:text-sand-300">
                    {item.totalPlants} พันธุ์ไม้
                    {item.inStockCount > 0 && (
                      <span className="text-[11px] font-normal text-emerald-600 dark:text-emerald-400 ml-1">
                        (พร้อมส่ง {item.inStockCount})
                      </span>
                    )}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-forest-600 dark:text-forest-400 group-hover:translate-x-1 transition-transform">
                    <span>เลือกดู</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Shop Assistance Consultation Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="rounded-3xl border border-forest-200 dark:border-forest-800 bg-gradient-to-r from-forest-50 via-sand-50 to-emerald-50/50 dark:from-forest-900/90 dark:via-forest-950 dark:to-forest-900/70 p-8 sm:p-10 shadow-soft">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>BOTANICAL CONCIERGE</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-forest-950 dark:text-sand-50 mb-2">
                ไม่แน่ใจว่าต้นไหนเหมาะกับพื้นที่ของคุณ?
              </h2>
              <p className="text-xs sm:text-sm text-forest-800/80 dark:text-sand-300 leading-relaxed">
                ส่งรูปห้องหรือระเบียงของคุณมาให้เราประเมินทิศทางแสง อุณหภูมิ และความชื้น
                ทีมนักพฤกษศาสตร์ของ TreeForLife ยินดีช่วยแนะนำพันธุ์ไม้ที่เหมาะสมที่สุดโดยไม่มีค่าใช้จ่าย
              </p>
            </div>
            <a
              href="https://line.me/R/ti/p/@treeforlife"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#06C755] hover:bg-[#05b34c] text-white font-semibold text-sm shadow-soft transition shrink-0 min-h-[44px]"
            >
              <MessageCircle className="w-5 h-5" />
              <span>ปรึกษาผ่าน LINE OA</span>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
