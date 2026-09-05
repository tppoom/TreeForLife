"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useApp } from "@/lib/context/AppContext";
import {
  Search,
  Sparkles,
  ArrowRight,
  Sun,
  Home,
  ShieldCheck,
  Award,
  Wind,
  Layers,
  CalendarCheck,
  CheckCircle2,
} from "lucide-react";

interface InStockSpeciesItem {
  id: string;
  slug: string;
  nameTh: string;
  nameEn: string;
  nameSci: string;
  family: string;
  summary: string;
  difficulty: number;
  stockStatus: string;
  primaryImage: string;
  imageAlt: string;
}

interface HomeClientProps {
  inStockSpecies: InStockSpeciesItem[];
}

export function HomeClient({ inStockSpecies }: HomeClientProps) {
  const { t, locale } = useApp();

  const quickShortcuts = [
    { label: t.home.indoor, href: "/search?placement=indoor", icon: <Home className="w-4 h-4" /> },
    { label: t.home.fullSun, href: "/search?light=full_sun", icon: <Sun className="w-4 h-4" /> },
    { label: t.home.petSafe, href: "/search?pet=safe", icon: <ShieldCheck className="w-4 h-4" /> },
    { label: t.home.beginner, href: "/search?diff=1", icon: <Award className="w-4 h-4" /> },
    { label: t.home.airPurify, href: "/search?q=ฟอกอากาศ", icon: <Wind className="w-4 h-4" /> },
    { label: t.home.deskPlant, href: "/search?size=xs", icon: <Layers className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-sand-200/70 dark:border-forest-900/60 bg-gradient-to-b from-sand-100/60 via-sand-50 to-sand-50 dark:from-[#08150f] dark:via-[#0b1a13] dark:to-[#0b1a13] transition-colors">
        <div className="absolute inset-0 bg-[radial-gradient(#d5c3aa_1px,transparent_1px)] dark:bg-[radial-gradient(#204432_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-forest-900/5 dark:bg-forest-900/40 border border-forest-900/15 dark:border-forest-700/50 text-forest-900 dark:text-gold-300 text-xs font-medium tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-gold-500" />
            <span>{t.home.badge}</span>
          </div>

          {/* Editorial Headline */}
          <div className="space-y-4">
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-forest-950 dark:text-sand-50 leading-[1.15]">
              {t.home.heroTitle1} <br className="hidden sm:inline" />
              <span className="italic font-normal text-forest-800 dark:text-gold-400">
                {t.home.heroTitle2}
              </span>{" "}
              {t.home.heroTitle3}
            </h1>
            <p className="max-w-2xl mx-auto text-base sm:text-lg text-stone-600 dark:text-sand-300/80 leading-relaxed font-light">
              {t.home.heroDesc}
            </p>
          </div>

          {/* Prominent Search Bar */}
          <div className="max-w-2xl mx-auto">
            <form
              action="/search"
              method="GET"
              className="relative flex items-center bg-white dark:bg-forest-950 rounded-2xl p-2 shadow-card border border-sand-300 dark:border-forest-800 hover:border-forest-600/40 dark:hover:border-gold-500/50 focus-within:border-forest-700 dark:focus-within:border-gold-500 focus-within:ring-4 focus-within:ring-forest-800/10 dark:focus-within:ring-gold-500/10 transition-all"
            >
              <div className="pl-4 pr-2 text-stone-400 dark:text-stone-500">
                <Search className="w-5 h-5 text-forest-800 dark:text-gold-400" />
              </div>
              <input
                type="text"
                name="q"
                placeholder={t.home.searchPlaceholder}
                className="w-full py-2.5 text-sm sm:text-base text-stone-800 dark:text-sand-100 placeholder-stone-400 dark:placeholder-stone-500 bg-transparent focus:outline-none"
              />
              <button
                type="submit"
                className="px-5 py-3 rounded-xl bg-forest-900 dark:bg-gold-500 hover:bg-forest-800 dark:hover:bg-gold-400 text-sand-50 dark:text-forest-950 font-medium text-xs sm:text-sm transition-colors shadow-sm shrink-0 flex items-center gap-1.5 cursor-pointer"
              >
                <span>{t.home.searchBtn}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* 6 Quick Shortcuts */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-5">
              <span className="text-xs text-stone-600 dark:text-sand-400 font-medium mr-1">
                {t.home.popularShortcuts}
              </span>
              {quickShortcuts.map((chip) => (
                <Link
                  key={chip.href}
                  href={chip.href}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/80 dark:bg-forest-950/80 hover:bg-white dark:hover:bg-forest-900 text-stone-700 dark:text-sand-200 hover:text-forest-900 dark:hover:text-sand-50 rounded-xl text-xs border border-sand-300 dark:border-forest-800 hover:border-forest-700 dark:hover:border-gold-500 shadow-sm transition-all"
                >
                  <span className="text-forest-700 dark:text-gold-400">{chip.icon}</span>
                  <span>{chip.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* "มีที่ร้านตอนนี้" In-Stock Showcase Row */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-sand-200 dark:border-forest-900 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-forest-700 dark:text-gold-400 font-bold mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{t.home.inStockDesc}</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-medium text-forest-950 dark:text-sand-50">
              {t.home.inStockNow}
            </h2>
          </div>
          <Link
            href="/search?stock=in_stock"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest-900 dark:text-gold-400 hover:text-forest-700 dark:hover:text-gold-300 underline underline-offset-4"
          >
            <span>{t.home.viewAllInStock}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Species Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {inStockSpecies.map((plant) => (
            <Link
              key={plant.id}
              href={`/plants/${plant.slug}`}
              className="group bg-white dark:bg-[#0e2117] rounded-2xl overflow-hidden border border-sand-200 dark:border-forest-800/80 hover:border-forest-700/40 dark:hover:border-gold-500/40 shadow-soft hover:shadow-card card-hover-effect flex flex-col transition-colors"
            >
              {/* Image Container with Luxury Badge */}
              <div className="relative aspect-[4/3] bg-sand-100 dark:bg-forest-950 overflow-hidden">
                <Image
                  src={plant.primaryImage}
                  alt={plant.imageAlt}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
                  <span className="px-2 py-0.5 rounded-full bg-forest-950/80 backdrop-blur-md text-gold-300 text-[10px] font-medium border border-gold-400/30">
                    {t.home.shotInStore}
                  </span>
                </div>
                <div className="absolute bottom-2.5 right-2.5">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-700/90 backdrop-blur-md text-white text-[10px] font-medium shadow-sm">
                    {t.home.inStockBadge}
                  </span>
                </div>
              </div>

              {/* Plant Meta Info */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-forest-700 dark:text-gold-400">
                    {plant.family.split(" ")[0]}
                  </span>
                  <h3 className="font-serif text-base font-semibold text-stone-900 dark:text-sand-50 group-hover:text-forest-800 dark:group-hover:text-gold-300 transition-colors line-clamp-1">
                    {locale === "th" ? plant.nameTh : plant.nameEn}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 italic line-clamp-1 font-serif">
                    {plant.nameSci}
                  </p>
                </div>

                <p className="text-xs text-stone-600 dark:text-sand-300/80 line-clamp-2 leading-relaxed">
                  {plant.summary}
                </p>

                <div className="pt-2 border-t border-sand-100 dark:border-forest-800/80 flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400">
                  <span>{t.home.diffLevel}: {"★".repeat(plant.difficulty)}{"☆".repeat(5 - plant.difficulty)}</span>
                  <span className="text-forest-800 dark:text-gold-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                    {t.home.details} →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Brand Value Props & Philosophy */}
      <section className="bg-sand-100/70 dark:bg-[#07150e]/80 border-y border-sand-200 dark:border-forest-900/80 py-16 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-forest-700 dark:text-gold-400">
              {t.home.whySub}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-medium text-forest-950 dark:text-sand-50">
              {t.home.whyTitle}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-[#0e2117] p-7 rounded-2xl border border-sand-200 dark:border-forest-800/80 shadow-soft space-y-4">
              <div className="w-12 h-12 rounded-xl bg-forest-900 dark:bg-forest-800 text-gold-400 flex items-center justify-center">
                <CalendarCheck className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-medium text-stone-900 dark:text-sand-50">
                {t.home.careEngineTitle}
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-sand-300/80 leading-relaxed">
                {t.home.careEngineDesc}
              </p>
            </div>

            <div className="bg-white dark:bg-[#0e2117] p-7 rounded-2xl border border-sand-200 dark:border-forest-800/80 shadow-soft space-y-4">
              <div className="w-12 h-12 rounded-xl bg-forest-900 dark:bg-forest-800 text-gold-400 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-medium text-stone-900 dark:text-sand-50">
                {t.home.shopNoteTitle}
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-sand-300/80 leading-relaxed">
                {t.home.shopNoteDesc}
              </p>
            </div>

            <div className="bg-white dark:bg-[#0e2117] p-7 rounded-2xl border border-sand-200 dark:border-forest-800/80 shadow-soft space-y-4">
              <div className="w-12 h-12 rounded-xl bg-forest-900 dark:bg-forest-800 text-gold-400 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-medium text-stone-900 dark:text-sand-50">
                {t.home.noCartTitle}
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-sand-300/80 leading-relaxed">
                {t.home.noCartDesc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Start My Garden CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-forest-950 dark:bg-[#071710] text-sand-50 p-8 sm:p-12 md:p-16 border border-forest-800 dark:border-forest-700 shadow-elevated">
          <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-forest-800/40 blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-800/60 border border-forest-700 text-gold-300 text-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.home.ctaBadge}</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-sand-50 leading-tight">
              {t.home.ctaTitle1} <br />
              <span className="text-gold-400 italic">{t.home.ctaTitle2}</span>
            </h2>
            <p className="text-sand-300 text-sm sm:text-base leading-relaxed font-light">
              {t.home.ctaDesc}
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                href="/garden/add"
                className="px-6 py-3.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-forest-950 font-semibold text-sm transition-all shadow-gold flex items-center gap-2"
              >
                <span>{t.home.addFirstPlant}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/search"
                className="px-6 py-3.5 rounded-xl bg-forest-900/80 hover:bg-forest-800 text-sand-100 font-medium text-sm border border-forest-700 transition-colors"
              >
                <span>{t.home.browseAll}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
