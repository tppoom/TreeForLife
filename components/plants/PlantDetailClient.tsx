"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Camera,
  Sun,
  Droplets,
  Home,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  Sprout,
  Maximize2,
  Calendar,
  Layers,
  Sparkles,
  MessageCircle,
  Plus,
  ChevronDown,
  ChevronUp,
  Award,
  BookOpen,
  ArrowRight,
  Quote,
  Clock,
  ExternalLink,
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";
import { InquiryModal } from "@/components/ui/InquiryModal";
import type { getSpeciesBySlug, getSimilarSpecies } from "@/lib/services/speciesService";
import { getLocalizedSpeciesData } from "@/lib/i18n/species-en";

type PlantData = NonNullable<Awaited<ReturnType<typeof getSpeciesBySlug>>>;
type SimilarPlant = Awaited<ReturnType<typeof getSimilarSpecies>>[number];

interface PlantDetailClientProps {
  plant: PlantData;
  similarSpecies: SimilarPlant[];
}

export function PlantDetailClient({ plant, similarSpecies }: PlantDetailClientProps) {
  const { t, locale } = useApp();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [expandedProblems, setExpandedProblems] = useState<Record<string, boolean>>({});

  const localized = getLocalizedSpeciesData(plant.slug, locale, {
    summary: plant.summary,
    shopNote: plant.shopNote,
    soilMix: plant.soilMix,
    fertilizerNote: plant.fertilizerNote,
    propagation: plant.propagation,
    notes: plant.careTemplate?.notesTh,
    problems: plant.problems,
  });

  const toggleProblem = (id: string) => {
    setExpandedProblems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const images =
    plant.media && plant.media.length > 0
      ? plant.media
      : [
          {
            id: "default",
            blobUrl:
              "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=1200&q=80",
            altTh: plant.nameTh,
            isPrimary: true,
            sortOrder: 0,
            credit: "ถ่ายที่ร้าน",
          },
        ];

  const currentImage = images[activeImageIndex] || images[0];

  // Helper for difficulty stars
  const renderDifficultyStars = (level: number) => {
    return (
      <div className="flex items-center gap-1 text-gold-500">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-sm ${star <= level ? "opacity-100" : "opacity-25"}`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="pb-28">
      {/* Breadcrumb Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        <nav className="flex items-center gap-2 text-xs text-sand-500 dark:text-sand-400">
          <Link href="/" className="hover:text-forest-800 dark:hover:text-sand-100 transition">
            {t("nav.home")}
          </Link>
          <span>/</span>
          <Link href="/search" className="hover:text-forest-800 dark:hover:text-sand-100 transition">
            {t("nav.catalog")}
          </Link>
          <span>/</span>
          <span className="text-forest-900 dark:text-sand-100 font-medium truncate max-w-xs">
            {locale === "th" ? plant.nameTh : plant.nameEn}
          </span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        {/* Top Section: Photo Gallery + Botanical Header */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Photo Gallery (5 cols) */}
          <div className="lg:col-span-6 space-y-4">
            {/* Primary Main Image */}
            <div className="relative aspect-square sm:aspect-[4/3] rounded-3xl overflow-hidden bg-sand-100 dark:bg-forest-950 border border-sand-200 dark:border-forest-800 shadow-elevated">
              <img
                src={currentImage.blobUrl}
                alt={currentImage.altTh || (locale === "th" ? plant.nameTh : plant.nameEn)}
                className="w-full h-full object-cover transition-transform duration-500"
              />

              {/* Stock Status Badge */}
              <div className="absolute top-4 left-4">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md shadow-sm ${
                    plant.stockStatus === "in_stock"
                      ? "bg-emerald-700/90 text-white"
                      : plant.stockStatus === "made_to_order"
                      ? "bg-sky-700/90 text-white"
                      : "bg-amber-700/90 text-white"
                  }`}
                >
                  {plant.stockStatus === "in_stock" && (
                    <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                  )}
                  {t(`filters.stock_${plant.stockStatus}`)}
                </span>
              </div>

              {/* Authentic Nursery Badge */}
              <div className="absolute bottom-4 right-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium bg-forest-950/80 text-sand-100 backdrop-blur-md shadow-sm">
                  <Camera className="w-3.5 h-3.5 text-gold-300" />
                  <span>{currentImage.credit === "ถ่ายที่ร้าน" || !currentImage.credit ? t("care.taken_at_shop") : currentImage.credit}</span>
                </span>
              </div>
            </div>

            {/* Thumbnail Gallery Strip */}
            {images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={img.id || idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition ${
                      activeImageIndex === idx
                        ? "border-forest-600 dark:border-forest-400 scale-105 shadow-md"
                        : "border-sand-200 dark:border-forest-800 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img.blobUrl}
                      alt={img.altTh}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Botanical Header & Quick Info (7 cols) */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              {/* Botanical Family */}
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-forest-600 dark:text-forest-400 mb-2">
                <Sprout className="w-3.5 h-3.5" />
                <span>{locale === "th" ? plant.family : (plant.family ? plant.family.split("(")[0].trim() : plant.family)}</span>
              </div>

              {/* Main Names */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-forest-950 dark:text-sand-50 tracking-tight leading-tight">
                {locale === "th" ? plant.nameTh : plant.nameEn}
              </h1>

              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mt-1">
                {locale === "th" ? (
                  <>
                    <span className="text-lg sm:text-xl font-medium text-sand-700 dark:text-sand-300">
                      {plant.nameEn}
                    </span>
                    <span className="text-sm italic font-serif text-sand-500 dark:text-sand-400">
                      ({plant.nameSci})
                    </span>
                  </>
                ) : (
                  <span className="text-base sm:text-lg italic font-serif text-sand-600 dark:text-sand-300">
                    {plant.nameSci}
                  </span>
                )}
              </div>
            </div>

            {/* Aliases Chips */}
            {locale === "th" && plant.aliases && plant.aliases.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-sand-500 dark:text-sand-400 mr-1">
                  ชื่ออื่นๆ:
                </span>
                {plant.aliases.map((alias) => (
                  <span
                    key={alias}
                    className="px-2.5 py-0.5 rounded-lg text-xs bg-sand-100 dark:bg-forest-900 text-forest-800 dark:text-sand-200 border border-sand-200 dark:border-forest-800"
                  >
                    {alias}
                  </span>
                ))}
              </div>
            )}

            {/* Summary */}
            <p className="text-sm sm:text-base text-forest-800 dark:text-sand-200 leading-relaxed font-light">
              {localized.summary}
            </p>

            {/* Prominent Authentic "Shop Note" Box */}
            <div className="rounded-2xl border border-gold-300 dark:border-gold-800/80 bg-gradient-to-br from-gold-100/40 via-sand-50 to-sand-100/50 dark:from-forest-900/90 dark:via-forest-900/60 dark:to-forest-950 p-5 sm:p-6 shadow-soft relative overflow-hidden">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-gold-400/20 text-gold-700 dark:text-gold-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Quote className="w-4 h-4" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-serif font-bold text-sm text-forest-950 dark:text-sand-50 flex items-center gap-2">
                    <span>{t("care.shop_owner_tip")}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-forest-200 dark:bg-forest-800 text-forest-800 dark:text-forest-200 font-sans font-normal">
                      {t("care.authentic_wisdom")}
                    </span>
                  </h3>
                  <p className="text-xs sm:text-sm text-forest-900 dark:text-sand-200 leading-relaxed italic">
                    &quot;{localized.shopNote}&quot;
                  </p>
                </div>
              </div>
            </div>

            {/* Desktop Action Buttons */}
            <div className="hidden sm:flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setInquiryModalOpen(true)}
                className="flex-1 py-3 px-4 rounded-xl bg-[#06C755] hover:bg-[#05b34c] text-white font-semibold text-sm shadow-soft transition flex items-center justify-center gap-2 min-h-[48px]"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{t("inquiry.ask_shop")}</span>
              </button>

              <Link
                href={`/garden/add?speciesId=${plant.id}`}
                className="flex-1 py-3 px-4 rounded-xl bg-forest-700 hover:bg-forest-800 text-sand-50 font-semibold text-sm shadow-soft transition flex items-center justify-center gap-2 min-h-[48px]"
              >
                <Plus className="w-4 h-4" />
                <span>{t("garden.add_plant")}</span>
              </Link>
            </div>
          </div>
        </section>

        {/* 6-Metric Summary Cards Grid */}
        <section className="space-y-4">
          <h2 className="font-serif font-bold text-xl sm:text-2xl text-forest-950 dark:text-sand-50">
            {t("care.quick_specs_title")}
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {/* 1. Light */}
            <div className="p-4 rounded-2xl border border-sand-200 dark:border-forest-800 bg-white dark:bg-forest-900/60 shadow-soft space-y-2">
              <div className="w-8 h-8 rounded-xl bg-gold-500/10 text-gold-600 dark:text-gold-400 flex items-center justify-center">
                <Sun className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-sand-500 dark:text-sand-400 block">
                  {t("filters.light")}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-forest-950 dark:text-sand-50 capitalize">
                  {t(`filters.light_${plant.light}`)}
                </span>
              </div>
            </div>

            {/* 2. Water */}
            <div className="p-4 rounded-2xl border border-sand-200 dark:border-forest-800 bg-white dark:bg-forest-900/60 shadow-soft space-y-2">
              <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                <Droplets className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-sand-500 dark:text-sand-400 block">
                  {t("filters.water")}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-forest-950 dark:text-sand-50 capitalize">
                  {t(`filters.water_${plant.waterNeed}`)}
                </span>
              </div>
            </div>

            {/* 3. Placement */}
            <div className="p-4 rounded-2xl border border-sand-200 dark:border-forest-800 bg-white dark:bg-forest-900/60 shadow-soft space-y-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Home className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-sand-500 dark:text-sand-400 block">
                  {t("filters.placement")}
                </span>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {plant.placement.map((p) => (
                    <span
                      key={p}
                      className="text-[11px] font-medium text-forest-900 dark:text-sand-100"
                    >
                      {t(`filters.placement_${p}`)}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 4. Difficulty */}
            <div className="p-4 rounded-2xl border border-sand-200 dark:border-forest-800 bg-white dark:bg-forest-900/60 shadow-soft space-y-2">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-sand-500 dark:text-sand-400 block">
                  {t("filters.difficulty")}
                </span>
                <div className="flex items-center gap-1.5">
                  {renderDifficultyStars(plant.difficulty)}
                </div>
                <span className="text-[11px] text-sand-600 dark:text-sand-400">
                  {t(`filters.difficulty_${plant.difficulty}`)}
                </span>
              </div>
            </div>

            {/* 5. Pet Safety */}
            <div className="p-4 rounded-2xl border border-sand-200 dark:border-forest-800 bg-white dark:bg-forest-900/60 shadow-soft space-y-2">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  plant.petSafe === "safe"
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                }`}
              >
                {plant.petSafe === "safe" ? (
                  <ShieldCheck className="w-4 h-4" />
                ) : (
                  <AlertTriangle className="w-4 h-4" />
                )}
              </div>
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-sand-500 dark:text-sand-400 block">
                  {t("filters.pet")}
                </span>
                <span
                  className={`text-xs sm:text-sm font-semibold ${
                    plant.petSafe === "safe"
                      ? "text-emerald-700 dark:text-emerald-300"
                      : "text-amber-700 dark:text-amber-300"
                  }`}
                >
                  {t(`filters.pet_${plant.petSafe}`)}
                </span>
              </div>
            </div>

            {/* 6. Mature Size */}
            <div className="p-4 rounded-2xl border border-sand-200 dark:border-forest-800 bg-white dark:bg-forest-900/60 shadow-soft space-y-2">
              <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                <Maximize2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-sand-500 dark:text-sand-400 block">
                  {t("filters.size")}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-forest-950 dark:text-sand-50">
                  {t(`filters.size_${plant.matureSize}`)}
                </span>
                {plant.matureHeightCm && (
                  <span className="text-[11px] text-sand-500 dark:text-sand-400 block">
                    ~{plant.matureHeightCm} {locale === "th" ? "ซม." : "cm"}
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Human-Readable Seasonal Care Instructions (care_templates) */}
        {plant.careTemplate && (
          <section className="rounded-3xl border border-sand-200 dark:border-forest-800 bg-white dark:bg-forest-900/60 shadow-soft p-6 sm:p-8 space-y-8">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest-600 dark:text-forest-400 uppercase tracking-wider">
                <Calendar className="w-3.5 h-3.5" />
                <span>{t("care.smart_schedule")}</span>
              </div>
              <h2 className="font-serif font-bold text-2xl sm:text-3xl text-forest-950 dark:text-sand-50">
                {t("care.care_guide")}
              </h2>
              <p className="text-xs sm:text-sm text-sand-600 dark:text-sand-400">
                {t("care.schedule_explanation")}
              </p>
            </div>

            {/* 3 Seasons Watering Grid */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-sand-600 dark:text-sand-400 mb-3">
                {locale === "th" ? "รอบการรดน้ำตาม 3 ฤดูกาลไทย" : "Watering Cadence by Thai Season"}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Hot Season */}
                <div className="p-4 rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-amber-800 dark:text-amber-300">
                    <span>{t("care.season_hot")}</span>
                    <span>☀️</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-serif font-bold text-forest-950 dark:text-sand-50">
                    {t("care.every_days", { days: plant.careTemplate.waterDaysHot })}
                  </div>
                  <p className="text-[11px] text-sand-600 dark:text-sand-400 leading-tight">
                    {locale === "th"
                      ? "อุณหภูมิสูง ดินแห้งไว เช็คผิวดินสม่ำเสมอ"
                      : "Higher evaporation rate, verify topsoil dryness"}
                  </p>
                </div>

                {/* Rainy Season */}
                <div className="p-4 rounded-2xl border border-sky-200 dark:border-sky-900/50 bg-sky-50/50 dark:bg-sky-950/20 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-sky-800 dark:text-sky-300">
                    <span>{t("care.season_rainy")}</span>
                    <span>🌧️</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-serif font-bold text-forest-950 dark:text-sand-50">
                    {t("care.every_days", { days: plant.careTemplate.waterDaysRainy })}
                  </div>
                  <p className="text-[11px] text-sand-600 dark:text-sand-400 leading-tight">
                    {locale === "th"
                      ? "ความชื้นสูง ยืดระยะห่างเพื่อป้องกันรากเน่า"
                      : "High humidity, extended intervals to prevent root rot"}
                  </p>
                </div>

                {/* Cool Season */}
                <div className="p-4 rounded-2xl border border-teal-200 dark:border-teal-900/50 bg-teal-50/50 dark:bg-teal-950/20 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-teal-800 dark:text-teal-300">
                    <span>{t("care.season_cool")}</span>
                    <span>🍃</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-serif font-bold text-forest-950 dark:text-sand-50">
                    {t("care.every_days", { days: plant.careTemplate.waterDaysCool })}
                  </div>
                  <p className="text-[11px] text-sand-600 dark:text-sand-400 leading-tight">
                    {locale === "th"
                      ? "การเจริญเติบโตชะลอตัว ดินแห้งปานกลาง"
                      : "Milder weather, steady moisture balance"}
                  </p>
                </div>
              </div>
            </div>

            {/* Other Care Tasks: Fertilize, Repot, Pest Check */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {plant.careTemplate.fertilizeDays && (
                <div className="p-4 rounded-2xl bg-sand-50/70 dark:bg-forest-950/40 border border-sand-200 dark:border-forest-800 space-y-1">
                  <span className="text-[11px] font-semibold text-sand-500 uppercase tracking-wider">
                    {t("care.fertilize")}
                  </span>
                  <div className="text-base font-bold text-forest-950 dark:text-sand-100">
                    {t("care.every_days", { days: plant.careTemplate.fertilizeDays })}
                  </div>
                  {plant.careTemplate.fertilizePauseMonths &&
                    plant.careTemplate.fertilizePauseMonths.length > 0 && (
                      <span className="text-[11px] text-sand-500 italic block">
                        {locale === "th"
                          ? `(พักปุ๋ยเดือน ${plant.careTemplate.fertilizePauseMonths.join(", ")})`
                          : `(Pause months: ${plant.careTemplate.fertilizePauseMonths.join(", ")})`}
                      </span>
                    )}
                </div>
              )}

              {plant.careTemplate.repotMonths && (
                <div className="p-4 rounded-2xl bg-sand-50/70 dark:bg-forest-950/40 border border-sand-200 dark:border-forest-800 space-y-1">
                  <span className="text-[11px] font-semibold text-sand-500 uppercase tracking-wider">
                    {t("care.repot")}
                  </span>
                  <div className="text-base font-bold text-forest-950 dark:text-sand-100">
                    {t("care.every_months", { months: plant.careTemplate.repotMonths })}
                  </div>
                  <span className="text-[11px] text-sand-500 block">
                    {locale === "th" ? "เปลี่ยนกระถางเมื่อรากเริ่มแน่น" : "When rootbound"}
                  </span>
                </div>
              )}

              <div className="p-4 rounded-2xl bg-sand-50/70 dark:bg-forest-950/40 border border-sand-200 dark:border-forest-800 space-y-1">
                <span className="text-[11px] font-semibold text-sand-500 uppercase tracking-wider">
                  {t("care.pest_check")}
                </span>
                <div className="text-base font-bold text-forest-950 dark:text-sand-100">
                  {t("care.every_days", { days: plant.careTemplate.pestCheckDays || 14 })}
                </div>
                <span className="text-[11px] text-sand-500 block">
                  {locale === "th" ? "ตรวจหลังใบและโคนต้น" : "Inspect undersides of leaves"}
                </span>
              </div>
            </div>

            {/* Detailed Care Attributes: Soil Mix, Fertilizer, Propagation, Notes */}
            <div className="space-y-4 pt-2 border-t border-sand-200 dark:border-forest-800">
              {localized.soilMix && (
                <div className="space-y-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-sand-600 dark:text-sand-400">
                    🌱 {t("care.soil_mix")}
                  </h4>
                  <p className="text-xs sm:text-sm text-forest-900 dark:text-sand-200 leading-relaxed bg-sand-50/80 dark:bg-forest-950/50 p-3.5 rounded-xl border border-sand-200 dark:border-forest-800">
                    {localized.soilMix}
                  </p>
                </div>
              )}

              {localized.fertilizerNote && (
                <div className="space-y-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-sand-600 dark:text-sand-400">
                    💊 {t("care.fertilizer_note")}
                  </h4>
                  <p className="text-xs sm:text-sm text-forest-900 dark:text-sand-200 leading-relaxed bg-sand-50/80 dark:bg-forest-950/50 p-3.5 rounded-xl border border-sand-200 dark:border-forest-800">
                    {localized.fertilizerNote}
                  </p>
                </div>
              )}

              {localized.propagation && (
                <div className="space-y-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-sand-600 dark:text-sand-400">
                    ✂️ {t("care.propagation")}
                  </h4>
                  <p className="text-xs sm:text-sm text-forest-900 dark:text-sand-200 leading-relaxed bg-sand-50/80 dark:bg-forest-950/50 p-3.5 rounded-xl border border-sand-200 dark:border-forest-800">
                    {localized.propagation}
                  </p>
                </div>
              )}

              {localized.notes && (
                <div className="space-y-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-sand-600 dark:text-sand-400">
                    📝 {locale === "th" ? "คำแนะนำเพิ่มเติม" : "Care Notes"}
                  </h4>
                  <p className="text-xs sm:text-sm text-forest-900 dark:text-sand-200 leading-relaxed bg-sand-50/80 dark:bg-forest-950/50 p-3.5 rounded-xl border border-sand-200 dark:border-forest-800">
                    {localized.notes}
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Common Problems & Troubleshooting Accordion (species_problems) */}
        {localized.problems && localized.problems.length > 0 && (
          <section className="space-y-4">
            <div className="space-y-1">
              <h2 className="font-serif font-bold text-2xl sm:text-3xl text-forest-950 dark:text-sand-50">
                {t("care.common_problems")}
              </h2>
              <p className="text-xs sm:text-sm text-sand-600 dark:text-sand-400">
                {locale === "th"
                  ? "วิธีสังเกตอาการผิดปกติ สาเหตุ และวิธีแก้ปัญหาที่พบบ่อย"
                  : "Common symptoms, causes, and remedy guidelines diagnosed by our plant clinic."}
              </p>
            </div>

            <div className="space-y-3">
              {localized.problems.map((prob) => {
                const isOpen = expandedProblems[prob.id] ?? true; // Open by default for instant readability
                return (
                  <div
                    key={prob.id}
                    className="rounded-2xl border border-sand-200 dark:border-forest-800 bg-white dark:bg-forest-900/60 shadow-soft overflow-hidden transition"
                  >
                    <button
                      type="button"
                      onClick={() => toggleProblem(prob.id)}
                      className="w-full px-5 py-4 text-left flex items-center justify-between gap-3 hover:bg-sand-50/50 dark:hover:bg-forest-800/40 transition"
                      aria-expanded={isOpen}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            prob.severity === "high"
                              ? "bg-rose-500"
                              : prob.severity === "medium"
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          }`}
                        />
                        <span className="font-serif font-bold text-sm sm:text-base text-forest-950 dark:text-sand-100">
                          {prob.symptom}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase ${
                            prob.severity === "high"
                              ? "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300"
                              : prob.severity === "medium"
                              ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300"
                              : "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                          }`}
                        >
                          {prob.severity}
                        </span>
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 text-sand-500" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-sand-500" />
                        )}
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 space-y-3 text-xs sm:text-sm border-t border-sand-100 dark:border-forest-800/80 bg-sand-50/40 dark:bg-forest-950/30">
                        <div>
                          <span className="font-semibold text-sand-600 dark:text-sand-400 block mb-1">
                            🔍 {locale === "th" ? "สาเหตุหลัก:" : "Cause:"}
                          </span>
                          <p className="text-forest-900 dark:text-sand-200 leading-relaxed">
                            {prob.cause}
                          </p>
                        </div>
                        <div>
                          <span className="font-semibold text-forest-700 dark:text-emerald-400 block mb-1">
                            🌿 {locale === "th" ? "วิธีแก้ไขและฟื้นฟู:" : "Treatment & Fix:"}
                          </span>
                          <p className="text-forest-900 dark:text-sand-100 leading-relaxed bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
                            {prob.fix}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 4 Similar Species Recommendations */}
        {similarSpecies && similarSpecies.length > 0 && (
          <section className="space-y-6 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif font-bold text-2xl sm:text-3xl text-forest-950 dark:text-sand-50">
                  {t("care.similar_plants")}
                </h2>
                <p className="text-xs sm:text-sm text-sand-600 dark:text-sand-400 mt-1">
                  {locale === "th"
                    ? "พันธุ์ไม้ที่มีความต้องการแสงและน้ำใกล้เคียงกัน"
                    : "Curated species with comparable lighting and watering characteristics."}
                </p>
              </div>
              <Link
                href="/search"
                className="text-xs sm:text-sm font-semibold text-forest-700 dark:text-forest-400 hover:underline flex items-center gap-1"
              >
                <span>{t("search.view_all")}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {similarSpecies.map((sim) => {
                const simLocalized = getLocalizedSpeciesData(sim.slug, locale, { summary: sim.summary });
                return (
                  <Link
                    key={sim.id}
                    href={`/plants/${sim.slug}`}
                    className="group flex flex-col rounded-2xl border border-sand-200 dark:border-forest-800 bg-white dark:bg-forest-900/80 shadow-soft hover:shadow-card hover:-translate-y-1 transition-all overflow-hidden"
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-sand-100 dark:bg-forest-950">
                      <img
                        src={sim.primaryImage}
                        alt={locale === "th" ? sim.nameTh : sim.nameEn}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute top-2.5 left-2.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-700/90 text-white backdrop-blur-md">
                          {t(`filters.stock_${sim.stockStatus}`)}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-serif font-bold text-sm sm:text-base text-forest-950 dark:text-sand-50 group-hover:text-forest-600 dark:group-hover:text-forest-400 transition line-clamp-1">
                          {locale === "th" ? sim.nameTh : sim.nameEn}
                        </h3>
                        {locale === "th" && (
                          <p className="text-xs text-sand-500 dark:text-sand-400 italic line-clamp-1 mb-1">
                            {sim.nameEn}
                          </p>
                        )}
                        <p className="text-xs text-forest-700 dark:text-sand-300 line-clamp-2 leading-relaxed">
                          {simLocalized.summary}
                        </p>
                      </div>
                      <div className="mt-3 pt-2 border-t border-sand-100 dark:border-forest-800/80 flex items-center justify-between text-[11px] text-sand-500">
                        <span>{sim.difficulty}/5 ★</span>
                        <span className="text-forest-600 dark:text-forest-400 font-medium group-hover:underline">
                          {locale === "th" ? "ดูข้อมูล" : "View"} →
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>

      {/* Sticky Bottom Action Bar (Mobile & Desktop) */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-sand-200 dark:border-forest-800 bg-sand-50/95 dark:bg-forest-950/95 backdrop-blur-md shadow-elevated transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Left side: Plant preview name */}
            <div className="hidden sm:flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-sand-100 dark:bg-forest-900 shrink-0 border border-sand-200 dark:border-forest-800">
                <img
                  src={currentImage.blobUrl}
                  alt={locale === "th" ? plant.nameTh : plant.nameEn}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="font-serif font-bold text-sm text-forest-950 dark:text-sand-50 line-clamp-1">
                  {locale === "th" ? plant.nameTh : plant.nameEn}
                </span>
                <span className="text-xs text-sand-500 dark:text-sand-400 line-clamp-1 italic">
                  {plant.nameSci}
                </span>
              </div>
            </div>

            {/* Right side: Action Buttons */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setInquiryModalOpen(true)}
                className="flex-1 sm:flex-initial px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-[#06C755] hover:bg-[#05b34c] text-white font-semibold text-xs sm:text-sm shadow-soft transition flex items-center justify-center gap-2 min-h-[44px]"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{t("inquiry.ask_shop")}</span>
              </button>

              <Link
                href={`/garden/add?speciesId=${plant.id}`}
                className="flex-1 sm:flex-initial px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-forest-700 hover:bg-forest-800 text-sand-50 font-semibold text-xs sm:text-sm shadow-soft transition flex items-center justify-center gap-2 min-h-[44px]"
              >
                <Plus className="w-4 h-4" />
                <span>{t("garden.add_plant")}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* LINE Inquiry Modal */}
      <InquiryModal
        isOpen={inquiryModalOpen}
        onClose={() => setInquiryModalOpen(false)}
        species={{
          id: plant.id,
          nameTh: plant.nameTh,
          nameEn: plant.nameEn,
          slug: plant.slug,
        }}
        sourcePage={`/plants/${plant.slug}`}
        defaultIntent="care_help"
      />
    </div>
  );
}
