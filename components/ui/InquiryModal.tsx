"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  MessageCircle,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  QrCode,
  RotateCcw,
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";

export type InquiryIntent = "price" | "availability" | "care_help" | "design_quote";

export const LINE_OA_ID = process.env.NEXT_PUBLIC_LINE_OA_ID || "treeforlife";

export interface InquiryModalSpecies {
  id: string;
  nameTh: string;
  nameEn: string;
  slug?: string;
}

export interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  species?: InquiryModalSpecies | null;
  speciesId?: string | null;
  speciesNameTh?: string;
  intent?: InquiryIntent;
  defaultIntent?: InquiryIntent;
  sourcePage?: string;
  initialQuery?: string;
}

export function InquiryModal({
  isOpen,
  onClose,
  species,
  speciesId,
  speciesNameTh,
  intent: initialIntentProp,
  defaultIntent = "care_help",
  sourcePage,
  initialQuery,
}: InquiryModalProps) {
  const { t, locale, addToast, user, guestToken } = useApp();

  const startingIntent = initialIntentProp || defaultIntent;
  const [intent, setIntent] = useState<InquiryIntent>(startingIntent);
  const [customNote, setCustomNote] = useState(initialQuery || "");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrError, setQrError] = useState(false);
  const [inquiryResult, setInquiryResult] = useState<{
    refCode: string;
    message: string;
    messageText: string;
    lineUrl: string;
    lineOaId: string;
  } | null>(null);

  // Reset modal state when closed or when species changes
  const speciesIdKey = species?.id || speciesId || null;
  useEffect(() => {
    if (!isOpen) {
      setInquiryResult(null);
      setCopied(false);
      setCustomNote(initialQuery || "");
      setQrError(false);
      setLoading(false);
    }
  }, [isOpen, initialQuery]);

  useEffect(() => {
    setInquiryResult(null);
    setCopied(false);
    setCustomNote(initialQuery || "");
    setQrError(false);
    setLoading(false);
  }, [speciesIdKey, initialQuery]);

  // Lock body scroll while modal is open
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // Sync default intent if changed from parent
  useEffect(() => {
    if (initialIntentProp) {
      setIntent(initialIntentProp);
    } else if (defaultIntent) {
      setIntent(defaultIntent);
    }
  }, [initialIntentProp, defaultIntent]);

  // Sync initial query if provided
  useEffect(() => {
    if (initialQuery) {
      setCustomNote(initialQuery);
    }
  }, [initialQuery]);

  // Handle ESC key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Check if current user is on mobile device
  const isMobileDevice = useCallback(() => {
    if (typeof window === "undefined") return false;
    return (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) || window.innerWidth < 768
    );
  }, []);

  if (!isOpen) return null;

  const targetSpeciesId = species?.id || speciesId || null;
  const targetSpeciesNameTh = species?.nameTh || speciesNameTh || "";
  const targetSpeciesNameEn = species?.nameEn || "";
  const effectiveSourcePage =
    sourcePage ||
    (species?.slug
      ? `/plants/${species.slug}`
      : typeof window !== "undefined"
      ? window.location.pathname
      : "/");

  const intentsList: { id: InquiryIntent; label: string; desc: string }[] = [
    {
      id: "care_help",
      label: t("inquiry.intent_care_help"),
      desc: locale === "th" ? "ปรึกษาอาการ ดิน แสง หรือการรดน้ำ" : "Care advice & troubleshooting",
    },
    {
      id: "availability",
      label: t("inquiry.intent_availability"),
      desc: locale === "th" ? "สอบถามสต็อกไม้พร้อมส่งที่หน้าร้าน" : "Check stock & current availability",
    },
    {
      id: "price",
      label: t("inquiry.intent_price"),
      desc: locale === "th" ? "ขอทราบราคาและขนาดต้นไม้ที่มี" : "Inquire pricing & available sizes",
    },
    {
      id: "design_quote",
      label: t("inquiry.intent_design_quote"),
      desc: locale === "th" ? "ปรึกษาจัดมุมต้นไม้และขอใบเสนอราคา" : "Interior plant styling quote",
    },
  ];

  const handleGenerateInquiry = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          speciesId: targetSpeciesId,
          speciesNameTh:
            targetSpeciesNameTh || (initialQuery ? `ค้นหา: ${initialQuery}` : undefined),
          userId: user?.id || null,
          guestToken: guestToken || null,
          sourcePage: effectiveSourcePage,
          intent,
          customNote: customNote.trim() || undefined,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create inquiry");
      }

      const data = await res.json();
      const resultObj = {
        refCode: data.refCode,
        message: data.message || data.messageText || "",
        messageText: data.messageText || data.message || "",
        lineUrl: data.lineUrl,
        lineOaId: data.lineOaId || LINE_OA_ID,
      };

      setInquiryResult(resultObj);
      addToast(t("inquiry.inquiry_sent"), "success");

      // On mobile: directly deep link to LINE OA
      if (isMobileDevice() && resultObj.lineUrl) {
        window.location.href = resultObj.lineUrl;
      }
    } catch (err) {
      console.error("Inquiry error:", err);
      addToast(t("toasts.error_generic"), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyMessage = async () => {
    const textToCopy = inquiryResult?.messageText || inquiryResult?.message;
    if (!textToCopy) return;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        // Fallback for environments where clipboard API is restricted
        const textArea = document.createElement("textarea");
        textArea.value = textToCopy;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopied(true);
      addToast(t("inquiry.message_copied"), "success");
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleReset = () => {
    setInquiryResult(null);
    setCopied(false);
    setQrError(false);
  };

  const activeLineOaId = inquiryResult?.lineOaId || LINE_OA_ID;
  const qrCodeUrl = inquiryResult?.lineUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=${encodeURIComponent(
        inquiryResult.lineUrl
      )}`
    : `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=${encodeURIComponent(
        `https://line.me/R/ti/p/@${activeLineOaId}`
      )}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-950/60 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="inquiry-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-xl rounded-2xl bg-white dark:bg-forest-900 border border-sand-200 dark:border-forest-700 shadow-elevated overflow-hidden transition-all animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-sand-200 dark:border-forest-800 bg-sand-50/70 dark:bg-forest-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#06C755]/10 text-[#06C755] flex items-center justify-center">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h3
                id="inquiry-modal-title"
                className="font-serif font-bold text-lg text-forest-950 dark:text-sand-50 leading-tight"
              >
                {t("inquiry.chat_line_title")}
              </h3>
              <p className="text-[11px] text-sand-600 dark:text-sand-400">
                LINE Official Account: @{activeLineOaId}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-sand-500 hover:text-forest-950 dark:hover:text-sand-100 hover:bg-sand-100 dark:hover:bg-forest-800 transition min-w-[44px] min-h-[44px] w-11 h-11 flex items-center justify-center"
            aria-label={t("nav.close") || "Close"}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {!inquiryResult ? (
            /* Step 1: Inquire Form */
            <>
              {/* Plant Banner if provided */}
              {(targetSpeciesNameTh || targetSpeciesNameEn) && (
                <div className="p-3.5 rounded-xl bg-forest-50 dark:bg-forest-800/50 border border-forest-100 dark:border-forest-700/50 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-forest-500 flex-shrink-0" />
                    <div className="truncate">
                      <span className="text-sm font-semibold text-forest-900 dark:text-sand-100">
                        {targetSpeciesNameTh}
                      </span>
                      {targetSpeciesNameEn && (
                        <span className="text-xs text-sand-600 dark:text-sand-400 ml-2 italic">
                          ({targetSpeciesNameEn})
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-forest-100 dark:bg-forest-700 text-forest-800 dark:text-sand-200 whitespace-nowrap">
                    TreeForLife
                  </span>
                </div>
              )}

              {/* Select Intent */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-sand-600 dark:text-sand-400 mb-2">
                  {locale === "th" ? "เลือกหัวข้อที่ต้องการสอบถาม" : "Choose Inquiry Topic"}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {intentsList.map((item) => {
                    const isSelected = intent === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setIntent(item.id)}
                        className={`p-3 rounded-xl text-left border transition flex flex-col justify-between min-h-[64px] ${
                          isSelected
                            ? "border-forest-600 bg-forest-50/90 dark:bg-forest-800/80 text-forest-900 dark:text-sand-50 font-semibold shadow-sm ring-1 ring-forest-500/20"
                            : "border-sand-200 dark:border-forest-700/60 bg-white dark:bg-forest-900/40 text-forest-700 dark:text-sand-300 hover:border-sand-300 hover:bg-sand-50/50 dark:hover:bg-forest-800/30"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <span className="text-xs sm:text-sm font-semibold">{item.label}</span>
                          {isSelected && (
                            <span className="text-xs font-bold text-forest-600 dark:text-forest-400">
                              ✓
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-sand-600 dark:text-sand-400 line-clamp-1 font-normal">
                          {item.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Note / Custom details */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-sand-600 dark:text-sand-400 mb-1.5">
                  {locale === "th"
                    ? "รายละเอียดเพิ่มเติม หรือคำถามเฉพาะ (ถ้ามี)"
                    : "Additional Details or Specific Questions (Optional)"}
                </label>
                <textarea
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder={
                    locale === "th"
                      ? "เช่น มีส่งด่วนใน กทม. ไหม หรือใบมีจุดสีน้ำตาลแบบนี้ควรทำอย่างไร..."
                      : "e.g., Do you offer express same-day delivery, or what should I do for brown leaf tips..."
                  }
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-sand-300 dark:border-forest-700 bg-sand-50/50 dark:bg-forest-950/50 text-forest-950 dark:text-sand-100 placeholder:text-sand-400 focus:outline-none focus:ring-2 focus:ring-forest-500 transition"
                />
              </div>

              {/* Submit CTA */}
              <button
                type="button"
                onClick={handleGenerateInquiry}
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-[#06C755] hover:bg-[#05b34c] text-white font-semibold text-sm shadow-soft transition flex items-center justify-center gap-2 disabled:opacity-50 min-h-[48px]"
              >
                {loading ? (
                  <span>{locale === "th" ? "กำลังเตรียมข้อความและรหัสอ้างอิง..." : "Preparing inquiry..."}</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-emerald-100" />
                    <span>
                      {locale === "th"
                        ? "สร้างรหัสและเชื่อมต่อ LINE"
                        : "Generate Code & Connect to LINE"}
                    </span>
                  </>
                )}
              </button>
            </>
          ) : (
            /* Step 2: Inquiry Ready State (Handoff Screen) */
            <div className="space-y-5">
              {/* Reference Code & Status Badge */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-forest-50 dark:bg-forest-800/60 border border-forest-200 dark:border-forest-700">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-forest-700 dark:text-sand-300 font-medium">
                    {t("inquiry.ref_code_label")}:
                  </span>
                  <span className="font-mono font-bold text-forest-900 dark:text-sand-50 text-base tracking-wider bg-white dark:bg-forest-900 px-2 py-0.5 rounded-md border border-forest-200 dark:border-forest-700 shadow-xs">
                    {inquiryResult.refCode}
                  </span>
                </div>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-medium border border-emerald-200 dark:border-emerald-800">
                  {locale === "th" ? "บันทึกในระบบแล้ว" : "Recorded"}
                </span>
              </div>

              {/* Desktop View: QR Code + Instructions */}
              <div className="hidden md:flex flex-col items-center justify-center p-4 rounded-2xl bg-sand-50/80 dark:bg-forest-950/60 border border-sand-200 dark:border-forest-800 text-center">
                <div className="flex items-center gap-2 text-xs font-semibold text-sand-700 dark:text-sand-300 mb-3">
                  <QrCode className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{t("inquiry.desktop_line_prompt")}</span>
                </div>

                {/* QR Code Container */}
                <div
                  data-testid="inquiry-qr-code"
                  className="p-3 bg-white rounded-2xl shadow-soft border border-sand-200/80 flex flex-col items-center"
                >
                  {!qrError ? (
                    <img
                      src={qrCodeUrl}
                      alt="LINE OA QR Code"
                      width={160}
                      height={160}
                      onError={() => setQrError(true)}
                      className="w-36 h-36 rounded-lg object-contain"
                    />
                  ) : (
                    <div
                      data-testid="inquiry-qr-code-fallback"
                      className="w-36 h-36 bg-emerald-50 rounded-lg flex flex-col items-center justify-center p-2 text-center"
                    >
                      <MessageCircle className="w-8 h-8 text-emerald-600 mb-1" />
                      <span className="text-xs font-mono font-bold text-forest-900">
                        @{activeLineOaId}
                      </span>
                    </div>
                  )}
                  <span className="mt-1.5 text-[11px] font-mono font-semibold text-forest-800">
                    LINE OA: @{activeLineOaId}
                  </span>
                </div>
              </div>

              {/* Formatted Inquiry Message Box */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-sand-600 dark:text-sand-400 mb-1.5">
                  {locale === "th" ? "ข้อความที่เตรียมไว้ส่งให้ร้าน" : "Pre-formatted Message"}
                </label>
                <div className="p-3.5 rounded-xl bg-sand-100/80 dark:bg-forest-950/80 border border-sand-200 dark:border-forest-800 font-sans text-xs sm:text-sm text-forest-900 dark:text-sand-100 leading-relaxed break-words whitespace-pre-wrap select-all">
                  {inquiryResult.messageText || inquiryResult.message}
                </div>
              </div>

              {/* Action Buttons: Copy Message & Open LINE App */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleCopyMessage}
                  data-testid="copy-message-btn"
                  className="w-full py-3 px-4 rounded-xl border border-sand-300 dark:border-forest-700 bg-white dark:bg-forest-900 text-forest-800 dark:text-sand-100 font-medium text-xs sm:text-sm hover:bg-sand-100 dark:hover:bg-forest-800 transition flex items-center justify-center gap-2 min-h-[44px]"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                        {t("inquiry.message_copied")}
                      </span>
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
                  className="w-full py-3 px-4 rounded-xl bg-[#06C755] hover:bg-[#05b34c] text-white font-semibold text-xs sm:text-sm shadow-soft transition flex items-center justify-center gap-2 min-h-[44px]"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>{t("inquiry.open_line_app")}</span>
                </a>
              </div>

              {/* Reset / Ask Another Topic Option */}
              <div className="pt-2 border-t border-sand-200 dark:border-forest-800 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-sand-600 dark:text-sand-400 hover:text-forest-800 dark:hover:text-sand-200 flex items-center gap-1.5 transition py-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{locale === "th" ? "สอบถามเรื่องอื่นเพิ่มเติม" : "Inquire another topic"}</span>
                </button>
                <span className="text-sand-400 font-mono text-[11px]">
                  Ref: {inquiryResult.refCode}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
