"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/lib/context/AppContext";
import {
  ShieldCheck,
  Download,
  Trash2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  FileJson,
  Loader2,
  AlertTriangle,
} from "lucide-react";

export interface GardenPdpaSectionProps {
  className?: string;
  onReset?: () => void;
}

export function GardenPdpaSection({ className = "", onReset }: GardenPdpaSectionProps) {
  const { locale, addToast } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // 1. Export personal data as JSON
  const handleExportData = async () => {
    try {
      setExporting(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("tfl_guest_token") : null;
      if (!token) {
        addToast(
          locale === "th"
            ? "ไม่พบรหัสประจำอุปกรณ์ (Guest Token) ไม่พบข้อมูลที่ต้องส่งออก"
            : "No guest identifier found on this device.",
          "warning"
        );
        return;
      }

      const res = await fetch("/api/account/export", {
        headers: {
          "x-guest-token": token,
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errorMsg =
          errorData.error?.message ||
          (typeof errorData.error === "string" ? errorData.error : null) ||
          errorData.message ||
          (locale === "th" ? "การดาวน์โหลดข้อมูลล้มเหลว" : "Export failed");
        throw new Error(errorMsg);
      }

      const blob = await res.blob();
      const contentDisposition = res.headers.get("content-disposition");
      let filename = `treeforlife-data-${new Date().toISOString().split("T")[0]}.json`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^";]+)"?/);
        if (match && match[1]) {
          filename = match[1];
        }
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      addToast(
        locale === "th"
          ? "ดาวน์โหลดข้อมูลส่วนบุคคล (JSON) สำเร็จเรียบร้อยแล้ว"
          : "Personal data (JSON) exported successfully",
        "success"
      );
    } catch (err: unknown) {
      console.error("Export error:", err);
      addToast(
        err instanceof Error
          ? err.message
          : locale === "th"
          ? "เกิดข้อผิดพลาดในการดาวน์โหลด"
          : "Failed to export data",
        "error"
      );
    } finally {
      setExporting(false);
    }
  };

  // 2. Erase personal data & reset local guest state
  const handleResetData = async () => {
    const confirmMessage =
      locale === "th"
        ? "คุณต้องการลบข้อมูลต้นไม้และบันทึกการดูแลทั้งหมดในเครื่องนี้ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้"
        : "Are you sure you want to delete all plant records and care logs on this device? This action cannot be undone.";

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setDeleting(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("tfl_guest_token") : null;

      if (token) {
        const res = await fetch("/api/account/delete", {
          method: "POST",
          headers: {
            "x-guest-token": token,
          },
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          const errorMsg =
            errorData.error?.message ||
            (typeof errorData.error === "string" ? errorData.error : null) ||
            errorData.message ||
            (locale === "th" ? "การลบข้อมูลล้มเหลว กรุณาลองใหม่อีกครั้ง" : "Deletion failed, please try again");
          throw new Error(errorMsg);
        }
      }

      if (typeof window !== "undefined") {
        localStorage.removeItem("tfl_guest_token");
      }

      addToast(
        locale === "th"
          ? "ล้างข้อมูลในเครื่องนี้และระบบเรียบร้อยแล้ว"
          : "All local data has been erased successfully.",
        "success"
      );

      if (onReset) {
        onReset();
      } else if (typeof window !== "undefined") {
        window.location.reload();
      }
    } catch (err: unknown) {
      console.error("Delete error:", err);
      addToast(
        err instanceof Error
          ? err.message
          : locale === "th"
          ? "เกิดข้อผิดพลาดในการลบข้อมูล"
          : "Failed to erase data",
        "error"
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section
      aria-label="การจัดการข้อมูลส่วนบุคคล (PDPA)"
      className={`bg-white/80 dark:bg-forest-900/60 backdrop-blur-md border border-sand-200/80 dark:border-forest-800 rounded-2xl p-5 sm:p-6 shadow-sm transition-all duration-200 ${className}`}
    >
      {/* Header & Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-xl"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-center text-emerald-700 dark:text-emerald-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-serif font-bold text-base sm:text-lg text-forest-900 dark:text-sand-100">
                {locale === "th"
                  ? "การจัดการข้อมูลส่วนบุคคล (PDPA) & สิทธิผู้ใช้งาน"
                  : "Personal Data (PDPA) & Data Rights"}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                PDPA Compliant
              </span>
            </div>
            <p className="text-xs text-sand-600 dark:text-sand-400 mt-0.5">
              {locale === "th"
                ? "สิทธิในการเข้าถึง ดาวน์โหลดข้อมูล และขอให้ลบข้อมูลออกจากระบบ"
                : "Your rights to access, export, and erase personal data"}
            </p>
          </div>
        </div>

        <div className="text-sand-500 dark:text-sand-400 hover:text-forest-800 dark:hover:text-sand-200 transition p-1">
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="mt-5 pt-5 border-t border-sand-200/60 dark:border-forest-800/80 space-y-4">
          <p className="text-xs sm:text-sm text-sand-600 dark:text-sand-300 leading-relaxed">
            {locale === "th"
              ? "TreeForLife ให้ความสำคัญกับการคุ้มครองข้อมูลส่วนบุคคลตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA) ข้อมูลต้นไม้ในสวน บันทึกการดูแล และประวัติการสอบถามของคุณผูกอยู่กับรหัสประจำอุปกรณ์แบบนิรนาม (Guest Token) คุณสามารถขอรับสำเนาข้อมูลของคุณ หรือสั่งลบข้อมูลทั้งหมดในเครื่องนี้ได้อย่างอิสระ"
              : "TreeForLife complies with Personal Data Protection laws (PDPA). Your garden plants, care logs, and inquiries are associated with an anonymous guest token on this device. You can download an export copy or permanently erase all associated data at any time."}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {/* Download Data Button */}
            <button
              type="button"
              onClick={handleExportData}
              disabled={exporting || deleting}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm bg-forest-800 hover:bg-forest-900 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-sand-50 transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {exporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4 text-emerald-300" />
              )}
              <span>
                {locale === "th" ? "ดาวน์โหลดข้อมูลของฉัน (JSON)" : "Download My Data (JSON)"}
              </span>
            </button>

            {/* Erase Data Button */}
            <button
              type="button"
              onClick={handleResetData}
              disabled={exporting || deleting}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm border border-rose-300 dark:border-rose-900/60 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {deleting ? (
                <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
              ) : (
                <Trash2 className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              )}
              <span>{locale === "th" ? "ล้างข้อมูลในเครื่องนี้" : "Erase Device Data"}</span>
            </button>
          </div>

          {/* Privacy Policy Link Note */}
          <div className="pt-3 border-t border-sand-100 dark:border-forest-800/40 flex items-center justify-between flex-wrap gap-2 text-xs text-sand-500 dark:text-sand-400">
            <span className="flex items-center gap-1.5">
              <FileJson className="w-3.5 h-3.5 text-sand-400" />
              <span>{locale === "th" ? "ไฟล์ JSON พกพาได้ตามมาตรฐานสิทธิพกพาข้อมูล" : "Standard portable JSON format"}</span>
            </span>
            <Link
              href="/privacy"
              className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 hover:underline font-medium"
            >
              <span>{locale === "th" ? "อ่านนโยบายความเป็นส่วนตัว" : "Read Privacy Policy"}</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}

// Alias for convenience as specified in requirements
export const GardenPlantsClient = GardenPdpaSection;
export default GardenPdpaSection;
