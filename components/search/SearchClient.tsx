"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useApp } from "@/lib/context/AppContext";
import {
  Search,
  Filter,
  X,
  SlidersHorizontal,
  RotateCcw,
  Heart,
  MessageCircle,
  Check,
  ChevronDown,
} from "lucide-react";

interface SpeciesItem {
  id: string;
  slug: string;
  nameTh: string;
  nameEn: string;
  nameSci: string;
  family: string;
  summary: string;
  light: string;
  waterNeed: string;
  placement: string[];
  difficulty: number;
  petSafe: string;
  matureSize: string;
  stockStatus: string;
  primaryImage: string;
  imageAlt: string;
}

interface SearchClientProps {
  initialSpecies: SpeciesItem[];
  searchParams: {
    q?: string;
    light?: string;
    water?: string;
    placement?: string;
    diff?: string;
    pet?: string;
    size?: string;
    stock?: string;
    sort?: string;
    fav?: string;
  };
}

export function SearchClient({ initialSpecies, searchParams }: SearchClientProps) {
  const router = useRouter();
  const rawParams = useSearchParams();
  const { isFavorite, toggleFavorite, openInquiryModal } = useApp();

  const [searchQuery, setSearchQuery] = useState(searchParams.q || "");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Update query params
  const updateParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(rawParams.toString());
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    router.push(`/search?${next.toString()}`);
  };

  const clearAllFilters = () => {
    router.push("/search");
    setSearchQuery("");
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam("q", searchQuery.trim() || null);
  };

  const lightOptions = [
    { value: "full_sun", label: "แดดจัด (Full Sun)" },
    { value: "partial", label: "แดดรำไร (Partial)" },
    { value: "shade", label: "ร่มเงา (Shade)" },
    { value: "indoor_bright", label: "ในบ้านสว่าง (Bright Indirect)" },
    { value: "low_light", label: "แสงน้อย (Low Light)" },
  ];

  const waterOptions = [
    { value: "low", label: "น้อย (7+ วัน/ครั้ง)" },
    { value: "medium", label: "ปานกลาง (3–7 วัน)" },
    { value: "high", label: "บ่อย (1–3 วัน)" },
  ];

  const placementOptions = [
    { value: "indoor", label: "ในบ้าน/คอนโด" },
    { value: "outdoor", label: "กลางแจ้ง" },
    { value: "balcony", label: "ระเบียง" },
    { value: "bathroom", label: "ห้องน้ำ" },
  ];

  const stockOptions = [
    { value: "in_stock", label: "มีที่ร้านพร้อมส่ง" },
    { value: "made_to_order", label: "สั่งได้ (~7-14 วัน)" },
    { value: "seasonal", label: "ตามฤดูกาล" },
  ];

  const sizeOptions = [
    { value: "xs", label: "เล็กมาก (< 30 ซม.)" },
    { value: "sm", label: "เล็ก (30–60 ซม.)" },
    { value: "md", label: "กลาง (60–120 ซม.)" },
    { value: "lg", label: "ใหญ่ (120–200 ซม.)" },
    { value: "xl", label: "ใหญ่พิเศษ (> 200 ซม.)" },
  ];

  const hasActiveFilters =
    Boolean(searchParams.q) ||
    Boolean(searchParams.light) ||
    Boolean(searchParams.water) ||
    Boolean(searchParams.placement) ||
    Boolean(searchParams.diff) ||
    Boolean(searchParams.pet) ||
    Boolean(searchParams.size) ||
    Boolean(searchParams.stock);

  // Filter species locally if favorite mode is requested
  const displayedSpecies = searchParams.fav === "true"
    ? initialSpecies.filter((p) => isFavorite(p.id))
    : initialSpecies;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Search Header */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-medium text-forest-950">
              {searchParams.fav === "true" ? "ต้นไม้ที่คุณบันทึกไว้" : "คัดเลือกพันธุ์ไม้"}
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              {displayedSpecies.length} พันธุ์ที่ตรงตามเงื่อนไข · พร้อมข้อมูลการดูแลจริงจากร้าน
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative max-w-md w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อไทย, อังกฤษ, ชื่อวิทย์ หรือชื่อเล่น..."
              className="w-full text-xs sm:text-sm pl-10 pr-20 py-2.5 bg-white border border-sand-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-700 text-stone-800 placeholder-stone-400"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 px-3 py-1.5 bg-forest-900 text-sand-50 rounded-lg text-xs font-medium hover:bg-forest-800 transition-colors cursor-pointer"
            >
              ค้นหา
            </button>
          </form>
        </div>

        {/* Action Bar (Filter trigger, Sorting, Clear) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-sand-200">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 px-3.5 py-2 bg-white border border-sand-300 rounded-xl text-xs font-medium text-stone-700 hover:bg-sand-100 transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-forest-800" />
              <span>ตัวกรองละเอียด</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
              )}
            </button>

            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-1.5 text-xs text-rose-700 hover:text-rose-900 font-medium px-2 py-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>ล้างตัวกรอง</span>
              </button>
            )}
          </div>

          {/* Sorting Dropdown */}
          <div className="flex items-center gap-2 text-xs text-stone-600">
            <span>เรียงตาม:</span>
            <select
              value={searchParams.sort || "relevance"}
              onChange={(e) => updateParam("sort", e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-sand-300 rounded-xl text-xs font-medium text-stone-800 focus:outline-none focus:ring-1 focus:ring-forest-700"
            >
              <option value="relevance">ตรงที่สุด</option>
              <option value="in_stock_first">มีที่ร้านก่อน</option>
              <option value="easiest_first">เลี้ยงง่ายที่สุด</option>
              <option value="name">ชื่อ ก-ฮ</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Catalog Layout (Sidebar Filters + Cards Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Left Sidebar Filters */}
        <aside className="hidden lg:block lg:col-span-1 space-y-6 bg-sand-100/50 p-6 rounded-2xl border border-sand-200/80 h-fit">
          <div className="flex items-center justify-between pb-3 border-b border-sand-200">
            <span className="font-serif text-base font-semibold text-forest-950">ตัวกรองละเอียด</span>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-[11px] text-rose-600 hover:text-rose-800 font-medium"
              >
                ล้างทั้งหมด
              </button>
            )}
          </div>

          {/* Stock Status Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-600">
              สถานะที่ร้าน
            </label>
            <div className="space-y-1">
              {stockOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() =>
                    updateParam("stock", searchParams.stock === opt.value ? null : opt.value)
                  }
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left transition-colors ${
                    searchParams.stock === opt.value
                      ? "bg-forest-900 text-sand-50 font-medium"
                      : "text-stone-700 hover:bg-sand-200/60"
                  }`}
                >
                  <span>{opt.label}</span>
                  {searchParams.stock === opt.value && <Check className="w-3.5 h-3.5 text-gold-400" />}
                </button>
              ))}
            </div>
          </div>

          {/* Light Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-600">
              สภาพแสง
            </label>
            <div className="space-y-1">
              {lightOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() =>
                    updateParam("light", searchParams.light === opt.value ? null : opt.value)
                  }
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left transition-colors ${
                    searchParams.light === opt.value
                      ? "bg-forest-900 text-sand-50 font-medium"
                      : "text-stone-700 hover:bg-sand-200/60"
                  }`}
                >
                  <span>{opt.label}</span>
                  {searchParams.light === opt.value && <Check className="w-3.5 h-3.5 text-gold-400" />}
                </button>
              ))}
            </div>
          </div>

          {/* Water Need Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-600">
              ความถี่รดน้ำ
            </label>
            <div className="space-y-1">
              {waterOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() =>
                    updateParam("water", searchParams.water === opt.value ? null : opt.value)
                  }
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left transition-colors ${
                    searchParams.water === opt.value
                      ? "bg-forest-900 text-sand-50 font-medium"
                      : "text-stone-700 hover:bg-sand-200/60"
                  }`}
                >
                  <span>{opt.label}</span>
                  {searchParams.water === opt.value && <Check className="w-3.5 h-3.5 text-gold-400" />}
                </button>
              ))}
            </div>
          </div>

          {/* Placement Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-600">
              ตำแหน่งที่วาง
            </label>
            <div className="space-y-1">
              {placementOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() =>
                    updateParam("placement", searchParams.placement === opt.value ? null : opt.value)
                  }
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left transition-colors ${
                    searchParams.placement === opt.value
                      ? "bg-forest-900 text-sand-50 font-medium"
                      : "text-stone-700 hover:bg-sand-200/60"
                  }`}
                >
                  <span>{opt.label}</span>
                  {searchParams.placement === opt.value && <Check className="w-3.5 h-3.5 text-gold-400" />}
                </button>
              ))}
            </div>
          </div>

          {/* Pet Friendly Filter */}
          <div className="space-y-2 pt-2 border-t border-sand-200">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-600">
              สัตว์เลี้ยง
            </label>
            <button
              onClick={() => updateParam("pet", searchParams.pet === "safe" ? null : "safe")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left transition-colors ${
                searchParams.pet === "safe"
                  ? "bg-emerald-800 text-white font-medium"
                  : "bg-white border border-sand-300 text-stone-700 hover:bg-sand-200/60"
              }`}
            >
              <span>ปลอดภัยกับสัตว์เลี้ยงเท่านั้น</span>
              {searchParams.pet === "safe" && <Check className="w-3.5 h-3.5 text-emerald-200" />}
            </button>
          </div>
        </aside>

        {/* Species List Grid (or Zero Result State) */}
        <div className="lg:col-span-3">
          {displayedSpecies.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedSpecies.map((plant) => (
                <div
                  key={plant.id}
                  className="group relative bg-white rounded-2xl overflow-hidden border border-sand-200 hover:border-forest-700/40 shadow-soft hover:shadow-card card-hover-effect flex flex-col justify-between"
                >
                  {/* Image Container */}
                  <Link href={`/plants/${plant.slug}`} className="block relative aspect-[4/3] bg-sand-100 overflow-hidden">
                    <Image
                      src={plant.primaryImage}
                      alt={plant.imageAlt}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-full bg-forest-950/80 backdrop-blur-md text-gold-300 text-[10px] font-medium border border-gold-400/30">
                        ถ่ายที่ร้าน
                      </span>
                    </div>

                    <div className="absolute top-2.5 right-2.5">
                      {plant.stockStatus === "in_stock" && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-700/90 backdrop-blur-md text-white text-[10px] font-medium">
                          มีที่ร้าน
                        </span>
                      )}
                      {plant.stockStatus === "made_to_order" && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-700/90 backdrop-blur-md text-white text-[10px] font-medium">
                          สั่งได้
                        </span>
                      )}
                      {plant.stockStatus === "seasonal" && (
                        <span className="px-2 py-0.5 rounded-full bg-stone-700/90 backdrop-blur-md text-white text-[10px] font-medium">
                          ตามฤดูกาล
                        </span>
                      )}
                    </div>
                  </Link>

                  {/* Body Info */}
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-forest-700">
                          {plant.family.split(" ")[0]}
                        </span>
                        <button
                          onClick={() => toggleFavorite(plant.id)}
                          className="p-1 text-stone-400 hover:text-rose-500 transition-colors"
                          title="บันทึกไว้ดูภายหลัง"
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              isFavorite(plant.id) ? "text-rose-500 fill-rose-500" : ""
                            }`}
                          />
                        </button>
                      </div>

                      <Link href={`/plants/${plant.slug}`}>
                        <h3 className="font-serif text-lg font-semibold text-stone-900 group-hover:text-forest-800 transition-colors line-clamp-1 mt-0.5">
                          {plant.nameTh}
                        </h3>
                        <p className="text-xs text-stone-500 italic font-serif line-clamp-1">
                          {plant.nameSci}
                        </p>
                      </Link>

                      <p className="text-xs text-stone-600 line-clamp-2 mt-2 leading-relaxed">
                        {plant.summary}
                      </p>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-3 border-t border-sand-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() =>
                          openInquiryModal({
                            speciesId: plant.id,
                            speciesNameTh: plant.nameTh,
                            speciesPhoto: plant.primaryImage,
                            defaultIntent: "price",
                          })
                        }
                        className="px-3 py-1.5 rounded-xl bg-sand-100 hover:bg-forest-900 hover:text-sand-50 text-stone-700 text-xs font-medium transition-colors flex items-center gap-1.5"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>ถามร้าน</span>
                      </button>

                      <Link
                        href={`/plants/${plant.slug}`}
                        className="text-xs font-semibold text-forest-900 hover:text-forest-700 flex items-center gap-1"
                      >
                        <span>สูตรดูแล</span>
                        <span>→</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Zero Result State (SPEC §6.2) */
            <div className="bg-white rounded-3xl p-10 sm:p-14 text-center border border-sand-200 shadow-soft max-w-xl mx-auto space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-forest-900/5 text-forest-800 flex items-center justify-center mx-auto border border-sand-300">
                <Search className="w-8 h-8 text-forest-800" />
              </div>

              <div className="space-y-2">
                <h3 className="font-serif text-2xl font-medium text-stone-900">
                  ยังไม่มีข้อมูลต้นนี้ในระบบ
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-md mx-auto">
                  {searchParams.q ? (
                    <>คำค้นว่า <span className="font-semibold text-stone-800">"{searchParams.q}"</span> บันทึกเข้าคลังคำขอของร้านแล้ว ทางเรากำลังจัดเตรียมพันธุ์ไม้นี้</>
                  ) : (
                    "ไม่มีต้นไม้ที่ตรงกับตัวกรองที่คุณเลือก ลองปรับตัวกรองใหม่อีกครั้ง"
                  )}
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() =>
                    openInquiryModal({
                      defaultIntent: "availability",
                      customNote: searchParams.q ? `ตามหาพันธุ์: ${searchParams.q}` : undefined,
                    })
                  }
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#06C755] hover:bg-[#05b34c] text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>ทักไปถามร้านใน LINE เลยไหม</span>
                </button>
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="w-full sm:w-auto px-4 py-3 rounded-xl bg-sand-100 hover:bg-sand-200 text-stone-700 font-medium text-xs sm:text-sm transition-colors cursor-pointer"
                  >
                    ล้างตัวกรองทั้งหมด
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-sand-50 p-6 overflow-y-auto animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center justify-between pb-4 border-b border-sand-200">
            <h3 className="font-serif text-lg font-semibold text-stone-900">ตัวกรองพันธุ์ไม้</h3>
            <button
              onClick={() => setMobileFilterOpen(false)}
              className="p-1 rounded-lg text-stone-500 hover:text-stone-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="py-6 space-y-6 flex-1">
            {/* Stock */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-2">
                สถานะที่ร้าน
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                {stockOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      updateParam("stock", searchParams.stock === opt.value ? null : opt.value);
                    }}
                    className={`px-3 py-2.5 rounded-xl text-xs text-left ${
                      searchParams.stock === opt.value
                        ? "bg-forest-900 text-sand-50 font-medium"
                        : "bg-white border border-sand-200 text-stone-700"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Light */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-2">
                สภาพแสง
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                {lightOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      updateParam("light", searchParams.light === opt.value ? null : opt.value);
                    }}
                    className={`px-3 py-2.5 rounded-xl text-xs text-left ${
                      searchParams.light === opt.value
                        ? "bg-forest-900 text-sand-50 font-medium"
                        : "bg-white border border-sand-200 text-stone-700"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Pet Safe */}
            <div>
              <button
                onClick={() => {
                  updateParam("pet", searchParams.pet === "safe" ? null : "safe");
                }}
                className={`w-full py-3 px-4 rounded-xl text-xs font-medium text-center ${
                  searchParams.pet === "safe"
                    ? "bg-emerald-800 text-white"
                    : "bg-white border border-sand-300 text-stone-800"
                }`}
              >
                {searchParams.pet === "safe" ? "✓ ปลอดภัยกับสัตว์เลี้ยงเท่านั้น" : "ปลอดภัยกับสัตว์เลี้ยงเท่านั้น"}
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-sand-200 flex gap-3">
            <button
              onClick={() => {
                clearAllFilters();
                setMobileFilterOpen(false);
              }}
              className="flex-1 py-3 bg-sand-200 text-stone-800 rounded-xl text-xs font-medium"
            >
              ล้างทั้งหมด
            </button>
            <button
              onClick={() => setMobileFilterOpen(false)}
              className="flex-1 py-3 bg-forest-900 text-sand-50 rounded-xl text-xs font-medium"
            >
              ดู {displayedSpecies.length} รายการ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
