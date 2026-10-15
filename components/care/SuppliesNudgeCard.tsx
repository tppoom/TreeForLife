"use client";

import React, { useState } from "react";
import { getRepotNudge, getFertilizerNudge } from "@/lib/care/supplies";
import { ShoppingBag, ArrowRight, X, Sparkles } from "lucide-react";
import { InquiryModal } from "@/components/ui/InquiryModal";
import { useApp } from "@/lib/context/AppContext";

export interface SuppliesNudgeCardProps {
  userPlantId: string;
  plantNickname: string;
  speciesName: string;
  speciesId?: string | null;
  potSizeInch: number;
  soilMix?: string | null;
  fertilizerNote?: string | null;
  nudgeDismissedAt?: Date | string | null;
  onDismissed?: () => void;
}

export function SuppliesNudgeCard({
  userPlantId,
  plantNickname,
  speciesName,
  speciesId,
  potSizeInch,
  soilMix,
  fertilizerNote,
  nudgeDismissedAt,
  onDismissed,
}: SuppliesNudgeCardProps) {
  const { locale } = useApp();
  const isEn = locale === "en";
  const [dismissed, setDismissed] = useState(Boolean(nudgeDismissedAt));
  const [inquiryOpen, setInquiryOpen] = useState(false);

  const repotNudge = getRepotNudge({
    currentPotInch: potSizeInch,
    speciesName,
    soilMix,
    fertilizerNote,
    nudgeDismissedAt: dismissed ? new Date() : null,
  });

  if (dismissed || !repotNudge.shouldShow) {
    return null;
  }

  const handleDismiss = async () => {
    setDismissed(true);
    onDismissed?.();
  };

  return (
    <>
      <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl p-4 sm:p-5 relative transition-all shadow-sm">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1 rounded-full transition-colors"
          title={isEn ? "Hide suggestion" : "ซ่อนคำแนะนำ"}
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <ShoppingBag className="w-5 h-5" />
          </div>

          <div className="flex-1 pr-6">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                {isEn ? `Recommended Supplies for ${plantNickname}` : `อุปกรณ์แนะนำสำหรับ ${plantNickname}`}
              </span>
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            </div>

            <p className="text-sm font-medium text-stone-800 dark:text-stone-200 mb-2 leading-relaxed">
              {isEn ? repotNudge.messageEn : repotNudge.messageTh}
            </p>

            <div className="flex flex-wrap items-center gap-2 mt-3">
              <button
                onClick={() => setInquiryOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium rounded-lg shadow-sm transition-all min-h-[36px]"
              >
                <span>{isEn ? "Inquire Pot & Soil on LINE" : "สั่งกระถาง & ดินสูตรร้านทาง LINE"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleDismiss}
                className="text-xs text-stone-500 dark:text-stone-400 hover:underline px-2 py-1.5 min-h-[36px]"
              >
                {isEn ? "Maybe later" : "ไว้คราวหน้า"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <InquiryModal
        isOpen={inquiryOpen}
        onClose={() => setInquiryOpen(false)}
        speciesNameTh={speciesName}
        speciesId={speciesId || undefined}
        initialQuery={
          isEn
            ? `Inquiring supplies for ${plantNickname} (${speciesName}): recommended pot ${repotNudge.suggestedPotInch}" ${soilMix ? `and nursery soil mix (${soilMix})` : ""}`
            : `สนใจสั่งซื้ออุปกรณ์สำหรับ ${plantNickname} (${speciesName}): แนะนำกระถาง ${repotNudge.suggestedPotInch} นิ้ว ${soilMix ? `และดินสูตรร้าน (${soilMix})` : ""}`
        }
      />
    </>
  );
}
