"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MessageCircle,
  Camera,
  Sun,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Wind,
  Sprout,
  Droplets,
  Moon,
  Laptop,
  Building2,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";
import { InquiryModal } from "@/components/ui/InquiryModal";
import type { Collection } from "@/lib/collections";
import type { SpeciesItem } from "@/lib/services/speciesService";
import { getLocalizedSpeciesData } from "@/lib/i18n/species-en";

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

interface CollectionDetailClientProps {
  collection: Collection;
  species: SpeciesItem[];
}

export function CollectionDetailClient({ collection, species }: CollectionDetailClientProps) {
  const { t, locale } = useApp();
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [openFaqs, setOpenFaqs] = useState<Record<number, boolean>>({ 0: true });

  const toggleFaq = (index: number) => {
    setOpenFaqs((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const Icon = ICON_MAP[collection.icon] || Sparkles;

  return (
    <div className="min-h-screen bg-sand-50 dark:bg-forest-950 text-forest-950 dark:text-sand-50 pb-28">
      {/* Breadcrumb Navigation */}
      <div className="border-b border-sand-200 dark:border-forest-800 bg-sand-100/50 dark:bg-forest-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-xs text-sand-600 dark:text-sand-400" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-forest-700 dark:hover:text-sand-200 transition-colors">
              หน้าแรก
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/collections" className="hover:text-forest-700 dark:hover:text-sand-200 transition-colors">
              คอลเลกชัน
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-forest-900 dark:text-sand-100 font-semibold" aria-current="page">
              {locale === "th" ? collection.titleTh : collection.titleEn}
            </span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-10 sm:pt-14 pb-12 sm:pb-16 border-b border-sand-200 dark:border-forest-800 bg-gradient-to-b from-forest-50/50 via-sand-50 to-sand-50 dark:from-forest-900/60 dark:via-forest-950 dark:to-forest-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            {/* Top Badges */}
            <div className="flex flex-wrap items-center gap-2.5 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-forest-100 dark:bg-forest-800 text-forest-800 dark:text-forest-200 border border-forest-200 dark:border-forest-700">
                <Icon className="w-3.5 h-3.5 text-forest-600 dark:text-forest-400" />
                <span>{collection.badge}</span>
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-sand-200/80 dark:bg-forest-900 text-sand-700 dark:text-sand-300">
                {species.length} พันธุ์ไม้คัดสรร
              </span>
            </div>

            {/* Botanical Heading */}
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-forest-950 dark:text-sand-50 mb-2">
              {locale === "th" ? collection.titleTh : collection.titleEn}
            </h1>
            <p className="font-sans text-sm sm:text-base text-sand-600 dark:text-sand-400 italic mb-6">
              {locale === "th" ? collection.titleEn : collection.titleTh}
            </p>

            {/* Editorial Intro in Nursery Store Voice */}
            <div className="space-y-3 p-5 sm:p-6 rounded-2xl bg-white/80 dark:bg-forest-900/70 border border-sand-200 dark:border-forest-800 shadow-soft">
              <p className="text-sm sm:text-base text-forest-900 dark:text-sand-100 leading-relaxed font-serif">
                "{collection.introTh}"
              </p>
              {collection.introEn && (
                <p className="text-xs sm:text-sm text-sand-500 dark:text-sand-400 font-sans italic leading-relaxed pt-2 border-t border-sand-100 dark:border-forest-800/80">
                  {collection.introEn}
                </p>
              )}
            </div>

            {/* Highlights Chips */}
            <div className="flex flex-wrap items-center gap-3 mt-6 text-xs text-forest-700 dark:text-sand-300">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>คัดพิเศษจากเรือนเพาะชำ</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>ตารางรดน้ำเฉพาะ 3 ฤดูกาลไทย</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>ปรึกษาผู้เชี่ยวชาญฟรีตลอดอายุต้น</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Species Catalog Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-sand-500 dark:text-sand-400">
              พืชในคอลเลกชัน ({species.length} ต้น)
            </h2>
            <p className="font-serif text-xl sm:text-2xl font-bold text-forest-950 dark:text-sand-50">
              เรียงตามความพร้อมส่ง
            </p>
          </div>

          <button
            type="button"
            onClick={() => setInquiryModalOpen(true)}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-forest-100 dark:bg-forest-900 hover:bg-forest-200 dark:hover:bg-forest-800 text-forest-800 dark:text-sand-200 text-xs font-semibold border border-forest-200 dark:border-forest-700 transition min-h-[44px]"
          >
            <MessageCircle className="w-4 h-4 text-forest-600 dark:text-forest-400" />
            <span>สอบถามพันธุ์ไม้อื่นๆ</span>
          </button>
        </div>

        {/* Species Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {species.map((plant) => (
            <Link
              key={plant.id}
              href={`/plants/${plant.slug}`}
              className="group flex flex-col rounded-2xl border border-sand-200 dark:border-forest-800 bg-white dark:bg-forest-900/80 shadow-soft hover:shadow-card hover:-translate-y-1 transition-all overflow-hidden"
            >
              {/* Image Box */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-sand-100 dark:bg-forest-950">
                {plant.primaryImage && (
                  <img
                    src={plant.primaryImage}
                    alt={locale === "th" ? (plant.imageAlt || plant.nameTh) : (plant.nameEn || plant.imageAlt || plant.nameTh)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                )}

                {/* Stock Status Badge */}
                <div className="absolute top-2.5 left-2.5">
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

                {/* Taken at Shop Badge */}
                <div className="absolute bottom-2.5 right-2.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-medium bg-forest-950/75 text-sand-100 backdrop-blur-md">
                    <Camera className="w-3 h-3 text-gold-300" />
                    <span>{t("care.taken_at_shop")}</span>
                  </span>
                </div>
              </div>

              {/* Card Content */}
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
                    {getLocalizedSpeciesData(plant.slug, locale, { summary: plant.summary }).summary}
                  </p>
                </div>

                {/* Quick Specs Footer */}
                <div className="mt-4 pt-3 border-t border-sand-100 dark:border-forest-800/80 flex items-center justify-between text-[11px] text-sand-600 dark:text-sand-400">
                  <div className="flex items-center gap-1.5">
                    <Sun className="w-3.5 h-3.5 text-gold-500" />
                    <span className="capitalize">{t(`filters.light_${plant.light}`)}</span>
                  </div>
                  <span className="text-forest-600 dark:text-forest-400 font-semibold group-hover:underline">
                    ดูวิธีดูแล →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Botanical FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 pt-12 border-t border-sand-200 dark:border-forest-800">
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sand-200/60 dark:bg-forest-900 text-forest-800 dark:text-sand-200 mb-3">
            <HelpCircle className="w-3.5 h-3.5 text-forest-600 dark:text-forest-400" />
            <span>คำถามที่พบบ่อย (FAQs)</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-forest-950 dark:text-sand-50">
            ข้อแนะนำการดูแลสำหรับคอลเลกชันนี้
          </h2>
          <p className="text-xs sm:text-sm text-forest-800/80 dark:text-sand-400 mt-2">
            ตอบคำถามยอดนิยมจากลูกค้า เพื่อให้ต้นไม้ของคุณเติบโตแข็งแรงที่สุด
          </p>
        </div>

        <div className="space-y-4">
          {collection.faqs.map((faq, index) => {
            const isOpen = Boolean(openFaqs[index]);
            return (
              <div
                key={index}
                className="rounded-2xl border border-sand-200 dark:border-forest-800 bg-white dark:bg-forest-900/80 overflow-hidden shadow-soft transition"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="w-full px-5 sm:px-6 py-4 sm:py-5 text-left flex items-center justify-between gap-4 font-serif font-bold text-base sm:text-lg text-forest-950 dark:text-sand-50 hover:text-forest-600 dark:hover:text-forest-400 transition-colors min-h-[44px]"
                  aria-expanded={isOpen}
                >
                  <span>{locale === "th" ? faq.qTh : faq.qEn}</span>
                  <div className="w-8 h-8 rounded-full bg-sand-100 dark:bg-forest-800 text-forest-700 dark:text-sand-300 flex items-center justify-center shrink-0">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>
                {isOpen && (
                  <div className="px-5 sm:px-6 pb-5 pt-1 text-xs sm:text-sm text-forest-800/90 dark:text-sand-300 leading-relaxed border-t border-sand-100 dark:border-forest-800/60">
                    <p className="mb-2">{locale === "th" ? faq.aTh : faq.aEn}</p>
                    <p className="text-xs text-sand-500 dark:text-sand-400 font-sans italic">
                      {locale === "th" ? faq.aEn : faq.aTh}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Consultation Action Banner before footer */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="rounded-3xl border border-forest-200 dark:border-forest-800 bg-gradient-to-r from-forest-50 via-sand-50 to-emerald-50 dark:from-forest-900/90 dark:via-forest-950 dark:to-forest-900/70 p-6 sm:p-8 shadow-soft flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-serif text-lg sm:text-xl font-bold text-forest-950 dark:text-sand-50">
              ไม่แน่ใจว่าต้นไหนเหมาะกับห้องของคุณที่สุด?
            </h3>
            <p className="text-xs sm:text-sm text-forest-800/80 dark:text-sand-300">
              ส่งรูปพื้นที่ของคุณมาให้เราประเมินทิศทางแสงฟรี พร้อมให้คำแนะนำก่อนตัดสินใจ
            </p>
          </div>
          <button
            type="button"
            onClick={() => setInquiryModalOpen(true)}
            className="px-6 py-3 rounded-xl bg-[#06C755] hover:bg-[#05b34c] text-white font-semibold text-xs sm:text-sm shadow-soft transition flex items-center gap-2 shrink-0 min-h-[44px]"
          >
            <MessageCircle className="w-4 h-4" />
            <span>ปรึกษาผู้เชี่ยวชาญ LINE OA</span>
          </button>
        </div>
      </section>

      {/* Sticky Bottom Action Bar with Floating LINE OA Consultation Button */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-sand-200 dark:border-forest-800 bg-sand-50/95 dark:bg-forest-950/95 backdrop-blur-md shadow-elevated">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="hidden sm:flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-forest-100 dark:bg-forest-900 text-forest-700 dark:text-forest-300 flex items-center justify-center shrink-0 border border-forest-200 dark:border-forest-700">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <span className="font-serif font-bold text-sm text-forest-950 dark:text-sand-50 line-clamp-1">
                  {collection.titleTh}
                </span>
                <span className="text-xs text-sand-500 dark:text-sand-400 line-clamp-1">
                  คอลเลกชันแนะนำ · {species.length} พันธุ์ไม้
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setInquiryModalOpen(true)}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#06C755] hover:bg-[#05b34c] text-white font-semibold text-xs sm:text-sm shadow-soft transition flex items-center justify-center gap-2 min-h-[44px]"
              >
                <MessageCircle className="w-4 h-4" />
                <span>ปรึกษาเรื่อง {collection.titleTh} ผ่าน LINE OA</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* LINE OA Inquiry Consultation Modal with source_page pre-populated */}
      <InquiryModal
        isOpen={inquiryModalOpen}
        onClose={() => setInquiryModalOpen(false)}
        defaultIntent="care_help"
        sourcePage={`/collections/${collection.slug}`}
        initialQuery={`สนใจพันธุ์ไม้ในคอลเลกชัน ${collection.titleTh} (${collection.slug}) รบกวนขอคำแนะนำสำหรับพื้นที่ของผม/ฉันครับ`}
      />
    </div>
  );
}
