"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/lib/context/AppContext";
import {
  explainCareSchedule,
  formatDate,
  PotMaterial,
  Placement,
  POT_MATERIAL_FACTORS,
  PLACEMENT_FACTORS,
  getThaiSeason,
  getThaiSeasonInfo,
} from "@/lib/care/scheduler";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Search,
  Sprout,
  Droplets,
  Sun,
  Layers,
  Sparkles,
  Calendar,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Info,
} from "lucide-react";

export interface AvailableSpeciesOption {
  id: string;
  nameTh: string;
  nameEn: string;
  nameSci?: string;
  slug: string;
  primaryImage: string;
  careTemplate: {
    waterDaysHot: number;
    waterDaysRainy: number;
    waterDaysCool: number;
    fertilizeDays?: number | null;
  };
}

interface AddPlantWizardProps {
  availableSpecies: AvailableSpeciesOption[];
}

export function AddPlantWizard({ availableSpecies }: AddPlantWizardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSpeciesId = searchParams.get("speciesId");

  const { user, guestToken, addToast, t, locale } = useApp();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [submitting, setSubmitting] = useState(false);

  // Step 1: Species Selection
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<string | null>(
    initialSpeciesId || (availableSpecies.length > 0 ? availableSpecies[0].id : null)
  );
  const [isCustomSpecies, setIsCustomSpecies] = useState(false);
  const [customSpeciesName, setCustomSpeciesName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Step 2: Nickname, Acquisition Date, Source, Notes
  const [nickname, setNickname] = useState("");
  const [acquiredAt, setAcquiredAt] = useState(() => {
    return formatDate(new Date());
  });
  const [acquiredFrom, setAcquiredFrom] = useState<
    "shop" | "elsewhere" | "gift" | "propagated"
  >("shop");
  const [notes, setNotes] = useState("");

  // Step 3: Pot Size & Material
  const [potSizeInch, setPotSizeInch] = useState<number>(8);
  const [potMaterial, setPotMaterial] = useState<PotMaterial>("plastic");

  // Step 4: Placement & Custom Water Override
  const [placement, setPlacement] = useState<Placement>("indoor_window");
  const [useCustomWater, setUseCustomWater] = useState(false);
  const [customWaterDays, setCustomWaterDays] = useState<number | "">("");

  // Set default nickname based on chosen species if not edited yet
  const selectedSpecies = useMemo(
    () => availableSpecies.find((s) => s.id === selectedSpeciesId) || null,
    [availableSpecies, selectedSpeciesId]
  );

  useEffect(() => {
    if (!nickname) {
      if (isCustomSpecies && customSpeciesName) {
        setNickname(customSpeciesName);
      } else if (selectedSpecies) {
        setNickname(selectedSpecies.nameTh);
      }
    }
  }, [selectedSpecies, isCustomSpecies, customSpeciesName, nickname]);

  // Filtered species search
  const filteredSpecies = useMemo(() => {
    if (!searchQuery.trim()) return availableSpecies;
    const q = searchQuery.toLowerCase().trim();
    return availableSpecies.filter(
      (s) =>
        s.nameTh.toLowerCase().includes(q) ||
        s.nameEn.toLowerCase().includes(q) ||
        (s.nameSci && s.nameSci.toLowerCase().includes(q))
    );
  }, [availableSpecies, searchQuery]);

  // Real-time calculation preview
  const calculationPreview = useMemo(() => {
    const template = selectedSpecies?.careTemplate || {
      waterDaysHot: 3,
      waterDaysRainy: 5,
      waterDaysCool: 7,
    };

    return explainCareSchedule({
      template,
      plantConfig: {
        potSizeInch,
        potMaterial,
        placement,
        customWaterDays: useCustomWater && customWaterDays ? Number(customWaterDays) : undefined,
      },
    });
  }, [selectedSpecies, potSizeInch, potMaterial, placement, useCustomWater, customWaterDays]);

  // Validation
  const isStep1Valid = isCustomSpecies ? customSpeciesName.trim().length > 0 : !!selectedSpeciesId;
  const isStep2Valid = nickname.trim().length > 0 && !!acquiredAt;
  const isStep3Valid = potSizeInch > 0;
  const isStep4Valid = !useCustomWater || (typeof customWaterDays === "number" && customWaterDays > 0);

  // Submit Handler
  const handleSubmit = async () => {
    if (!nickname.trim()) {
      addToast(locale === "th" ? "กรุณาระบุชื่อเล่นของต้นไม้" : "Please provide a nickname", "warning");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        userId: user.id || null,
        guestToken,
        speciesId: isCustomSpecies ? null : selectedSpeciesId,
        customSpeciesName: isCustomSpecies ? customSpeciesName.trim() : null,
        nickname: nickname.trim(),
        acquiredAt,
        acquiredFrom,
        potSizeInch: Number(potSizeInch),
        potMaterial,
        placement,
        notes: notes.trim() || null,
        customWaterDays: useCustomWater && customWaterDays ? Number(customWaterDays) : null,
      };

      const res = await fetch("/api/garden/plants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to add plant");
      }

      addToast(
        locale === "th"
          ? `เพิ่ม "${nickname.trim()}" เข้าสู่สวนเรียบร้อยแล้ว!`
          : `Added "${nickname.trim()}" to your garden!`,
        "success"
      );

      router.push("/garden");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to add plant";
      addToast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const currentSeason = getThaiSeason();
  const currentSeasonInfo = getThaiSeasonInfo(currentSeason);

  return (
    <div className="min-h-[calc(100vh-140px)] bg-sand-50 dark:bg-forest-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/garden"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-sand-600 dark:text-sand-400 hover:text-forest-900 dark:hover:text-sand-100 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{locale === "th" ? "กลับไปยังสวนของฉัน" : "Back to My Garden"}</span>
          </Link>
          <span className="text-xs text-sand-500 dark:text-sand-400 font-medium">
            {locale === "th" ? `ขั้นตอนที่ ${step} จาก 4` : `Step ${step} of 4`}
          </span>
        </div>

        {/* Wizard Steps Progress Bar */}
        <div className="bg-white dark:bg-forest-900/80 rounded-2xl border border-sand-200 dark:border-forest-800 p-4 shadow-sm">
          <div className="grid grid-cols-4 gap-2">
            {[
              { num: 1, label: t("garden.step_1") },
              { num: 2, label: t("garden.step_2") },
              { num: 3, label: t("garden.step_3") },
              { num: 4, label: t("garden.step_4") },
            ].map((s) => {
              const isDone = step > s.num;
              const isCurrent = step === s.num;
              return (
                <button
                  key={s.num}
                  type="button"
                  disabled={s.num > step}
                  onClick={() => setStep(s.num as 1 | 2 | 3 | 4)}
                  className={`flex flex-col sm:flex-row items-center gap-2 p-2 rounded-xl text-center sm:text-left transition ${
                    isCurrent
                      ? "bg-forest-50 dark:bg-forest-800 text-forest-900 dark:text-sand-100 font-bold"
                      : isDone
                      ? "text-forest-700 dark:text-forest-300 hover:bg-sand-100 dark:hover:bg-forest-800/40"
                      : "text-sand-400 dark:text-sand-600 opacity-60 cursor-not-allowed"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      isDone
                        ? "bg-forest-700 text-white"
                        : isCurrent
                        ? "bg-forest-800 text-white ring-4 ring-forest-200 dark:ring-forest-700"
                        : "bg-sand-200 dark:bg-forest-800 text-sand-600 dark:text-sand-400"
                    }`}
                  >
                    {isDone ? <Check className="w-3.5 h-3.5" /> : s.num}
                  </div>
                  <span className="text-xs truncate hidden sm:inline">{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* STEP 1: Species Selection */}
        {step === 1 && (
          <div className="bg-white dark:bg-forest-900/80 rounded-3xl border border-sand-200 dark:border-forest-800 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="border-b border-sand-200 dark:border-forest-800/80 pb-4">
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-forest-900 dark:text-sand-100">
                {t("garden.step_1")}
              </h2>
              <p className="text-xs sm:text-sm text-sand-600 dark:text-sand-400 mt-1">
                {locale === "th"
                  ? "เลือกพันธุ์ไม้จากแคตตาล็อก หรือระบุชื่อต้นไม้ที่คุณมี"
                  : "Select from shop catalog or enter a custom plant name"}
              </p>
            </div>

            {/* Selection Mode Toggle */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsCustomSpecies(false)}
                className={`flex-1 py-3 px-4 rounded-2xl border text-sm font-semibold transition ${
                  !isCustomSpecies
                    ? "border-forest-700 bg-forest-50/70 dark:bg-forest-800 text-forest-900 dark:text-sand-100 ring-2 ring-forest-600"
                    : "border-sand-300 dark:border-forest-700 bg-white dark:bg-forest-900 text-sand-700 dark:text-sand-300 hover:border-sand-400"
                }`}
              >
                {locale === "th" ? "เลือกจากแคตตาล็อก (30 ชนิด)" : "Catalog Species"}
              </button>
              <button
                type="button"
                onClick={() => setIsCustomSpecies(true)}
                className={`flex-1 py-3 px-4 rounded-2xl border text-sm font-semibold transition ${
                  isCustomSpecies
                    ? "border-forest-700 bg-forest-50/70 dark:bg-forest-800 text-forest-900 dark:text-sand-100 ring-2 ring-forest-600"
                    : "border-sand-300 dark:border-forest-700 bg-white dark:bg-forest-900 text-sand-700 dark:text-sand-300 hover:border-sand-400"
                }`}
              >
                {t("garden.custom_species")}
              </button>
            </div>

            {/* Custom Species Name Input */}
            {isCustomSpecies ? (
              <div className="p-6 rounded-2xl bg-sand-50 dark:bg-forest-950/60 border border-sand-200 dark:border-forest-800 space-y-4">
                <label className="block text-sm font-semibold text-forest-900 dark:text-sand-100">
                  {t("garden.custom_species_prompt")} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={customSpeciesName}
                  onChange={(e) => setCustomSpeciesName(e.target.value)}
                  placeholder={locale === "th" ? "เช่น ต้นไทรใบสัก, ลิ้นมังกรด่าง, กุหลาบหิน..." : "e.g., Fiddle Leaf Fig, Rose..."}
                  className="w-full px-4 py-3 rounded-xl border border-sand-300 dark:border-forest-700 bg-white dark:bg-forest-900 text-forest-900 dark:text-sand-100 focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
                <p className="text-xs text-sand-500 dark:text-sand-400">
                  {locale === "th"
                    ? "💡 ระบบจะใช้ค่าพื้นฐานการรดน้ำมาตรฐาน และปรับตามกระถางและสภาพแวดล้อมที่คุณเลือก"
                    : "Standard baseline care template will be used, adjusted by your pot and placement"}
                </p>
              </div>
            ) : (
              /* Catalog Species Grid with Search */
              <div className="space-y-4">
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-sand-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={locale === "th" ? "ค้นหาชื่อภาษาไทย, อังกฤษ, หรือชื่อวิทยาศาสตร์..." : "Search catalog species..."}
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-sand-300 dark:border-forest-700 bg-white dark:bg-forest-900 text-sm text-forest-900 dark:text-sand-100 focus:outline-none focus:ring-2 focus:ring-forest-600"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[420px] overflow-y-auto p-1">
                  {filteredSpecies.map((sp) => {
                    const isSelected = selectedSpeciesId === sp.id;
                    return (
                      <div
                        key={sp.id}
                        onClick={() => setSelectedSpeciesId(sp.id)}
                        className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition ${
                          isSelected
                            ? "border-forest-700 bg-forest-50/70 dark:bg-forest-800 text-forest-900 dark:text-sand-100 ring-2 ring-forest-600"
                            : "border-sand-200 dark:border-forest-800/80 bg-white dark:bg-forest-900 hover:border-sand-400"
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={sp.primaryImage}
                          alt={sp.nameTh}
                          className="w-14 h-14 rounded-xl object-cover shrink-0"
                          loading="lazy"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold text-forest-900 dark:text-sand-100 truncate">
                              {sp.nameTh}
                            </h4>
                            {isSelected && (
                              <CheckCircle2 className="w-4 h-4 text-forest-700 dark:text-forest-400 shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-sand-500 dark:text-sand-400 truncate">
                            {sp.nameEn}
                          </p>
                          <span className="text-[11px] text-forest-700 dark:text-forest-300 mt-1 inline-block">
                            💧 {sp.careTemplate.waterDaysRainy} วัน (ฤดูฝน)
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-end pt-4 border-t border-sand-100 dark:border-forest-800/60">
              <button
                type="button"
                disabled={!isStep1Valid}
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 dark:bg-forest-700 text-sand-50 font-semibold text-sm transition disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              >
                <span>{locale === "th" ? "ถัดไป" : "Next"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Nickname, Acquisition Date & Source */}
        {step === 2 && (
          <div className="bg-white dark:bg-forest-900/80 rounded-3xl border border-sand-200 dark:border-forest-800 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="border-b border-sand-200 dark:border-forest-800/80 pb-4">
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-forest-900 dark:text-sand-100">
                {t("garden.step_2")}
              </h2>
              <p className="text-xs sm:text-sm text-sand-600 dark:text-sand-400 mt-1">
                {locale === "th"
                  ? "ตั้งชื่อเล่น และระบุที่มาของต้นไม้ต้นนี้"
                  : "Give your plant a nickname and set its acquisition background"}
              </p>
            </div>

            <div className="space-y-5">
              {/* Nickname */}
              <div>
                <label className="block text-sm font-semibold text-forest-900 dark:text-sand-100 mb-1.5">
                  {t("garden.nickname_label")} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder={t("garden.nickname_placeholder")}
                  className="w-full px-4 py-2.5 rounded-xl border border-sand-300 dark:border-forest-700 bg-white dark:bg-forest-900 text-forest-900 dark:text-sand-100 text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
              </div>

              {/* Acquired Date */}
              <div>
                <label className="block text-sm font-semibold text-forest-900 dark:text-sand-100 mb-1.5">
                  {t("garden.acquired_date")} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={acquiredAt}
                  onChange={(e) => setAcquiredAt(e.target.value)}
                  className="w-full sm:w-64 px-4 py-2.5 rounded-xl border border-sand-300 dark:border-forest-700 bg-white dark:bg-forest-900 text-forest-900 dark:text-sand-100 text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
              </div>

              {/* Acquisition Source */}
              <div>
                <label className="block text-sm font-semibold text-forest-900 dark:text-sand-100 mb-2">
                  {t("garden.acquired_source")}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: "shop", labelTh: "ซื้อจาก TreeForLife", labelEn: "TreeForLife Shop", icon: "🛒" },
                    { id: "elsewhere", labelTh: "ซื้อจากร้านอื่น", labelEn: "Other Store", icon: "🏪" },
                    { id: "gift", labelTh: "ได้รับเป็นของขวัญ", labelEn: "Gift", icon: "🎁" },
                    { id: "propagated", labelTh: "ขยายพันธุ์เอง", labelEn: "Propagated", icon: "🌱" },
                  ].map((src) => {
                    const isSelected = acquiredFrom === src.id;
                    return (
                      <div
                        key={src.id}
                        onClick={() => setAcquiredFrom(src.id as any)}
                        className={`p-3.5 rounded-2xl border cursor-pointer text-center transition ${
                          isSelected
                            ? "border-forest-700 bg-forest-50/70 dark:bg-forest-800 text-forest-900 dark:text-sand-100 ring-2 ring-forest-600 font-bold"
                            : "border-sand-200 dark:border-forest-800/80 bg-white dark:bg-forest-900 hover:border-sand-400 text-sand-700 dark:text-sand-300"
                        }`}
                      >
                        <span className="text-2xl block mb-1">{src.icon}</span>
                        <span className="text-xs">
                          {locale === "th" ? src.labelTh : src.labelEn}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-forest-900 dark:text-sand-100 mb-1.5">
                  {t("garden.notes_label")}
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t("garden.notes_placeholder")}
                  className="w-full px-4 py-2.5 rounded-xl border border-sand-300 dark:border-forest-700 bg-white dark:bg-forest-900 text-forest-900 dark:text-sand-100 text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-sand-100 dark:border-forest-800/60">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-sand-300 dark:border-forest-700 text-sand-700 dark:text-sand-300 text-sm font-medium hover:bg-sand-100 dark:hover:bg-forest-800/60 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{locale === "th" ? "ย้อนกลับ" : "Back"}</span>
              </button>
              <button
                type="button"
                disabled={!isStep2Valid}
                onClick={() => setStep(3)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 dark:bg-forest-700 text-sand-50 font-semibold text-sm transition disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              >
                <span>{locale === "th" ? "ถัดไป" : "Next"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Pot Diameter & Material */}
        {step === 3 && (
          <div className="bg-white dark:bg-forest-900/80 rounded-3xl border border-sand-200 dark:border-forest-800 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="border-b border-sand-200 dark:border-forest-800/80 pb-4">
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-forest-900 dark:text-sand-100">
                {t("garden.step_3")}
              </h2>
              <p className="text-xs sm:text-sm text-sand-600 dark:text-sand-400 mt-1">
                {locale === "th"
                  ? "ขนาดและวัสดุกระถางมีผลต่อความเร็วในการแห้งของดิน"
                  : "Pot size and material directly influence soil evaporation"}
              </p>
            </div>

            <div className="space-y-6">
              {/* Pot Diameter (Inches) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-forest-900 dark:text-sand-100">
                    {t("garden.pot_size_label")} <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-xs font-bold text-forest-800 dark:text-forest-300">
                    {potSizeInch} {t("care.inches")} (
                    {potSizeInch < 6
                      ? "แห้งเร็วกว่า ×0.85"
                      : potSizeInch <= 10
                      ? "ขนาดมาตรฐาน ×1.00"
                      : "อุ้มน้ำนานกว่า ×1.20"}
                    )
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {[4, 6, 8, 10, 12, 14].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setPotSizeInch(size)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                        potSizeInch === size
                          ? "bg-forest-800 text-white shadow-sm"
                          : "bg-sand-100 dark:bg-forest-800/50 text-sand-700 dark:text-sand-300 hover:bg-sand-200"
                      }`}
                    >
                      {size}&quot;
                    </button>
                  ))}
                  <div className="flex items-center gap-1.5 ml-auto">
                    <input
                      type="number"
                      min={1}
                      max={40}
                      value={potSizeInch}
                      onChange={(e) => setPotSizeInch(Math.max(1, Number(e.target.value)))}
                      className="w-20 px-3 py-1.5 rounded-xl border border-sand-300 dark:border-forest-700 bg-white dark:bg-forest-900 text-sm text-center text-forest-900 dark:text-sand-100"
                    />
                    <span className="text-xs text-sand-500">{t("care.inches")}</span>
                  </div>
                </div>
              </div>

              {/* Pot Material Visual Cards */}
              <div>
                <label className="block text-sm font-semibold text-forest-900 dark:text-sand-100 mb-2">
                  {t("garden.pot_material_label")} <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {(
                    [
                      { id: "terracotta", mult: "0.80x", icon: "🧱" },
                      { id: "plastic", mult: "1.00x", icon: "🪴" },
                      { id: "ceramic_glazed", mult: "1.15x", icon: "🏺" },
                      { id: "cement", mult: "1.15x", icon: "🏛️" },
                      { id: "hanging", mult: "1.00x", icon: "🧺" },
                    ] as const
                  ).map((m) => {
                    const info = POT_MATERIAL_FACTORS[m.id];
                    const isSelected = potMaterial === m.id;
                    return (
                      <div
                        key={m.id}
                        onClick={() => setPotMaterial(m.id)}
                        className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                          isSelected
                            ? "border-forest-700 bg-forest-50/80 dark:bg-forest-800 text-forest-900 dark:text-sand-100 ring-2 ring-forest-600"
                            : "border-sand-200 dark:border-forest-800/80 bg-white dark:bg-forest-900 hover:border-sand-400"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-2xl">{m.icon}</span>
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              isSelected
                                ? "bg-forest-800 text-white"
                                : "bg-sand-100 dark:bg-forest-800 text-sand-600 dark:text-sand-400"
                            }`}
                          >
                            ×{info.factor.toFixed(2)}
                          </span>
                        </div>
                        <h4 className="font-semibold text-sm text-forest-900 dark:text-sand-100">
                          {locale === "th" ? info.labelTh : info.labelEn}
                        </h4>
                        <p className="text-xs text-sand-500 dark:text-sand-400 mt-1">
                          {locale === "th" ? info.descTh : info.descEn}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Real-time Calculation Mini Preview */}
              <div className="p-4 rounded-2xl bg-forest-50/60 dark:bg-forest-950/60 border border-forest-200 dark:border-forest-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-forest-700 dark:text-forest-400" />
                  <div>
                    <span className="text-xs font-bold text-forest-900 dark:text-sand-100 block">
                      {locale === "th" ? "รอบรดน้ำที่คำนวณได้ ณ ตอนนี้" : "Computed Interval"}
                    </span>
                    <span className="text-xs text-sand-600 dark:text-sand-400">
                      {calculationPreview.formula}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xl font-serif font-bold text-forest-800 dark:text-forest-300">
                    {calculationPreview.finalIntervalDays}
                  </span>
                  <span className="text-xs text-sand-500 ml-1">{t("care.days_unit")}</span>
                </div>
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-sand-100 dark:border-forest-800/60">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-sand-300 dark:border-forest-700 text-sand-700 dark:text-sand-300 text-sm font-medium hover:bg-sand-100 dark:hover:bg-forest-800/60 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{locale === "th" ? "ย้อนกลับ" : "Back"}</span>
              </button>
              <button
                type="button"
                disabled={!isStep3Valid}
                onClick={() => setStep(4)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 dark:bg-forest-700 text-sand-50 font-semibold text-sm transition disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              >
                <span>{locale === "th" ? "ถัดไป" : "Next"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Placement Environment & Final Live Preview */}
        {step === 4 && (
          <div className="bg-white dark:bg-forest-900/80 rounded-3xl border border-sand-200 dark:border-forest-800 p-6 sm:p-8 shadow-sm space-y-8">
            <div className="border-b border-sand-200 dark:border-forest-800/80 pb-4">
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-forest-900 dark:text-sand-100">
                {t("garden.step_4")}
              </h2>
              <p className="text-xs sm:text-sm text-sand-600 dark:text-sand-400 mt-1">
                {locale === "th"
                  ? "ตำแหน่งที่วางต้นไม้ แสงแดด และการระบายอากาศ"
                  : "Microclimate, light availability and ventilation"}
              </p>
            </div>

            <div className="space-y-6">
              {/* Placement Visual Cards */}
              <div>
                <label className="block text-sm font-semibold text-forest-900 dark:text-sand-100 mb-2">
                  {t("garden.placement_label")} <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {(
                    [
                      { id: "outdoor_sun", mult: "0.70x", icon: "☀️" },
                      { id: "balcony_shade", mult: "0.90x", icon: "🌤️" },
                      { id: "indoor_window", mult: "1.00x", icon: "🪟" },
                      { id: "indoor_far", mult: "1.25x", icon: "🛋️" },
                      { id: "air_con", mult: "1.20x", icon: "❄️" },
                    ] as const
                  ).map((p) => {
                    const info = PLACEMENT_FACTORS[p.id];
                    const isSelected = placement === p.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => setPlacement(p.id)}
                        className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                          isSelected
                            ? "border-forest-700 bg-forest-50/80 dark:bg-forest-800 text-forest-900 dark:text-sand-100 ring-2 ring-forest-600"
                            : "border-sand-200 dark:border-forest-800/80 bg-white dark:bg-forest-900 hover:border-sand-400"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-2xl">{p.icon}</span>
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              isSelected
                                ? "bg-forest-800 text-white"
                                : "bg-sand-100 dark:bg-forest-800 text-sand-600 dark:text-sand-400"
                            }`}
                          >
                            ×{info.factor.toFixed(2)}
                          </span>
                        </div>
                        <h4 className="font-semibold text-sm text-forest-900 dark:text-sand-100">
                          {locale === "th" ? info.labelTh : info.labelEn}
                        </h4>
                        <p className="text-xs text-sand-500 dark:text-sand-400 mt-1">
                          {locale === "th" ? info.descTh : info.descEn}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Optional Custom Water Days override */}
              <div className="p-4 rounded-2xl bg-sand-50 dark:bg-forest-950/60 border border-sand-200 dark:border-forest-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-semibold text-forest-900 dark:text-sand-100 block">
                      {locale === "th" ? "กำหนดรอบรดน้ำเอง (ไม่ใช้ตัวคูณอัตโนมัติ)" : "Custom Fixed Interval Override"}
                    </span>
                    <span className="text-xs text-sand-500 dark:text-sand-400">
                      {locale === "th"
                        ? "เลือกหากคุณมีตารางส่วนตัว เช่น รดทุก 2 วันตายตัว"
                        : "Override the dynamic formula with a fixed schedule"}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={useCustomWater}
                    onChange={(e) => setUseCustomWater(e.target.checked)}
                    className="w-5 h-5 rounded text-forest-700 focus:ring-forest-600 cursor-pointer"
                  />
                </div>

                {useCustomWater && (
                  <div className="flex items-center gap-3 pt-2">
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={customWaterDays}
                      onChange={(e) =>
                        setCustomWaterDays(e.target.value === "" ? "" : Number(e.target.value))
                      }
                      placeholder="เช่น 3"
                      className="w-24 px-3 py-1.5 rounded-xl border border-sand-300 dark:border-forest-700 bg-white dark:bg-forest-900 text-sm text-center"
                    />
                    <span className="text-xs text-sand-600 dark:text-sand-300 font-medium">
                      {locale === "th" ? "วัน / ครั้ง (กำหนด 1–30 วัน)" : "days per watering"}
                    </span>
                  </div>
                )}
              </div>

              {/* PROMINENT LIVE CALCULATION PREVIEW CARD */}
              <div className="bg-gradient-to-br from-forest-800 to-forest-900 dark:from-forest-900 dark:to-forest-950 rounded-3xl p-6 sm:p-8 text-sand-50 shadow-lg space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-forest-700/80 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-forest-300" />
                      <h3 className="text-lg font-serif font-bold text-sand-50">
                        {t("garden.preview_schedule")}
                      </h3>
                    </div>
                    <p className="text-xs text-sand-300 mt-0.5">
                      {locale === "th"
                        ? "คำนวณตามสภาพอากาศประเทศไทยและตำแหน่งจริงของต้นไม้"
                        : "Computed in real-time for Thailand climate and real pot condition"}
                    </p>
                  </div>

                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-forest-700/80 text-sand-100 text-xs font-semibold backdrop-blur-sm self-start sm:self-auto">
                    <span>
                      {currentSeason === "hot"
                        ? "☀️ ฤดูร้อน (มี.ค.–พ.ค.)"
                        : currentSeason === "rainy"
                        ? "🌧️ ฤดูฝน (มิ.ย.–ต.ค.)"
                        : "❄️ ฤดูหนาว/แล้ง (พ.ย.–ก.พ.)"}
                    </span>
                  </div>
                </div>

                {/* Factor Breakdown Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="bg-forest-700/40 rounded-2xl p-3 border border-forest-600/40">
                    <span className="text-xs text-sand-300 block">
                      {locale === "th" ? "รอบพื้นฐาน" : "Base Interval"}
                    </span>
                    <span className="text-lg font-bold text-sand-100">
                      {calculationPreview.baseDays} วัน
                    </span>
                  </div>
                  <div className="bg-forest-700/40 rounded-2xl p-3 border border-forest-600/40">
                    <span className="text-xs text-sand-300 block">
                      {locale === "th" ? "วัสดุกระถาง" : "Pot Material"}
                    </span>
                    <span className="text-lg font-bold text-sand-100">
                      ×{calculationPreview.materialFactor.toFixed(2)}
                    </span>
                  </div>
                  <div className="bg-forest-700/40 rounded-2xl p-3 border border-forest-600/40">
                    <span className="text-xs text-sand-300 block">
                      {locale === "th" ? "ขนาดกระถาง" : "Pot Size"}
                    </span>
                    <span className="text-lg font-bold text-sand-100">
                      ×{calculationPreview.sizeFactor.toFixed(2)}
                    </span>
                  </div>
                  <div className="bg-forest-700/40 rounded-2xl p-3 border border-forest-600/40">
                    <span className="text-xs text-sand-300 block">
                      {locale === "th" ? "ตำแหน่งแสง" : "Placement"}
                    </span>
                    <span className="text-lg font-bold text-sand-100">
                      ×{calculationPreview.placementFactor.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Math Formula Display */}
                <div className="bg-forest-950/60 rounded-2xl p-4 border border-forest-700/60 space-y-2">
                  <div className="flex items-center justify-between text-xs text-sand-400">
                    <span>{locale === "th" ? "สูตรคำนวณ" : "Formula"}</span>
                    <span>{locale === "th" ? "ปัดเศษและคุมกรอบ 1–30 วัน" : "Clamped 1–30 days"}</span>
                  </div>
                  <code className="text-sm sm:text-base text-forest-200 font-mono block">
                    {calculationPreview.formula}
                  </code>
                </div>

                {/* Result Recommendation Callout */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
                  <div>
                    <span className="text-xs text-sand-300 block mb-1">
                      {locale === "th" ? "คำแนะนำการดูแลสำหรับต้นนี้:" : "Schedule summary:"}
                    </span>
                    <p className="text-xs sm:text-sm text-sand-200 leading-relaxed max-w-xl">
                      {locale === "th"
                        ? calculationPreview.descriptionTh
                        : calculationPreview.descriptionEn}
                    </p>
                  </div>

                  <div className="bg-white/10 rounded-2xl p-4 text-center shrink-0 border border-white/10">
                    <span className="text-xs text-sand-300 block">
                      {locale === "th" ? "รอบรดน้ำแนะนำ" : "Recommended"}
                    </span>
                    <span className="text-3xl sm:text-4xl font-serif font-bold text-sand-50 block mt-1">
                      ทุก {calculationPreview.finalIntervalDays} วัน
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation and Submit buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-sand-100 dark:border-forest-800/60">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-sand-300 dark:border-forest-700 text-sand-700 dark:text-sand-300 text-sm font-medium hover:bg-sand-100 dark:hover:bg-forest-800/60 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{locale === "th" ? "ย้อนกลับ" : "Back"}</span>
              </button>

              <button
                type="button"
                disabled={!isStep4Valid || submitting}
                onClick={handleSubmit}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-forest-800 hover:bg-forest-900 dark:bg-forest-700 dark:hover:bg-forest-600 text-sand-50 font-bold text-sm sm:text-base transition disabled:opacity-40 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-sand-50 border-t-transparent rounded-full animate-spin" />
                    <span>{locale === "th" ? "กำลังบันทึก..." : "Saving..."}</span>
                  </>
                ) : (
                  <>
                    <Sprout className="w-5 h-5 text-forest-300" />
                    <span>{t("garden.submit_add")}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
