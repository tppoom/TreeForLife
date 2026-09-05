"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useApp } from "@/lib/context/AppContext";
import {
  ShieldCheck,
  Package,
  MessageSquare,
  TrendingUp,
  Search,
  Check,
  ExternalLink,
  Plus,
  RefreshCw,
  AlertCircle,
  Clock,
  Sparkles,
  Layers,
} from "lucide-react";

interface AdminDashboardClientProps {
  stats: {
    species: {
      total: number;
      inStock: number;
      madeToOrder: number;
      seasonal: number;
    };
    inquiriesCount: number;
    searchMissesCount: number;
    totalUserPlants: number;
  };
  initialSpecies: any[];
  initialInquiries: any[];
  initialMisses: any[];
}

export function AdminDashboardClient({
  stats,
  initialSpecies,
  initialInquiries,
  initialMisses,
}: AdminDashboardClientProps) {
  const { currentUser, loginAsDemoUser, showToast, t, locale } = useApp();
  const [activeTab, setActiveTab] = useState<"species" | "inquiries" | "misses">("species");
  const [speciesList, setSpeciesList] = useState(initialSpecies);
  const [speciesSearch, setSpeciesSearch] = useState("");
  const [stockUpdatingId, setStockUpdatingId] = useState<string | null>(null);

  const filteredSpecies = speciesList.filter(
    (s) =>
      s.nameTh.toLowerCase().includes(speciesSearch.toLowerCase()) ||
      s.nameEn.toLowerCase().includes(speciesSearch.toLowerCase())
  );

  const handleStockToggle = async (speciesId: string, currentStatus: string) => {
    const statuses = ["in_stock", "made_to_order", "seasonal", "hidden"];
    const nextIndex = (statuses.indexOf(currentStatus) + 1) % statuses.length;
    const nextStatus = statuses[nextIndex];

    setStockUpdatingId(speciesId);
    try {
      const res = await fetch("/api/admin/species/stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ speciesId, status: nextStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      setSpeciesList((prev) =>
        prev.map((s) => (s.id === speciesId ? { ...s, stockStatus: nextStatus } : s))
      );
      showToast(locale === "th" ? "อัปเดตสถานะของเรียบร้อย" : "Stock status updated", "success");
    } catch (err: any) {
      showToast(err.message || (locale === "th" ? "เกิดข้อผิดพลาด" : "Error updating status"), "warning");
    } finally {
      setStockUpdatingId(null);
    }
  };

  const getStockBadge = (status: string) => {
    switch (status) {
      case "in_stock":
        return (
          <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs font-semibold">
            {t.plant.inStockReady}
          </span>
        );
      case "made_to_order":
        return (
          <span className="px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-xs font-semibold">
            {t.plant.madeToOrderDays}
          </span>
        );
      case "seasonal":
        return (
          <span className="px-2.5 py-1 rounded-full bg-stone-100 dark:bg-forest-900 text-stone-700 dark:text-sand-300 border border-stone-300 dark:border-forest-800 text-xs font-semibold">
            {t.plant.seasonal}
          </span>
        );
      case "hidden":
        return (
          <span className="px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800 text-xs font-semibold">
            {locale === "th" ? "ซ่อนจากหน้าเว็บ" : "Hidden from site"}
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-20">
      {/* Header & Role Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sand-200 dark:border-forest-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-forest-700 dark:text-gold-400">
            <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>{t.admin.tagline}</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-stone-950 dark:text-sand-50 mt-1">
            {t.admin.title}
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-sand-400">
            {t.admin.desc}
          </p>
        </div>

        {currentUser?.role !== "admin" && (
          <button
            onClick={() => loginAsDemoUser("admin")}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-forest-950 font-semibold rounded-xl text-xs flex items-center gap-2 transition-all shadow-sm cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{t.admin.switchDemoAdmin}</span>
          </button>
        )}
      </div>

      {/* Top 4 Key Metric Cards (SPEC §8.3, §6.9) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-[#0e2117] p-5 rounded-2xl border border-sand-200 dark:border-forest-800 shadow-soft space-y-2">
          <div className="flex items-center justify-between text-stone-400 dark:text-sand-400">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-sand-400">{t.admin.metricAllSpecies}</span>
            <Package className="w-5 h-5 text-forest-800 dark:text-gold-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-stone-900 dark:text-sand-100">{stats.species.total}</span>
            <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
              ({t.admin.inStockCount.replace("{count}", String(stats.species.inStock))})
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0e2117] p-5 rounded-2xl border border-sand-200 dark:border-forest-800 shadow-soft space-y-2">
          <div className="flex items-center justify-between text-stone-400 dark:text-sand-400">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-sand-400">{t.admin.metricInquiries}</span>
            <MessageSquare className="w-5 h-5 text-[#06C755]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-stone-900 dark:text-sand-100">{stats.inquiriesCount}</span>
            <span className="text-xs text-stone-500 dark:text-sand-400 font-medium">{t.admin.inquiriesUnit}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0e2117] p-5 rounded-2xl border border-sand-200 dark:border-forest-800 shadow-soft space-y-2">
          <div className="flex items-center justify-between text-stone-400 dark:text-sand-400">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-sand-400">{t.admin.metricMisses}</span>
            <TrendingUp className="w-5 h-5 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-stone-900 dark:text-sand-100">{stats.searchMissesCount}</span>
            <span className="text-xs text-rose-600 dark:text-rose-400 font-medium">{t.admin.missesUnit}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0e2117] p-5 rounded-2xl border border-sand-200 dark:border-forest-800 shadow-soft space-y-2">
          <div className="flex items-center justify-between text-stone-400 dark:text-sand-400">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-sand-400">{t.admin.metricGardenPlants}</span>
            <Sparkles className="w-5 h-5 text-gold-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-stone-900 dark:text-sand-100">{stats.totalUserPlants}</span>
            <span className="text-xs text-stone-500 dark:text-sand-400 font-medium">{t.admin.plantsUnit}</span>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-sand-200 dark:border-forest-800">
        <button
          onClick={() => setActiveTab("species")}
          className={`py-3 px-5 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === "species"
              ? "border-forest-900 dark:border-gold-400 text-forest-900 dark:text-gold-400"
              : "border-transparent text-stone-500 dark:text-sand-400 hover:text-stone-800 dark:hover:text-sand-200"
          }`}
        >
          {t.admin.tabSpecies} ({speciesList.length})
        </button>

        <button
          onClick={() => setActiveTab("inquiries")}
          className={`py-3 px-5 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === "inquiries"
              ? "border-forest-900 dark:border-gold-400 text-forest-900 dark:text-gold-400"
              : "border-transparent text-stone-500 dark:text-sand-400 hover:text-stone-800 dark:hover:text-sand-200"
          }`}
        >
          {t.admin.tabInquiries}
        </button>

        <button
          onClick={() => setActiveTab("misses")}
          className={`py-3 px-5 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === "misses"
              ? "border-forest-900 dark:border-gold-400 text-forest-900 dark:text-gold-400"
              : "border-transparent text-stone-500 dark:text-sand-400 hover:text-stone-800 dark:hover:text-sand-200"
          }`}
        >
          {t.admin.tabMisses}
        </button>
      </div>

      {/* TAB 1: SPECIES LIST (SPEC §6.9 /admin/species) */}
      {activeTab === "species" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative max-w-sm w-full">
              <input
                type="text"
                value={speciesSearch}
                onChange={(e) => setSpeciesSearch(e.target.value)}
                placeholder={t.admin.searchInAdmin}
                className="w-full text-xs px-3.5 py-2 pl-9 bg-white dark:bg-forest-950 border border-sand-300 dark:border-forest-800 rounded-xl focus:outline-none text-stone-800 dark:text-sand-100 placeholder-stone-400 dark:placeholder-sand-500"
              />
              <Search className="w-4 h-4 text-stone-400 dark:text-sand-500 absolute left-3 top-2.5" />
            </div>

            <span className="text-xs text-stone-500 dark:text-sand-400">
              {t.admin.statusTip}
            </span>
          </div>

          <div className="bg-white dark:bg-[#0e2117] rounded-2xl border border-sand-200 dark:border-forest-800 overflow-hidden shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-sand-100/70 dark:bg-forest-900/60 border-b border-sand-200 dark:border-forest-800 text-stone-600 dark:text-sand-300 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">{t.admin.thPlant}</th>
                    <th className="py-3 px-4">{t.admin.thFamily}</th>
                    <th className="py-3 px-4">{t.admin.thDiff}</th>
                    <th className="py-3 px-4">{t.admin.thStockStatus}</th>
                    <th className="py-3 px-4 text-right">{t.admin.thWebLink}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-100 dark:divide-forest-800">
                  {filteredSpecies.map((plant) => {
                    const plantTitle = locale === "th" ? plant.nameTh : plant.nameEn;
                    const plantSub = locale === "th" ? plant.nameSci : `${plant.nameSci} (${plant.nameTh})`;

                    return (
                      <tr key={plant.id} className="hover:bg-sand-50/60 dark:hover:bg-forest-900/30 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-sand-100 dark:bg-forest-950 border border-sand-200 dark:border-forest-700">
                              <Image src={plant.primaryImage} alt={plantTitle} fill className="object-cover" />
                            </div>
                            <div>
                              <p className="font-semibold text-stone-900 dark:text-sand-100">{plantTitle}</p>
                              <p className="text-[11px] text-stone-500 dark:text-sand-400 italic font-serif">{plantSub}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-stone-600 dark:text-sand-400">{plant.family}</td>
                        <td className="py-3 px-4 text-stone-700 dark:text-sand-300">
                          {locale === "th" ? `ระดับ ${plant.difficulty}/5` : `Level ${plant.difficulty}/5`}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleStockToggle(plant.id, plant.stockStatus)}
                            disabled={stockUpdatingId === plant.id}
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                            title={locale === "th" ? "คลิกเพื่อเปลี่ยนสถานะ" : "Click to change status"}
                          >
                            {getStockBadge(plant.stockStatus)}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link
                            href={`/plants/${plant.slug}`}
                            target="_blank"
                            className="text-forest-800 dark:text-gold-400 hover:text-forest-600 dark:hover:text-gold-300 font-semibold inline-flex items-center gap-1"
                          >
                            <span>{t.admin.openLook}</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INQUIRIES LIST (SPEC §6.9 /admin/inquiries) */}
      {activeTab === "inquiries" && (
        <div className="space-y-4">
          <p className="text-xs text-stone-500 dark:text-sand-400">
            {t.admin.inqNotice}
          </p>

          <div className="bg-white dark:bg-[#0e2117] rounded-2xl border border-sand-200 dark:border-forest-800 overflow-hidden shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-sand-100/70 dark:bg-forest-900/60 border-b border-sand-200 dark:border-forest-800 text-stone-600 dark:text-sand-300 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">{t.admin.thRefCode}</th>
                    <th className="py-3 px-4">{t.admin.thTopic}</th>
                    <th className="py-3 px-4">{t.admin.thInterestedPlant}</th>
                    <th className="py-3 px-4">{t.admin.thSourcePage}</th>
                    <th className="py-3 px-4 text-right">{t.admin.thTimestamp}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-100 dark:divide-forest-800">
                  {initialInquiries.length > 0 ? (
                    initialInquiries.map((inq) => {
                      const topicLabel =
                        inq.intent === "price"
                          ? (locale === "th" ? "สอบถามราคา & ขนาด" : "Price & Size inquiry")
                          : inq.intent === "availability"
                          ? (locale === "th" ? "เช็คของพร้อมส่ง" : "Check availability")
                          : inq.intent === "care_help"
                          ? (locale === "th" ? "ปรึกษาการดูแล" : "Care advice")
                          : inq.intent === "design_quote"
                          ? (locale === "th" ? "จัดมุมสวน" : "Garden design")
                          : inq.intent;

                      return (
                        <tr key={inq.id} className="hover:bg-sand-50/60 dark:hover:bg-forest-900/30 transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-mono font-bold text-xs px-2 py-0.5 rounded-full bg-forest-900 text-gold-300 border border-gold-400/20">
                              {inq.refCode}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-stone-800 dark:text-sand-200 font-medium">
                            {topicLabel}
                          </td>
                          <td className="py-3 px-4 text-stone-900 dark:text-sand-100 font-semibold">
                            {inq.speciesNameTh || (locale === "th" ? "สอบถามทั่วไป" : "General Inquiry")}
                          </td>
                          <td className="py-3 px-4 text-stone-500 dark:text-sand-400 font-mono text-[11px]">
                            {inq.sourcePage}
                          </td>
                          <td className="py-3 px-4 text-right text-stone-500 dark:text-sand-400">
                            {new Date(inq.createdAt).toLocaleString(locale === "th" ? "th-TH" : "en-US")}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-stone-400 dark:text-sand-500">
                        {t.admin.emptyInquiries}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SEARCH MISSES (SPEC §6.9 /admin/misses) */}
      {activeTab === "misses" && (
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
            <span className="font-bold">{t.admin.missesInsight}</span>
          </div>

          <div className="bg-white dark:bg-[#0e2117] rounded-2xl border border-sand-200 dark:border-forest-800 overflow-hidden shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-sand-100/70 dark:bg-forest-900/60 border-b border-sand-200 dark:border-forest-800 text-stone-600 dark:text-sand-300 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">{t.admin.thQuery}</th>
                    <th className="py-3 px-4">{t.admin.thFrequency}</th>
                    <th className="py-3 px-4 text-right">{t.admin.thLastSearch}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-100 dark:divide-forest-800">
                  {initialMisses.length > 0 ? (
                    initialMisses.map((m) => (
                      <tr key={m.id} className="hover:bg-sand-50/60 dark:hover:bg-forest-900/30 transition-colors">
                        <td className="py-3 px-4 font-semibold text-stone-900 dark:text-sand-100">
                          "{m.query}"
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 font-bold border border-rose-300 dark:border-rose-800">
                            {m.count} {locale === "th" ? "ครั้ง" : "times"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-stone-500 dark:text-sand-400">
                          {new Date(m.lastSeenAt).toLocaleString(locale === "th" ? "th-TH" : "en-US")}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-stone-400 dark:text-sand-500">
                        {t.admin.emptyMisses}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
