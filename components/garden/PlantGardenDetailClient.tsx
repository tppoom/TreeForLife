"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/context/AppContext";
import {
  Calendar,
  Droplets,
  Clock,
  Archive,
  MessageCircle,
  Sparkles,
  ArrowLeft,
  Check,
  AlertTriangle,
  Layers,
  Home,
  CheckCircle2,
} from "lucide-react";

interface PlantDetailProps {
  plant: {
    id: string;
    nickname: string;
    photoUrl?: string | null;
    acquiredAt: string;
    acquiredFrom: string;
    potSizeInch: string;
    potMaterial: string;
    placement: string;
    customWaterDays?: number | null;
    speciesId?: string | null;
    speciesNameTh?: string | null;
    speciesNameEn?: string | null;
    speciesNameSci?: string | null;
    speciesSlug?: string | null;
    shopNote?: string | null;
    calculation: any;
    tasks: any[];
    logs: any[];
  };
}

export function PlantGardenDetailClient({ plant }: PlantDetailProps) {
  const router = useRouter();
  const { openInquiryModal, showToast, t, locale } = useApp();

  const [tasks, setTasks] = useState(plant.tasks);
  const [logs, setLogs] = useState(plant.logs);
  const [wateringLoading, setWateringLoading] = useState(false);

  const pendingTask = tasks.find((t) => t.status === "pending");

  const handleWater = async () => {
    if (!pendingTask) return;
    setWateringLoading(true);
    try {
      const res = await fetch("/api/garden/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userPlantId: plant.id,
          taskId: pendingTask.id,
          action: "done",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to log watering");

      const successMsg =
        locale === "th"
          ? `รดน้ำ ${plant.nickname} แล้ว! รอบถัดไปคือ ${data.nextDueDate}`
          : `Watered ${plant.nickname}! Next due: ${data.nextDueDate}`;
      showToast(successMsg, "success");
      router.refresh();
    } catch (err: any) {
      showToast(err.message, "warning");
    } finally {
      setWateringLoading(false);
    }
  };

  const handleArchive = async () => {
    const confirmPrompt =
      locale === "th"
        ? `ต้องการย้าย "${plant.nickname}" ไปยังคลังประวัติ (Archive) ใช่หรือไม่?`
        : `Move "${plant.nickname}" to Archive?`;
    if (!confirm(confirmPrompt)) return;
    try {
      await fetch(`/api/garden/plants/${plant.id}/archive`, { method: "POST" });
      showToast(
        locale === "th" ? `ย้าย "${plant.nickname}" ไปคลังประวัติแล้ว` : `Moved "${plant.nickname}" to archive`,
        "info"
      );
      router.push("/garden");
    } catch (e) {
      router.push("/garden");
    }
  };

  const speciesTitle =
    locale === "th"
      ? (plant.speciesNameTh || "พันธุ์อื่น ๆ")
      : (plant.speciesNameEn || plant.speciesNameTh || "Other Species");

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-20">
      {/* Back button & Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/garden"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 dark:text-sand-400 hover:text-forest-900 dark:hover:text-gold-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.garden.backToGarden}</span>
        </Link>

        <button
          onClick={handleArchive}
          className="inline-flex items-center gap-1.5 text-xs text-stone-400 dark:text-sand-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
        >
          <Archive className="w-3.5 h-3.5" />
          <span>{t.garden.archiveBtn}</span>
        </button>
      </div>

      {/* Hero Header Card */}
      <div className="bg-white dark:bg-[#0e2117] rounded-3xl p-6 sm:p-8 border border-sand-200 dark:border-forest-800 shadow-soft flex flex-col md:flex-row gap-6 md:items-center justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-900/5 dark:bg-forest-800/30 text-forest-800 dark:text-gold-400 text-xs font-medium border border-forest-900/10 dark:border-forest-700/30">
            <Sparkles className="w-3.5 h-3.5 text-gold-500" />
            <span>{t.garden.caredSince} {plant.acquiredAt}</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-stone-900 dark:text-sand-50">
            {plant.nickname}
          </h1>
          <p className="font-serif text-base text-stone-600 dark:text-sand-400 italic">
            {speciesTitle} {plant.speciesNameSci && `(${plant.speciesNameSci})`}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {pendingTask && (
            <button
              onClick={handleWater}
              disabled={wateringLoading}
              className="py-3 px-5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <Droplets className="w-4 h-4" />
              <span>{wateringLoading ? t.garden.recordingBtn : t.garden.waterTodayDone}</span>
            </button>
          )}

          <button
            onClick={() =>
              openInquiryModal({
                speciesId: plant.speciesId,
                speciesNameTh: speciesTitle || plant.nickname,
                defaultIntent: "care_help",
                customNote: `ต้นชื่อ "${plant.nickname}" เลี้ยงมาตั้งแต่ ${plant.acquiredAt}`,
              })
            }
            className="py-3 px-4 rounded-2xl bg-[#06C755] hover:bg-[#05b34c] text-white font-medium text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{t.garden.askShopThisPlant}</span>
          </button>
        </div>
      </div>

      {/* Grid: Care Schedule Calculation Breakdown & Current Conditions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Conditions Card */}
        <div className="bg-white dark:bg-[#0e2117] p-6 rounded-2xl border border-sand-200 dark:border-forest-800 shadow-soft space-y-4">
          <h3 className="font-serif text-base font-semibold text-stone-900 dark:text-sand-50 border-b border-sand-100 dark:border-forest-800 pb-2">
            {t.garden.currentEnv}
          </h3>
          <div className="space-y-3 text-xs text-stone-700 dark:text-sand-300">
            <div className="flex items-center justify-between">
              <span className="text-stone-500 dark:text-sand-400">{t.garden.potSize}</span>
              <span className="font-semibold text-stone-900 dark:text-sand-100">{plant.potSizeInch} {t.garden.inches}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-500 dark:text-sand-400">{t.garden.potMaterial}</span>
              <span className="font-semibold text-stone-900 dark:text-sand-100">{plant.potMaterial}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-500 dark:text-sand-400">{t.garden.placement}</span>
              <span className="font-semibold text-stone-900 dark:text-sand-100">{plant.placement}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-500 dark:text-sand-400">{t.garden.acquiredFrom}</span>
              <span className="font-semibold text-stone-900 dark:text-sand-100">{plant.acquiredFrom}</span>
            </div>
          </div>
        </div>

        {/* Engine Math Explanation Card (SPEC §5.4) */}
        {plant.calculation && (
          <div className="md:col-span-2 p-6 rounded-2xl bg-forest-950 text-sand-50 border border-gold-500/40 shadow-soft space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gold-400">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  {t.garden.careEngineResults}
                </span>
              </div>
              <span className="px-3 py-1 rounded-full bg-gold-400 text-forest-950 font-bold text-xs">
                {t.garden.waterInterval.replace("{days}", String(plant.calculation.finalDays))}
              </span>
            </div>

            <div className="text-xs text-sand-300 space-y-2 pt-2 border-t border-forest-800 leading-relaxed">
              <p>
                <span className="text-sand-100 font-medium">{t.garden.currentSeason}</span>{" "}
                {locale === "en" ? (plant.calculation.seasonNameEn || plant.calculation.seasonNameTh) : plant.calculation.seasonNameTh}
              </p>
              <p>
                <span className="text-sand-100 font-medium">{t.garden.mathFormula}</span>{" "}
                {locale === "en" ? (plant.calculation.explanationEn || plant.calculation.explanationTh) : plant.calculation.explanationTh}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 30-Day Tasks Schedule (SPEC §6.6) */}
      <section className="bg-white dark:bg-[#0e2117] rounded-3xl p-6 sm:p-8 border border-sand-200 dark:border-forest-800 shadow-soft space-y-4">
        <div className="flex items-center justify-between border-b border-sand-100 dark:border-forest-800 pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-forest-800 dark:text-gold-400" />
            <h3 className="font-serif text-lg font-semibold text-stone-900 dark:text-sand-50">
              {t.garden.thirtyDayTitle}
            </h3>
          </div>
          <span className="text-xs text-stone-500 dark:text-sand-400">
            {tasks.filter((t) => t.status === "pending").length} {t.garden.pendingTasksSuffix}
          </span>
        </div>

        <div className="space-y-2">
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-sand-50 dark:bg-forest-900/40 border border-sand-200 dark:border-forest-800 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      task.status === "done"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        : task.status === "skipped"
                        ? "bg-stone-200 text-stone-600 dark:bg-forest-800 dark:text-sand-400"
                        : "bg-forest-900 text-sand-50 dark:bg-forest-800 dark:text-sand-100"
                    }`}
                  >
                    {task.type === "water" ? <Droplets className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="font-semibold text-stone-900 dark:text-sand-100">
                      {task.type === "water" ? t.garden.waterPlantTask : task.type}
                    </p>
                    <p className="text-stone-500 dark:text-sand-400">{t.garden.dueLabel} {task.dueDate}</p>
                  </div>
                </div>

                <div>
                  {task.status === "done" && (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-medium text-[11px] border border-emerald-300 dark:border-emerald-800">
                      {t.garden.taskDone}
                    </span>
                  )}
                  {task.status === "pending" && (
                    <span className="px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 font-medium text-[11px] border border-amber-300 dark:border-amber-800">
                      {t.garden.taskPending}
                    </span>
                  )}
                  {task.status === "skipped" && (
                    <span className="px-2.5 py-1 rounded-full bg-stone-100 dark:bg-forest-800 text-stone-600 dark:text-sand-300 font-medium text-[11px] border border-stone-200 dark:border-forest-700">
                      {t.garden.taskSkipped}
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-stone-500 dark:text-sand-400 py-4 text-center">{t.garden.noCalendarTasks}</p>
          )}
        </div>
      </section>

      {/* Care Logs Timeline History (SPEC §6.6) */}
      <section className="bg-white dark:bg-[#0e2117] rounded-3xl p-6 sm:p-8 border border-sand-200 dark:border-forest-800 shadow-soft space-y-4">
        <div className="flex items-center gap-2 border-b border-sand-100 dark:border-forest-800 pb-3">
          <Clock className="w-5 h-5 text-forest-800 dark:text-gold-400" />
          <h3 className="font-serif text-lg font-semibold text-stone-900 dark:text-sand-50">
            {t.garden.timelineTitle}
          </h3>
        </div>

        {logs.length > 0 ? (
          <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-sand-200 dark:before:bg-forest-800">
            {logs.map((log) => (
              <div key={log.id} className="relative text-xs space-y-1">
                <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-emerald-600 ring-4 ring-white dark:ring-[#0e2117]" />
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-stone-900 dark:text-sand-100">
                    {log.type === "water" ? t.garden.waterSuccess : log.type}
                  </span>
                  <span className="text-stone-400 dark:text-sand-500">
                    {new Date(log.performedAt).toLocaleString(locale === "th" ? "th-TH" : "en-US")}
                  </span>
                </div>
                {log.note && <p className="text-stone-600 dark:text-sand-400">{log.note}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-stone-500 dark:text-sand-400 py-4 text-center">{t.garden.noLogs}</p>
        )}
      </section>
    </div>
  );
}
