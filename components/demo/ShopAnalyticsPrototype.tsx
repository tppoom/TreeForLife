"use client";

import React, { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Search,
  AlertCircle,
  PackagePlus,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  Eye,
  ShoppingBag,
} from "lucide-react";

export interface TrendingPlant {
  id: string;
  nameTh: string;
  nameEn: string;
  viewCount: number;
  conversionRate: number;
  stockStatus: string;
  revenueEst: number;
  trendPct: number;
}

export interface SearchMiss {
  id: string;
  keyword: string;
  searchFrequency: number;
  demandLevel: "ความต้องการสูงมาก" | "ความต้องการสูง" | "ความต้องการปานกลาง";
  recommendation: string;
  status: "รอจัดซื้อ" | "สั่งซื้อแล้ว" | "เปิดพรีออเดอร์";
}

export function ShopAnalyticsPrototype() {
  const [timeframe, setTimeframe] = useState<"30d" | "7d" | "90d">("30d");
  const [addedToPO, setAddedToPO] = useState<Record<string, boolean>>({});

  const trendingPlants: TrendingPlant[] = [
    {
      id: "tp-1",
      nameTh: "มอนสเตอร่าไจแอนท์",
      nameEn: "Monstera Deliciosa",
      viewCount: 1420,
      conversionRate: 8.4,
      stockStatus: "พร้อมส่ง (18 ต้น)",
      revenueEst: 42600,
      trendPct: 24,
    },
    {
      id: "tp-2",
      nameTh: "ยางอินเดียด่าง",
      nameEn: "Ficus Elastica Variegata",
      viewCount: 1180,
      conversionRate: 7.2,
      stockStatus: "เหลือน้อย (4 ต้น)",
      revenueEst: 35400,
      trendPct: 18,
    },
    {
      id: "tp-3",
      nameTh: "ลิ้นมังกรขอบทอง",
      nameEn: "Sansevieria Golden Hahnii",
      viewCount: 960,
      conversionRate: 11.5,
      stockStatus: "พร้อมส่ง (42 ต้น)",
      revenueEst: 28800,
      trendPct: 32,
    },
    {
      id: "tp-4",
      nameTh: "ฟิโลเดนดรอนก้ามกุ้ง",
      nameEn: "Philodendron Florida",
      viewCount: 840,
      conversionRate: 6.8,
      stockStatus: "พร้อมส่ง (12 ต้น)",
      revenueEst: 25200,
      trendPct: 12,
    },
    {
      id: "tp-5",
      nameTh: "กวักมรกตดำด่าง",
      nameEn: "Zamioculcas Raven Variegata",
      viewCount: 720,
      conversionRate: 9.1,
      stockStatus: "เหลือน้อย (2 ต้น)",
      revenueEst: 21600,
      trendPct: 40,
    },
  ];

  const maxViews = Math.max(...trendingPlants.map((p) => p.viewCount));

  const initialSearchMisses: SearchMiss[] = [
    {
      id: "sm-1",
      keyword: "หน้าวัวใบเงิน (Anthurium Clarinervium)",
      searchFrequency: 342,
      demandLevel: "ความต้องการสูงมาก",
      recommendation: "แนะนำจัดซื้อด่วนจากสวนราชบุรี ขนาด 6-8 นิ้ว",
      status: "รอจัดซื้อ",
    },
    {
      id: "sm-2",
      keyword: "มอนสเตอร่าอัลโบด่าง (Monstera Albo)",
      searchFrequency: 289,
      demandLevel: "ความต้องการสูง",
      recommendation: "แนะนำเปิดพรีออเดอร์ตัดข้อรากแน่น",
      status: "รอจัดซื้อ",
    },
    {
      id: "sm-3",
      keyword: "ต้นสนบลูไอซ์ (Cupressus Arizonica)",
      searchFrequency: 215,
      demandLevel: "ความต้องการปานกลาง",
      recommendation: "เหมาะกับช่วงปลายฝนต้นหนาว รอประสานสวนเชียงใหม่",
      status: "รอจัดซื้อ",
    },
    {
      id: "sm-4",
      keyword: "บอนสีราชินีใบไม้ (Caladium Bicolor Rare)",
      searchFrequency: 184,
      demandLevel: "ความต้องการปานกลาง",
      recommendation: "สายสะสมตามหา แนะนำคัดฟอร์มกอดอก 5-10 กระถาง",
      status: "รอจัดซื้อ",
    },
    {
      id: "sm-5",
      keyword: "เฟิร์นข้าหลวงสายพันธุ์ออสเตรเลีย",
      searchFrequency: 126,
      demandLevel: "ความต้องการปานกลาง",
      recommendation: "ลูกค้างานจัดสวนถามหาบ่อย",
      status: "รอจัดซื้อ",
    },
  ];

  const handleTogglePO = (id: string) => {
    setAddedToPO((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="bg-white dark:bg-forest-900 border border-sand-200 dark:border-forest-800 rounded-2xl shadow-card overflow-hidden">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-forest-800 via-forest-900 to-forest-950 p-5 sm:p-6 text-white relative">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Phase 3 Platform Feature</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-white flex items-center gap-2">
              <span>📊 สถิติร้านค้า & สินค้าที่ลูกค้าค้นหา</span>
            </h3>
            <p className="text-xs sm:text-sm text-sand-200 max-w-2xl">
              แดชบอร์ดข้อมูลเชิงลึกสำหรับผู้ดูแลร้านค้า วิเคราะห์สินค้าขายดี อัตราคอนเวอร์ชัน และคำค้นหายอดนิยมที่ยังไม่มีสต็อกเพื่อวางแผนจัดซื้อสินค้าอย่างแม่นยำ
            </p>
          </div>

          <div className="flex items-center gap-2">
            {(["7d", "30d", "90d"] as const).map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                  timeframe === tf
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-forest-800/80 text-sand-300 hover:bg-forest-700 border border-forest-700"
                }`}
              >
                {tf === "7d" ? "7 วัน" : tf === "30d" ? "30 วันล่าสุด" : "ไตรมาสนี้"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-8">
        {/* Section 1: Top 5 Trending Plants Visual CSS Bar Chart */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h4 className="text-base sm:text-lg font-serif font-bold text-forest-900 dark:text-sand-100 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Top 5 พันธุ์ไม้ยอดนิยมประจำเดือน (Trending Species)</span>
              </h4>
              <p className="text-xs text-sand-600 dark:text-sand-400">
                สถิติจำนวนครั้งที่เปิดดู (Page Views) เทียบกับอัตราการกดสั่งซื้อสำเร็จ (Conversion Rate)
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-sand-600 dark:text-sand-400">
                <span className="w-3 h-3 rounded-sm bg-forest-700 dark:bg-emerald-500 inline-block" />
                <span>ยอดเข้าชม (Views)</span>
              </span>
              <span className="flex items-center gap-1.5 text-sand-600 dark:text-sand-400">
                <span className="w-3 h-3 rounded-sm bg-gold-400 inline-block" />
                <span>Conversion Rate (%)</span>
              </span>
            </div>
          </div>

          <div className="p-5 bg-sand-50/50 dark:bg-forest-950/40 rounded-2xl border border-sand-200 dark:border-forest-800 space-y-4">
            {trendingPlants.map((plant, index) => {
              const viewPercentage = Math.round((plant.viewCount / maxViews) * 100);
              return (
                <div key={plant.id} className="space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between text-xs gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-forest-800 text-white dark:bg-forest-700 text-[11px] font-bold flex items-center justify-center">
                        {index + 1}
                      </span>
                      <strong className="text-forest-900 dark:text-sand-100 text-sm">
                        {plant.nameTh}
                      </strong>
                      <span className="text-[11px] text-sand-500 dark:text-sand-400 hidden sm:inline">
                        ({plant.nameEn})
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono">
                      <span className="text-forest-800 dark:text-sand-200 flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-forest-600 dark:text-emerald-400" />
                        <strong>{plant.viewCount.toLocaleString()}</strong> วิว
                      </span>
                      <span className="px-2 py-0.5 rounded bg-gold-100 dark:bg-gold-950/80 text-gold-900 dark:text-gold-300 font-bold border border-gold-300/40">
                        {plant.conversionRate}% CVR
                      </span>
                      <span className="text-emerald-600 dark:text-emerald-400 hidden md:inline">
                        +{plant.trendPct}%
                      </span>
                    </div>
                  </div>

                  {/* Visual CSS Bar */}
                  <div className="relative w-full h-4 bg-sand-200/80 dark:bg-forest-800/80 rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-gradient-to-r from-forest-700 to-emerald-600 rounded-full transition-all duration-500"
                      style={{ width: `${viewPercentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Search Misses Table */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h4 className="text-base sm:text-lg font-serif font-bold text-forest-900 dark:text-sand-100 flex items-center gap-2">
                <Search className="w-4 h-4 text-forest-700 dark:text-emerald-400" />
                <span>คำค้นหายอดนิยมที่ยังไม่มีในสต็อก (Search Misses & Demand)</span>
              </h4>
              <p className="text-xs text-sand-600 dark:text-sand-400">
                ข้อมูลคำค้นที่ลูกค้าค้นหาในระบบแต่ยังไม่พบสินค้า เพื่อเป็นแนวทางเติมสต็อกและจัดซื้อต้นไม้ใหม่
              </p>
            </div>
            <div className="text-xs text-amber-700 dark:text-amber-400 flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 px-3 py-1 rounded-lg border border-amber-200 dark:border-amber-800">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>โอกาสสูญเสียรายได้โดยประมาณ: ฿85,000 / เดือน</span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-sand-200 dark:border-forest-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-sand-100/80 dark:bg-forest-800/70 text-forest-900 dark:text-sand-200 border-b border-sand-200 dark:border-forest-700 font-semibold">
                  <th className="p-3 sm:p-4">คำค้นหา / สายพันธุ์</th>
                  <th className="p-3 sm:p-4">ความถี่การค้นหา</th>
                  <th className="p-3 sm:p-4">ระดับความต้องการ</th>
                  <th className="p-3 sm:p-4 hidden md:table-cell">ข้อเสนอแนะจัดซื้อ</th>
                  <th className="p-3 sm:p-4 text-center">การดำเนินการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-200 dark:divide-forest-800 bg-white dark:bg-forest-900">
                {initialSearchMisses.map((miss) => {
                  const isAdded = !!addedToPO[miss.id];
                  return (
                    <tr
                      key={miss.id}
                      className="hover:bg-sand-50/70 dark:hover:bg-forest-800/40 transition"
                    >
                      <td className="p-3 sm:p-4 font-semibold text-forest-900 dark:text-sand-100">
                        {miss.keyword}
                      </td>
                      <td className="p-3 sm:p-4 font-mono">
                        <span className="font-bold text-forest-800 dark:text-emerald-400">
                          {miss.searchFrequency}
                        </span>{" "}
                        <span className="text-sand-500 text-[11px]">ครั้ง/เดือน</span>
                      </td>
                      <td className="p-3 sm:p-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                            miss.demandLevel === "ความต้องการสูงมาก"
                              ? "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800"
                              : miss.demandLevel === "ความต้องการสูง"
                              ? "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800"
                              : "bg-sand-100 text-sand-800 border-sand-300 dark:bg-forest-800 dark:text-sand-300 dark:border-forest-700"
                          }`}
                        >
                          {miss.demandLevel}
                        </span>
                      </td>
                      <td className="p-3 sm:p-4 text-sand-600 dark:text-sand-400 hidden md:table-cell">
                        {miss.recommendation}
                      </td>
                      <td className="p-3 sm:p-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleTogglePO(miss.id)}
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition flex items-center justify-center gap-1 mx-auto ${
                            isAdded
                              ? "bg-emerald-600 text-white"
                              : "bg-forest-800 hover:bg-forest-900 text-white dark:bg-forest-700 dark:hover:bg-forest-600"
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              <span>เพิ่มใน PO แล้ว</span>
                            </>
                          ) : (
                            <>
                              <PackagePlus className="w-3 h-3" />
                              <span>เพิ่มในรายการจัดซื้อ</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
