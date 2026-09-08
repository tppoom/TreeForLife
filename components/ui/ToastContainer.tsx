"use client";

import React from "react";
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
} from "lucide-react";
import { useApp, type Toast, type ToastType } from "@/lib/context/AppContext";

function ToastIcon({ type }: { type: ToastType }) {
  switch (type) {
    case "success":
      return <CheckCircle2 className="w-5 h-5 text-forest-600 dark:text-forest-400 shrink-0" />;
    case "error":
      return <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />;
    case "warning":
      return <AlertTriangle className="w-5 h-5 text-gold-600 dark:text-gold-400 shrink-0" />;
    case "info":
    default:
      return <Info className="w-5 h-5 text-forest-700 dark:text-sand-300 shrink-0" />;
  }
}

function ToastCard({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const borderAndBgStyles = {
    success:
      "border-forest-200 dark:border-forest-800 bg-white/95 dark:bg-forest-900/95 text-forest-950 dark:text-sand-50",
    error:
      "border-red-200 dark:border-red-900/80 bg-white/95 dark:bg-[#1a0f0f]/95 text-red-950 dark:text-red-100",
    warning:
      "border-gold-300 dark:border-gold-800 bg-white/95 dark:bg-[#1c180e]/95 text-amber-950 dark:text-amber-100",
    info:
      "border-sand-200 dark:border-forest-800 bg-white/95 dark:bg-forest-900/95 text-forest-950 dark:text-sand-50",
  }[toast.type];

  return (
    <div
      role="status"
      aria-live="polite"
      className={`pointer-events-auto flex items-start gap-3 p-3.5 sm:p-4 rounded-xl shadow-elevated border backdrop-blur-md transition-all duration-200 animate-in fade-in slide-in-from-bottom-3 ${borderAndBgStyles}`}
    >
      <ToastIcon type={toast.type} />
      <div className="flex-1 text-xs sm:text-sm font-medium leading-snug pt-0.5">
        {toast.message}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 p-1 -mr-1 -mt-1 rounded-lg text-sand-500 hover:text-forest-950 dark:text-sand-400 dark:hover:text-sand-100 hover:bg-sand-100 dark:hover:bg-forest-800 transition min-w-[32px] min-h-[32px] flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-500"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const { toasts, removeToast } = useApp();

  if (!toasts || toasts.length === 0) {
    return null;
  }

  return (
    <aside
      aria-label="Notifications"
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full px-4 sm:px-0 pointer-events-none"
    >
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onDismiss={removeToast} />
      ))}
    </aside>
  );
}
