"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/context/AppContext";
import {
  Sun,
  Droplets,
  Home,
  ShieldCheck,
  AlertTriangle,
  Award,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Plus,
  Heart,
  Share2,
  Check,
} from "lucide-react";

interface MediaItem {
  id: string;
  blobUrl: string;
  altTh: string;
  isPrimary: boolean;
  credit: string;
}

interface ProblemItem {
  id: string;
  symptomTh: string;
  causeTh: string;
  fixTh: string;
  severity: string;
}

interface CareTemplateItem {
  waterDaysHot: number;
  waterDaysRainy: number;
  waterDaysCool: number;
  fertilizeDays?: number | null;
  fertilizePauseMonths?: number[];
  repotMonths?: number | null;
  notesTh?: string | null;
}

interface SimilarSpeciesItem {
  id: string;
  slug: string;
  nameTh: string;
  nameEn: string;
  summary: string;
  difficulty: number;
  stockStatus: string;
  primaryImage: string;
}

interface PlantDetailProps {
  plant: {
    id: string;
    slug: string;
    nameTh: string;
    nameEn: string;
    nameSci: string;
    aliases: string[];
    family: string;
    summary: string;
    light: string;
    waterNeed: string;
    placement: string[];
    difficulty: number;
    petSafe: string;
    matureSize: string;
    matureHeightCm?: number | null;
    growthRate: string;
    soilMix: string;
    fertilizerNote?: string | null;
    propagation?: string | null;
    shopNote: string;
    stockStatus: string;
    media: MediaItem[];
    careTemplate: CareTemplateItem | null;
    problems: ProblemItem[];
  };
  similarPlants: SimilarSpeciesItem[];
}

export function PlantDetailClient({ plant, similarPlants }: PlantDetailProps) {
  const router = useRouter();
  const { openInquiryModal, isFavorite, toggleFavorite, showToast } = useApp();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [openAccordionIndex, setOpenAccordionIndex] = useState<number | null>(0);
  const [copiedLink, setCopiedLink] = useState(false);

  const images = plant.media.length > 0 ? plant.media : [
    {
      id: "default",
      blobUrl: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=1200&q=80",
      altTh: plant.nameTh,
      isPrimary: true,
      credit: "ถ่ายที่ร้าน",
    }
  ];

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      showToast("คัดลอกลิงก์ต้นไม้นี้แล้ว", "success");
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const getLightLabel = (light: string) => {
    switch (light) {
      case "full_sun": return "แดดจัดเต็มวัน";
      case "partial": return "แดดรำไร 3–5 ชม.";
      case "shade": return "ร่มเงา ไม่โดนแดดตรง";
      case "indoor_bright": return "ในบ้าน สว่างทางอ้อม";
      case "low_light": return "แสงน้อย ไฟนีออน";
      default: return light;
    }
  };

  const getWaterLabel = (water: string) => {
    switch (water) {
      case "low": return "รดน้ำน้อย (7+ วัน/ครั้ง)";
      case "medium": return "รดน้ำปานกลาง (3–7 วัน)";
      case "high": return "รดน้ำบ่อย (1–3 วัน)";
      default: return water;
    }
  };

  const getPlacementLabel = (p: string[]) => {
    const map: Record<string, string> = {
      indoor: "ในบ้าน/คอนโด",
      outdoor: "นอกบ้าน",
      balcony: "ริมระเบียง",
      bathroom: "ห้องน้ำ",
    };
    return p.map((item) => map[item] || item).join(", ");
  };

  const getSizeLabel = (size: string, heightCm?: number | null) => {
    const height = heightCm ? ` (~${heightCm} ซม.)` : "";
    switch (size) {
      case "xs": return `ขนาดเล็กมาก${height}`;
      case "sm": return `ขนาดเล็ก${height}`;
      case "md": return `ขนาดกลาง${height}`;
      case "lg": return `ขนาดใหญ่${height}`;
      case "xl": return `ขนาดใหญ่พิเศษ${height}`;
      default: return size;
    }
  };

  return (
    <div className="pb-28">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex items-center gap-2 text-xs text-stone-500">
          <Link href="/" className="hover:text-forest-900 transition-colors">หน้าแรก</Link>
          <span>/</span>
          <Link href="/search" className="hover:text-forest-900 transition-colors">พันธุ์ไม้</Link>
          <span>/</span>
          <span className="text-stone-800 font-medium truncate">{plant.nameTh}</span>
        </nav>
      </div>

      {/* Main Grid: Gallery on Left + Crucial Info on Right */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          {/* Left Column: Gallery (SPEC §6.3 #1) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-sand-100 border border-sand-300 shadow-soft">
              <Image
                src={images[activeImageIndex].blobUrl}
                alt={images[activeImageIndex].altTh}
                fill
                priority
                className="object-cover transition-all duration-300"
              />
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-forest-950/80 backdrop-blur-md text-gold-300 text-xs font-medium border border-gold-400/30">
                  ถ่ายที่ร้าน 100%
                </span>
              </div>
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <button
                  onClick={() => toggleFavorite(plant.id)}
                  className="p-2.5 rounded-full bg-white/80 hover:bg-white backdrop-blur-md text-stone-700 hover:text-rose-500 shadow-sm transition-all cursor-pointer"
                  title="บันทึกไว้ดูภายหลัง"
                >
                  <Heart
                    className={`w-4 h-4 ${isFavorite(plant.id) ? "text-rose-500 fill-rose-500" : ""}`}
                  />
                </button>
                <button
                  onClick={handleShare}
                  className="p-2.5 rounded-full bg-white/80 hover:bg-white backdrop-blur-md text-stone-700 shadow-sm transition-all cursor-pointer"
                  title="แชร์หน้านี้"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Thumbnail selector if multiple images */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                      activeImageIndex === idx
                        ? "border-forest-800 ring-2 ring-forest-800/20"
                        : "border-sand-300 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image src={img.blobUrl} alt={img.altTh} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Titles, Stock Status & Summary (SPEC §6.3 #2, #3, #4) */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              {/* Family & Stock Badge */}
              <div className="flex items-center justify-between gap-3 mb-2">
                <span className="text-xs font-bold uppercase tracking-widest text-forest-700">
                  {plant.family}
                </span>

                {plant.stockStatus === "in_stock" && (
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-semibold">
                    มีที่ร้านพร้อมส่ง
                  </span>
                )}
                {plant.stockStatus === "made_to_order" && (
                  <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-semibold">
                    สั่งได้ ~7–14 วัน
                  </span>
                )}
                {plant.stockStatus === "seasonal" && (
                  <span className="px-3 py-1 rounded-full bg-stone-100 text-stone-700 border border-stone-300 text-xs font-semibold">
                    ตามฤดูกาล
                  </span>
                )}
              </div>

              {/* Plant Names */}
              <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-stone-950 tracking-tight">
                {plant.nameTh}
              </h1>
              <p className="font-serif text-base sm:text-lg text-stone-600 italic mt-0.5">
                {plant.nameSci} <span className="font-sans not-italic text-sm text-stone-400">({plant.nameEn})</span>
              </p>

              {/* Aliases Chips */}
              {plant.aliases && plant.aliases.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 mt-3">
                  <span className="text-xs text-stone-400">ชื่อเล่น:</span>
                  {plant.aliases.map((alias) => (
                    <span
                      key={alias}
                      className="px-2 py-0.5 rounded-md bg-sand-200/60 text-stone-700 text-xs"
                    >
                      {alias}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Summary */}
            <p className="text-sm sm:text-base text-stone-700 leading-relaxed font-light">
              {plant.summary}
            </p>

            {/* 6-Grid Feature Summary Cards (SPEC §6.3 #4) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 bg-white rounded-2xl border border-sand-200 shadow-sm space-y-1">
                <div className="flex items-center gap-2 text-forest-700">
                  <Sun className="w-4 h-4" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">แสงสว่าง</span>
                </div>
                <p className="text-xs font-semibold text-stone-800">{getLightLabel(plant.light)}</p>
              </div>

              <div className="p-3.5 bg-white rounded-2xl border border-sand-200 shadow-sm space-y-1">
                <div className="flex items-center gap-2 text-forest-700">
                  <Droplets className="w-4 h-4" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">น้ำ</span>
                </div>
                <p className="text-xs font-semibold text-stone-800">{getWaterLabel(plant.waterNeed)}</p>
              </div>

              <div className="p-3.5 bg-white rounded-2xl border border-sand-200 shadow-sm space-y-1">
                <div className="flex items-center gap-2 text-forest-700">
                  <Home className="w-4 h-4" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">ที่วาง</span>
                </div>
                <p className="text-xs font-semibold text-stone-800">{getPlacementLabel(plant.placement)}</p>
              </div>

              <div className="p-3.5 bg-white rounded-2xl border border-sand-200 shadow-sm space-y-1">
                <div className="flex items-center gap-2 text-forest-700">
                  <Award className="w-4 h-4" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">ความยาก</span>
                </div>
                <p className="text-xs font-semibold text-stone-800">
                  {"★".repeat(plant.difficulty)}{"☆".repeat(5 - plant.difficulty)} (ระดับ {plant.difficulty}/5)
                </p>
              </div>

              <div className="p-3.5 bg-white rounded-2xl border border-sand-200 shadow-sm space-y-1">
                <div className="flex items-center gap-2 text-forest-700">
                  {plant.petSafe === "safe" ? (
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                  )}
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">สัตว์เลี้ยง</span>
                </div>
                <p className="text-xs font-semibold text-stone-800">
                  {plant.petSafe === "safe"
                    ? "ปลอดภัย 100%"
                    : plant.petSafe === "toxic"
                    ? "มีพิษเมื่อกัดกิน"
                    : "ข้อมูลไม่แน่ชัด"}
                </p>
              </div>

              <div className="p-3.5 bg-white rounded-2xl border border-sand-200 shadow-sm space-y-1">
                <div className="flex items-center gap-2 text-forest-700">
                  <Layers className="w-4 h-4" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">ขนาดโตเต็มที่</span>
                </div>
                <p className="text-xs font-semibold text-stone-800">{getSizeLabel(plant.matureSize, plant.matureHeightCm)}</p>
              </div>
            </div>

            {/* Actions for Desktop */}
            <div className="hidden lg:flex items-center gap-4 pt-4">
              <button
                onClick={() =>
                  openInquiryModal({
                    speciesId: plant.id,
                    speciesNameTh: plant.nameTh,
                    speciesPhoto: images[0]?.blobUrl,
                    defaultIntent: "price",
                  })
                }
                className="flex-1 py-3.5 px-6 rounded-2xl bg-[#06C755] hover:bg-[#05b34c] text-white font-medium text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>ถามร้านเรื่องต้นนี้ผ่าน LINE</span>
              </button>

              <Link
                href={`/garden/add?speciesId=${plant.id}`}
                className="py-3.5 px-6 rounded-2xl bg-forest-900 hover:bg-forest-800 text-sand-50 font-medium text-sm flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4 text-gold-400" />
                <span>+ เพิ่มเข้าสวนของฉัน</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Section: "ที่ร้านบอกว่า" — Authentic Shop Experience Note (SPEC §6.3 #6) */}
        <section className="mt-14 p-6 sm:p-8 rounded-3xl bg-forest-950 text-sand-50 border border-gold-500/40 shadow-elevated relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-2 text-gold-400">
              <Sparkles className="w-4 h-4" />
              <span className="font-serif text-sm font-semibold tracking-wider uppercase">
                ที่ร้านบอกว่า — ประสบการณ์จริงจากเรือนเพาะชำ
              </span>
            </div>
            <p className="font-serif text-lg sm:text-xl text-sand-100 leading-relaxed italic">
              "{plant.shopNote}"
            </p>
            <p className="text-xs text-sand-300 font-sans">
              — บันทึกโดยครอบครัว TreeForLife เพื่อผู้เลี้ยงชาวไทย
            </p>
          </div>
        </section>

        {/* Section: Detailed Care Guide (SPEC §6.3 #5) */}
        <section className="mt-14 space-y-6">
          <div className="border-b border-sand-200 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-forest-700">คู่มือการปลูก</span>
            <h2 className="font-serif text-2xl sm:text-3xl font-medium text-forest-950">
              วิธีดูแลให้เติบโตอย่างสมบูรณ์
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 3 Seasons Watering Guide */}
            {plant.careTemplate && (
              <div className="bg-white p-6 rounded-2xl border border-sand-200 shadow-soft space-y-3">
                <div className="flex items-center gap-2 text-forest-800">
                  <Droplets className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-serif text-base font-semibold text-stone-900">รอบการรดน้ำ 3 ฤดู</h3>
                </div>
                <div className="space-y-2 text-xs text-stone-700">
                  <div className="flex justify-between py-1 border-b border-sand-100">
                    <span className="text-stone-500">ฤดูร้อน (มี.ค.–พ.ค.):</span>
                    <span className="font-semibold text-stone-900">ทุก {plant.careTemplate.waterDaysHot} วัน</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-sand-100">
                    <span className="text-stone-500">ฤดูฝน (มิ.ย.–ต.ค.):</span>
                    <span className="font-semibold text-stone-900">ทุก {plant.careTemplate.waterDaysRainy} วัน</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-stone-500">ฤดูหนาว/แล้ง (พ.ย.–ก.พ.):</span>
                    <span className="font-semibold text-stone-900">ทุก {plant.careTemplate.waterDaysCool} วัน</span>
                  </div>
                </div>
                {plant.careTemplate.notesTh && (
                  <p className="text-xs text-stone-500 bg-sand-50 p-2.5 rounded-xl mt-2 leading-relaxed">
                    💡 {plant.careTemplate.notesTh}
                  </p>
                )}
              </div>
            )}

            {/* Soil Mix Recipe */}
            <div className="bg-white p-6 rounded-2xl border border-sand-200 shadow-soft space-y-3">
              <div className="flex items-center gap-2 text-forest-800">
                <Layers className="w-5 h-5 text-earth-600" />
                <h3 className="font-serif text-base font-semibold text-stone-900">สูตรดินที่ร้านใช้จริง</h3>
              </div>
              <p className="text-xs text-stone-700 leading-relaxed">
                {plant.soilMix}
              </p>
            </div>

            {/* Fertilizer & Repotting */}
            <div className="bg-white p-6 rounded-2xl border border-sand-200 shadow-soft space-y-3">
              <div className="flex items-center gap-2 text-forest-800">
                <Sparkles className="w-5 h-5 text-gold-500" />
                <h3 className="font-serif text-base font-semibold text-stone-900">ปุ๋ย & เปลี่ยนกระถาง</h3>
              </div>
              <p className="text-xs text-stone-700 leading-relaxed">
                <span className="font-semibold text-stone-900">ปุ๋ย:</span> {plant.fertilizerNote || "ใส่ปุ๋ยละลายช้าตามความเหมาะสม"}
              </p>
              {plant.careTemplate?.repotMonths && (
                <p className="text-xs text-stone-700 leading-relaxed pt-1 border-t border-sand-100">
                  <span className="font-semibold text-stone-900">เปลี่ยนกระถาง:</span> ทุก {plant.careTemplate.repotMonths} เดือน หรือเมื่อรากเริ่มแน่น
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Section: Common Problems Accordion (SPEC §6.3 #7) */}
        {plant.problems && plant.problems.length > 0 && (
          <section className="mt-14 space-y-6">
            <div className="border-b border-sand-200 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-forest-700">การวินิจฉัย</span>
              <h2 className="font-serif text-2xl sm:text-3xl font-medium text-forest-950">
                ปัญหาที่พบบ่อยและวิธีรักษา
              </h2>
            </div>

            <div className="space-y-3">
              {plant.problems.map((prob, idx) => {
                const isOpen = openAccordionIndex === idx;
                return (
                  <div
                    key={prob.id}
                    className="bg-white rounded-2xl border border-sand-200 overflow-hidden shadow-soft transition-all"
                  >
                    <button
                      onClick={() => setOpenAccordionIndex(isOpen ? null : idx)}
                      className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-sand-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <AlertTriangle
                          className={`w-4 h-4 shrink-0 ${
                            prob.severity === "high"
                              ? "text-rose-600"
                              : prob.severity === "medium"
                              ? "text-amber-600"
                              : "text-stone-500"
                          }`}
                        />
                        <span className="font-serif text-sm sm:text-base font-medium text-stone-900">
                          {prob.symptomTh}
                        </span>
                      </div>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-stone-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-stone-400" />
                      )}
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-stone-700 border-t border-sand-100 space-y-2 bg-sand-50/50">
                        <p>
                          <span className="font-semibold text-stone-900">สาเหตุ:</span> {prob.causeTh}
                        </p>
                        <p className="text-forest-900 bg-emerald-50/80 p-3 rounded-xl border border-emerald-200">
                          <span className="font-semibold text-emerald-950">วิธีแก้ไข:</span> {prob.fixTh}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Section: Similar Species (SPEC §6.3 #8) */}
        {similarPlants.length > 0 && (
          <section className="mt-14 space-y-6">
            <div className="border-b border-sand-200 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-forest-700">คำแนะนำเพิ่มเติม</span>
              <h2 className="font-serif text-2xl sm:text-3xl font-medium text-forest-950">
                พันธุ์ที่ต้องการสภาพแวดล้อมใกล้เคียงกัน
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {similarPlants.map((item) => (
                <Link
                  key={item.id}
                  href={`/plants/${item.slug}`}
                  className="group bg-white rounded-2xl overflow-hidden border border-sand-200 shadow-soft hover:shadow-card card-hover-effect flex flex-col"
                >
                  <div className="relative aspect-square bg-sand-100 overflow-hidden">
                    <Image
                      src={item.primaryImage}
                      alt={item.nameTh}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-3">
                    <h4 className="font-serif text-sm font-semibold text-stone-900 group-hover:text-forest-800 transition-colors truncate">
                      {item.nameTh}
                    </h4>
                    <p className="text-[11px] text-stone-500 italic truncate font-serif">{item.nameEn}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Floating Bottom Bar for Mobile & Quick Action (SPEC §6.3 #9) */}
      <div className="fixed bottom-14 md:bottom-0 left-0 right-0 z-30 bg-sand-50/95 backdrop-blur-lg border-t border-sand-300 p-3 sm:p-4 shadow-elevated">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="hidden sm:flex items-center gap-3">
            <span className="font-serif text-sm font-semibold text-stone-900 truncate">
              {plant.nameTh}
            </span>
            <span className="text-xs text-stone-500 italic">({plant.nameSci})</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={() =>
                openInquiryModal({
                  speciesId: plant.id,
                  speciesNameTh: plant.nameTh,
                  speciesPhoto: images[0]?.blobUrl,
                  defaultIntent: "price",
                })
              }
              className="flex-1 sm:flex-initial py-3 px-5 rounded-xl bg-[#06C755] hover:bg-[#05b34c] text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>ถามร้านเรื่องต้นนี้</span>
            </button>

            <Link
              href={`/garden/add?speciesId=${plant.id}`}
              className="flex-1 sm:flex-initial py-3 px-5 rounded-xl bg-forest-900 hover:bg-forest-800 text-sand-50 font-medium text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-gold-400" />
              <span>+ เพิ่มเข้าสวน</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
