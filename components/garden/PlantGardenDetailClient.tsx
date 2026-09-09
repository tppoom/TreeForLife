"use client";

import React, { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/context/AppContext";
import { InquiryModal } from "@/components/ui/InquiryModal";
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
  Calendar as CalendarIcon,
  Droplets,
  Sparkles,
  Clock,
  MessageCircle,
  Archive,
  Save,
  Edit3,
  AlertCircle,
  CheckCircle2,
  Layers,
  Sun,
  Check,
  ChevronRight,
  Info,
  BookOpen,
  RefreshCw,
  Sprout,
} from "lucide-react";
import type { getUserPlantById } from "@/lib/services/gardenService";

export type PlantDetailData = NonNullable<Awaited<ReturnType<typeof getUserPlantById>>>;

export interface PlantGardenDetailProps {
  initialPlant: PlantDetailData;
}

export function PlantGardenDetailClient({ initialPlant }: PlantGardenDetailProps) {
  const router = useRouter();
  const { user, guestToken, addToast, t, locale } = useApp();

  const [plant, setPlant] = useState(initialPlant);
  const [tasks, setTasks] = useState(initialPlant.tasks || []);
  const [logs, setLogs] = useState(initialPlant.logs || []);

  // UI States
  const [isWatering, setIsWatering] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [isEditingEnv, setIsEditingEnv] = useState(false);
  const [isSavingEnv, setIsSavingEnv] = useState(false);

  // Environmental Edit Form State
  const [editNickname, setEditNickname] = useState(plant.nickname);
  const [editPotSize, setEditPotSize] = useState<number>(Number(plant.potSizeInch) || 8);
  const [editPotMaterial, setEditPotMaterial] = useState<PotMaterial>(
    (plant.potMaterial as PotMaterial) || "plastic"
  );
  const [editPlacement, setEditPlacement] = useState<Placement>(
    (plant.placement as Placement) || "indoor_window"
  );
  const [editUseCustomWater, setEditUseCustomWater] = useState(!!plant.customWaterDays);
  const [editCustomWaterDays, setEditCustomWaterDays] = useState<number | "">(
    plant.customWaterDays || ""
  );
  const [editNotes, setEditNotes] = useState(plant.notes || "");

  // 30-Day Calendar State
  const todayStr = useMemo(() => formatDate(new Date()), []);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>(todayStr);

  // Live recalculation based on edit form values
  const liveCalculation = useMemo(() => {
    return explainCareSchedule({
      template: plant.template ? (plant.template as any) : undefined,
      plantConfig: {
        potSizeInch: editPotSize,
        potMaterial: editPotMaterial,
        placement: editPlacement,
        customWaterDays:
          editUseCustomWater && editCustomWaterDays ? Number(editCustomWaterDays) : undefined,
      },
    });
  }, [plant.template, editPotSize, editPotMaterial, editPlacement, editUseCustomWater, editCustomWaterDays]);

  // Next Pending Task
  const nextTask = useMemo(() => {
    return tasks.find((t) => t.status === "pending") || null;
  }, [tasks]);

  // Compute status badge
  const statusBadge = useMemo(() => {
    if (!nextTask) {
      return {
        type: "all_done" as const,
        label: locale === "th" ? "ดูแลครบแล้ว" : "All caught up",
        days: 0,
      };
    }

    const today = new Date(todayStr);
    const due = new Date(nextTask.dueDate);
    const diffDays = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        type: "overdue" as const,
        label: locale === "th" ? `เลยกำหนด ${Math.abs(diffDays)} วัน` : `Overdue ${Math.abs(diffDays)}d`,
        days: diffDays,
      };
    }
    if (diffDays === 0) {
      return {
        type: "today" as const,
        label: t("care.due_today"),
        days: 0,
      };
    }
    return {
      type: "upcoming" as const,
      label: locale === "th" ? `อีก ${diffDays} วัน` : `In ${diffDays}d`,
      days: diffDays,
    };
  }, [nextTask, todayStr, locale, t]);

  // Handle Quick Water Complete Action
  const handleCompleteTask = async (taskId?: string) => {
    const targetTaskId = taskId || nextTask?.id;
    if (!targetTaskId) return;

    setIsWatering(true);
    try {
      const res = await fetch("/api/garden/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userPlantId: plant.id,
          taskId: targetTaskId,
          action: "complete",
          source: "app",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to record task");

      addToast(
        locale === "th"
          ? `รดน้ำ "${plant.nickname}" เรียบร้อยแล้ว! ${
              data.nextDueDate ? `(รอบถัดไป ${data.nextDueDate})` : ""
            }`
          : `Watered "${plant.nickname}"! ${
              data.nextDueDate ? `(Next due: ${data.nextDueDate})` : ""
            }`,
        "success"
      );

      // Refresh tasks and logs from server
      const refreshedPlantRes = await fetch(`/api/garden/plants/${plant.id}`);
      if (refreshedPlantRes.ok) {
        const refreshedData = await refreshedPlantRes.json();
        if (refreshedData.plant) {
          setPlant(refreshedData.plant);
          setTasks(refreshedData.plant.tasks || []);
          setLogs(refreshedData.plant.logs || []);
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error completing task";
      addToast(msg, "error");
    } finally {
      setIsWatering(false);
    }
  };

  // Handle Save Environmental Settings
  const handleSaveEnvSettings = async () => {
    setIsSavingEnv(true);
    try {
      const payload = {
        nickname: editNickname.trim() || plant.nickname,
        potSizeInch: editPotSize,
        potMaterial: editPotMaterial,
        placement: editPlacement,
        customWaterDays:
          editUseCustomWater && editCustomWaterDays ? Number(editCustomWaterDays) : null,
        notes: editNotes.trim() || null,
      };

      const res = await fetch(`/api/garden/plants/${plant.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update settings");

      if (data.plant) {
        setPlant((prev) => ({
          ...prev,
          ...data.plant,
          calculation: data.plant.calculation || liveCalculation,
        }));
      }

      addToast(
        locale === "th"
          ? "บันทึกการตั้งค่าสภาพแวดล้อมเรียบร้อยแล้ว"
          : "Saved environmental settings successfully",
        "success"
      );
      setIsEditingEnv(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error updating plant";
      addToast(msg, "error");
    } finally {
      setIsSavingEnv(false);
    }
  };

  // Handle Archive Plant
  const handleArchivePlant = async () => {
    const confirmPrompt =
      locale === "th"
        ? `คุณแน่ใจหรือไม่ว่าต้องการย้าย "${plant.nickname}" ไปยังคลังประวัติ (Archive)?`
        : `Are you sure you want to archive "${plant.nickname}"?`;

    if (!window.confirm(confirmPrompt)) return;

    setIsArchiving(true);
    try {
      const res = await fetch(`/api/garden/plants/${plant.id}/archive`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to archive plant");
      }

      addToast(
        locale === "th"
          ? `ย้าย "${plant.nickname}" เข้าคลังประวัติเรียบร้อยแล้ว`
          : `Archived "${plant.nickname}"`,
        "info"
      );

      router.push("/garden");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error archiving plant";
      addToast(msg, "error");
      setIsArchiving(false);
    }
  };

  // Generate 30-Day Forward Interactive Calendar
  const calendarDays = useMemo(() => {
    const days = [];
    const baseDate = new Date();
    const cycleInterval = liveCalculation.finalIntervalDays || 3;

    // Projected watering dates starting from next due task (or today)
    const projectedWaterDates = new Set<string>();
    let startDue = nextTask ? new Date(nextTask.dueDate) : new Date();
    if (isNaN(startDue.getTime())) startDue = new Date();

    for (let step = 1; step <= 10; step++) {
      const projDate = new Date(startDue.getTime() + step * cycleInterval * 24 * 60 * 60 * 1000);
      projectedWaterDates.add(formatDate(projDate));
    }

    for (let i = 0; i < 30; i++) {
      const d = new Date(baseDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dateStr = formatDate(d);
      const dayNumber = d.getDate();
      const monthNumber = d.getMonth() + 1;

      const dayTasks = tasks.filter((t) => t.dueDate === dateStr);
      const dayLogs = logs.filter((l) => {
        const perf = l.performedAt instanceof Date ? l.performedAt.toISOString() : String(l.performedAt);
        return perf.startsWith(dateStr);
      });

      const isToday = dateStr === todayStr;
      const isProjectedWater = !dayTasks.length && projectedWaterDates.has(dateStr);

      days.push({
        dateStr,
        dayNumber,
        monthNumber,
        isToday,
        tasks: dayTasks,
        logs: dayLogs,
        isProjectedWater,
      });
    }
    return days;
  }, [tasks, logs, todayStr, nextTask, liveCalculation.finalIntervalDays]);

  // Find selected date data for Inspector
  const selectedDayData = useMemo(() => {
    return (
      calendarDays.find((d) => d.dateStr === selectedCalendarDate) || {
        dateStr: selectedCalendarDate,
        dayNumber: 0,
        monthNumber: 0,
        isToday: selectedCalendarDate === todayStr,
        tasks: [],
        logs: [],
        isProjectedWater: false,
      }
    );
  }, [calendarDays, selectedCalendarDate, todayStr]);

  const currentSeasonInfo = getThaiSeasonInfo(getThaiSeason());
  const displayPhoto =
    plant.photoUrl ||
    "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=800&q=80";

  return (
    <div className="min-h-[calc(100vh-140px)] bg-sand-50 dark:bg-forest-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8 pb-20">
        {/* Navigation Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Link
            href="/garden"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-sand-600 dark:text-sand-400 hover:text-forest-900 dark:hover:text-sand-100 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{locale === "th" ? "กลับไปยังสวนของฉัน" : "Back to My Garden"}</span>
          </Link>

          <div className="flex items-center gap-3">
            {/* Ask Shop Button */}
            <button
              type="button"
              onClick={() => setInquiryModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-forest-50 dark:bg-forest-900 border border-forest-300 dark:border-forest-700 text-forest-800 dark:text-sand-100 text-xs font-semibold hover:bg-forest-100 transition shadow-sm"
            >
              <MessageCircle className="w-4 h-4 text-forest-600 dark:text-forest-400" />
              <span>{locale === "th" ? "ปรึกษาร้านเกี่ยวกับต้นไม้นี้" : "Ask Shop About This Plant"}</span>
            </button>

            {/* Archive Plant Button */}
            <button
              type="button"
              onClick={handleArchivePlant}
              disabled={isArchiving}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold transition"
            >
              <Archive className="w-3.5 h-3.5" />
              <span>{locale === "th" ? "ย้ายเข้าคลังประวัติ" : "Archive"}</span>
            </button>
          </div>
        </div>

        {/* HERO PLANT CARD */}
        <div className="bg-white dark:bg-forest-900/80 rounded-3xl border border-sand-200 dark:border-forest-800 overflow-hidden shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3">
            {/* Image Column */}
            <div className="relative h-64 md:h-full bg-sand-100 dark:bg-forest-950 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={displayPhoto}
                alt={plant.nickname}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4">
                {statusBadge.type === "overdue" && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/90 border border-rose-300 dark:border-rose-700 text-rose-800 dark:text-rose-200 text-xs font-bold shadow-sm backdrop-blur-sm">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                    <span>{statusBadge.label}</span>
                  </div>
                )}
                {statusBadge.type === "today" && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/90 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs font-bold shadow-sm backdrop-blur-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                    <span>{statusBadge.label}</span>
                  </div>
                )}
                {statusBadge.type === "upcoming" && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/90 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 text-xs font-medium shadow-sm backdrop-blur-sm">
                    <span className="w-2.5 h-2.5 rounded-full border-2 border-emerald-600 dark:border-emerald-400 inline-block" />
                    <span>{statusBadge.label}</span>
                  </div>
                )}
                {statusBadge.type === "all_done" && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-100 dark:bg-forest-800 text-forest-800 dark:text-sand-100 text-xs font-medium shadow-sm">
                    <CheckCircle2 className="w-3.5 h-3.5 text-forest-600" />
                    <span>{statusBadge.label}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Content Column */}
            <div className="p-6 sm:p-8 md:col-span-2 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-serif font-bold text-forest-900 dark:text-sand-100">
                    {plant.nickname}
                  </h1>
                  <p className="text-sm text-sand-500 dark:text-sand-400 mt-0.5">
                    {locale === "th" ? (
                      <>
                        {plant.speciesNameTh || plant.customSpeciesName || plant.speciesNameEn}
                        {plant.speciesNameEn && plant.speciesNameTh ? ` (${plant.speciesNameEn})` : ""}
                      </>
                    ) : (
                      plant.speciesNameEn || plant.customSpeciesName || plant.speciesNameTh
                    )}
                    {plant.speciesNameSci ? ` • ${plant.speciesNameSci}` : ""}
                  </p>
                </div>

                {/* Quick Attributes */}
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="px-3 py-1.5 rounded-xl bg-sand-100 dark:bg-forest-800 text-forest-900 dark:text-sand-100 flex items-center gap-1.5 font-medium">
                    <Layers className="w-3.5 h-3.5 text-forest-600" />
                    <span>
                      {plant.potSizeInch}&quot; (
                      {locale === "th"
                        ? (POT_MATERIAL_FACTORS[plant.potMaterial as PotMaterial]?.labelTh || plant.potMaterial)
                        : (POT_MATERIAL_FACTORS[plant.potMaterial as PotMaterial]?.labelEn || plant.potMaterial)}
                      )
                    </span>
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-sand-100 dark:bg-forest-800 text-forest-900 dark:text-sand-100 flex items-center gap-1.5 font-medium">
                    <Sun className="w-3.5 h-3.5 text-forest-600" />
                    <span>
                      {locale === "th"
                        ? (PLACEMENT_FACTORS[plant.placement as Placement]?.labelTh || plant.placement)
                        : (PLACEMENT_FACTORS[plant.placement as Placement]?.labelEn || plant.placement)}
                    </span>
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-sand-100 dark:bg-forest-800 text-forest-900 dark:text-sand-100 flex items-center gap-1.5 font-medium">
                    <Clock className="w-3.5 h-3.5 text-forest-600" />
                    <span>
                      {locale === "th" ? "รับมาเลี้ยงเมื่อ" : "Acquired:"} {plant.acquiredAt}
                    </span>
                  </span>
                </div>

                {plant.notes && (
                  <p className="text-xs text-sand-600 dark:text-sand-300 bg-sand-50 dark:bg-forest-950/60 p-3 rounded-xl border border-sand-200 dark:border-forest-800 italic">
                    &ldquo;{plant.notes}&rdquo;
                  </p>
                )}
              </div>

              {/* Next Scheduled Action Box */}
              <div className="p-4 rounded-2xl bg-forest-50/80 dark:bg-forest-800/50 border border-forest-200 dark:border-forest-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-forest-800 dark:text-sand-300 block">
                    {locale === "th" ? "กำหนดการดูแลถัดไป" : "Next Scheduled Care"}
                  </span>
                  {nextTask ? (
                    <span className="text-sm font-semibold text-forest-900 dark:text-sand-100">
                      💧 {locale === "th" ? "รดน้ำ" : "Watering"}: {nextTask.dueDate} (
                      {statusBadge.label})
                    </span>
                  ) : (
                    <span className="text-sm font-semibold text-forest-700 dark:text-sand-300">
                      ✨ {locale === "th" ? "ยังไม่มีงานที่ต้องทำ" : "No pending tasks"}
                    </span>
                  )}
                </div>

                {nextTask && (
                  <button
                    type="button"
                    onClick={() => handleCompleteTask(nextTask.id)}
                    disabled={isWatering}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 dark:bg-forest-700 text-sand-50 font-bold text-xs sm:text-sm transition shadow-sm disabled:opacity-60"
                  >
                    <Droplets className={`w-4 h-4 ${isWatering ? "animate-spin" : ""}`} />
                    <span>{t("care.action_water_done")}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 30-DAY INTERACTIVE CARE CALENDAR SECTION */}
        <div className="bg-white dark:bg-forest-900/80 rounded-3xl border border-sand-200 dark:border-forest-800 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-sand-200 dark:border-forest-800/80 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-forest-700 dark:text-forest-400" />
                <h2 className="text-xl font-serif font-bold text-forest-900 dark:text-sand-100">
                  {t("garden.calendar_30_days")}
                </h2>
              </div>
              <p className="text-xs text-sand-600 dark:text-sand-400 mt-0.5">
                {locale === "th"
                  ? "คลิกที่วันเพื่อดูรายละเอียดงาน คาดการณ์รอบรดน้ำ หรือบันทึกการรดน้ำ"
                  : "Click any day to view details, projected care cycles, or complete tasks"}
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs text-sand-600 dark:text-sand-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-forest-700 inline-block" />
                <span>{locale === "th" ? "มีงานดูแล" : "Task Due"}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full border-2 border-forest-500 border-dashed inline-block" />
                <span>{locale === "th" ? "คาดการณ์ตามรอบ" : "Projected"}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                <span>{locale === "th" ? "เสร็จแล้ว" : "Completed"}</span>
              </span>
            </div>
          </div>

          {/* Calendar Day Grid (30 Days Forward) */}
          <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 gap-2">
            {calendarDays.map((day) => {
              const isSelected = selectedCalendarDate === day.dateStr;
              const hasPending = day.tasks.some((t) => t.status === "pending");
              const hasCompleted = day.logs.length > 0 || day.tasks.some((t) => t.status === "completed");

              return (
                <button
                  key={day.dateStr}
                  type="button"
                  onClick={() => setSelectedCalendarDate(day.dateStr)}
                  className={`p-2 rounded-2xl border text-center transition flex flex-col items-center justify-between min-h-[74px] ${
                    isSelected
                      ? "border-forest-700 bg-forest-50 dark:bg-forest-800 text-forest-900 dark:text-sand-100 ring-2 ring-forest-600 shadow-sm"
                      : day.isToday
                      ? "border-amber-400 bg-amber-50/40 dark:bg-amber-950/20 text-forest-900 dark:text-sand-100"
                      : "border-sand-200 dark:border-forest-800/80 bg-white dark:bg-forest-900/60 hover:border-sand-400 text-sand-700 dark:text-sand-300"
                  }`}
                >
                  <span className="text-[10px] font-medium text-sand-500 dark:text-sand-400">
                    {day.monthNumber}/{day.dayNumber}
                  </span>

                  <span className="text-sm font-bold my-0.5">
                    {day.dayNumber}
                  </span>

                  {/* Indicator Icon */}
                  <div className="h-4 flex items-center justify-center">
                    {hasPending ? (
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    ) : hasCompleted ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    ) : day.isProjectedWater ? (
                      <Droplets className="w-3.5 h-3.5 text-forest-500 opacity-70" />
                    ) : (
                      <span className="w-1 h-1 rounded-full bg-sand-300 dark:bg-forest-700 opacity-40" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Date Inspector Card */}
          <div className="p-5 rounded-2xl bg-sand-50 dark:bg-forest-950/60 border border-sand-200 dark:border-forest-800 space-y-3">
            <div className="flex items-center justify-between border-b border-sand-200 dark:border-forest-800 pb-2">
              <span className="text-sm font-bold text-forest-900 dark:text-sand-100 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-forest-600" />
                <span>
                  {locale === "th" ? "รายละเอียดประจำวันที่" : "Details for:"}{" "}
                  {selectedDayData.dateStr}
                  {selectedDayData.isToday && (
                    <span className="ml-2 px-2 py-0.5 text-[11px] rounded-md bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100">
                      {locale === "th" ? "วันนี้" : "Today"}
                    </span>
                  )}
                </span>
              </span>
            </div>

            {/* Events for this day */}
            <div className="space-y-2">
              {/* Actual database tasks */}
              {selectedDayData.tasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3.5 rounded-xl bg-white dark:bg-forest-900 border border-sand-200 dark:border-forest-800 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5">
                    <Droplets className="w-4 h-4 text-blue-600" />
                    <div>
                      <span className="text-xs font-bold text-forest-900 dark:text-sand-100 block">
                        {task.type === "water"
                          ? locale === "th"
                            ? "รดน้ำต้นไม้"
                            : "Water plant"
                          : task.type}
                      </span>
                      <span className="text-[11px] text-sand-500">
                        {locale === "th" ? "สถานะ:" : "Status:"} {task.status}
                      </span>
                    </div>
                  </div>

                  {task.status === "pending" && (
                    <button
                      type="button"
                      onClick={() => handleCompleteTask(task.id)}
                      disabled={isWatering}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-sand-50 text-xs font-semibold transition"
                    >
                      <Droplets className="w-3.5 h-3.5" />
                      <span>{t("care.action_water_done")}</span>
                    </button>
                  )}
                </div>
              ))}

              {/* Past logs on this day */}
              {selectedDayData.logs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-white dark:bg-forest-900 border border-sand-200 dark:border-forest-800 flex items-center justify-between text-xs"
                >
                  <span className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {log.type === "water"
                        ? locale === "th"
                          ? "รดน้ำแล้ว"
                          : "Watered"
                        : log.type}
                    </span>
                  </span>
                  <span className="text-sand-500">
                    {new Date(log.performedAt).toLocaleTimeString(
                      locale === "th" ? "th-TH" : "en-US",
                      { hour: "2-digit", minute: "2-digit" }
                    )}
                  </span>
                </div>
              ))}

              {/* Projected watering marker */}
              {selectedDayData.isProjectedWater && (
                <div className="p-3 rounded-xl bg-forest-50 dark:bg-forest-900/60 border border-dashed border-forest-300 dark:border-forest-700 flex items-center gap-2 text-xs text-forest-800 dark:text-sand-200">
                  <Droplets className="w-4 h-4 text-forest-600" />
                  <span>
                    {locale === "th"
                      ? `รอบรดน้ำคาดการณ์ตามสูตร (ทุก ${liveCalculation.finalIntervalDays} วัน)`
                      : `Projected watering cycle (every ${liveCalculation.finalIntervalDays} days)`}
                  </span>
                </div>
              )}

              {/* Empty state on this day */}
              {!selectedDayData.tasks.length &&
                !selectedDayData.logs.length &&
                !selectedDayData.isProjectedWater && (
                  <p className="text-xs text-sand-500 dark:text-sand-400 py-1">
                    {locale === "th"
                      ? "ไม่มีงานดูแลที่กำหนดไว้ในวันนี้ — ต้นไม้กำลังเติบโตอย่างมีความสุข 🌿"
                      : "No scheduled care on this date — plant is thriving happily 🌿"}
                  </p>
                )}
            </div>
          </div>
        </div>

        {/* HISTORICAL TIMELINE & ENVIRONMENTAL EDITOR GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Care History Timeline */}
          <div className="bg-white dark:bg-forest-900/80 rounded-3xl border border-sand-200 dark:border-forest-800 p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b border-sand-200 dark:border-forest-800/80 pb-4">
              <Clock className="w-5 h-5 text-forest-700 dark:text-forest-400" />
              <h2 className="text-lg font-serif font-bold text-forest-900 dark:text-sand-100">
                {t("garden.history_timeline")}
              </h2>
            </div>

            {logs.length === 0 ? (
              <div className="py-8 text-center text-xs text-sand-500 dark:text-sand-400 space-y-2">
                <Sprout className="w-8 h-8 mx-auto text-sand-400 opacity-60" />
                <p>
                  {locale === "th"
                    ? "ยังไม่มีประวัติการดูแล เมื่อคุณกด 'รดแล้ว' ประวัติจะแสดงที่นี่"
                    : "No care logs yet. Click 'Watered' to start recording history."}
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {logs.map((log) => {
                  const perfDate = new Date(log.performedAt);
                  const formattedDate = perfDate.toLocaleDateString(
                    locale === "th" ? "th-TH" : "en-US",
                    { day: "numeric", month: "short", year: "numeric" }
                  );
                  const formattedTime = perfDate.toLocaleTimeString(
                    locale === "th" ? "th-TH" : "en-US",
                    { hour: "2-digit", minute: "2-digit" }
                  );

                  return (
                    <div
                      key={log.id}
                      className="flex items-start gap-3 p-3 rounded-2xl bg-sand-50 dark:bg-forest-950/60 border border-sand-200 dark:border-forest-800"
                    >
                      <div className="p-2 rounded-xl bg-forest-100 dark:bg-forest-800 text-forest-700 dark:text-forest-300 mt-0.5">
                        <Droplets className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-forest-900 dark:text-sand-100">
                            {log.type === "water"
                              ? locale === "th"
                                ? "รดน้ำต้นไม้"
                                : "Watered"
                              : log.type}
                          </span>
                          <span className="text-[11px] text-sand-500">
                            {formattedDate} {formattedTime}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-sand-200 dark:bg-forest-800 text-sand-700 dark:text-sand-300">
                            {locale === "th" ? "บันทึกผ่านแอป" : "via App"}
                          </span>
                          {log.note && (
                            <span className="text-xs text-sand-600 dark:text-sand-400 truncate">
                              {log.note}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Environmental Settings Editor & Live Recalculation */}
          <div className="bg-white dark:bg-forest-900/80 rounded-3xl border border-sand-200 dark:border-forest-800 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-sand-200 dark:border-forest-800/80 pb-4">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-forest-700 dark:text-forest-400" />
                <h2 className="text-lg font-serif font-bold text-forest-900 dark:text-sand-100">
                  {t("garden.edit_plant")}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingEnv(!isEditingEnv)}
                className="text-xs font-semibold text-forest-700 dark:text-sand-300 hover:underline"
              >
                {isEditingEnv
                  ? locale === "th"
                    ? "ย่อส่วนแก้ไข"
                    : "Minimize"
                  : locale === "th"
                  ? "เปิดฟอร์มแก้ไข"
                  : "Edit Form"}
              </button>
            </div>

            {/* Live Formula Preview Box */}
            <div className="p-4 rounded-2xl bg-forest-50/60 dark:bg-forest-950/60 border border-forest-200 dark:border-forest-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-forest-900 dark:text-sand-100 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-forest-600" />
                  <span>{locale === "th" ? "รอบรดน้ำคำนวณสด" : "Live Interval Calculation"}</span>
                </span>
                <span className="font-serif font-bold text-base text-forest-800 dark:text-forest-300">
                  ทุก {liveCalculation.finalIntervalDays} วัน
                </span>
              </div>
              <code className="text-xs text-sand-600 dark:text-sand-400 font-mono block">
                {liveCalculation.formula}
              </code>
              <p className="text-[11px] text-sand-500 leading-relaxed">
                {locale === "th" ? liveCalculation.descriptionTh : liveCalculation.descriptionEn}
              </p>
            </div>

            {/* Environmental Form (Expandable or always accessible) */}
            <div className="space-y-4">
              {/* Nickname */}
              <div>
                <label className="block text-xs font-semibold text-sand-700 dark:text-sand-300 mb-1">
                  {t("garden.nickname_label")}
                </label>
                <input
                  type="text"
                  value={editNickname}
                  onChange={(e) => setEditNickname(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-sand-300 dark:border-forest-700 bg-white dark:bg-forest-900 text-xs text-forest-900 dark:text-sand-100"
                />
              </div>

              {/* Pot Size & Material */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-sand-700 dark:text-sand-300 mb-1">
                    {t("garden.pot_size_label")}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={40}
                    value={editPotSize}
                    onChange={(e) => setEditPotSize(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3 py-2 rounded-xl border border-sand-300 dark:border-forest-700 bg-white dark:bg-forest-900 text-xs text-forest-900 dark:text-sand-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-sand-700 dark:text-sand-300 mb-1">
                    {t("garden.pot_material_label")}
                  </label>
                  <select
                    value={editPotMaterial}
                    onChange={(e) => setEditPotMaterial(e.target.value as PotMaterial)}
                    className="w-full px-3 py-2 rounded-xl border border-sand-300 dark:border-forest-700 bg-white dark:bg-forest-900 text-xs text-forest-900 dark:text-sand-100"
                  >
                    <option value="terracotta">ดินเผา (×0.80)</option>
                    <option value="plastic">พลาสติก (×1.00)</option>
                    <option value="ceramic_glazed">เซรามิกเคลือบ (×1.15)</option>
                    <option value="cement">ปูน/คอนกรีต (×1.15)</option>
                    <option value="hanging">กระถางแขวน (×1.00)</option>
                  </select>
                </div>
              </div>

              {/* Placement */}
              <div>
                <label className="block text-xs font-semibold text-sand-700 dark:text-sand-300 mb-1">
                  {t("garden.placement_label")}
                </label>
                <select
                  value={editPlacement}
                  onChange={(e) => setEditPlacement(e.target.value as Placement)}
                  className="w-full px-3 py-2 rounded-xl border border-sand-300 dark:border-forest-700 bg-white dark:bg-forest-900 text-xs text-forest-900 dark:text-sand-100"
                >
                  <option value="outdoor_sun">กลางแจ้งแดดเต็มวัน (×0.70)</option>
                  <option value="balcony_shade">ระเบียง/มีร่มรำไร (×0.90)</option>
                  <option value="indoor_window">ในบ้านใกล้หน้าต่าง (×1.00)</option>
                  <option value="indoor_far">ในบ้านห่างหน้าต่าง (×1.25)</option>
                  <option value="air_con">ห้องแอร์ (×1.20)</option>
                </select>
              </div>

              {/* Custom Water Override */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="editCustomWater"
                  checked={editUseCustomWater}
                  onChange={(e) => setEditUseCustomWater(e.target.checked)}
                  className="rounded text-forest-700 cursor-pointer"
                />
                <label htmlFor="editCustomWater" className="text-xs text-sand-700 dark:text-sand-300 cursor-pointer">
                  {locale === "th" ? "กำหนดรอบรดน้ำคงที่เอง:" : "Custom fixed water interval:"}
                </label>
                {editUseCustomWater && (
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={editCustomWaterDays}
                    onChange={(e) =>
                      setEditCustomWaterDays(e.target.value === "" ? "" : Number(e.target.value))
                    }
                    className="w-16 px-2 py-1 rounded border border-sand-300 dark:border-forest-700 bg-white dark:bg-forest-900 text-xs text-center"
                  />
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-sand-700 dark:text-sand-300 mb-1">
                  {t("garden.notes_label")}
                </label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-sand-300 dark:border-forest-700 bg-white dark:bg-forest-900 text-xs text-forest-900 dark:text-sand-100"
                />
              </div>

              {/* Save Button */}
              <button
                type="button"
                onClick={handleSaveEnvSettings}
                disabled={isSavingEnv}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 dark:bg-forest-700 text-sand-50 text-xs font-bold transition shadow-sm disabled:opacity-60"
              >
                <Save className="w-3.5 h-3.5" />
                <span>
                  {isSavingEnv
                    ? locale === "th"
                      ? "กำลังบันทึก..."
                      : "Saving..."
                    : t("garden.save_changes")}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* SHOP WISDOM & ADVICE (If species linked) */}
        {plant.shopNote && (
          <div className="bg-sand-100/70 dark:bg-forest-900/60 rounded-3xl p-6 sm:p-8 border border-sand-200 dark:border-forest-800 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xl" role="img" aria-label="light bulb">
                💡
              </span>
              <h3 className="text-base font-serif font-bold text-forest-900 dark:text-sand-100">
                {t("care.shop_owner_tip")}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-sand-700 dark:text-sand-300 leading-relaxed italic">
              &ldquo;{plant.shopNote}&rdquo;
            </p>

            {plant.speciesSlug && (
              <div className="pt-2">
                <Link
                  href={`/plants/${plant.speciesSlug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest-800 dark:text-sand-200 hover:underline"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>
                    {locale === "th"
                      ? "อ่านคู่มือการดูแลฉบับเต็มของพันธุ์นี้"
                      : "Read full species care guide"}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Inquiry Modal */}
      <InquiryModal
        isOpen={inquiryModalOpen}
        onClose={() => setInquiryModalOpen(false)}
        speciesId={plant.speciesId || undefined}
        speciesNameTh={plant.speciesNameTh || plant.nickname}
        intent="care_help"
        defaultIntent="care_help"
        sourcePage={`/garden/${plant.id}`}
        initialQuery={
          locale === "th"
            ? `ปรึกษาเรื่องการดูแล ${plant.nickname} (${
                plant.speciesNameTh || plant.customSpeciesName || ""
              })`
            : `Care inquiry for ${plant.nickname}`
        }
      />
    </div>
  );
}
