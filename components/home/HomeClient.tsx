"use client";

import React from "react";
import Link from "next/link";
import {
  Sun,
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  Camera,
  ChevronRight,
  Sprout,
  HeartHandshake,
  Sparkles,
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";
import { getLocalizedSpeciesData } from "@/lib/i18n/species-en";
import type { getAllSpecies } from "@/lib/services/speciesService";
import { HomeHero } from "./HomeHero";

interface HomeClientProps {
  featuredPlants: Awaited<ReturnType<typeof getAllSpecies>>;
}

export function HomeClient({ featuredPlants }: HomeClientProps) {
  const { t, locale } = useApp();

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* 1. Hero Section */}
      <HomeHero />

      {/* 2. In-Stock Plant Carousel / Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-forest-600 dark:text-forest-400 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{locale === "th" ? "คัดพิเศษพร้อมส่งทันที" : "Ready For Delivery"}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-forest-950 dark:text-sand-50">
              {locale === "th" ? "ต้นไม้พร้อมจำหน่ายที่ร้าน" : "In Stock at Nursery"}
            </h2>
            <p className="text-xs sm:text-sm text-sand-600 dark:text-sand-400 mt-1">
              {locale === "th"
                ? "ถ่ายจากต้นจริงในเรือนเพาะชำ พร้อมส่งและพร้อมดูแล"
                : "Authentic nursery photography, healthy roots, ready to take home."}
            </p>
          </div>
          <Link
            href="/search?stock=in_stock"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-forest-700 dark:text-forest-400 hover:text-forest-950 dark:hover:text-sand-50 group min-h-[44px]"
          >
            <span>{t("search.view_all")}</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Grid of 8 Plants */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {featuredPlants.slice(0, 8).map((plant) => {
            const hasTakenAtShop = true; // By design requirement, authentic shop badge
            const plantLocalized = getLocalizedSpeciesData(plant.slug, locale, { summary: plant.summary });
            return (
              <Link
                key={plant.id}
                href={`/plants/${plant.slug}`}
                className="group flex flex-col rounded-2xl border border-sand-200 dark:border-forest-800 bg-white dark:bg-forest-900/80 shadow-soft hover:shadow-card hover:-translate-y-1 transition-all overflow-hidden"
              >
                {/* Image & Badges */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-sand-100 dark:bg-forest-950">
                  {plant.primaryImage && (
                    <img
                      src={plant.primaryImage}
                      alt={locale === "th" ? (plant.imageAlt || plant.nameTh) : (plant.nameEn || plant.imageAlt || plant.nameTh)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  )}

                  {/* Stock Tag */}
                  <div className="absolute top-2.5 left-2.5">
                    {/* page.tsx falls back to non-in-stock plants when fewer than 8 are in stock */}
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold backdrop-blur-md shadow-sm ${
                        plant.stockStatus === "in_stock"
                          ? "bg-emerald-700/90 text-white"
                          : plant.stockStatus === "made_to_order"
                          ? "bg-sky-700/90 text-white"
                          : "bg-amber-700/90 text-white"
                      }`}
                    >
                      {plant.stockStatus === "in_stock" && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                      )}
                      {t(`filters.stock_${plant.stockStatus}`)}
                    </span>
                  </div>

                  {/* "Taken at Shop" Badge */}
                  {hasTakenAtShop && (
                    <div className="absolute bottom-2.5 right-2.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-medium bg-forest-950/75 text-sand-100 backdrop-blur-md">
                        <Camera className="w-3 h-3 text-gold-300" />
                        <span>{t("care.taken_at_shop")}</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-baseline justify-between gap-2 mb-1">
                      <h3 className="font-serif font-bold text-base sm:text-lg text-forest-950 dark:text-sand-50 group-hover:text-forest-600 dark:group-hover:text-forest-400 transition-colors line-clamp-1">
                        {locale === "th" ? plant.nameTh : plant.nameEn}
                      </h3>
                      <span className="text-[11px] font-medium text-sand-600 dark:text-sand-400 shrink-0">
                        {plant.difficulty}/5 ★
                      </span>
                    </div>
                    <p className="text-xs text-sand-500 dark:text-sand-400 font-sans italic line-clamp-1 mb-2">
                      {locale === "th" ? plant.nameEn : plant.nameSci}
                    </p>
                    <p className="text-xs text-forest-700 dark:text-sand-300 line-clamp-2 leading-relaxed">
                      {plantLocalized.summary}
                    </p>
                  </div>

                  {/* Quick specs pill footer */}
                  <div className="mt-4 pt-3 border-t border-sand-100 dark:border-forest-800/80 flex items-center justify-between text-[11px] text-sand-600 dark:text-sand-400">
                    <div className="flex items-center gap-1.5">
                      <Sun className="w-3.5 h-3.5 text-gold-500" />
                      <span className="capitalize">{t(`filters.light_${plant.light}`)}</span>
                    </div>
                    {plant.petSafe === "safe" ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                        🐾 {locale === "th" ? "มิตรต่อสัตว์" : "Pet Safe"}
                      </span>
                    ) : (
                      <span className="text-sand-400 dark:text-sand-500">
                        🌿 {locale === "th" ? "พืชฟอกอากาศ" : "Air Plant"}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 4. Value Proposition Banner & Start My Garden CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden border border-forest-200 dark:border-forest-800 bg-gradient-to-br from-forest-900 via-forest-950 to-forest-950 text-sand-50 shadow-elevated p-8 sm:p-12 lg:p-16">
          {/* Decorative Leaf overlay */}
          <div className="absolute -right-16 -bottom-16 w-80 h-80 opacity-10 pointer-events-none">
            <Sprout className="w-full h-full text-white" />
          </div>

          <div className="relative max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-800/80 border border-forest-700 text-xs font-semibold text-gold-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{locale === "th" ? "ระบบดูแลสวนอัจฉริยะ" : "Smart Botanical Companion"}</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-serif font-bold tracking-tight text-sand-50 leading-tight">
              {locale === "th"
                ? "เลี้ยงต้นไม้ไม่ให้ตายอีกต่อไป ด้วยตารางดูแลที่ปรับตามชีวิตจริง"
                : "No More Dead Plants. Smart Care Schedules Tuned to Real Life."}
            </h2>

            <p className="text-sm sm:text-base text-sand-200 leading-relaxed font-light">
              {locale === "th"
                ? "เพิ่มต้นไม้เข้าสู่ 'สวนของฉัน' เพื่อคำนวณรอบรดน้ำและให้ปุ๋ยอัตโนมัติ คำนวณจากขนาดกระถาง ชนิดวัสดุ (ดินเผา/พลาสติก) แสงแดดในห้อง และสภาพอากาศประเทศไทยแบบ 3 ฤดูกาล"
                : "Add any plant to 'My Garden' to unlock automatic watering schedules adjusted for pot diameter, material (terracotta/plastic), microclimate, and the 3 Thai seasons."}
            </p>

            {/* 3 Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-forest-800/40 border border-forest-700/50">
                <CalendarCheck className="w-5 h-5 text-gold-300 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-semibold text-sand-100 mb-0.5">
                    {locale === "th" ? "ปรับ 3 ฤดูกาลไทย" : "3-Season Formula"}
                  </div>
                  <div className="text-sand-300">
                    {locale === "th" ? "ร้อน ฝน หนาว รดน้ำไม่เท่ากัน" : "Dynamic hot/rainy/cool cycles"}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-forest-800/40 border border-forest-700/50">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-semibold text-sand-100 mb-0.5">
                    {locale === "th" ? "บันทึกในคลิกเดียว" : "1-Click Watered"}
                  </div>
                  <div className="text-sand-300">
                    {locale === "th" ? "กดรดแล้ว ตารางวันถัดไปคำนวณทันที" : "Instant rollover upon completion"}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-forest-800/40 border border-forest-700/50">
                <HeartHandshake className="w-5 h-5 text-pink-300 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-semibold text-sand-100 mb-0.5">
                    {locale === "th" ? "ปรึกษาร้านทาง LINE" : "Direct LINE Doctor"}
                  </div>
                  <div className="text-sand-300">
                    {locale === "th" ? "ส่งรูปปรึกษาอาการได้ตลอด" : "Diagnose pests & leaf health"}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-wrap items-center gap-3">
              <Link
                href="/garden"
                className="px-6 py-3.5 rounded-xl bg-gold-400 hover:bg-gold-500 text-forest-950 font-bold text-sm shadow-gold transition flex items-center gap-2 min-h-[48px]"
              >
                <Sprout className="w-4 h-4" />
                <span>{locale === "th" ? "เริ่มต้นสวนของฉัน" : "Start My Garden"}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/search"
                className="px-6 py-3.5 rounded-xl bg-forest-800 hover:bg-forest-700 text-sand-100 font-semibold text-sm border border-forest-700 transition min-h-[48px] flex items-center justify-center"
              >
                <span>{locale === "th" ? "ค้นหาพันธุ์ไม้ทั้งหมด" : "Browse All Species"}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
