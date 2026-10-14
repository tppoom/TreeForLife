"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Sun,
  ShieldCheck,
  Sparkles,
  Wind,
  Laptop,
  ArrowRight,
  Moon,
  ChevronRight,
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";

const PLACEHOLDERS_TH = [
  "มอนสเตอร่า",
  "ต้นไม้ห้องแอร์",
  "ปลอดภัยกับแมว",
  "ยางอินเดีย",
  "กวักมรกต",
  "ลิ้นมังกรฟอกอากาศ",
];

const PLACEHOLDERS_EN = [
  "Monstera deliciosa",
  "Air-conditioned room plants",
  "Pet-safe indoor greens",
  "Rubber tree",
  "ZZ plant",
  "Snake plant",
];

export function HomeHero() {
  const router = useRouter();
  const { t, locale } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  // Rotate seasonal search placeholder
  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS_TH.length);
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  const currentPlaceholder =
    locale === "th"
      ? `เช่น ${PLACEHOLDERS_TH[placeholderIndex]}...`
      : `e.g. ${PLACEHOLDERS_EN[placeholderIndex]}...`;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    } else {
      router.push("/search");
    }
  };

  const categoryShortcuts = [
    {
      id: "air-con",
      label: locale === "th" ? "ต้นไม้ห้องแอร์" : "Air-Con Plants",
      href: "/collections/air-con-plants",
      icon: Wind,
      color: "from-sky-500/10 to-cyan-500/20 text-sky-700 dark:text-sky-300",
      border: "border-sky-200/80 dark:border-sky-900/60",
    },
    {
      id: "sun",
      label: locale === "th" ? "ต้นไม้ทนแดด" : "Full Sun",
      href: "/collections/full-sun-plants",
      icon: Sun,
      color: "from-gold-400/10 to-amber-500/20 text-amber-700 dark:text-gold-300",
      border: "border-gold-200/80 dark:border-gold-900/60",
    },
    {
      id: "pet",
      label: locale === "th" ? "ปลอดภัยกับสัตว์เลี้ยง" : "Pet Safe",
      href: "/collections/pet-safe-plants",
      icon: ShieldCheck,
      color: "from-blue-500/10 to-teal-500/20 text-teal-700 dark:text-teal-300",
      border: "border-teal-200/80 dark:border-teal-900/60",
    },
    {
      id: "beginner",
      label: locale === "th" ? "มือใหม่เลี้ยงง่าย" : "Beginner",
      href: "/collections/beginner-plants",
      icon: Sparkles,
      color: "from-purple-500/10 to-pink-500/20 text-purple-700 dark:text-purple-300",
      border: "border-purple-200/80 dark:border-purple-900/60",
    },
    {
      id: "low-light",
      label: locale === "th" ? "ต้นไม้แสงน้อย" : "Low Light",
      href: "/collections/low-light-plants",
      icon: Moon,
      color: "from-emerald-500/10 to-forest-500/20 text-forest-700 dark:text-emerald-400",
      border: "border-forest-200/80 dark:border-forest-800",
    },
    {
      id: "desk",
      label: locale === "th" ? "ต้นเล็กวางโต๊ะ" : "Desk Plants",
      href: "/collections/desk-plants",
      icon: Laptop,
      color: "from-orange-500/10 to-amber-500/20 text-orange-700 dark:text-orange-300",
      border: "border-orange-200/80 dark:border-orange-900/60",
    },
  ];

  return (
    <section className="relative pt-12 sm:pt-20 pb-12 sm:pb-16 overflow-hidden">
      {/* Background Decorative Gradient Blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 pointer-events-none opacity-40 dark:opacity-20 blur-3xl -z-10 bg-gradient-to-b from-forest-200 via-sand-200 to-transparent dark:from-forest-800 dark:via-forest-900 dark:to-transparent" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 sm:space-y-8">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-forest-100/80 dark:bg-forest-900/80 border border-forest-200 dark:border-forest-700/80 text-xs font-semibold text-forest-800 dark:text-forest-200 shadow-sm animate-in fade-in slide-in-from-top-3">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{locale === "th" ? "ปรับสูตรการดูแลตาม 3 ฤดูกาลไทย" : "Tailored for Thailand's 3 Climate Seasons"}</span>
        </div>

        {/* Heading */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-forest-950 dark:text-sand-50 leading-[1.15]">
          {locale === "th" ? (
            <>
              ค้นพบต้นไม้ที่ชอบ <br className="hidden sm:inline" />
              พร้อมตารางดูแลที่ <span className="text-forest-600 dark:text-forest-400">เข้าใจสภาพอากาศไทย</span>
            </>
          ) : (
            <>
              Find Your Perfect Plants <br className="hidden sm:inline" />
              With <span className="text-forest-600 dark:text-forest-400">Intelligent Thai Climate Care</span>
            </>
          )}
        </h1>

        {/* Subheading */}
        <p className="max-w-2xl mx-auto text-sm sm:text-base text-sand-700 dark:text-sand-300 leading-relaxed font-normal">
          {locale === "th"
            ? "ร้านต้นไม้คัดฟอร์มสวย เพาะเลี้ยงในสภาพแวดล้อมจริงของกรุงเทพฯ ไม่ต้องเดาเรื่องรดน้ำอีกต่อไป ด้วยระบบคำนวณรอบน้ำตามกระถางและฤดูกาล"
            : "Boutique curated plants tested for Bangkok weather. Never guess watering again with adaptive schedules calibrated by pot material and microclimate."}
        </p>

        {/* Hero Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="max-w-2xl mx-auto relative group mt-4 sm:mt-6"
          role="search"
        >
          <div className="relative flex items-center bg-white dark:bg-forest-900/90 rounded-2xl shadow-elevated border border-sand-200 dark:border-forest-700/80 p-2 sm:p-2.5 transition-all focus-within:ring-2 focus-within:ring-forest-500 focus-within:border-forest-500">
            <div className="pl-3 pr-2 text-sand-400 dark:text-sand-500">
              <Search className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={currentPlaceholder}
              className="w-full bg-transparent text-sm sm:text-base text-forest-950 dark:text-sand-50 placeholder:text-sand-400 dark:placeholder:text-sand-500 focus:outline-none pr-3 min-h-[44px]"
              aria-label={t("search.placeholder")}
            />
            <button
              type="submit"
              className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-forest-700 hover:bg-forest-800 text-sand-50 font-semibold text-xs sm:text-sm tracking-wide transition shadow-soft flex items-center gap-1.5 shrink-0 min-h-[44px]"
            >
              <span>{t("search.search_button")}</span>
              <ArrowRight className="w-4 h-4 hidden sm:inline" />
            </button>
          </div>
        </form>

        {/* Curated Category Shortcuts linking to /collections/[slug] */}
        <div className="pt-4">
          <div className="flex items-center justify-between max-w-4xl mx-auto mb-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-sand-600 dark:text-sand-400">
              {locale === "th" ? "คอลเลกชันแนะนำยอดนิยม" : "Popular Curated Collections"}
            </div>
            <Link
              href="/collections"
              className="text-xs font-semibold text-forest-700 dark:text-forest-400 hover:text-forest-950 dark:hover:text-sand-100 flex items-center gap-1 transition-colors"
            >
              <span>{locale === "th" ? "ดูทั้งหมด 8 คอลเลกชัน" : "View all 8 collections"}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3 max-w-4xl mx-auto">
            {categoryShortcuts.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.id}
                  href={cat.href}
                  className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl sm:rounded-2xl border bg-white/70 dark:bg-forest-900/60 backdrop-blur-sm shadow-soft hover:shadow-card hover:-translate-y-0.5 transition-all group ${cat.border}`}
                >
                  <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <span className="text-xs font-medium text-forest-900 dark:text-sand-100 text-center leading-tight">
                    {cat.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
