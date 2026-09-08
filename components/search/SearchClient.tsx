"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Search,
  SlidersHorizontal,
  X,
  Camera,
  Sun,
  Droplets,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  MessageCircle,
  RotateCcw,
  Check,
  HelpCircle,
  Sprout,
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";
import { InquiryModal } from "@/components/ui/InquiryModal";
import type { getAllSpecies } from "@/lib/services/speciesService";

export interface FilterState {
  q: string;
  light: string;
  water: string;
  placement: string;
  difficulty: string;
  pet: string;
  size: string;
  stock: string;
  sort: string;
}

interface SearchClientProps {
  initialSpecies: Awaited<ReturnType<typeof getAllSpecies>>;
  initialFilters: FilterState;
}

export function SearchClient({ initialSpecies, initialFilters }: SearchClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { t, locale } = useApp();
  const [isPending, startTransition] = useTransition();

  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [searchInput, setSearchInput] = useState(initialFilters.q);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);

  // Sync state if props change from URL navigation
  useEffect(() => {
    setFilters(initialFilters);
    setSearchInput(initialFilters.q);
  }, [initialFilters]);

  // Push filter changes to URL
  const applyFilters = (newFilters: FilterState) => {
    setFilters(newFilters);
    const params = new URLSearchParams();

    if (newFilters.q.trim()) params.set("q", newFilters.q.trim());
    if (newFilters.light && newFilters.light !== "all") params.set("light", newFilters.light);
    if (newFilters.water && newFilters.water !== "all") params.set("water", newFilters.water);
    if (newFilters.placement && newFilters.placement !== "all") params.set("placement", newFilters.placement);
    if (newFilters.difficulty && newFilters.difficulty !== "all") params.set("difficulty", newFilters.difficulty);
    if (newFilters.pet && newFilters.pet !== "all") params.set("pet", newFilters.pet);
    if (newFilters.size && newFilters.size !== "all") params.set("size", newFilters.size);
    if (newFilters.stock && newFilters.stock !== "all") params.set("stock", newFilters.stock);
    if (newFilters.sort && newFilters.sort !== "relevance") params.set("sort", newFilters.sort);

    const queryString = params.toString();
    const target = queryString ? `${pathname}?${queryString}` : pathname;

    startTransition(() => {
      router.push(target, { scroll: false });
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters({ ...filters, q: searchInput });
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const updated = { ...filters, [key]: value };
    applyFilters(updated);
  };

  const clearAllFilters = () => {
    setSearchInput("");
    applyFilters({
      q: "",
      light: "all",
      water: "all",
      placement: "all",
      difficulty: "all",
      pet: "all",
      size: "all",
      stock: "all",
      sort: "relevance",
    });
  };

  // Active filter count
  const activeFiltersCount = Object.entries(filters).filter(([k, v]) => {
    if (k === "sort") return false;
    if (k === "q") return Boolean(v.trim());
    return v && v !== "all";
  }).length;

  // Filter definitions
  const filterSections = [
    {
      id: "light" as const,
      label: t("filters.light"),
      options: [
        { value: "all", label: locale === "th" ? "ทุกระดับแสง" : "All Light" },
        { value: "full_sun", label: t("filters.light_full_sun") },
        { value: "partial", label: t("filters.light_partial") },
        { value: "shade", label: t("filters.light_shade") },
        { value: "indoor_bright", label: t("filters.light_indoor_bright") },
        { value: "low_light", label: t("filters.light_low_light") },
      ],
    },
    {
      id: "water" as const,
      label: t("filters.water"),
      options: [
        { value: "all", label: locale === "th" ? "ทุกระดับน้ำ" : "All Water" },
        { value: "low", label: t("filters.water_low") },
        { value: "medium", label: t("filters.water_medium") },
        { value: "high", label: t("filters.water_high") },
      ],
    },
    {
      id: "placement" as const,
      label: t("filters.placement"),
      options: [
        { value: "all", label: locale === "th" ? "ทุกตำแหน่ง" : "All Placements" },
        { value: "indoor", label: t("filters.placement_indoor") },
        { value: "outdoor", label: t("filters.placement_outdoor") },
        { value: "balcony", label: t("filters.placement_balcony") },
        { value: "bathroom", label: t("filters.placement_bathroom") },
      ],
    },
    {
      id: "difficulty" as const,
      label: t("filters.difficulty"),
      options: [
        { value: "all", label: locale === "th" ? "ทุกระดับความยาก" : "All Difficulties" },
        { value: "1", label: t("filters.difficulty_1") },
        { value: "2", label: t("filters.difficulty_2") },
        { value: "3", label: t("filters.difficulty_3") },
        { value: "4", label: t("filters.difficulty_4") },
        { value: "5", label: t("filters.difficulty_5") },
      ],
    },
    {
      id: "pet" as const,
      label: t("filters.pet"),
      options: [
        { value: "all", label: locale === "th" ? "ทั้งหมด" : "All" },
        { value: "safe", label: t("filters.pet_safe") },
        { value: "toxic", label: t("filters.pet_toxic") },
      ],
    },
    {
      id: "size" as const,
      label: t("filters.size"),
      options: [
        { value: "all", label: locale === "th" ? "ทุกขนาด" : "All Sizes" },
        { value: "xs", label: t("filters.size_xs") },
        { value: "sm", label: t("filters.size_sm") },
        { value: "md", label: t("filters.size_md") },
        { value: "lg", label: t("filters.size_lg") },
        { value: "xl", label: t("filters.size_xl") },
      ],
    },
    {
      id: "stock" as const,
      label: t("filters.status"),
      options: [
        { value: "all", label: locale === "th" ? "ทุกสถานะ" : "All Stock" },
        { value: "in_stock", label: t("filters.stock_in_stock") },
        { value: "made_to_order", label: t("filters.stock_made_to_order") },
        { value: "seasonal", label: t("filters.stock_seasonal") },
      ],
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Top Search & Controls Header */}
      <div className="space-y-6 mb-8">
        <div>
          <h1 className="text-2xl sm:text-4xl font-serif font-bold text-forest-950 dark:text-sand-50">
            {t("nav.catalog")} & {t("search.filters")}
          </h1>
          <p className="text-xs sm:text-sm text-sand-600 dark:text-sand-400 mt-1">
            {locale === "th"
              ? "ค้นหาพันธุ์ไม้ตามลักษณะ ความต้องการแสง รอบน้ำ หรือตำแหน่งที่วาง"
              : "Explore boutique species filtered by light, watering cadence, pet safety, and stock."}
          </p>
        </div>

        {/* Search Input Bar */}
        <form onSubmit={handleSearchSubmit} className="relative flex items-center max-w-3xl">
          <div className="relative w-full flex items-center bg-white dark:bg-forest-900 rounded-2xl border border-sand-200 dark:border-forest-700 shadow-soft p-1.5 focus-within:ring-2 focus-within:ring-forest-500 focus-within:border-forest-500 transition">
            <div className="pl-3 pr-2 text-sand-400 dark:text-sand-500">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t("search.placeholder")}
              className="w-full bg-transparent text-sm sm:text-base text-forest-950 dark:text-sand-50 placeholder:text-sand-400 dark:placeholder:text-sand-500 focus:outline-none pr-3 min-h-[44px]"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  handleFilterChange("q", "");
                }}
                className="p-1.5 text-sand-400 hover:text-forest-900 dark:hover:text-sand-100 mr-1"
                aria-label="Clear search input"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-forest-700 hover:bg-forest-800 text-sand-50 font-semibold text-xs sm:text-sm shadow-soft transition min-h-[44px] shrink-0"
            >
              {t("search.search_button")}
            </button>
          </div>
        </form>

        {/* Filter Controls Toolbar: Result Count, Mobile Filter Button, Sort Dropdown */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-b border-sand-200 dark:border-forest-800 pb-4">
          <div className="flex items-center gap-3">
            {/* Mobile Filter Toggle Button */}
            <button
              type="button"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl border border-sand-300 dark:border-forest-700 bg-white dark:bg-forest-900 text-xs font-semibold text-forest-900 dark:text-sand-100 shadow-soft min-h-[44px]"
            >
              <SlidersHorizontal className="w-4 h-4 text-forest-600 dark:text-forest-400" />
              <span>{t("search.filters")}</span>
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-forest-600 text-white text-[10px] flex items-center justify-center font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Results Count */}
            <div className="text-xs sm:text-sm font-medium text-sand-700 dark:text-sand-300 flex items-center gap-2">
              <span>{t("search.results_count", { count: initialSpecies.length })}</span>
              {isPending && (
                <span className="text-xs text-forest-600 dark:text-forest-400 animate-pulse">
                  {locale === "th" ? "(กำลังอัปเดต...)" : "(Updating...)"}
                </span>
              )}
            </div>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-sand-500 dark:text-sand-400 hidden sm:inline">
              {t("search.sort_by")}:
            </span>
            <select
              value={filters.sort}
              onChange={(e) => handleFilterChange("sort", e.target.value)}
              className="px-3 py-2 rounded-xl border border-sand-300 dark:border-forest-700 bg-white dark:bg-forest-900 text-xs font-medium text-forest-950 dark:text-sand-50 focus:outline-none focus:ring-2 focus:ring-forest-500 min-h-[44px]"
            >
              <option value="relevance">{t("search.sort_relevance")}</option>
              <option value="in_stock_first">{t("search.sort_in_stock")}</option>
              <option value="easiest_first">{t("search.sort_easiest")}</option>
              <option value="name">
                {locale === "th" ? "ชื่อพันธุ์ไม้ (ก-ฮ)" : "Botanical Name (A-Z)"}
              </option>
            </select>
          </div>
        </div>

        {/* Active Filter Badges Bar */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1 animate-in fade-in">
            <span className="text-xs text-sand-500 dark:text-sand-400 mr-1">
              {locale === "th" ? "ตัวกรองที่เลือก:" : "Active filters:"}
            </span>

            {filters.q && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-forest-100 dark:bg-forest-900 text-forest-900 dark:text-sand-100 border border-forest-200 dark:border-forest-800">
                <span>&quot;{filters.q}&quot;</span>
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    handleFilterChange("q", "");
                  }}
                  className="hover:text-red-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filterSections.map((sec) => {
              const currentVal = filters[sec.id];
              if (!currentVal || currentVal === "all") return null;
              const opt = sec.options.find((o) => o.value === currentVal);
              return (
                <span
                  key={sec.id}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-forest-100 dark:bg-forest-900 text-forest-900 dark:text-sand-100 border border-forest-200 dark:border-forest-800"
                >
                  <span className="text-sand-500 dark:text-sand-400">{sec.label}:</span>
                  <span>{opt?.label || currentVal}</span>
                  <button
                    type="button"
                    onClick={() => handleFilterChange(sec.id, "all")}
                    className="hover:text-red-500 ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              );
            })}

            <button
              type="button"
              onClick={clearAllFilters}
              className="text-xs font-semibold text-sand-500 hover:text-red-600 dark:text-sand-400 dark:hover:text-red-400 underline ml-2 min-h-[44px] flex items-center"
            >
              {t("search.clear_filters")}
            </button>
          </div>
        )}
      </div>

      {/* Main Content Layout: Left Filters Sidebar + Right Plants Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar Filter Chips (Desktop + Mobile Drawer) */}
        <aside
          className={`lg:block ${
            showMobileFilters
              ? "fixed inset-0 z-50 bg-white dark:bg-forest-950 p-6 overflow-y-auto"
              : "hidden"
          }`}
        >
          {showMobileFilters && (
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-sand-200 dark:border-forest-800 lg:hidden">
              <h3 className="font-serif font-bold text-lg text-forest-950 dark:text-sand-50">
                {t("search.filters")}
              </h3>
              <button
                type="button"
                onClick={() => setShowMobileFilters(false)}
                className="p-2 rounded-lg text-sand-500 hover:bg-sand-100 dark:hover:bg-forest-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-sand-500 dark:text-sand-400">
                {t("search.filters")}
              </h2>
              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-xs text-forest-600 dark:text-forest-400 hover:underline"
                >
                  {t("search.clear_filters")}
                </button>
              )}
            </div>

            {/* Filter Sections */}
            {filterSections.map((section) => {
              const currentValue = filters[section.id];
              return (
                <div key={section.id} className="space-y-2">
                  <span className="text-xs font-semibold text-forest-950 dark:text-sand-100">
                    {section.label}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {section.options.map((opt) => {
                      const isSelected = currentValue === opt.value || (!currentValue && opt.value === "all");
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleFilterChange(section.id, opt.value)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition border min-h-[36px] ${
                            isSelected
                              ? "bg-forest-700 text-sand-50 border-forest-700 font-semibold shadow-xs"
                              : "bg-white/70 dark:bg-forest-900/60 text-forest-800 dark:text-sand-200 border-sand-200 dark:border-forest-800 hover:border-sand-400"
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {showMobileFilters && (
              <div className="pt-6 border-t border-sand-200 dark:border-forest-800 lg:hidden">
                <button
                  type="button"
                  onClick={() => setShowMobileFilters(false)}
                  className="w-full py-3 rounded-xl bg-forest-700 text-sand-50 font-bold text-sm shadow-soft"
                >
                  {locale === "th" ? "ดูผลการค้นหา" : "View Results"}
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* Right Plants Results Grid */}
        <div className="lg:col-span-3">
          {initialSpecies.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {initialSpecies.map((plant) => (
                <Link
                  key={plant.id}
                  href={`/plants/${plant.slug}`}
                  className="group flex flex-col rounded-2xl border border-sand-200 dark:border-forest-800 bg-white dark:bg-forest-900/80 shadow-soft hover:shadow-card hover:-translate-y-1 transition-all overflow-hidden"
                >
                  {/* Plant Image & Badges */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-sand-100 dark:bg-forest-950">
                    <img
                      src={plant.primaryImage}
                      alt={plant.imageAlt || plant.nameTh}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />

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
                        <span>ถ่ายที่ร้าน</span>
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-baseline justify-between gap-2 mb-1">
                        <h3 className="font-serif font-bold text-base sm:text-lg text-forest-950 dark:text-sand-50 group-hover:text-forest-600 dark:group-hover:text-forest-400 transition-colors line-clamp-1">
                          {plant.nameTh}
                        </h3>
                        <span className="text-[11px] font-medium text-sand-600 dark:text-sand-400 shrink-0">
                          {plant.difficulty}/5 ★
                        </span>
                      </div>
                      <p className="text-xs text-sand-500 dark:text-sand-400 font-sans italic line-clamp-1 mb-2">
                        {plant.nameEn}
                      </p>
                      <p className="text-xs text-forest-700 dark:text-sand-300 line-clamp-2 leading-relaxed">
                        {plant.summary}
                      </p>
                    </div>

                    {/* Quick Specs Pill Footer */}
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
              ))}
            </div>
          ) : (
            /* Zero-results State */
            <div className="rounded-3xl border border-dashed border-sand-300 dark:border-forest-800 bg-white/60 dark:bg-forest-900/40 p-8 sm:p-12 text-center space-y-5 animate-in fade-in">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-sand-100 dark:bg-forest-800/80 text-forest-700 dark:text-sand-300 flex items-center justify-center">
                <HelpCircle className="w-8 h-8" />
              </div>

              <div className="space-y-1.5 max-w-md mx-auto">
                <h3 className="font-serif font-bold text-xl sm:text-2xl text-forest-950 dark:text-sand-50">
                  {t("search.no_results_title")}
                </h3>
                <p className="text-xs sm:text-sm text-sand-600 dark:text-sand-300 leading-relaxed">
                  {t("search.no_results_desc")}
                </p>
                {filters.q && (
                  <p className="text-xs text-sand-500 dark:text-sand-400 italic">
                    {locale === "th"
                      ? `(ระบบได้บันทึกคำค้นหา "${filters.q}" ไว้เพื่อจัดหาพันธุ์ไม้เข้าเรือนเพาะชำแล้ว)`
                      : `(Query "${filters.q}" logged to our nursery procurement list)`}
                  </p>
                )}
              </div>

              {/* Action Buttons in Zero-Results */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setInquiryModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-[#06C755] hover:bg-[#05b34c] text-white font-semibold text-xs sm:text-sm shadow-soft transition flex items-center gap-2 min-h-[44px]"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{t("search.ask_shop_line")}</span>
                </button>

                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="px-5 py-2.5 rounded-xl border border-sand-300 dark:border-forest-700 bg-white dark:bg-forest-900 text-forest-800 dark:text-sand-100 font-semibold text-xs sm:text-sm hover:bg-sand-100 dark:hover:bg-forest-800 transition flex items-center gap-1.5 min-h-[44px]"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{t("search.clear_filters")}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* LINE Inquiry Modal for zero-results or general catalog inquiries */}
      <InquiryModal
        isOpen={inquiryModalOpen}
        onClose={() => setInquiryModalOpen(false)}
        sourcePage="/search"
        initialQuery={filters.q}
        defaultIntent="availability"
      />
    </div>
  );
}
