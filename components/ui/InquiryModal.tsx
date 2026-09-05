"use client";

import React, { useState } from "react";
import { useApp } from "@/lib/context/AppContext";
import { InquiryIntent } from "@/lib/services/inquiryService";
import { X, Send, Copy, Check, MessageSquare, Sparkles, HelpCircle, Package, ArrowUpRight } from "lucide-react";
import Image from "next/image";

export function InquiryModal() {
  const { inquiryModal, closeInquiryModal, showToast, guestToken, currentUser } = useApp();
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
          speciesNameTh: inquiryModal.speciesNameTh || "ต้นไม้",
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
      showToast(err.message || "เกิดข้อผิดพลาดในการเชื่อมต่อ LINE", "warning");
    } finally {
      setLoading(false);
    }
  };

  const copyMessage = () => {
    if (!createdResult) return;
    navigator.clipboard.writeText(createdResult.message);
    setCopied(true);
    showToast("คัดลอกข้อความแล้ว นำไปวางในแชท LINE ได้เลย", "success");
    setTimeout(() => setCopied(false), 2500);
  };

  const intents: { key: InquiryIntent; label: string; icon: React.ReactNode }[] = [
    { key: "price", label: "สอบถามราคา & ขนาด", icon: <Package className="w-4 h-4" /> },
    { key: "availability", label: "เช็คสถานะของพร้อมส่ง", icon: <Check className="w-4 h-4" /> },
    { key: "care_help", label: "ปรึกษาการดูแล", icon: <HelpCircle className="w-4 h-4" /> },
    { key: "design_quote", label: "สนใจจัดมุมสวน", icon: <Sparkles className="w-4 h-4" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-sand-50 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-sand-300/80 text-stone-800 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-forest-900 to-forest-800 text-sand-50 px-6 py-5 flex items-center justify-between border-b border-forest-700/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-medium text-sand-50">ส่งข้อความถึงร้าน TreeForLife</h3>
              <p className="text-xs text-sand-300">ปรึกษาโดยตรงผ่าน LINE Official ของทางร้าน</p>
            </div>
          </div>
          <button
            onClick={closeInquiryModal}
            className="text-sand-300 hover:text-sand-100 p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Target Plant Preview */}
          {inquiryModal.speciesNameTh && (
            <div className="flex items-center gap-3.5 p-3.5 bg-sand-100 rounded-xl border border-sand-200">
              {inquiryModal.speciesPhoto && (
                <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-sand-300">
                  <Image
                    src={inquiryModal.speciesPhoto}
                    alt={inquiryModal.speciesNameTh}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="min-w-0">
                <span className="text-[11px] font-semibold tracking-wider text-forest-700 uppercase">ต้นไม้ที่คุณสนใจ</span>
                <h4 className="font-serif text-base font-semibold text-stone-900 truncate">
                  {inquiryModal.speciesNameTh}
                </h4>
              </div>
            </div>
          )}

          {!createdResult ? (
            <>
              {/* Intent Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-2">
                  เรื่องที่ต้องการสอบถาม
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {intents.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setIntent(item.key)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left border ${
                        intent === item.key
                          ? "bg-forest-900 text-sand-50 border-forest-900 shadow-sm"
                          : "bg-white text-stone-700 border-sand-200 hover:border-sand-300 hover:bg-sand-50"
                      }`}
                    >
                      <span className={intent === item.key ? "text-emerald-400" : "text-stone-400"}>
                        {item.icon}
                      </span>
                      <span className="truncate">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Note input */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                  ระบุรายละเอียดเพิ่มเติม (ถ้ามี)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="เช่น อยากได้ต้นสูงประมาณ 1 เมตร หรือสอบถามวิธีแก้ใบเหลือง..."
                  rows={3}
                  className="w-full text-sm px-3.5 py-2.5 bg-white border border-sand-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-transparent text-stone-800 placeholder-stone-400"
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
                  <span>{loading ? "กำลังสร้างข้อความ..." : "เปิดแชท LINE พร้อมข้อความระบุชื่อต้นนี้"}</span>
                </button>
                <p className="text-[11px] text-stone-400 text-center mt-2">
                  ระบบจะสร้างรหัสอ้างอิงและเปิด LINE Official ของร้านให้อัตโนมัติ
                </p>
              </div>
            </>
          ) : (
            /* Created Result View */
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-emerald-800">รหัสอ้างอิงของคุณ</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-700 text-white font-mono text-xs font-bold tracking-wider">
                    {createdResult.refCode}
                  </span>
                </div>
                <p className="text-xs text-emerald-700 leading-relaxed">
                  หาก LINE ไม่เปิดขึ้นอัตโนมัติ คุณสามารถคัดลอกข้อความด้านล่างนี้ไปส่งให้ร้านได้ทันที
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">
                  ข้อความตั้งต้นที่ระบุรหัสแล้ว
                </label>
                <div className="p-3 bg-white border border-sand-300 rounded-xl text-xs text-stone-700 leading-relaxed font-sans select-all">
                  {createdResult.message}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={copyMessage}
                  className="flex-1 py-2.5 px-3 bg-white border border-sand-300 hover:bg-sand-100 rounded-xl text-xs font-medium text-stone-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? "คัดลอกแล้ว!" : "คัดลอกข้อความ"}</span>
                </button>
                <a
                  href={createdResult.lineUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 px-3 bg-[#06C755] hover:bg-[#05b34c] text-white rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  <span>เปิด LINE อีกครั้ง</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>

              <div className="text-center pt-2">
                <button
                  onClick={closeInquiryModal}
                  className="text-xs text-stone-500 hover:text-stone-800 underline underline-offset-4"
                >
                  เสร็จสิ้นและปิดหน้าต่าง
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
