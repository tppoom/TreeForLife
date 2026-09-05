"use client";

import React, { useState } from "react";
import { useApp } from "@/lib/context/AppContext";
import { InquiryIntent } from "@/lib/services/inquiryService";
import { X, Send, Copy, Check, MessageSquare, Sparkles, HelpCircle, Package, ArrowUpRight } from "lucide-react";
import Image from "next/image";

export function InquiryModal() {
  const { inquiryModal, closeInquiryModal, showToast, guestToken, currentUser, t, locale } = useApp();
  const [intent, setIntent] = useState<InquiryIntent>(inquiryModal.defaultIntent || "price");
  const [note, setNote] = useState(inquiryModal.customNote || "");
  const [loading, setLoading] = useState(false);
  const [createdResult, setCreatedResult] = useState<{
    refCode: string;
    message: string;
    lineUrl: string;
    lineOaId: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  if (!inquiryModal.isOpen) return null;

  const handleSendToLine = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          speciesId: inquiryModal.speciesId,
          speciesNameTh: inquiryModal.speciesNameTh || (locale === "th" ? "ต้นไม้" : "Plant"),
          userId: currentUser?.id,
          guestToken,
          sourcePage: inquiryModal.sourcePage || window.location.pathname,
          intent,
          customNote: note.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create inquiry");

      setCreatedResult(data);

      // Try opening LINE deep link in new tab / app
      if (typeof window !== "undefined") {
        window.open(data.lineUrl, "_blank");
      }
    } catch (err: any) {
      showToast(err.message || (locale === "th" ? "เกิดข้อผิดพลาดในการเชื่อมต่อ LINE" : "Failed to connect to LINE"), "warning");
    } finally {
      setLoading(false);
    }
  };

  const copyMessage = () => {
    if (!createdResult) return;
    navigator.clipboard.writeText(createdResult.message);
    setCopied(true);
    showToast(t.modal.copiedBtn, "success");
    setTimeout(() => setCopied(false), 2500);
  };

  const intents: { key: InquiryIntent; label: string; icon: React.ReactNode }[] = [
    { key: "price", label: locale === "th" ? "สอบถามราคา & ขนาด" : "Inquire Price & Size", icon: <Package className="w-4 h-4" /> },
    { key: "availability", label: locale === "th" ? "เช็คสถานะของพร้อมส่ง" : "Check In-Stock Status", icon: <Check className="w-4 h-4" /> },
    { key: "care_help", label: locale === "th" ? "ปรึกษาการดูแล" : "Plant Care Advice", icon: <HelpCircle className="w-4 h-4" /> },
    { key: "design_quote", label: locale === "th" ? "สนใจจัดมุมสวน" : "Garden Corner Styling", icon: <Sparkles className="w-4 h-4" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-950/70 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-sand-50 dark:bg-[#0c1e15] rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-sand-300/80 dark:border-forest-800 text-stone-800 dark:text-sand-100 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-forest-900 to-forest-800 text-sand-50 px-6 py-5 flex items-center justify-between border-b border-forest-700/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-medium text-sand-50">{t.modal.title}</h3>
              <p className="text-xs text-sand-300">{t.modal.desc}</p>
            </div>
          </div>
          <button
            onClick={closeInquiryModal}
            className="text-sand-300 hover:text-sand-100 p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Target Plant Preview */}
          {inquiryModal.speciesNameTh && (
            <div className="flex items-center gap-3.5 p-3.5 bg-sand-100 dark:bg-forest-950/60 rounded-xl border border-sand-200 dark:border-forest-900">
              {inquiryModal.speciesPhoto && (
                <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-sand-300 dark:border-forest-800">
                  <Image
                    src={inquiryModal.speciesPhoto}
                    alt={inquiryModal.speciesNameTh}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="min-w-0">
                <span className="text-[11px] font-semibold tracking-wider text-forest-700 dark:text-gold-400 uppercase">
                  {t.modal.plantInterested}
                </span>
                <h4 className="font-serif text-base font-semibold text-stone-900 dark:text-sand-50 truncate">
                  {inquiryModal.speciesNameTh}
                </h4>
              </div>
            </div>
          )}

          {!createdResult ? (
            <>
              {/* Intent Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-sand-300 mb-2">
                  {t.modal.topicLabel}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {intents.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setIntent(item.key)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left border cursor-pointer ${
                        intent === item.key
                          ? "bg-forest-900 dark:bg-forest-800 text-sand-50 border-forest-900 dark:border-forest-700 shadow-sm"
                          : "bg-white dark:bg-forest-950 text-stone-700 dark:text-sand-200 border-sand-200 dark:border-forest-900 hover:border-sand-300 hover:bg-sand-50 dark:hover:bg-forest-900"
                      }`}
                    >
                      <span className={intent === item.key ? "text-emerald-400" : "text-stone-400 dark:text-stone-500"}>
                        {item.icon}
                      </span>
                      <span className="truncate">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Note input */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-sand-300 mb-1.5">
                  {t.modal.detailsLabel}
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={t.modal.detailsPlaceholder}
                  rows={3}
                  className="w-full text-sm px-3.5 py-2.5 bg-white dark:bg-forest-950 border border-sand-300 dark:border-forest-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-600 dark:focus:ring-gold-500 text-stone-800 dark:text-sand-100 placeholder-stone-400 dark:placeholder-stone-500"
                />
              </div>

              {/* CTA Buttons */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSendToLine}
                  disabled={loading}
                  className="w-full py-3.5 px-4 bg-[#06C755] hover:bg-[#05b34c] active:bg-[#049a41] text-white font-medium rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all text-sm disabled:opacity-70 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{loading ? t.modal.creatingMsg : t.modal.openLineBtn}</span>
                </button>
                <p className="text-[11px] text-stone-400 dark:text-stone-500 text-center mt-2">
                  {t.modal.lineSubtext}
                </p>
              </div>
            </>
          ) : (
            /* Created Result View */
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">{t.modal.refCodeLabel}</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-700 text-white font-mono text-xs font-bold tracking-wider">
                    {createdResult.refCode}
                  </span>
                </div>
                <p className="text-xs text-emerald-700 dark:text-emerald-300 leading-relaxed">
                  {t.modal.refCodeDesc}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 dark:text-sand-300 mb-1">
                  {t.modal.prefilledLabel}
                </label>
                <div className="p-3 bg-white dark:bg-forest-950 border border-sand-300 dark:border-forest-800 rounded-xl text-xs text-stone-700 dark:text-sand-200 leading-relaxed font-sans select-all">
                  {createdResult.message}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={copyMessage}
                  className="flex-1 py-2.5 px-3 bg-white dark:bg-forest-950 border border-sand-300 dark:border-forest-800 hover:bg-sand-100 dark:hover:bg-forest-900 rounded-xl text-xs font-medium text-stone-700 dark:text-sand-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? t.modal.copiedBtn : t.modal.copyBtn}</span>
                </button>
                <a
                  href={createdResult.lineUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 px-3 bg-[#06C755] hover:bg-[#05b34c] text-white rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  <span>{t.modal.reopenLineBtn}</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>

              <div className="text-center pt-2">
                <button
                  onClick={closeInquiryModal}
                  className="text-xs text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-sand-100 underline underline-offset-4 cursor-pointer"
                >
                  {t.modal.closeBtn}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
