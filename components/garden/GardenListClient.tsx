"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useApp } from "@/lib/context/AppContext";
import {
  Sprout,
  Plus,
  Droplets,
  Calendar,
  AlertCircle,
  Clock,
  CheckCircle2,
  ArrowRight,
  Sun,
  Layers,
  ChevronRight,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import {
  POT_MATERIAL_FACTORS,
  PLACEMENT_FACTORS,
  PotMaterial,
  Placement,
} from "@/lib/care/scheduler";

export interface UserPlantListItem {
  id: string;
  nickname: string;
  photoUrl?: string | null;
  displayPhoto: string;
  acquiredAt: string;
  acquiredFrom: "shop" | "elsewhere" | "gift" | "propagated";
  potSizeInch: string;
  potMaterial: PotMaterial;
  placement: Placement;
  customWaterDays?: number | null;
  customSpeciesName?: string | null;
  speciesId?: string | null;
  speciesNameTh?: string | null;
  speciesNameEn?: string | null;
  speciesSlug?: string | null;
  statusBadge: {
    type: "overdue" | "today" | "upcoming";
    label: string;
    days: number;
  };
  nextTask: {
    id: string;
    dueDate: string;
    type: string;
    status: string;
    snoozeCount?: number;
  } | null;
}

export function GardenListClient() {
  const { user, guestToken, addToast, t, locale } = useApp();
  const [plants, setPlants] = useState<UserPlantListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<"all" | "due" | "upcoming">("all");

  const fetchPlants = useCallback(async () => {
    try {
      setLoading(true);
      const queryParam = user.id ? `userId=${user.id}` : `guestToken=${guestToken}`;
      const res = await fetch(`/api/garden/plants?${queryParam}`);
      if (!res.ok) {
        throw new Error("Failed to load plants");
      }
      const data = await res.json();
      setPlants(data.plants || []);
    } catch (err) {
      console.error("Error fetching garden plants:", err);
      addToast(
        locale === "th"
          ? "ไม่สามารถโหลดข้อมูลต้นไม้ได้ กรุณาลองใหม่"
          : "Failed to load garden plants",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [user.id, guestToken, locale, addToast]);

  useEffect(() => {
    fetchPlants();
  }, [fetchPlants]);

  // One-click quick watered action
  const handleQuickWater = async (plant: UserPlantListItem, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!plant.nextTask) return;
    setActionLoadingId(plant.id);

    try {
      const res = await fetch("/api/garden/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userPlantId: plant.id,
          taskId: plant.nextTask.id,
          action: "complete",
          source: "app",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to record watering");
      }

      const successMsg =
        locale === "th"
          ? `รดน้ำ "${plant.nickname}" เรียบร้อยแล้ว! ${
              data.nextDueDate ? `(รอบถัดไป ${data.nextDueDate})` : ""
            }`
          : `Watered "${plant.nickname}"! ${
              data.nextDueDate ? `(Next due: ${data.nextDueDate})` : ""
            }`;
      addToast(successMsg, "success");

      // Refetch to refresh status badges and next due task
      await fetchPlants();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error completing task";
      addToast(msg, "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filtered plant list
  const filteredPlants = useMemo(() => {
    if (filterTab === "due") {
      return plants.filter(
        (p) =>
          p.statusBadge.type === "overdue" || p.statusBadge.type === "today"
      );
    }
    if (filterTab === "upcoming") {
      return plants.filter((p) => p.statusBadge.type === "upcoming");
    }
    return plants;
  }, [plants, filterTab]);

  const overdueCount = plants.filter((p) => p.statusBadge.type === "overdue").length;
  const todayCount = plants.filter((p) => p.statusBadge.type === "today").length;
  const urgentCount = overdueCount + todayCount;

  return (
    <div className="min-h-[calc(100vh-140px)] bg-sand-50 dark:bg-forest-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-sand-200 dark:border-forest-800/60 pb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-forest-800 text-sand-50 dark:bg-forest-700">
                <Sprout className="w-6 h-6 text-forest-300" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-forest-900 dark:text-sand-100">
                {t("garden.title")}
              </h1>
            </div>
            <p className="mt-1 text-sm text-sand-600 dark:text-sand-300">
              {t("garden.subtitle")}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/today"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-sand-300 dark:border-forest-700 bg-white dark:bg-forest-900/80 text-sand-700 dark:text-sand-200 hover:border-forest-500 hover:text-forest-900 dark:hover:text-sand-100 font-medium text-sm transition shadow-sm"
            >
              <Calendar className="w-4 h-4 text-forest-600 dark:text-forest-400" />
              <span>{locale === "th" ? "งานวันนี้" : "Today's Care"}</span>
              {urgentCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-rose-500 text-white">
                  {urgentCount}
                </span>
              )}
            </Link>

            <Link
              href="/garden/add"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 dark:bg-forest-700 dark:hover:bg-forest-600 text-sand-50 font-medium text-sm transition shadow-sm"
            >
              <Plus className="w-4 h-4 text-forest-300" />
              <span>{t("garden.add_plant")}</span>
            </Link>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-forest-900/70 rounded-2xl border border-sand-200 dark:border-forest-800/80 p-5 space-y-4"
              >
                <div className="h-44 bg-sand-200 dark:bg-forest-800/50 rounded-xl" />
                <div className="h-5 bg-sand-200 dark:bg-forest-800/50 rounded w-2/3" />
                <div className="h-4 bg-sand-100 dark:bg-forest-800/30 rounded w-1/2" />
                <div className="h-10 bg-sand-100 dark:bg-forest-800/40 rounded-xl" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State Onboarding Card */}
        {!loading && plants.length === 0 && (
          <div className="bg-white dark:bg-forest-900/70 border border-sand-200 dark:border-forest-800/80 rounded-3xl p-8 sm:p-12 text-center shadow-sm max-w-3xl mx-auto space-y-8">
            <div className="w-20 h-20 mx-auto rounded-full bg-forest-50 dark:bg-forest-800/50 flex items-center justify-center text-forest-700 dark:text-forest-300 ring-8 ring-forest-50/50 dark:ring-forest-800/20">
              <Sprout className="w-10 h-10" />
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-forest-900 dark:text-sand-100">
                {t("garden.empty_title")}
              </h2>
              <p className="text-sand-600 dark:text-sand-300 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
                {t("garden.empty_desc")}
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/garden/add"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-forest-800 hover:bg-forest-900 dark:bg-forest-700 dark:hover:bg-forest-600 text-sand-50 font-semibold text-base transition shadow-md hover:shadow-lg"
              >
                <Plus className="w-5 h-5 text-forest-300" />
                <span>
                  {locale === "th" ? "เพิ่มต้นไม้ต้นแรกของคุณ" : "Add Your First Plant"}
                </span>
              </Link>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left pt-6 border-t border-sand-100 dark:border-forest-800/60">
              <div className="p-4 rounded-2xl bg-sand-50 dark:bg-forest-800/40 border border-sand-200/60 dark:border-forest-800/40 space-y-1.5">
                <span className="text-2xl" role="img" aria-label="sun and rain">
                  🌦️
                </span>
                <h3 className="font-semibold text-sm text-forest-900 dark:text-sand-100">
                  {locale === "th" ? "3 ฤดูกาลไทย" : "Thai 3-Season"}
                </h3>
                <p className="text-xs text-sand-600 dark:text-sand-400">
                  {locale === "th"
                    ? "ร้อน ฝน หนาว ดินแห้งช้าเร็วต่างกัน คำนวณรอบรดน้ำแม่นยำ"
                    : "Hot, Rainy, Cool seasons automatically adjust water cycles"}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-sand-50 dark:bg-forest-800/40 border border-sand-200/60 dark:border-forest-800/40 space-y-1.5">
                <span className="text-2xl" role="img" aria-label="potted plant">
                  🪴
                </span>
                <h3 className="font-semibold text-sm text-forest-900 dark:text-sand-100">
                  {locale === "th" ? "กระถาง & ตำแหน่งจริง" : "Pot & Microclimate"}
                </h3>
                <p className="text-xs text-sand-600 dark:text-sand-400">
                  {locale === "th"
                    ? "ดินเผา พลาสติก เซรามิก แดดจัด ระเบียง แอร์ ปรับตัวคูณตามจริง"
                    : "Terracotta, plastic, ceramic, outdoor, window, or AC room"}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-sand-50 dark:bg-forest-800/40 border border-sand-200/60 dark:border-forest-800/40 space-y-1.5">
                <span className="text-2xl" role="img" aria-label="water droplet">
                  💧
                </span>
                <h3 className="font-semibold text-sm text-forest-900 dark:text-sand-100">
                  {locale === "th" ? "รดแล้วบันทึก 1 คลิก" : "1-Click Watered"}
                </h3>
                <p className="text-xs text-sand-600 dark:text-sand-400">
                  {locale === "th"
                    ? "บันทึกสะดวกรวดเร็ว ดูปฏิทิน 30 วัน และประวัติย้อนหลัง"
                    : "Log care in 1 second, view 30-day forecast and history"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Plants List View */}
        {!loading && plants.length > 0 && (
          <div className="space-y-6">
            {/* Filter Tabs & Plant Count */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 p-1 rounded-xl bg-sand-200/60 dark:bg-forest-900 border border-sand-200 dark:border-forest-800">
                <button
                  type="button"
                  onClick={() => setFilterTab("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition ${
                    filterTab === "all"
                      ? "bg-white dark:bg-forest-800 text-forest-900 dark:text-sand-100 shadow-sm"
                      : "text-sand-600 dark:text-sand-300 hover:text-forest-900"
                  }`}
                >
                  {locale === "th" ? "ทั้งหมด" : "All"} ({plants.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab("due")}
                  className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition ${
                    filterTab === "due"
                      ? "bg-white dark:bg-forest-800 text-forest-900 dark:text-sand-100 shadow-sm"
                      : "text-sand-600 dark:text-sand-300 hover:text-forest-900"
                  }`}
                >
                  {locale === "th" ? "ต้องรดน้ำ" : "Due / Overdue"} ({urgentCount})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab("upcoming")}
                  className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition ${
                    filterTab === "upcoming"
                      ? "bg-white dark:bg-forest-800 text-forest-900 dark:text-sand-100 shadow-sm"
                      : "text-sand-600 dark:text-sand-300 hover:text-forest-900"
                  }`}
                >
                  {locale === "th" ? "รอบถัดไป" : "Upcoming"} (
                  {plants.length - urgentCount})
                </button>
              </div>

              <div className="text-xs sm:text-sm text-sand-500 dark:text-sand-400">
                {t("garden.my_plants_count", { count: plants.length })}
              </div>
            </div>

            {/* Plants Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPlants.map((plant) => {
                const badge = plant.statusBadge;
                const matInfo = POT_MATERIAL_FACTORS[plant.potMaterial];
                const placeInfo = PLACEMENT_FACTORS[plant.placement];

                const isWatering = actionLoadingId === plant.id;
                const hasPendingTask = !!plant.nextTask;

                return (
                  <div
                    key={plant.id}
                    className="bg-white dark:bg-forest-900/80 rounded-2xl border border-sand-200 dark:border-forest-800/80 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col group"
                  >
                    {/* Plant Image & Quick Status Bar */}
                    <div className="relative h-48 w-full bg-sand-100 dark:bg-forest-950 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={plant.displayPhoto}
                        alt={plant.nickname}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        loading="lazy"
                      />

                      {/* Accessible Colorblind-safe Status Badge */}
                      <div className="absolute top-3 left-3">
                        {badge.type === "overdue" && (
                          <div
                            role="status"
                            aria-label={locale === "th" ? `สถานะเลยกำหนด ${Math.abs(badge.days)} วัน` : `Overdue ${Math.abs(badge.days)} days`}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-700 text-rose-800 dark:text-rose-200 text-xs font-bold shadow-sm backdrop-blur-sm"
                          >
                            <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                            <span>
                              {locale === "th"
                                ? `เลยกำหนด ${Math.abs(badge.days)} วัน`
                                : `Overdue ${Math.abs(badge.days)}d`}
                            </span>
                          </div>
                        )}

                        {badge.type === "today" && (
                          <div
                            role="status"
                            aria-label={locale === "th" ? "สถานะต้องรดน้ำวันนี้" : "Water today"}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs font-bold shadow-sm backdrop-blur-sm"
                          >
                            <span
                              className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block ring-2 ring-amber-200 dark:ring-amber-800"
                              aria-hidden="true"
                            />
                            <span>{t("care.due_today")}</span>
                          </div>
                        )}

                        {badge.type === "upcoming" && (
                          <div
                            role="status"
                            aria-label={locale === "th" ? `สถานะรดน้ำอีก ${badge.days} วัน` : `Water in ${badge.days} days`}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 text-xs font-medium shadow-sm backdrop-blur-sm"
                          >
                            <span
                              className="w-2.5 h-2.5 rounded-full border-2 border-emerald-600 dark:border-emerald-400 inline-block"
                              aria-hidden="true"
                            />
                            <span>
                              {locale === "th"
                                ? `อีก ${badge.days} วัน`
                                : `In ${badge.days}d`}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Source badge on right */}
                      {plant.speciesSlug && (
                        <div className="absolute top-3 right-3">
                          <span className="px-2.5 py-1 rounded-full bg-forest-900/70 text-sand-100 text-[11px] font-medium backdrop-blur-sm">
                            {locale === "th" ? "มีในระบบ" : "Catalog"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Plant Info Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-serif font-bold text-lg text-forest-900 dark:text-sand-100 leading-snug">
                              {plant.nickname}
                            </h3>
                            <p className="text-xs text-sand-500 dark:text-sand-400">
                              {locale === "th" ? (
                                <>
                                  {plant.speciesNameTh || plant.customSpeciesName || plant.speciesNameEn}
                                  {plant.speciesNameEn && plant.speciesNameTh ? ` (${plant.speciesNameEn})` : ""}
                                </>
                              ) : (
                                plant.speciesNameEn || plant.customSpeciesName || plant.speciesNameTh
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Pot & Placement tags */}
                        <div className="flex flex-wrap gap-1.5 text-[11px] text-sand-600 dark:text-sand-300">
                          <span className="px-2 py-0.5 rounded-md bg-sand-100 dark:bg-forest-800/60 border border-sand-200/60 dark:border-forest-700/60 flex items-center gap-1">
                            <Layers className="w-3 h-3 text-sand-400" />
                            <span>
                              {plant.potSizeInch}&quot; •{" "}
                              {locale === "th" ? matInfo?.labelTh || plant.potMaterial : matInfo?.labelEn || plant.potMaterial}
                            </span>
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-sand-100 dark:bg-forest-800/60 border border-sand-200/60 dark:border-forest-700/60 flex items-center gap-1">
                            <Sun className="w-3 h-3 text-sand-400" />
                            <span>
                              {locale === "th" ? placeInfo?.labelTh || plant.placement : placeInfo?.labelEn || plant.placement}
                            </span>
                          </span>
                        </div>
                      </div>

                      {/* Actions footer */}
                      <div className="pt-3 border-t border-sand-100 dark:border-forest-800/60 flex items-center justify-between gap-3">
                        <Link
                          href={`/garden/${plant.id}`}
                          className="text-xs font-medium text-forest-700 dark:text-sand-300 hover:text-forest-900 dark:hover:text-sand-100 inline-flex items-center gap-1 transition"
                        >
                          <span>{locale === "th" ? "ดูตารางดูแล" : "Care Details"}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>

                        {/* One-click "Watered" (รดแล้ว) Button */}
                        {hasPendingTask ? (
                          <button
                            type="button"
                            onClick={(e) => handleQuickWater(plant, e)}
                            disabled={isWatering}
                            aria-label={`บันทึกการรดน้ำสำหรับ ${plant.nickname}`}
                            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-semibold text-xs transition shadow-sm ${
                              badge.type === "overdue"
                                ? "bg-rose-600 hover:bg-rose-700 text-white"
                                : badge.type === "today"
                                ? "bg-amber-600 hover:bg-amber-700 text-white"
                                : "bg-forest-800 hover:bg-forest-900 dark:bg-forest-700 text-sand-50"
                            } ${isWatering ? "opacity-60 cursor-not-allowed" : ""}`}
                          >
                            <Droplets className={`w-3.5 h-3.5 ${isWatering ? "animate-spin" : ""}`} />
                            <span>{t("care.action_water_done")}</span>
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{locale === "th" ? "รดแล้ว" : "All Done"}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
