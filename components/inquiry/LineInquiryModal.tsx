"use client";

import React, { useState } from "react";
import {
  X,
  MessageCircle,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";

export type InquiryIntent = "price" | "availability" | "care_help" | "design_quote";
const LINE_OA_ID = process.env.NEXT_PUBLIC_LINE_OA_ID || "treeforlife";

interface LineInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  speciesId?: string | null;
  speciesNameTh?: string;
  sourcePage: string;
  defaultIntent?: InquiryIntent;
  initialQuery?: string;
}

export function LineInquiryModal({
  isOpen,
  onClose,
  speciesId,
  speciesNameTh,
  sourcePage,
  defaultIntent = "care_help",
  initialQuery,
}: LineInquiryModalProps) {
  const { t, locale, addToast, user, guestToken } = useApp();
  const [intent, setIntent] = useState<InquiryIntent>(defaultIntent);
  const [customNote, setCustomNote] = useState(initialQuery || "");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [inquiryResult, setInquiryResult] = useState<{
    refCode: string;
    message: string;
    lineUrl: string;
    lineOaId: string;
  } | null>(null);

  if (!isOpen) return null;

  const intentsList: { id: InquiryIntent; label: string }[] = [
    { id: "care_help", label: t("inquiry.intent_care_help") },
    { id: "availability", label: t("inquiry.intent_availability") },
    { id: "price", label: t("inquiry.intent_price") },
    { id: "design_quote", label: t("inquiry.intent_design_quote") },
  ];

  const handleGenerateInquiry = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          speciesId: speciesId || null,
          speciesNameTh: speciesNameTh || (initialQuery ? `ค้นหา: ${initialQuery}` : undefined),
          userId: user.id || null,
          guestToken: guestToken || null,
          sourcePage,
          intent,
          customNote: customNote.trim() || undefined,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create inquiry");
      }

      const data = await res.json();
      setInquiryResult(data);
      addToast(t("inquiry.inquiry_sent"), "success");
    } catch (err) {
      console.error(err);
      addToast(t("toasts.error_generic"), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyMessage = async () => {
    if (!inquiryResult?.message) return;
    try {
      await navigator.clipboard.writeText(inquiryResult.message);
      setCopied(true);
      addToast(t("inquiry.message_copied"), "success");
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  const lineOaId = inquiryResult?.lineOaId || LINE_OA_ID;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-950/60 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="inquiry-modal-title"
    >
      <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-forest-900 border border-sand-200 dark:border-forest-700 shadow-elevated overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-sand-200 dark:border-forest-800 bg-sand-50/50 dark:bg-forest-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <MessageCircle className="w-5 h-5" />
            </div>
            <h3 id="inquiry-modal-title" className="font-serif font-bold text-lg text-forest-950 dark:text-sand-50">
              {t("inquiry.chat_line_title")}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-sand-500 hover:text-forest-950 dark:hover:text-sand-100 hover:bg-sand-100 dark:hover:bg-forest-800 transition"
            aria-label={t("nav.close")}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {!inquiryResult ? (
            <>
              {speciesNameTh && (
                <div className="p-3 rounded-xl bg-forest-50 dark:bg-forest-800/50 border border-forest-100 dark:border-forest-700/50 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-forest-500" />
                  <span className="text-sm font-medium text-forest-900 dark:text-sand-100">
                    {speciesNameTh}
                  </span>
                </div>
              )}

              {/* Select Intent */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-sand-600 dark:text-sand-400 mb-2">
                  {locale === "th" ? "หัวข้อที่ต้องการสอบถาม" : "Inquiry Topic"}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {intentsList.map((item) => {
                    const isSelected = intent === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setIntent(item.id)}
                        className={`px-3 py-2.5 rounded-xl text-xs font-medium text-left border transition flex items-center justify-between ${
                          isSelected
                            ? "border-forest-600 bg-forest-50 dark:bg-forest-800/80 text-forest-900 dark:text-sand-50 font-semibold shadow-sm"
                            : "border-sand-200 dark:border-forest-700/60 bg-white dark:bg-forest-900/40 text-forest-700 dark:text-sand-300 hover:border-sand-300"
                        }`}
                      >
                        <span>{item.label}</span>
                        {isSelected && <span className="text-forest-600 dark:text-forest-400 font-bold">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Note / Custom details */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-sand-600 dark:text-sand-400 mb-2">
                  {locale === "th" ? "รายละเอียดเพิ่มเติม (ถ้ามี)" : "Additional Notes (Optional)"}
                </label>
                <textarea
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder={
                    locale === "th"
                      ? "เช่น มีบริการส่งด่วนไหม หรืออาการใบเหลืองแบบนี้ต้องทำอย่างไร..."
                      : "e.g. Do you offer express delivery, or how to treat yellow leaves..."
                  }
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl text-sm border border-sand-300 dark:border-forest-700 bg-sand-50/50 dark:bg-forest-950/50 text-forest-950 dark:text-sand-100 placeholder:text-sand-400 focus:outline-none focus:ring-2 focus:ring-forest-500 transition"
                />
              </div>

              {/* Submit CTA */}
              <button
                type="button"
                onClick={handleGenerateInquiry}
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-forest-700 hover:bg-forest-800 text-sand-50 font-semibold text-sm shadow-soft transition flex items-center justify-center gap-2 disabled:opacity-50 min-h-[44px]"
              >
                {loading ? (
                  <span>{locale === "th" ? "กำลังเตรียมข้อความ..." : "Preparing..."}</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-gold-300" />
                    <span>{locale === "th" ? "สร้างข้อความและทัก LINE" : "Generate Message & Chat on LINE"}</span>
                  </>
                )}
              </button>
            </>
          ) : (
            /* Inquiry Ready State */
            <div className="space-y-4">
              {/* Reference Code Badge */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-forest-50 dark:bg-forest-800/60 border border-forest-200 dark:border-forest-700">
                <div className="text-xs text-forest-700 dark:text-sand-300">
                  <span className="font-semibold">{t("inquiry.ref_code_label")}: </span>
                  <span className="font-mono font-bold text-forest-900 dark:text-sand-50 text-sm tracking-wider">
                    {inquiryResult.refCode}
                  </span>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-medium">
                  {locale === "th" ? "บันทึกในระบบแล้ว" : "Recorded"}
                </span>
              </div>

              {/* Pre-formatted Message */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-sand-600 dark:text-sand-400 mb-1.5">
                  {locale === "th" ? "ข้อความที่เตรียมไว้ส่งให้ร้าน" : "Pre-formatted Inquiry Message"}
                </label>
                <div className="p-3.5 rounded-xl bg-sand-100/70 dark:bg-forest-950/70 border border-sand-200 dark:border-forest-800 font-sans text-xs sm:text-sm text-forest-900 dark:text-sand-100 leading-relaxed break-words whitespace-pre-wrap">
                  {inquiryResult.message}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleCopyMessage}
                  className="w-full py-2.5 px-3 rounded-xl border border-sand-300 dark:border-forest-700 bg-white dark:bg-forest-900 text-forest-800 dark:text-sand-100 font-medium text-xs hover:bg-sand-100 dark:hover:bg-forest-800 transition flex items-center justify-center gap-1.5 min-h-[44px]"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>{t("inquiry.message_copied")}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-sand-500" />
                      <span>{t("inquiry.copy_message")}</span>
                    </>
                  )}
                </button>

                <a
                  href={inquiryResult.lineUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 rounded-xl bg-[#06C755] hover:bg-[#05b34c] text-white font-semibold text-xs shadow-soft transition flex items-center justify-center gap-1.5 min-h-[44px]"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>{t("inquiry.open_line_app")}</span>
                </a>
              </div>

              {/* Desktop instructions */}
              <div className="pt-2 border-t border-sand-200 dark:border-forest-800/80 text-center">
                <p className="text-[11px] text-sand-600 dark:text-sand-400">
                  {t("inquiry.desktop_line_prompt")}
                </p>
                <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-sand-100 dark:bg-forest-800 text-xs font-mono text-forest-900 dark:text-sand-100">
                  <span>LINE ID: @{lineOaId}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
