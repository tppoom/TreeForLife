"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/lib/context/AppContext";
import {
  User,
  Bell,
  Smartphone,
  MessageCircle,
  Clock,
  Send,
  LogOut,
  Shield,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

interface UserProfile {
  id: string;
  displayName: string;
  email?: string | null;
  avatarUrl?: string | null;
  role: string;
  notifyWebPush: boolean;
  notifyLine: boolean;
  notifyHour: number;
  lineFriend?: boolean | null;
  createdAt: string;
}

export function AccountClient() {
  const { t, locale, addToast } = useApp();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [testSending, setTestSending] = useState(false);
  const [webPushSupported, setWebPushSupported] = useState(false);
  const [pushSubscribed, setPushSubscribed] = useState(false);

  const isEn = locale === "en";

  useEffect(() => {
    // Check if web push is supported in browser
    if (typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window) {
      setWebPushSupported(true);
      navigator.serviceWorker.ready.then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          setPushSubscribed(!!sub);
        });
      });
    }

    // Fetch user profile from /api/auth/me
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          setProfile(data.user);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleToggleWebPush = async () => {
    if (!profile) return;
    const nextVal = !profile.notifyWebPush;

    if (nextVal && webPushSupported) {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          addToast(
            isEn
              ? "Please allow browser notifications to enable this feature."
              : "กรุณาอนุญาตการแจ้งเตือนในเบราว์เซอร์เพื่อเปิดใช้งาน",
            "warning"
          );
          return;
        }

        // Register push subscription
        const reg = await navigator.serviceWorker.ready;
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (vapidPublicKey) {
          const sub = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: vapidPublicKey,
          });

          await fetch("/api/notify/subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(sub.toJSON()),
          });
          setPushSubscribed(true);
        }
      } catch (err) {
        console.error("Push registration failed:", err);
      }
    }

    setUpdating(true);
    try {
      const res = await fetch("/api/account/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notifyWebPush: nextVal }),
      });
      if (res.ok) {
        setProfile({ ...profile, notifyWebPush: nextVal });
        addToast(t("toasts.task_done"), "success");
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleLine = async () => {
    if (!profile) return;
    const nextVal = !profile.notifyLine;

    setUpdating(true);
    try {
      const res = await fetch("/api/account/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notifyLine: nextVal }),
      });
      if (res.ok) {
        setProfile({ ...profile, notifyLine: nextVal });
        addToast(t("toasts.task_done"), "success");
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleChangeHour = async (hour: number) => {
    if (!profile) return;
    setUpdating(true);
    try {
      const res = await fetch("/api/account/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notifyHour: hour }),
      });
      if (res.ok) {
        setProfile({ ...profile, notifyHour: hour });
        addToast(t("toasts.task_done"), "success");
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleSendTest = async () => {
    setTestSending(true);
    try {
      const res = await fetch("/api/notify/test", { method: "POST" });
      if (res.ok) {
        addToast(t("auth.test_sent_success"), "success");
      } else {
        addToast(isEn ? "Unable to send test notification." : "ไม่สามารถส่งการทดสอบได้", "error");
      }
    } catch {
      addToast(isEn ? "Error sending notification." : "เกิดข้อผิดพลาดในการส่งข้อความ", "error");
    } finally {
      setTestSending(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/today";
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-forest-600 border-t-transparent" />
        <p className="mt-3 text-sm text-sand-600 dark:text-sand-400">
          {isEn ? "Loading account profile..." : "กำลังโหลดข้อมูลบัญชี..."}
        </p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-forest-100 dark:bg-forest-900/60 flex items-center justify-center text-forest-700 dark:text-sand-200">
          <User className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold font-serif text-forest-950 dark:text-sand-50 mb-2">
          {t("auth.account")}
        </h1>
        <p className="text-sm text-sand-600 dark:text-sand-400 mb-6">
          {t("auth.login_prompt_garden")}
        </p>
        <a
          href="/api/auth/line/login?next=/account"
          className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-[#06C755] text-white font-semibold text-sm shadow hover:bg-[#05b34c] transition min-h-[48px]"
        >
          <MessageCircle className="w-5 h-5" />
          <span>{t("auth.login_with_line")}</span>
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Header Profile Card */}
      <div className="p-6 rounded-2xl border border-sand-200 dark:border-forest-800 bg-white/80 dark:bg-forest-900/60 shadow-sm backdrop-blur">
        <div className="flex items-center gap-4">
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={profile.displayName}
              className="w-16 h-16 rounded-full object-cover border-2 border-forest-600"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-forest-100 dark:bg-forest-800 flex items-center justify-center text-forest-700 dark:text-sand-200 font-bold text-xl">
              {profile.displayName.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-forest-950 dark:text-sand-50 truncate">
              {profile.displayName}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-forest-100 dark:bg-forest-800 text-forest-800 dark:text-forest-200 capitalize">
                {profile.role}
              </span>
              {profile.lineFriend && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {isEn ? "LINE OA Friend" : "เพื่อน LINE OA"}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="p-6 rounded-2xl border border-sand-200 dark:border-forest-800 bg-white/80 dark:bg-forest-900/60 shadow-sm backdrop-blur space-y-6">
        <div className="flex items-center gap-3 pb-3 border-b border-sand-200 dark:border-forest-800">
          <Bell className="w-5 h-5 text-forest-600 dark:text-forest-400" />
          <h2 className="text-base font-bold text-forest-950 dark:text-sand-50">
            {t("auth.notification_settings")}
          </h2>
        </div>

        {/* Web Push Setting */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Smartphone className="w-5 h-5 text-sand-500 mt-0.5" />
            <div>
              <div className="text-sm font-semibold text-forest-900 dark:text-sand-100">
                {t("auth.web_push_label")}
              </div>
              <div className="text-xs text-sand-600 dark:text-sand-400">
                {isEn
                  ? "Receive reminders on mobile & desktop when care tasks are due."
                  : "แจ้งเตือนบนหน้าจอมือถือและเบราว์เซอร์เมื่อถึงรอบรดน้ำ"}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleToggleWebPush}
            disabled={updating}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition duration-200 ${
              profile.notifyWebPush ? "bg-forest-600 justify-end" : "bg-sand-300 dark:bg-forest-700 justify-start"
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-md transform" />
          </button>
        </div>

        {/* LINE Push Setting */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <MessageCircle className="w-5 h-5 text-[#06C755] mt-0.5" />
            <div>
              <div className="text-sm font-semibold text-forest-900 dark:text-sand-100">
                {t("auth.line_push_label")}
              </div>
              <div className="text-xs text-sand-600 dark:text-sand-400">
                {isEn
                  ? "Daily care digest with one-tap water logging directly in LINE chat."
                  : "ส่งสรุปงานดูแลประจำวันพร้อมปุ่มกดบันทึกรดน้ำในแชท LINE"}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleToggleLine}
            disabled={updating}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition duration-200 ${
              profile.notifyLine ? "bg-[#06C755] justify-end" : "bg-sand-300 dark:bg-forest-700 justify-start"
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-md transform" />
          </button>
        </div>

        {/* Reminder Time Setting */}
        <div className="flex items-center justify-between gap-4 pt-2 border-t border-sand-100 dark:border-forest-800/60">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-sand-500" />
            <div className="text-sm font-semibold text-forest-900 dark:text-sand-100">
              {t("auth.reminder_time_label")}
            </div>
          </div>
          <select
            value={profile.notifyHour}
            onChange={(e) => handleChangeHour(Number(e.target.value))}
            disabled={updating}
            aria-label={t("auth.reminder_time_label")}
            className="px-3 py-1.5 rounded-lg border border-sand-300 dark:border-forest-700 bg-sand-50 dark:bg-forest-950 text-sm font-medium text-forest-900 dark:text-sand-100 min-h-[44px]"
          >
            {[6, 7, 8, 9, 10, 12, 17, 18, 19, 20].map((h) => (
              <option key={h} value={h}>
                {isEn ? `${String(h).padStart(2, "0")}:00` : `${String(h).padStart(2, "0")}:00 น.`}
              </option>
            ))}
          </select>
        </div>

        {/* Test Notification Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleSendTest}
            disabled={testSending}
            className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl border border-forest-600 dark:border-forest-500 text-forest-700 dark:text-sand-100 text-xs font-semibold hover:bg-forest-50 dark:hover:bg-forest-900/50 transition min-h-[44px]"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{testSending ? (isEn ? "Sending..." : "กำลังส่ง...") : t("auth.send_test_notification")}</span>
          </button>
        </div>
      </div>

      {/* Account Actions & Privacy */}
      <div className="p-6 rounded-2xl border border-sand-200 dark:border-forest-800 bg-white/80 dark:bg-forest-900/60 shadow-sm backdrop-blur space-y-4">
        <h3 className="text-sm font-semibold text-sand-600 dark:text-sand-400 uppercase tracking-wider">
          {isEn ? "Account & Privacy Management" : "การจัดการบัญชีและความเป็นส่วนตัว"}
        </h3>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={handleLogout}
            className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-sand-300 dark:border-forest-700 text-forest-800 dark:text-sand-200 text-sm font-medium hover:bg-sand-100 dark:hover:bg-forest-800 transition min-h-[44px]"
          >
            <LogOut className="w-4 h-4" />
            <span>{t("auth.logout")}</span>
          </button>

          <Link
            href="/privacy"
            className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-sand-300 dark:border-forest-700 text-forest-800 dark:text-sand-200 text-sm font-medium hover:bg-sand-100 dark:hover:bg-forest-800 transition min-h-[44px]"
          >
            <Shield className="w-4 h-4 text-forest-600" />
            <span>{isEn ? "Privacy Policy" : "นโยบายความเป็นส่วนตัว"}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
