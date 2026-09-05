"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useApp } from "@/lib/context/AppContext";
import {
  Sprout,
  Plus,
  Droplets,
  Calendar,
  AlertCircle,
  Clock,
  CheckCircle2,
  MoreVertical,
  Archive,
  MessageCircle,
  Sparkles,
  ArrowRight,
} from "lucide-react";

interface UserPlantItem {
  id: string;
  nickname: string;
  photoUrl?: string | null;
  displayPhoto: string;
  acquiredAt: string;
  acquiredFrom: string;
  potSizeInch: string;
  potMaterial: string;
  placement: string;
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
    snoozeCount: number;
  } | null;
}

export function GardenListClient() {
  const { guestToken, currentUser, showToast, openInquiryModal } = useApp();
  const [plants, setPlants] = useState<UserPlantItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchPlants = async () => {
    try {
      setLoading(true);
      const url = currentUser
        ? `/api/garden/plants?userId=${currentUser.id}`
        : `/api/garden/plants?guestToken=${guestToken}`;

      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) {
        setPlants(data.plants || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (guestToken || currentUser) {
      fetchPlants();
    }
  }, [guestToken, currentUser]);

  const handleQuickWater = async (plant: UserPlantItem) => {
    if (!plant.nextTask) return;
    setActionLoadingId(plant.id);
    try {
      const res = await fetch("/api/garden/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userPlantId: plant.id,
          taskId: plant.nextTask.id,
          action: "done",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update task");

      showToast(`รดน้ำ ${plant.nickname} เรียบร้อย! รอบถัดไป ${data.nextDueDate}`, "success");

      if (data.adaptiveSuggestion?.shouldSuggest) {
        showToast(data.adaptiveSuggestion.messageTh, "info");
      }

      await fetchPlants();
    } catch (err: any) {
      showToast(err.message || "เกิดข้อผิดพลาดในการบันทึก", "warning");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sand-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-forest-700">
            <Sprout className="w-4 h-4 text-emerald-600" />
            <span>สวนส่วนตัวและปฏิทินดูแล</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-stone-950 mt-1">
            สวนของฉัน
          </h1>
          <p className="text-xs sm:text-sm text-stone-600">
            {currentUser ? `บัญชีของ ${currentUser.displayName}` : "บันทึกในอุปกรณ์ (Guest-first Mode)"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/today"
            className="px-4 py-2.5 bg-white border border-sand-300 hover:bg-sand-100 text-stone-700 rounded-xl text-xs font-medium transition-colors flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>ภารกิจวันนี้</span>
          </Link>

          <Link
            href="/garden/add"
            className="px-5 py-2.5 bg-forest-900 hover:bg-forest-800 text-sand-50 rounded-xl text-xs font-medium shadow-sm transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4 text-gold-400" />
            <span>+ เพิ่มต้นไม้ใหม่</span>
          </Link>
        </div>
      </div>

      {/* Guest Mode Notice Banner */}
      {!currentUser && (
        <div className="p-4 bg-sand-100/80 rounded-2xl border border-sand-300/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-stone-700">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-gold-600 shrink-0" />
            <span>
              คุณกำลังใช้งานในโหมดผู้เยี่ยมชม ข้อมูลบันทึกปลอดภัยในเครื่องนี้ เข้าสู่ระบบเมื่อต้องการสำรองข้อมูลข้ามเครื่อง
            </span>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-sand-200/50 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : plants.length > 0 ? (
        /* Plant Cards Grid (SPEC §6.6) */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {plants.map((plant) => {
            const isOverdue = plant.statusBadge.type === "overdue";
            const isToday = plant.statusBadge.type === "today";
            const isUpcoming = plant.statusBadge.type === "upcoming";

            return (
              <div
                key={plant.id}
                className="group bg-white rounded-2xl border border-sand-200 overflow-hidden shadow-soft hover:shadow-card card-hover-effect flex flex-col justify-between"
              >
                <div>
                  {/* Photo & Badge */}
                  <div className="relative aspect-[16/10] bg-sand-100 overflow-hidden">
                    <Image
                      src={plant.displayPhoto}
                      alt={plant.nickname}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Shape & Color Status Badge (SPEC §6.6 Accessibility Requirement) */}
                    <div className="absolute top-3 left-3">
                      {isOverdue && (
                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-700 text-white text-xs font-bold shadow-md">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{plant.statusBadge.label}</span>
                        </div>
                      )}
                      {isToday && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500 text-stone-950 text-xs font-bold shadow-md">
                          <span className="w-2 h-2 rounded-full bg-stone-950" />
                          <span>{plant.statusBadge.label}</span>
                        </div>
                      )}
                      {isUpcoming && (
                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-900/80 backdrop-blur-md text-sand-100 text-xs font-medium">
                          <span className="w-2 h-2 rounded-full border border-sand-100" />
                          <span>{plant.statusBadge.label}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-serif text-xl font-semibold text-stone-900 group-hover:text-forest-800 transition-colors">
                          {plant.nickname}
                        </h3>
                        <p className="text-xs text-stone-500 italic font-serif">
                          {plant.speciesNameTh || "พันธุ์อื่น ๆ"}
                        </p>
                      </div>

                      <Link
                        href={`/garden/${plant.id}`}
                        className="p-1 text-stone-400 hover:text-stone-700 transition-colors"
                        title="ดูรายละเอียดและประวัติ"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Link>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-stone-500 pt-1">
                      <span>กระถาง: {plant.potSizeInch} นิ้ว</span>
                      <span>•</span>
                      <span>รับมาเมื่อ: {plant.acquiredAt}</span>
                    </div>
                  </div>
                </div>

                {/* Footer 1-Click Quick Water Button (SPEC §6.6) */}
                <div className="p-4 pt-0 border-t border-sand-100 mt-2 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleQuickWater(plant)}
                    disabled={actionLoadingId === plant.id || !plant.nextTask}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      isOverdue
                        ? "bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
                        : isToday
                        ? "bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm"
                        : "bg-sand-100 hover:bg-sand-200 text-stone-700"
                    } disabled:opacity-50`}
                  >
                    <Droplets className="w-3.5 h-3.5" />
                    <span>
                      {actionLoadingId === plant.id
                        ? "กำลังบันทึก..."
                        : "รดน้ำแล้ว"}
                    </span>
                  </button>

                  <Link
                    href={`/garden/${plant.id}`}
                    className="py-2.5 px-3 bg-white border border-sand-300 hover:bg-sand-100 text-stone-700 rounded-xl text-xs font-medium transition-colors"
                  >
                    ปฏิทิน
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State (SPEC §6.6) */
        <div className="bg-white rounded-3xl p-12 sm:p-16 text-center border border-sand-200 shadow-soft max-w-lg mx-auto space-y-6">
          <div className="w-16 h-16 rounded-full bg-forest-900/5 border border-forest-900/10 flex items-center justify-center mx-auto text-forest-800">
            <Sprout className="w-8 h-8 text-forest-800" />
          </div>

          <div className="space-y-2">
            <h3 className="font-serif text-2xl font-semibold text-stone-900">
              ยังไม่มีต้นไม้ในสวนของคุณ
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              เพิ่มต้นไม้ต้นแรกเพื่อให้ระบบคำนวณรอบรดน้ำตามสภาพอากาศไทยและช่วยบันทึกการดูแลให้อัตโนมัติ
            </p>
          </div>

          <Link
            href="/garden/add"
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-forest-900 hover:bg-forest-800 text-sand-50 font-medium rounded-xl text-xs sm:text-sm shadow-sm transition-all"
          >
            <Plus className="w-4 h-4 text-gold-400" />
            <span>เพิ่มต้นแรกเข้าสวนของฉัน</span>
          </Link>
        </div>
      )}
    </div>
  );
}
