"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import {
  RotateCcw,
  MessageCircle,
  Home,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import { getLineAddFriendUrl } from "@/lib/line/formatters";

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalErrorPage({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    // Log the error to console for monitoring
    console.error("TreeForLife Client Error Caught:", error);
  }, [error]);

  const lineAddFriendUrl = getLineAddFriendUrl();

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-sand-50/60 dark:bg-forest-950/70">
      {/* Decorative ambient botanical glows */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-earth-200/40 dark:bg-earth-900/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-forest-200/40 dark:bg-emerald-900/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-xl w-full relative z-10 text-center space-y-8 bg-white/80 dark:bg-forest-900/70 backdrop-blur-md p-6 sm:p-10 rounded-3xl border border-sand-200/80 dark:border-forest-800 shadow-card">
        {/* Soft amber alert motif */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-earth-100 dark:bg-forest-800/80 text-earth-700 dark:text-emerald-300 shadow-soft ring-8 ring-earth-50 dark:ring-forest-900/60 transition-transform hover:scale-105">
          <AlertTriangle className="w-10 h-10 stroke-[1.75]" />
        </div>

        {/* Heading & Subtitle */}
        <div className="space-y-3">
          <h1 className="font-serif font-bold text-2xl sm:text-3xl lg:text-4xl text-forest-950 dark:text-sand-50 tracking-tight">
            เกิดข้อผิดพลาดชั่วคราว
          </h1>
          <p className="text-sm sm:text-base text-forest-800/80 dark:text-sand-300 max-w-md mx-auto leading-relaxed">
            ระบบกำลังปรับสมดุลหรือพบข้อขัดข้องชั่วคราวขณะโหลดข้อมูล คุณสามารถกดลองใหม่อีกครั้ง หรือติดต่อผู้ดูแลสวนของเราเพื่อรับคำแนะนำ
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {/* Retry Button */}
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-sand-50 bg-forest-700 hover:bg-forest-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 shadow-soft transition active:scale-[0.98] min-h-[44px] cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>ลองใหม่อีกครั้ง</span>
          </button>

          {/* LINE OA Contact Link */}
          <a
            href={lineAddFriendUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white bg-[#06C755] hover:bg-[#05b34c] shadow-soft transition active:scale-[0.98] min-h-[44px]"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>ติดต่อผ่าน LINE OA</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </a>
        </div>

        {/* Fallback Home Link */}
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-forest-700 dark:text-sand-300 hover:text-forest-950 dark:hover:text-sand-50 hover:underline transition"
          >
            <Home className="w-3.5 h-3.5" />
            <span>กลับสู่หน้าแรก</span>
          </Link>
        </div>

        {/* Optional Error Digest */}
        {error.digest && (
          <div className="pt-2 border-t border-sand-200/60 dark:border-forest-800/60">
            <p className="text-[11px] font-mono text-forest-600/60 dark:text-sand-400">
              รหัสข้อผิดพลาด: {error.digest}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
