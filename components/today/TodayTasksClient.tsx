"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useApp } from "@/lib/context/AppContext";
import {
  CheckCircle2,
  Droplets,
  AlertCircle,
  Clock,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Sprout,
  Check,
  Calendar,
} from "lucide-react";

interface TodayTaskItem {
  plantId: string;
  plantNickname: string;
  speciesNameTh?: string | null;
  photoUrl: string;
  taskId: string;
  taskType: string;
  dueDate: string;
  isOverdue: boolean;
  daysDiff: number;
}

export function TodayTasksClient() {
  const { guestToken, currentUser, showToast } = useApp();
  const [tasks, setTasks] = useState<TodayTaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [batchLoading, setBatchLoading] = useState(false);
  const [actionTaskId, setActionTaskId] = useState<string | null>(null);

  const fetchTodayTasks = async () => {
    try {
      setLoading(true);
      const url = currentUser
        ? `/api/garden/plants?userId=${currentUser.id}`
        : `/api/garden/plants?guestToken=${guestToken}`;

      const res = await fetch(url);
      const data = await res.json();
      if (res.ok && data.plants) {
        const todayStr = new Date().toISOString().split("T")[0];
        const today = new Date(todayStr);

        const activeList: TodayTaskItem[] = [];

        for (const p of data.plants) {
          if (p.nextTask && p.nextTask.status === "pending") {
            const due = new Date(p.nextTask.dueDate);
            const diffMs = due.getTime() - today.getTime();
            const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

            // Only tasks due today or overdue
            if (diffDays <= 0) {
              activeList.push({
                plantId: p.id,
                plantNickname: p.nickname,
                speciesNameTh: p.speciesNameTh,
                photoUrl: p.displayPhoto,
                taskId: p.nextTask.id,
                taskType: p.nextTask.type,
                dueDate: p.nextTask.dueDate,
                isOverdue: diffDays < 0,
                daysDiff: Math.abs(diffDays),
              });
            }
          }
        }

        // Sort: overdue first
        activeList.sort((a, b) => (b.isOverdue ? 1 : 0) - (a.isOverdue ? 1 : 0));
        setTasks(activeList);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (guestToken || currentUser) {
      fetchTodayTasks();
    }
  }, [guestToken, currentUser]);

  const handleAction = async (item: TodayTaskItem, action: "done" | "snooze" | "skip") => {
    setActionTaskId(item.taskId);
    try {
      const res = await fetch("/api/garden/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userPlantId: item.plantId,
          taskId: item.taskId,
          action,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed action");

      if (action === "done") {
        showToast(`รดน้ำ ${item.plantNickname} แล้ว! รอบถัดไป ${data.nextDueDate}`, "success");
      } else if (action === "snooze") {
        showToast(`เลื่อนรดน้ำ ${item.plantNickname} ไปพรุ่งนี้`, "info");
      } else {
        showToast(`ข้ามรอบรดน้ำ ${item.plantNickname} แล้ว`, "info");
      }

      await fetchTodayTasks();
    } catch (err: any) {
      showToast(err.message || "เกิดข้อผิดพลาด", "warning");
    } finally {
      setActionTaskId(null);
    }
  };

  const handleCompleteAll = async () => {
    if (tasks.length === 0) return;
    setBatchLoading(true);
    try {
      for (const item of tasks) {
        await fetch("/api/garden/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userPlantId: item.plantId,
            taskId: item.taskId,
            action: "done",
          }),
        });
      }
      showToast(`ทำครบทุกอย่างแล้ว! รดน้ำ ${tasks.length} ต้นเรียบร้อย 🌿`, "success");
      await fetchTodayTasks();
    } catch (err) {
      showToast("เกิดข้อผิดพลาดในการบันทึกบางรายการ", "warning");
    } finally {
      setBatchLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sand-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-forest-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>ภารกิจประจำวันนี้</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-stone-950 mt-1">
            งานดูแลวันนี้
          </h1>
          <p className="text-xs sm:text-sm text-stone-600">
            {new Date().toLocaleDateString("th-TH", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {tasks.length > 0 && (
          <button
            onClick={handleCompleteAll}
            disabled={batchLoading}
            className="px-5 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>{batchLoading ? "กำลังบันทึก..." : `ทำครบทุกอย่างแล้ว (${tasks.length} ต้น)`}</span>
          </button>
        )}
      </div>

      {/* Tasks List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-sand-200/60 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : tasks.length > 0 ? (
        <div className="space-y-4">
          {tasks.map((item) => (
            <div
              key={item.taskId}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-sand-200 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              {/* Plant info */}
              <div className="flex items-center gap-3.5">
                <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-sand-100 border border-sand-300">
                  <Image src={item.photoUrl} alt={item.plantNickname} fill className="object-cover" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-lg font-semibold text-stone-900">
                      {item.plantNickname}
                    </h3>
                    {item.isOverdue ? (
                      <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>เลยกำหนด {item.daysDiff} วัน</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold">
                        ครบกำหนดวันนี้
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-500 italic font-serif">
                    {item.speciesNameTh || "รดน้ำตามรอบ"}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() => handleAction(item, "snooze")}
                  disabled={actionTaskId === item.taskId}
                  className="px-3 py-2 bg-sand-100 hover:bg-sand-200 text-stone-700 rounded-xl text-xs font-medium transition-colors cursor-pointer"
                  title="เลื่อนไป 1 วัน"
                >
                  เลื่อน 1 วัน
                </button>

                <button
                  onClick={() => handleAction(item, "skip")}
                  disabled={actionTaskId === item.taskId}
                  className="px-3 py-2 bg-sand-100 hover:bg-sand-200 text-stone-700 rounded-xl text-xs font-medium transition-colors cursor-pointer"
                  title="ข้ามรอบนี้"
                >
                  ข้าม
                </button>

                <button
                  onClick={() => handleAction(item, "done")}
                  disabled={actionTaskId === item.taskId}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                >
                  <Droplets className="w-3.5 h-3.5" />
                  <span>รดแล้ว</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Zero tasks state */
        <div className="bg-white rounded-3xl p-12 sm:p-16 text-center border border-sand-200 shadow-soft max-w-lg mx-auto space-y-5">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-200">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>

          <div className="space-y-1.5">
            <h3 className="font-serif text-2xl font-semibold text-stone-900">
              ยอดเยี่ยม! ไม่มีงานค้างวันนี้
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              ต้นไม้ทุกต้นในสวนของคุณได้รับการดูแลอย่างครบถ้วนแล้ว พักผ่อนและเพลิดเพลินกับความเขียวชอุ่มได้เลย
            </p>
          </div>

          <div className="pt-2 flex justify-center gap-3">
            <Link
              href="/garden"
              className="px-5 py-2.5 bg-forest-900 hover:bg-forest-800 text-sand-50 rounded-xl text-xs font-medium transition-colors shadow-sm"
            >
              ดูสวนทั้งหมด
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
