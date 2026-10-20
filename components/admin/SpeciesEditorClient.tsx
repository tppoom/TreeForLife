"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Loader2,
  ExternalLink,
  Save,
  Globe,
  FileText,
  Image as ImageIcon,
  Droplets,
  AlertTriangle,
  Plus,
  Trash2,
  X,
  Sparkles,
} from "lucide-react";
import { SpeciesCareEditor, type CareTemplateData } from "./SpeciesCareEditor";
import { SpeciesMediaManager, type SpeciesMediaItem } from "./SpeciesMediaManager";

export interface SpeciesProblemItem {
  id?: string;
  symptomTh: string;
  causeTh: string;
  fixTh: string;
  severity: "low" | "medium" | "high";
  sortOrder?: number;
}

export interface FullSpeciesData {
  id: string;
  slug: string;
  nameTh: string;
  nameEn: string;
  nameSci?: string;
  family?: string;
  aliases?: string[];
  summary?: string;
  light?: string;
  waterNeed?: string;
  placement?: string[];
  difficulty?: number;
  petSafe?: string;
  matureSize?: string;
  matureHeightCm?: number | null;
  growthRate?: string;
  soilMix?: string;
  fertilizerNote?: string | null;
  propagation?: string | null;
  shopNote?: string;
  stockStatus?: string;
  priceRangeInternal?: string | null;
  publishedAt?: Date | string | null;
  media?: SpeciesMediaItem[];
  careTemplate?: CareTemplateData | null;
  problems?: SpeciesProblemItem[];
}

interface SpeciesEditorClientProps {
  initialSpecies: FullSpeciesData;
}

type TabType = "info" | "photos" | "care" | "problems";

export function SpeciesEditorClient({ initialSpecies }: SpeciesEditorClientProps) {
  const router = useRouter();

  // Active Tab
  const [activeTab, setActiveTab] = useState<TabType>("info");

  // Save status: "saved" | "saving" | "unsaved" | "error"
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved" | "error">("saved");
  const [saveError, setSaveError] = useState<string | null>(null);

  // Publish Status
  const [publishedAt, setPublishedAt] = useState<Date | string | null>(initialSpecies.publishedAt ?? null);
  const [togglingPublish, setTogglingPublish] = useState(false);

  // Form State
  const [nameTh, setNameTh] = useState(initialSpecies.nameTh || "");
  const [nameEn, setNameEn] = useState(initialSpecies.nameEn || "");
  const [nameSci, setNameSci] = useState(initialSpecies.nameSci || "");
  const [family, setFamily] = useState(initialSpecies.family || "");
  const [slug, setSlug] = useState(initialSpecies.slug || "");
  const [difficulty, setDifficulty] = useState<number>(initialSpecies.difficulty || 1);
  const [light, setLight] = useState<string>(initialSpecies.light || "indoor_bright");
  const [waterNeed, setWaterNeed] = useState<string>(initialSpecies.waterNeed || "medium");
  const [placement, setPlacement] = useState<string[]>(initialSpecies.placement || ["indoor"]);
  const [matureSize, setMatureSize] = useState<string>(initialSpecies.matureSize || "md");
  const [matureHeightCm, setMatureHeightCm] = useState<number | string>(initialSpecies.matureHeightCm ?? "");
  const [petSafe, setPetSafe] = useState<string>(initialSpecies.petSafe || "unknown");
  const [growthRate, setGrowthRate] = useState<string>(initialSpecies.growthRate || "medium");
  const [stockStatus, setStockStatus] = useState<string>(initialSpecies.stockStatus || "in_stock");
  const [priceRangeInternal, setPriceRangeInternal] = useState<string>(initialSpecies.priceRangeInternal || "");
  const [soilMix, setSoilMix] = useState<string>(initialSpecies.soilMix || "");
  const [fertilizerNote, setFertilizerNote] = useState<string>(initialSpecies.fertilizerNote || "");
  const [propagation, setPropagation] = useState<string>(initialSpecies.propagation || "");
  const [summary, setSummary] = useState<string>(initialSpecies.summary || "");
  const [shopNote, setShopNote] = useState<string>(initialSpecies.shopNote || "");

  // Aliases tag input
  const [aliases, setAliases] = useState<string[]>(initialSpecies.aliases || []);
  const [aliasInput, setAliasInput] = useState("");

  // Media
  const [media, setMedia] = useState<SpeciesMediaItem[]>(initialSpecies.media || []);

  // Care Template
  const [careTemplate, setCareTemplate] = useState<CareTemplateData>(
    initialSpecies.careTemplate || {
      waterDaysHot: 3,
      waterDaysRainy: 5,
      waterDaysCool: 4,
      fertilizeDays: 14,
      fertilizePauseMonths: [],
      repotMonths: 12,
      pruneDays: null,
      pestCheckDays: 14,
      notesTh: "",
    }
  );

  // Troubleshooting Problems
  const [problems, setProblems] = useState<SpeciesProblemItem[]>(initialSpecies.problems || []);

  // Mark unsaved changes
  const markUnsaved = () => {
    if (saveStatus === "saved") {
      setSaveStatus("unsaved");
    }
  };

  // Toggle placement item
  const togglePlacement = (item: string) => {
    markUnsaved();
    setPlacement((prev) =>
      prev.includes(item) ? prev.filter((p) => p !== item) : [...prev, item]
    );
  };

  // Add alias tag
  const handleAddAlias = () => {
    const trimmed = aliasInput.trim();
    if (trimmed && !aliases.includes(trimmed)) {
      markUnsaved();
      setAliases([...aliases, trimmed]);
      setAliasInput("");
    }
  };

  // Remove alias tag
  const handleRemoveAlias = (tagToRemove: string) => {
    markUnsaved();
    setAliases(aliases.filter((a) => a !== tagToRemove));
  };

  // Save all changes
  const handleSave = async () => {
    setSaveStatus("saving");
    setSaveError(null);

    try {
      const payload = {
        nameTh,
        nameEn,
        nameSci,
        family,
        slug,
        difficulty,
        light,
        waterNeed,
        placement,
        matureSize,
        matureHeightCm: matureHeightCm ? Number(matureHeightCm) : null,
        petSafe,
        growthRate,
        stockStatus,
        priceRangeInternal: priceRangeInternal || null,
        soilMix,
        fertilizerNote: fertilizerNote || null,
        propagation: propagation || null,
        summary,
        shopNote,
        aliases,
        careTemplate,
        problems,
      };

      const res = await fetch(`/api/admin/species/${initialSpecies.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error?.message || "บันทึกข้อมูลไม่สำเร็จ");
      }

      setSaveStatus("saved");
    } catch (err: any) {
      console.error("Save species error:", err);
      setSaveStatus("error");
      setSaveError(err.message || "เกิดข้อผิดพลาดในการบันทึก");
    }
  };

  // Toggle Publish / Draft
  const handleTogglePublish = async () => {
    setTogglingPublish(true);
    try {
      const res = await fetch(`/api/admin/species/${initialSpecies.id}/publish`, {
        method: "POST",
      });
      if (res.ok) {
        const json = await res.json();
        setPublishedAt(json.data.publishedAt);
        router.refresh();
      }
    } catch (err) {
      console.error("Toggle publish error:", err);
    } finally {
      setTogglingPublish(false);
    }
  };

  // Problem management helpers
  const handleAddProblem = () => {
    markUnsaved();
    setProblems([
      ...problems,
      {
        symptomTh: "",
        causeTh: "",
        fixTh: "",
        severity: "medium",
        sortOrder: problems.length,
      },
    ]);
  };

  const handleUpdateProblem = (index: number, field: keyof SpeciesProblemItem, val: any) => {
    markUnsaved();
    const updated = [...problems];
    updated[index] = { ...updated[index], [field]: val };
    setProblems(updated);
  };

  const handleRemoveProblem = (index: number) => {
    markUnsaved();
    setProblems(problems.filter((_, idx) => idx !== index));
  };

  return (
    <div className="min-h-screen bg-sand-50/50 dark:bg-zinc-950 pb-24">
      {/* 1. Sticky Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* Back & Plant Name */}
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/admin/species"
              className="p-2 -ml-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="กลับหน้ารายการพันธุ์ไม้"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 truncate flex items-center gap-2">
                <span>{nameTh || "พันธุ์ไม้ใหม่"}</span>
                {nameEn && (
                  <span className="text-xs font-normal text-zinc-400 hidden md:inline truncate">
                    ({nameEn})
                  </span>
                )}
              </h1>
              <div className="text-xs text-zinc-400 font-mono truncate">/{slug}</div>
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Save Status Indicator */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs">
              {saveStatus === "saving" && (
                <span className="inline-flex items-center gap-1.5 text-zinc-500 font-medium">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                  กำลังบันทึก...
                </span>
              )}
              {saveStatus === "saved" && (
                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                  <Check className="w-3.5 h-3.5" />
                  บันทึกแล้ว
                </span>
              )}
              {saveStatus === "unsaved" && (
                <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                  ● มีการแก้ไข
                </span>
              )}
              {saveStatus === "error" && (
                <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-medium">
                  ✕ ผิดพลาด
                </span>
              )}
            </div>

            {/* Live Storefront Link */}
            {slug && (
              <a
                href={`/plants/${slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-emerald-600 font-medium text-xs transition min-h-[44px]"
              >
                <span>ดูหน้าร้าน</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            {/* Publish Toggle Button */}
            <button
              type="button"
              disabled={togglingPublish}
              onClick={handleTogglePublish}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition min-h-[44px] cursor-pointer ${
                publishedAt
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100"
                  : "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800 hover:bg-amber-100"
              }`}
            >
              {togglingPublish ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Globe className="w-3.5 h-3.5" />
              )}
              <span>{publishedAt ? "เผยแพร่แล้ว" : "ฉบับร่าง (Draft)"}</span>
            </button>

            {/* Save Button */}
            <button
              type="button"
              disabled={saveStatus === "saving"}
              onClick={handleSave}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs sm:text-sm transition shadow-sm active:scale-95 min-h-[44px] cursor-pointer"
            >
              {saveStatus === "saving" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">บันทึกข้อมูล</span>
              <span className="sm:hidden">บันทึก</span>
            </button>
          </div>
        </div>

        {/* 2. Mobile-First Tab Bar */}
        <div className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-2 sm:space-x-4 overflow-x-auto py-1.5 no-scrollbar" role="tablist">
              {[
                { id: "info", label: "ข้อมูลทั่วไป", icon: FileText },
                { id: "photos", label: `รูปภาพ (${media.length})`, icon: ImageIcon },
                { id: "care", label: "สูตรดูแล 3 ฤดู", icon: Droplets },
                { id: "problems", label: `ปัญหาพบบ่อย (${problems.length})`, icon: AlertTriangle },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition whitespace-nowrap min-h-[44px] cursor-pointer ${
                      isActive
                        ? "bg-white dark:bg-zinc-800 text-emerald-700 dark:text-emerald-400 shadow-sm border border-zinc-200 dark:border-zinc-700 font-bold"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/40"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Error alert banner */}
      {saveError && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-sm text-rose-700 dark:text-rose-300">
            {saveError}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* TAB 1: ข้อมูลทั่วไป (General Info) */}
        {activeTab === "info" && (
          <div className="space-y-6">
            {/* Primary Details Card */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-sm space-y-6">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                ข้อมูลหลักของพันธุ์ไม้
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Name TH */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    ชื่อภาษาไทย <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={nameTh}
                    onChange={(e) => {
                      markUnsaved();
                      setNameTh(e.target.value);
                    }}
                    placeholder="เช่น มอนสเตอร่า ด่างขาว"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
                  />
                </div>

                {/* Name EN */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    ชื่อภาษาอังกฤษ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={nameEn}
                    onChange={(e) => {
                      markUnsaved();
                      setNameEn(e.target.value);
                    }}
                    placeholder="เช่น Monstera Deliciosa Variegata"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
                  />
                </div>

                {/* Slug */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    URL Slug <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => {
                      markUnsaved();
                      setSlug(e.target.value);
                    }}
                    placeholder="monstera-deliciosa-albo"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
                  />
                </div>

                {/* Scientific Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    ชื่อวิทยาศาสตร์
                  </label>
                  <input
                    type="text"
                    value={nameSci}
                    onChange={(e) => {
                      markUnsaved();
                      setNameSci(e.target.value);
                    }}
                    placeholder="Monstera deliciosa Liebm."
                    className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 italic focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
                  />
                </div>

                {/* Family */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    วงศ์ (Family)
                  </label>
                  <input
                    type="text"
                    value={family}
                    onChange={(e) => {
                      markUnsaved();
                      setFamily(e.target.value);
                    }}
                    placeholder="เช่น Araceae (วงศ์บอน)"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
                  />
                </div>

                {/* Internal Price Range */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    ช่วงราคาประเมินหน้าร้าน
                  </label>
                  <input
                    type="text"
                    value={priceRangeInternal}
                    onChange={(e) => {
                      markUnsaved();
                      setPriceRangeInternal(e.target.value);
                    }}
                    placeholder="เช่น 250 - 450 บาท"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
                  />
                </div>
              </div>

              {/* Aliases Tag Input */}
              <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
                  ชื่อเรียกอื่นๆ / คำค้นหาพ้อง (Aliases เพื่อการค้นหา)
                </label>
                <div className="flex flex-wrap gap-2 items-center">
                  {aliases.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-medium border border-zinc-200 dark:border-zinc-700"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAlias(tag)}
                        className="text-zinc-400 hover:text-rose-500 transition"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}

                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={aliasInput}
                      onChange={(e) => setAliasInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddAlias();
                        }
                      }}
                      placeholder="+ เพิ่มชื่อเรียก..."
                      className="px-3 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 min-h-[36px] w-36"
                    />
                    <button
                      type="button"
                      onClick={handleAddAlias}
                      className="px-3 py-1.5 rounded-xl bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-medium hover:bg-zinc-300 min-h-[36px]"
                    >
                      เพิ่ม
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Traits and Characteristics Card */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-sm space-y-6">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                คุณลักษณะและการดูแล (Traits & Difficulty)
              </h2>

              {/* Difficulty 1-5 Buttons */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
                  ระดับความยากในการเลี้ยง (1-5)
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { val: 1, label: "1: ง่ายมาก (มือใหม่)" },
                    { val: 2, label: "2: ง่าย" },
                    { val: 3, label: "3: ปานกลาง" },
                    { val: 4, label: "4: ท้าทาย" },
                    { val: 5, label: "5: ผู้เชี่ยวชาญ" },
                  ].map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => {
                        markUnsaved();
                        setDifficulty(item.val);
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-medium transition min-h-[44px] cursor-pointer ${
                        difficulty === item.val
                          ? "bg-emerald-600 text-white shadow-sm font-semibold"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Light Requirements Chips */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
                  ความต้องการแสง
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "full_sun", label: "☀️ แดดเต็มวัน (Outdoor Full Sun)" },
                    { id: "partial", label: "🌤️ แดดรำไร/ครึ่งวัน (Partial)" },
                    { id: "indoor_bright", label: "💡 ในบ้านแสงสว่างทางอ้อม (Indoor Bright)" },
                    { id: "shade", label: "🌿 ร่มเงา (Shade)" },
                    { id: "low_light", label: "🌑 แสงน้อย ทนร่ม (Low Light)" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        markUnsaved();
                        setLight(item.id);
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-medium transition min-h-[44px] cursor-pointer ${
                        light === item.id
                          ? "bg-amber-600 text-white shadow-sm font-semibold"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Water Need Chips */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
                  ความต้องการน้ำ
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "low", label: "💧 รดน้ำน้อย ดินแห้งค่อยรด" },
                    { id: "medium", label: "💧💧 รดน้ำปานกลาง ดินชื้นพอเหมาะ" },
                    { id: "high", label: "💧💧💧 ชอบความชื้นสูง รดบ่อย" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        markUnsaved();
                        setWaterNeed(item.id);
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-medium transition min-h-[44px] cursor-pointer ${
                        waterNeed === item.id
                          ? "bg-sky-600 text-white shadow-sm font-semibold"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Placements Multi-Select Chips */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
                  ตำแหน่งวางที่เหมาะสม (เลือกได้หลายจุด)
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "indoor", label: "🏠 ในบ้าน/ห้องนั่งเล่น" },
                    { id: "outdoor", label: "🌳 กลางแจ้ง/สวน" },
                    { id: "balcony", label: "🏢 ระเบียงคอนโด" },
                    { id: "bathroom", label: "🚿 ห้องน้ำ (ชื้นสูง)" },
                  ].map((item) => {
                    const isSelected = placement.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => togglePlacement(item.id)}
                        className={`px-3 py-2 rounded-xl text-xs font-medium transition min-h-[44px] cursor-pointer ${
                          isSelected
                            ? "bg-emerald-600 text-white shadow-sm font-semibold"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200"
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mature Size & Height, Pet Safe, Stock Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                {/* Mature Size */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    ขนาดเมื่อโตเต็มที่
                  </label>
                  <select
                    value={matureSize}
                    onChange={(e) => {
                      markUnsaved();
                      setMatureSize(e.target.value);
                    }}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 min-h-[44px]"
                  >
                    <option value="xs">XS (จิ๋ว &lt; 15 cm)</option>
                    <option value="sm">SM (เล็ก 15 - 30 cm)</option>
                    <option value="md">MD (กลาง 30 - 80 cm)</option>
                    <option value="lg">LG (ใหญ่ 80 - 150 cm)</option>
                    <option value="xl">XL (ต้นใหญ่ &gt; 150 cm)</option>
                  </select>
                </div>

                {/* Mature Height Cm */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    ความสูงเมื่อโต (ซม.)
                  </label>
                  <input
                    type="number"
                    value={matureHeightCm}
                    onChange={(e) => {
                      markUnsaved();
                      setMatureHeightCm(e.target.value);
                    }}
                    placeholder="เช่น 120"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 min-h-[44px]"
                  />
                </div>

                {/* Pet Safe */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    ความปลอดภัยต่อสัตว์เลี้ยง
                  </label>
                  <select
                    value={petSafe}
                    onChange={(e) => {
                      markUnsaved();
                      setPetSafe(e.target.value);
                    }}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 min-h-[44px]"
                  >
                    <option value="safe">🐾 ปลอดภัย (Pet-Friendly)</option>
                    <option value="toxic">⚠️ มีพิษ ระวังหมา/แมวกัดแทะ</option>
                    <option value="unknown">ไม่ระบุข้อมูล</option>
                  </select>
                </div>

                {/* Stock Status */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    สถานะสต็อกสินค้า
                  </label>
                  <select
                    value={stockStatus}
                    onChange={(e) => {
                      markUnsaved();
                      setStockStatus(e.target.value);
                    }}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 min-h-[44px]"
                  >
                    <option value="in_stock">พร้อมส่งที่ร้าน (In Stock)</option>
                    <option value="made_to_order">สั่งล่วงหน้า (Made to Order)</option>
                    <option value="seasonal">ตามฤดูกาล (Seasonal)</option>
                    <option value="hidden">ซ่อนจากหน้าร้าน (Hidden)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Descriptions & Nursery Experience Card */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-sm space-y-6">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                บทความและประสบการณ์จริงจากหน้าร้าน
              </h2>

              {/* Summary */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  คำอธิบายสรุปสั้น (SEO & Card Summary)
                </label>
                <textarea
                  rows={2}
                  value={summary}
                  onChange={(e) => {
                    markUnsaved();
                    setSummary(e.target.value);
                  }}
                  placeholder="คำบรรยายสั้นๆ แนะนำจุดเด่นของต้นไม้..."
                  className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Authentic Nursery Shop Note */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                  <span>ประสบการณ์ตรงจากเจ้าของร้าน (Authentic Shop Note)</span>
                  <span className="text-[11px] font-normal text-zinc-500">
                    - คำแนะนำจริงจากการเพาะเลี้ยงที่สวน
                  </span>
                </label>
                <textarea
                  rows={4}
                  value={shopNote}
                  onChange={(e) => {
                    markUnsaved();
                    setShopNote(e.target.value);
                  }}
                  placeholder="เขียนแชร์เทคนิคจากประสบการณ์เลี้ยงจริง เช่น นิสัยต้นไม้ วัสดุปลูกที่ร้านใช้แล้วได้ผลดีที่สุด อาการที่ต้องระวัง..."
                  className="w-full px-3 py-2 text-sm rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/20 dark:bg-emerald-950/20 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
                />
              </div>

              {/* Soil Mix & Propagation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    สูตรดินปลูก (Soil Mix)
                  </label>
                  <input
                    type="text"
                    value={soilMix}
                    onChange={(e) => {
                      markUnsaved();
                      setSoilMix(e.target.value);
                    }}
                    placeholder="เช่น กาบมะพร้าวสับ 50% ดินใบก้ามปู 30% เพอร์ไลต์ 20%"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 min-h-[44px]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    การขยายพันธุ์ (Propagation)
                  </label>
                  <input
                    type="text"
                    value={propagation}
                    onChange={(e) => {
                      markUnsaved();
                      setPropagation(e.target.value);
                    }}
                    placeholder="เช่น ตัดชำข้อ, ปักชำน้ำ, ยกยอด"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 min-h-[44px]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: รูปภาพ (Photos) */}
        {activeTab === "photos" && (
          <SpeciesMediaManager
            speciesId={initialSpecies.id}
            media={media}
            onMediaChange={(updated) => {
              setMedia(updated);
              markUnsaved();
            }}
          />
        )}

        {/* TAB 3: สูตรดูแล 3 ฤดู (Care) */}
        {activeTab === "care" && (
          <SpeciesCareEditor
            careTemplate={careTemplate}
            onChange={(updated) => {
              setCareTemplate(updated);
              markUnsaved();
            }}
          />
        )}

        {/* TAB 4: ปัญหาพบบ่อย (Troubleshooting Problems) */}
        {activeTab === "problems" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    คู่มือแก้ไขปัญหาและโรคพบบ่อย ({problems.length} อาการ)
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                    ข้อมูลอาการ สาเหตุ และวิธีแก้ เพื่อแสดงเป็น Accordion ในหน้าเว็บ และระบบวินิจฉัยต้นไม้
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddProblem}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs sm:text-sm transition shadow-sm active:scale-95 min-h-[44px] cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>เพิ่มปัญหาพบบ่อย</span>
                </button>
              </div>
            </div>

            {/* Problem Cards List */}
            {problems.length === 0 ? (
              <div className="p-12 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/30 text-zinc-500 space-y-3">
                <AlertTriangle className="w-10 h-10 mx-auto text-zinc-400" />
                <p className="text-sm font-medium">ยังไม่มีข้อมูลปัญหาสำหรับพันธุ์ไม้นี้</p>
                <p className="text-xs text-zinc-400">
                  คลิก "+ เพิ่มปัญหาพบบ่อย" เพื่อเพิ่มอาการ เช่น ใบเหลือง, ปลายใบไหม้, ยอดเน่า
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {problems.map((problem, idx) => (
                  <div
                    key={idx}
                    className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4"
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                        ปัญหาข้อที่ #{idx + 1}
                      </span>
                      <div className="flex items-center gap-2">
                        {/* Severity Selector */}
                        <div className="flex items-center gap-1">
                          {[
                            { id: "low", label: "ต่ำ (Low)", color: "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40" },
                            { id: "medium", label: "ปานกลาง", color: "text-amber-700 bg-amber-50 dark:bg-amber-950/40" },
                            { id: "high", label: "รุนแรง (High)", color: "text-rose-700 bg-rose-50 dark:bg-rose-950/40" },
                          ].map((sev) => (
                            <button
                              key={sev.id}
                              type="button"
                              onClick={() => handleUpdateProblem(idx, "severity", sev.id)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition min-h-[36px] ${
                                problem.severity === sev.id
                                  ? `${sev.color} ring-1 ring-inset ring-current font-bold`
                                  : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                              }`}
                            >
                              {sev.label}
                            </button>
                          ))}
                        </div>

                        {/* Remove Problem */}
                        <button
                          type="button"
                          onClick={() => handleRemoveProblem(idx)}
                          className="p-2 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition min-h-[36px] min-w-[36px] flex items-center justify-center"
                          title="ลบปัญหานี้"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Symptom */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                          อาการที่พบ (Symptom)
                        </label>
                        <input
                          type="text"
                          value={problem.symptomTh}
                          onChange={(e) => handleUpdateProblem(idx, "symptomTh", e.target.value)}
                          placeholder="เช่น ใบเหลืองโคนต้น ใบร่วง"
                          className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 min-h-[44px]"
                        />
                      </div>

                      {/* Cause */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                          สาเหตุ (Cause)
                        </label>
                        <input
                          type="text"
                          value={problem.causeTh}
                          onChange={(e) => handleUpdateProblem(idx, "causeTh", e.target.value)}
                          placeholder="เช่น รดน้ำมากเกินไป หรือดินแน่นไม่ระบาย"
                          className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 min-h-[44px]"
                        />
                      </div>

                      {/* Fix */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                          วิธีแก้ไข (Solution)
                        </label>
                        <input
                          type="text"
                          value={problem.fixTh}
                          onChange={(e) => handleUpdateProblem(idx, "fixTh", e.target.value)}
                          placeholder="เช่น เว้นรอบรดน้ำให้ผิวดินแห้งก่อนรดรอบถัดไป"
                          className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 min-h-[44px]"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
