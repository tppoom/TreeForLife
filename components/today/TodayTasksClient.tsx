"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useApp } from "@/lib/context/AppContext";
import {
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Droplets,
  Sparkles,
  Layers,
  ShieldAlert,
  Scissors,
  SkipForward,
  RotateCcw,
  Sprout,
  ArrowRight,
  FileText,
  Check,
} from "lucide-react";
import { parseDateSafe, formatDate } from "@/lib/care/scheduler";

export interface TodayCareTask {
  id: string;
  userPlantId: string;
  type: string; // "water" | "fertilize" | "repot" | "prune" | "pest_check"
  dueDate: string; // "YYYY-MM-DD"
  status: string; // "pending" | "done" | "skipped"
  snoozeCount: number;
  doneAt?: string | null;
  notifiedAt?: string | null;
  createdAt: string;
  plantNickname: string;
  plantPhotoUrl?: string | null;
  plantNotes?: string | null;
  potSizeInch?: string | number | null;
  potMaterial?: string | null;
  placement?: string | null;
  customSpeciesName?: string | null;
  speciesId?: string | null;
  speciesNameTh?: string | null;
  speciesNameEn?: string | null;
  speciesSlug?: string | null;
}

export interface TodayTasksClientProps {
  initialTasks?: TodayCareTask[];
}

export function TodayTasksClient({ initialTasks }: TodayTasksClientProps) {
  const { user, guestToken, addToast, t, locale } = useApp();
  const [tasks, setTasks] = useState<TodayCareTask[]>(initialTasks || []);
  const [loading, setLoading] = useState<boolean>(!initialTasks);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Compute today's date in local YYYY-MM-DD
  const todayStr = useMemo(() => formatDate(new Date()), []);

  // Fetch pending care tasks for current user or guest
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const queryParam = user?.id ? `userId=${user.id}` : `guestToken=${guestToken}`;
      const res = await fetch(`/api/garden/tasks?${queryParam}&status=pending`);
      if (!res.ok) {
        throw new Error("Failed to load tasks");
      }
      const data = await res.json();
      setTasks(data.tasks || []);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      addToast(
        locale === "th"
          ? "ไม่สามารถโหลดงานดูแลวันนี้ได้ กรุณาลองใหม่อีกครั้ง"
          : "Failed to load today's tasks",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [user?.id, guestToken, locale, addToast]);

  useEffect(() => {
    if (!initialTasks) {
      fetchTasks();
    }
  }, [fetchTasks, initialTasks]);

  // Group tasks into Overdue, Due Today, and Upcoming
  const { overdueTasks, dueTodayTasks, upcomingTasks } = useMemo(() => {
    const overdue: TodayCareTask[] = [];
    const dueToday: TodayCareTask[] = [];
    const upcoming: TodayCareTask[] = [];

    for (const task of tasks) {
      if (task.status !== "pending") continue;
      if (task.dueDate < todayStr) {
        overdue.push(task);
      } else if (task.dueDate === todayStr) {
        dueToday.push(task);
      } else {
        upcoming.push(task);
      }
    }

    return { overdueTasks: overdue, dueTodayTasks: dueToday, upcomingTasks: upcoming };
  }, [tasks, todayStr]);

  const urgentTasks = useMemo(
    () => [...overdueTasks, ...dueTodayTasks],
    [overdueTasks, dueTodayTasks]
  );

  // Action: Complete Task
  const handleComplete = async (task: TodayCareTask) => {
    setActionLoadingId(task.id);
    try {
      const res = await fetch("/api/garden/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userPlantId: task.userPlantId,
          taskId: task.id,
          action: "complete",
          source: "app",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to complete task");
      }

      const nextDueText = data.nextDueDate
        ? locale === "th"
          ? ` (รอบถัดไป ${data.nextDueDate})`
          : ` (Next due: ${data.nextDueDate})`
        : "";

      addToast(
        locale === "th"
          ? `ดูแล "${task.plantNickname}" เรียบร้อยแล้ว! 🌿${nextDueText}`
          : `Completed task for "${task.plantNickname}"! 🌿${nextDueText}`,
        "success"
      );

      await fetchTasks();
    } catch (err) {
      console.error("Complete task error:", err);
      const msg = err instanceof Error ? err.message : "Failed to record task completion";
      addToast(msg, "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Action: Snooze Task (+1 day, max 3 times)
  const handleSnooze = async (task: TodayCareTask) => {
    if (task.snoozeCount >= 3) {
      addToast(
        locale === "th"
          ? "เลื่อนได้สูงสุด 3 ครั้งติดต่อกัน กรุณาเลือก 'เสร็จแล้ว' หรือ 'ข้ามรอบนี้'"
          : "Maximum 3 snoozes reached. Please complete or skip this cycle.",
        "warning"
      );
      return;
    }

    setActionLoadingId(task.id);
    try {
      const res = await fetch("/api/garden/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userPlantId: task.userPlantId,
          taskId: task.id,
          action: "snooze",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to snooze task");
      }

      const newDueText = data.newDueDate
        ? locale === "th"
          ? ` (กำหนดใหม่: ${data.newDueDate})`
          : ` (New due date: ${data.newDueDate})`
        : "";

      addToast(
        locale === "th"
          ? `เลื่อนงานของ "${task.plantNickname}" ไป 1 วันแล้ว ⏰${newDueText}`
          : `Snoozed task for "${task.plantNickname}" by 1 day ⏰${newDueText}`,
        "info"
      );

      await fetchTasks();
    } catch (err) {
      console.error("Snooze task error:", err);
      const msg = err instanceof Error ? err.message : "Failed to snooze task";
      addToast(msg, "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Action: Skip Task
  const handleSkip = async (task: TodayCareTask) => {
    setActionLoadingId(task.id);
    try {
      const res = await fetch("/api/garden/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userPlantId: task.userPlantId,
          taskId: task.id,
          action: "skip",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to skip task");
      }

      const nextDueText = data.nextDueDate
        ? locale === "th"
          ? ` (รอบถัดไป: ${data.nextDueDate})`
          : ` (Next cycle: ${data.nextDueDate})`
        : "";

      addToast(
        locale === "th"
          ? `ข้ามรอบนี้ของ "${task.plantNickname}" แล้ว ⏭️${nextDueText}`
          : `Skipped cycle for "${task.plantNickname}" ⏭️${nextDueText}`,
        "info"
      );

      await fetchTasks();
    } catch (err) {
      console.error("Skip task error:", err);
      const msg = err instanceof Error ? err.message : "Failed to skip task";
      addToast(msg, "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Batch Action: Mark All Done (Overdue + Due Today)
  const handleMarkAllDone = async () => {
    if (urgentTasks.length === 0) return;

    setActionLoadingId("batch");
    try {
      const res = await fetch("/api/garden/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batch: true,
          tasks: urgentTasks.map((t) => ({
            userPlantId: t.userPlantId,
            taskId: t.id,
            action: "complete",
            source: "app",
          })),
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to batch complete tasks");
      }

      addToast(
        locale === "th"
          ? `รดน้ำและดูแลครบทุกต้นแล้ว (${urgentTasks.length} รายการ)! 🌿`
          : `Marked all ${urgentTasks.length} tasks as complete! 🌿`,
        "success"
      );

      await fetchTasks();
    } catch (err) {
      console.error("Batch complete error:", err);
      addToast(
        locale === "th"
          ? "เกิดข้อผิดพลาดในการบันทึกครบทุกงาน กรุณาลองใหม่อีกครั้ง"
          : "Failed to mark all tasks done",
        "error"
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  // Helper to render task type icon and localized label
  const renderTaskTypeInfo = (type: string) => {
    switch (type) {
      case "water":
        return {
          icon: Droplets,
          label: t("care.water") || (locale === "th" ? "รดน้ำ" : "Water"),
          badgeClass:
            "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900/50",
          iconColor: "text-blue-500",
        };
      case "fertilize":
        return {
          icon: Sparkles,
          label: t("care.fertilize") || (locale === "th" ? "ใส่ปุ๋ย" : "Fertilize"),
          badgeClass:
            "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/50",
          iconColor: "text-emerald-500",
        };
      case "repot":
        return {
          icon: Layers,
          label: t("care.repot") || (locale === "th" ? "เปลี่ยนกระถาง" : "Repot"),
          badgeClass:
            "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/50",
          iconColor: "text-amber-500",
        };
      case "pest_check":
        return {
          icon: ShieldAlert,
          label: t("care.pest_check") || (locale === "th" ? "ตรวจโรคและแมลง" : "Pest Check"),
          badgeClass:
            "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900/50",
          iconColor: "text-purple-500",
        };
      case "prune":
        return {
          icon: Scissors,
          label: t("care.prune") || (locale === "th" ? "ตัดแต่งกิ่ง" : "Prune"),
          badgeClass:
            "bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-900/50",
          iconColor: "text-orange-500",
        };
      default:
        return {
          icon: Sprout,
          label: type,
          badgeClass:
            "bg-sand-100 dark:bg-forest-800 text-sand-700 dark:text-sand-300 border-sand-200 dark:border-forest-700",
          iconColor: "text-forest-600",
        };
    }
  };

  // Helper to render due date badge
  const renderDueBadge = (dueDateStr: string) => {
    const due = parseDateSafe(dueDateStr);
    const today = parseDateSafe(todayStr);
    const diffMs = due.getTime() - today.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      const absDays = Math.abs(diffDays);
      return (
        <span
          data-testid="badge-overdue"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 shadow-xs"
        >
          <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
          <span>
            {locale === "th" ? `เลยกำหนด ${absDays} วัน` : `Overdue ${absDays}d`}
          </span>
        </span>
      );
    }

    if (diffDays === 0) {
      return (
        <span
          data-testid="badge-today"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800/80 shadow-xs"
        >
          <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>{locale === "th" ? "ครบกำหนดวันนี้" : "Due Today"}</span>
        </span>
      );
    }

    return (
      <span
        data-testid="badge-upcoming"
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-sand-100 dark:bg-forest-800/60 text-sand-700 dark:text-sand-300 border border-sand-200 dark:border-forest-700 shadow-xs"
      >
        <Calendar className="w-3.5 h-3.5 text-sand-500 dark:text-sand-400" />
        <span>
          {locale === "th" ? `อีก ${diffDays} วัน` : `In ${diffDays}d`}
        </span>
      </span>
    );
  };

  // Helper to render individual task card
  const renderTaskCard = (task: TodayCareTask) => {
    const isActionBusy = actionLoadingId === task.id || actionLoadingId === "batch";
    const typeInfo = renderTaskTypeInfo(task.type);
    const TypeIcon = typeInfo.icon;

    const speciesDisplayName =
      task.customSpeciesName ||
      (locale === "en" ? task.speciesNameEn || task.speciesNameTh : task.speciesNameTh) ||
      (locale === "th" ? "ต้นไม้ทั่วไป" : "General Plant");

    const defaultImg =
      "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=300&q=80";
    const photo = task.plantPhotoUrl || defaultImg;

    return (
      <div
        key={task.id}
        data-testid={`task-card-${task.id}`}
        className="bg-white dark:bg-forest-900/80 rounded-2xl border border-sand-200 dark:border-forest-800/80 p-4 sm:p-5 shadow-sm hover:shadow-md transition duration-200 space-y-4"
      >
        <div className="flex items-start gap-3.5">
          {/* Plant Photo Thumbnail */}
          <Link
            href={`/garden/${task.userPlantId}`}
            className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-sand-100 dark:bg-forest-800 border border-sand-200 dark:border-forest-700 block group"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo}
              alt={task.plantNickname}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            />
          </Link>

          {/* Plant & Task Header Details */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Link
                href={`/garden/${task.userPlantId}`}
                className="font-serif font-bold text-lg sm:text-xl text-forest-900 dark:text-sand-100 hover:text-forest-600 dark:hover:text-forest-400 transition truncate"
              >
                {task.plantNickname}
              </Link>
              {renderDueBadge(task.dueDate)}
            </div>

            <p className="text-xs sm:text-sm text-sand-500 dark:text-sand-400 truncate mt-0.5">
              {speciesDisplayName}
            </p>

            {/* Task Type Badge & Snooze Indicator */}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${typeInfo.badgeClass}`}
              >
                <TypeIcon className={`w-3.5 h-3.5 ${typeInfo.iconColor}`} />
                <span>{typeInfo.label}</span>
              </span>

              {task.snoozeCount > 0 && (
                <span
                  data-testid={`snooze-count-${task.id}`}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                  title={
                    locale === "th"
                      ? `เลื่อนงานแล้ว ${task.snoozeCount} ครั้ง (สูงสุด 3 ครั้ง)`
                      : `Snoozed ${task.snoozeCount} times (max 3)`
                  }
                >
                  <Clock className="w-3 h-3 text-amber-500" />
                  <span>
                    {locale === "th"
                      ? `เลื่อนแล้ว ${task.snoozeCount}/3`
                      : `Snoozed ${task.snoozeCount}/3`}
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Plant Notes / Care Advice */}
        {task.plantNotes && (
          <div className="flex items-start gap-2 p-2.5 rounded-xl bg-sand-50 dark:bg-forest-800/40 border border-sand-200/60 dark:border-forest-800/40 text-xs text-sand-700 dark:text-sand-300">
            <FileText className="w-4 h-4 shrink-0 text-sand-400 mt-0.5" />
            <p className="line-clamp-2 leading-relaxed">{task.plantNotes}</p>
          </div>
        )}

        {/* Quick Action Controls (Done, Snooze, Skip) */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-sand-100 dark:border-forest-800/60">
          {/* Done Button */}
          <button
            type="button"
            data-testid={`btn-done-${task.id}`}
            onClick={() => handleComplete(task)}
            disabled={isActionBusy}
            className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-forest-800 hover:bg-forest-900 dark:bg-forest-700 dark:hover:bg-forest-600 text-sand-50 font-semibold text-sm transition shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isActionBusy ? (
              <RotateCcw className="w-4 h-4 animate-spin text-sand-200" />
            ) : (
              <Check className="w-4 h-4 text-emerald-300" />
            )}
            <span>{locale === "th" ? "เสร็จแล้ว" : "Done"}</span>
          </button>

          {/* Snooze Button */}
          <button
            type="button"
            data-testid={`btn-snooze-${task.id}`}
            onClick={() => handleSnooze(task)}
            disabled={isActionBusy || task.snoozeCount >= 3}
            title={
              task.snoozeCount >= 3
                ? locale === "th"
                  ? "เลื่อนได้สูงสุด 3 ครั้งติดต่อกัน"
                  : "Maximum 3 snoozes reached"
                : t("today.snooze_day")
            }
            className="min-h-[44px] inline-flex items-center justify-center gap-1 px-3 sm:px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-200 border border-amber-300/80 dark:border-amber-800 font-medium text-xs sm:text-sm transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>{t("today.snooze_day")}</span>
          </button>

          {/* Skip Button */}
          <button
            type="button"
            data-testid={`btn-skip-${task.id}`}
            onClick={() => handleSkip(task)}
            disabled={isActionBusy}
            title={t("today.skip_cycle")}
            className="min-h-[44px] inline-flex items-center justify-center gap-1 px-3 sm:px-3.5 py-2 rounded-xl bg-sand-100 hover:bg-sand-200 dark:bg-forest-800 dark:hover:bg-forest-700/80 text-sand-700 dark:text-sand-300 border border-sand-300/80 dark:border-forest-700 font-medium text-xs sm:text-sm transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <SkipForward className="w-4 h-4 text-sand-500 dark:text-sand-400" />
            <span>{t("today.skip_cycle")}</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-[calc(100vh-140px)] bg-sand-50 dark:bg-forest-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-sand-200 dark:border-forest-800/60 pb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-forest-800 text-sand-50 dark:bg-forest-700 shadow-sm">
                <Calendar className="w-6 h-6 text-forest-300" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-forest-900 dark:text-sand-100">
                  {t("today.title")}
                </h1>
                <p className="text-xs sm:text-sm text-sand-600 dark:text-sand-300 mt-0.5">
                  {t("today.subtitle")}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Batch Action: Mark All Done */}
            {urgentTasks.length > 0 && (
              <button
                type="button"
                data-testid="btn-mark-all-done"
                onClick={handleMarkAllDone}
                disabled={actionLoadingId === "batch" || loading}
                className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 dark:bg-forest-700 dark:hover:bg-forest-600 text-sand-50 font-bold text-sm transition shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {actionLoadingId === "batch" ? (
                  <RotateCcw className="w-4 h-4 animate-spin text-sand-200" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                )}
                <span>{t("today.mark_all_done")}</span>
                <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-forest-700 dark:bg-forest-800 text-sand-100">
                  {urgentTasks.length}
                </span>
              </button>
            )}

            {/* Link to Garden */}
            <Link
              href="/garden"
              className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-sand-300 dark:border-forest-700 bg-white dark:bg-forest-900/80 text-sand-700 dark:text-sand-200 hover:border-forest-500 hover:text-forest-900 dark:hover:text-sand-100 font-medium text-sm transition shadow-xs"
            >
              <Sprout className="w-4 h-4 text-forest-600 dark:text-forest-400" />
              <span>{locale === "th" ? "สวนของฉัน" : "My Garden"}</span>
            </Link>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-6 animate-pulse">
            <div className="h-8 bg-sand-200 dark:bg-forest-800/50 rounded w-1/4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-44 bg-white dark:bg-forest-900/70 rounded-2xl border border-sand-200 dark:border-forest-800/80 p-5"
                />
              ))}
            </div>
          </div>
        )}

        {/* Content State */}
        {!loading && (
          <>
            {/* Clean Empty State: No pending tasks needing attention */}
            {urgentTasks.length === 0 ? (
              <div
                data-testid="today-empty-state"
                className="bg-white dark:bg-forest-900/70 border border-sand-200 dark:border-forest-800/80 rounded-3xl p-8 sm:p-12 text-center shadow-sm max-w-2xl mx-auto space-y-6"
              >
                <div className="w-20 h-20 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 ring-8 ring-emerald-50/50 dark:ring-emerald-950/20">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-forest-900 dark:text-sand-100">
                    {t("today.all_done_title")}
                  </h2>
                  <p className="text-sand-600 dark:text-sand-300 max-w-md mx-auto text-sm sm:text-base leading-relaxed">
                    {locale === "th"
                      ? "ไม่มีงานที่ต้องทำวันนี้ ต้นไม้ทุกต้นได้รับการดูแลเรียบร้อยแล้ว 🌿"
                      : "No pending tasks today. All plants are well taken care of! 🌿"}
                  </p>
                </div>

                <div className="pt-2 flex flex-wrap justify-center gap-3">
                  <Link
                    href="/garden"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-forest-800 hover:bg-forest-900 dark:bg-forest-700 dark:hover:bg-forest-600 text-sand-50 font-semibold text-sm transition shadow-sm"
                  >
                    <Sprout className="w-4 h-4 text-forest-300" />
                    <span>{locale === "th" ? "ดูสวนของฉัน" : "View My Garden"}</span>
                  </Link>
                  <Link
                    href="/garden/add"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-sand-300 dark:border-forest-700 bg-white dark:bg-forest-900 text-sand-700 dark:text-sand-200 hover:bg-sand-100 font-medium text-sm transition shadow-xs"
                  >
                    <span>{locale === "th" ? "เพิ่มต้นไม้ใหม่" : "Add Plant"}</span>
                    <ArrowRight className="w-4 h-4 text-sand-500" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-10">
                {/* 1. OVERDUE TASKS SECTION */}
                {overdueTasks.length > 0 && (
                  <section
                    aria-label="Overdue Tasks"
                    data-testid="section-overdue"
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between gap-3 border-b border-rose-200 dark:border-rose-900/60 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300">
                          <AlertCircle className="w-5 h-5" />
                        </span>
                        <h2 className="text-xl font-serif font-bold text-rose-900 dark:text-rose-200">
                          {t("today.overdue_section")}
                        </h2>
                        <span
                          data-testid="overdue-count"
                          className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-600 text-white"
                        >
                          {overdueTasks.length}
                        </span>
                      </div>
                      <p className="text-xs text-rose-700 dark:text-rose-300 hidden sm:block">
                        {locale === "th"
                          ? "ควรดูแลทันทีเพื่อป้องกันความเสียหายต่อต้นไม้"
                          : "Immediate care recommended to keep plants healthy"}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {overdueTasks.map(renderTaskCard)}
                    </div>
                  </section>
                )}

                {/* 2. DUE TODAY TASKS SECTION */}
                {dueTodayTasks.length > 0 && (
                  <section
                    aria-label="Tasks Due Today"
                    data-testid="section-due-today"
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between gap-3 border-b border-amber-200 dark:border-amber-900/60 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300">
                          <Clock className="w-5 h-5" />
                        </span>
                        <h2 className="text-xl font-serif font-bold text-forest-900 dark:text-sand-100">
                          {t("today.today_section")}
                        </h2>
                        <span
                          data-testid="today-count"
                          className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white"
                        >
                          {dueTodayTasks.length}
                        </span>
                      </div>
                      <p className="text-xs text-sand-500 dark:text-sand-400 hidden sm:block">
                        {locale === "th"
                          ? "รายการที่ครบกำหนดรดน้ำหรือบำรุงในวันนี้"
                          : "Tasks scheduled for attention today"}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {dueTodayTasks.map(renderTaskCard)}
                    </div>
                  </section>
                )}
              </div>
            )}

            {/* 3. UPCOMING TASKS (Informational section if pending future tasks exist) */}
            {upcomingTasks.length > 0 && (
              <section
                aria-label="Upcoming Tasks"
                data-testid="section-upcoming"
                className="pt-6 border-t border-sand-200 dark:border-forest-800/60 space-y-4"
              >
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 rounded-lg bg-sand-200 dark:bg-forest-800 text-sand-700 dark:text-sand-300">
                    <Calendar className="w-5 h-5" />
                  </span>
                  <h3 className="text-lg font-serif font-bold text-forest-900 dark:text-sand-100">
                    {t("today.upcoming_section")}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-sand-200 dark:bg-forest-800 text-sand-700 dark:text-sand-300">
                    {upcomingTasks.length}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {upcomingTasks.slice(0, 6).map(renderTaskCard)}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
