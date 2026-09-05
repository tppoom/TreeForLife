"use client";

import React from "react";
import { useApp } from "@/lib/context/AppContext";
import { CheckCircle2, Info, AlertCircle, X } from "lucide-react";

export function ToastContainer() {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 bg-stone-900/95 text-stone-100 backdrop-blur-md rounded-xl shadow-elevated border border-stone-700/60 text-sm animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          <div className="flex items-center gap-2.5">
            {toast.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
            {toast.type === "warning" && <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />}
            {toast.type === "info" && <Info className="w-5 h-5 text-sand-300 shrink-0" />}
            <span className="font-medium text-stone-100">{toast.message}</span>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-stone-400 hover:text-stone-200 p-1 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
