"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/lib/context/AppContext";
import { HeartPulse, CheckCircle2, AlertTriangle, ArrowRight, Sparkles, MessageCircle } from "lucide-react";

export interface AftercareCheckinItem {
  id: string;
  userPlantId: string;
  dayMark: number;
  dueDate: string;
  plantNickname: string;
  speciesNameTh?: string | null;
  speciesNameEn?: string | null;
  photoUrl?: string | null;
}

export function AftercareCheckinBanner() {
  const { user, guestToken, addToast, locale } = useApp();
  const [checkins, setCheckins] = useState<AftercareCheckinItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [answeringId, setAnsweringId] = useState<string | null>(null);
  const [wisdomModal, setWisdomModal] = useState<{ plant: string; wisdom: string } | null>(null);

  useEffect(() => {
    async function loadCheckins() {
      if (!user?.id && !guestToken) return;
      try {
        const query = user?.id ? `userId=${user.id}` : `guestToken=${guestToken}`;
        const res = await fetch(`/api/garden/checkins?${query}`);
        if (res.ok) {
          const data = await res.json();
          setCheckins(data.checkins || []);
        }
      } catch (err) {
        console.error("Failed to load aftercare checkins:", err);
      }
    }
    loadCheckins();
  }, [user?.id, guestToken]);

  const handleAnswer = async (checkin: AftercareCheckinItem, answer: "good" | "bad") => {
    try {
      setAnsweringId(checkin.id);
      const res = await fetch(`/api/garden/checkins/${checkin.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answer,
          symptoms: answer === "bad" ? ["อาการผิดปกติหลังรับต้นไม้"] : [],
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit aftercare response");
      }

      const data = await res.json();
      setCheckins((prev) => prev.filter((c) => c.id !== checkin.id));

      if (answer === "good") {
        setWisdomModal({
          plant: checkin.plantNickname,
          wisdom:
            data.wisdom ||
            "ต้นไม้ปรับตัวเข้ากับสภาพแวดล้อมใหม่ได้ยอดเยี่ยมแล้ว! คอยสังเกตความชื้นในดินก่อนรดน้ำทุกครั้ง",
        });
        addToast(
          locale === "th"
            ? `บันทึกสถานะของ ${checkin.plantNickname} แล้ว`
            : `Recorded health for ${checkin.plantNickname}`,
          "success"
        );
      } else {
        if (data.lineUrl) {
          window.open(data.lineUrl, "_blank");
        }
        addToast(
          locale === "th"
            ? "เปิดช่องทางปรึกษาเจ้าของสวนทาง LINE เรียบร้อยครับ"
            : "Opening LINE consultation with nursery team",
          "info"
        );
      }
    } catch (err) {
      console.error("Checkin submit error:", err);
      addToast(
        locale === "th" ? "เกิดข้อผิดพลาดในการบันทึก" : "Failed to record response",
        "error"
      );
    } finally {
      setAnsweringId(null);
    }
  };

  if (checkins.length === 0) {
    return null;
  }

  const current = checkins[0];

  return (
    <>
      <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-2xl p-4 sm:p-5 shadow-sm mb-6 transition-all">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
            <HeartPulse className="w-5 h-5" />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                {locale === "th"
                  ? `ติดตามผลหลังซื้อ · ครบ ${current.dayMark} วัน`
                  : `Aftercare Check-in · Day ${current.dayMark}`}
              </span>
              <Sparkles className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
            </div>

            <p className="text-sm font-medium text-stone-800 dark:text-stone-100 mb-1 leading-snug">
              {locale === "th" ? (
                <>
                  ต้น <span className="font-semibold text-emerald-800 dark:text-emerald-300">{current.plantNickname}</span> ({current.speciesNameTh || "ต้นไม้ที่คุณเลือก"}) เป็นอย่างไรบ้างครับ?
                </>
              ) : (
                <>
                  How is your <span className="font-semibold text-emerald-800 dark:text-emerald-300">{current.plantNickname}</span> ({current.speciesNameEn || current.speciesNameTh || "plant"}) settling in?
                </>
              )}
            </p>
            <p className="text-xs text-stone-600 dark:text-stone-400 mb-3">
              {locale === "th"
                ? "ทางสวนอยากมั่นใจว่าต้นไม้ปรับตัวเข้ากับสถานที่ของคุณได้เป็นอย่างดี"
                : "We want to make sure your plant is adapting well to its new environment."}
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <button
                disabled={answeringId === current.id}
                onClick={() => handleAnswer(current, "good")}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium rounded-lg shadow-sm transition-all min-h-[36px] disabled:opacity-50"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{locale === "th" ? "สดชื่นดีมาก ✨" : "Thriving & Healthy ✨"}</span>
              </button>

              <button
                disabled={answeringId === current.id}
                onClick={() => handleAnswer(current, "bad")}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium rounded-lg shadow-sm transition-all min-h-[36px] disabled:opacity-50"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{locale === "th" ? "มีอาการผิดปกติ / ปรึกษาสวน 💬" : "Needs Help / Consult Nursery 💬"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {wisdomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 text-center mb-2">
              {locale === "th" ? "ยินดีด้วยครับ! 🌿" : "Wonderful News! 🌿"}
            </h3>
            <p className="text-sm text-stone-600 dark:text-stone-300 text-center mb-4 leading-relaxed">
              {locale === "th" ? (
                <>ต้น <span className="font-semibold">{wisdomModal.plant}</span> สดชื่นและปรับตัวได้ดีเยี่ยม</>
              ) : (
                <>Your <span className="font-semibold">{wisdomModal.plant}</span> is thriving and settling in nicely.</>
              )}
            </p>
            <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl p-3.5 mb-5 text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
              💡 <strong>{locale === "th" ? "คำแนะนำจากสวน:" : "Nursery Tip:"}</strong> {wisdomModal.wisdom}
            </div>
            <button
              onClick={() => setWisdomModal(null)}
              className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-sm font-semibold rounded-xl transition-all"
            >
              {locale === "th" ? "รับทราบ / ปิดหน้าต่าง" : "Got it / Close"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
