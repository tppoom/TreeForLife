"use client";

import React, { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useApp, type UserRole } from "@/lib/context/AppContext";
import {
  ShieldAlert,
  ShieldCheck,
  Package,
  MessageSquare,
  TrendingUp,
  Search,
  Check,
  Copy,
  ExternalLink,
  Sprout,
  Clock,
  Flame,
  AlertTriangle,
  Info,
  Inbox,
  UserCheck,
} from "lucide-react";
import { formatLineMessage, type InquiryIntent } from "@/lib/line/formatters";

export interface AdminSpeciesItem {
  id: string;
  slug: string;
  nameTh: string;
  nameEn: string;
  nameSci: string;
  family?: string;
  summary?: string;
  light?: string;
  waterNeed?: string;
  difficulty?: number;
  stockStatus: string; // "in_stock" | "made_to_order" | "seasonal" | "hidden"
  primaryImage: string;
  imageAlt?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface AdminInquiryItem {
  id: string;
  refCode: string;
  intent: string; // "price" | "availability" | "care_help" | "design_quote"
  sourcePage: string;
  payload: Record<string, unknown>;
  createdAt: string | Date;
  userId?: string | null;
  guestToken?: string | null;
  speciesId?: string | null;
  speciesNameTh?: string | null;
  speciesNameEn?: string | null;
  speciesSlug?: string | null;
}

export interface AdminSearchMissItem {
  id: string;
  query: string;
  count: number;
  lastSeenAt: string | Date;
}

export interface AdminStats {
  species: {
    total: number;
    inStock: number;
    madeToOrder: number;
    seasonal: number;
  };
  inquiriesCount: number;
  searchMissesCount: number;
  totalUserPlants: number;
}

export interface AdminDashboardClientProps {
  initialSpecies?: AdminSpeciesItem[];
  initialInquiries?: AdminInquiryItem[];
  initialSearchMisses?: AdminSearchMissItem[];
  initialStats?: AdminStats;
}

type TabKey = "inventory" | "inquiries" | "search_misses";

function formatDateTime(dateVal: string | Date | undefined, locale: "th" | "en"): string {
  if (!dateVal) return "-";
  try {
    const d = typeof dateVal === "string" ? new Date(dateVal) : dateVal;
    if (isNaN(d.getTime())) return String(dateVal);
    return d.toLocaleString(locale === "th" ? "th-TH" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return String(dateVal);
  }
}

export function AdminDashboardClient({
  initialSpecies = [],
  initialInquiries = [],
  initialSearchMisses = [],
  initialStats,
}: AdminDashboardClientProps) {
  const { role, setRole, user, t, locale, addToast } = useApp();

  // Active tab
  const [activeTab, setActiveTab] = useState<TabKey>("inventory");

  // Inventory state
  const [speciesList, setSpeciesList] = useState<AdminSpeciesItem[]>(initialSpecies);
  const [speciesSearch, setSpeciesSearch] = useState("");
  const [stockFilter, setStockFilter] = useState<string>("all");
  const [updatingSpeciesId, setUpdatingSpeciesId] = useState<string | null>(null);

  // Inquiries state
  const [inquiriesList, setInquiriesList] = useState<AdminInquiryItem[]>(initialInquiries);
  const [inquirySearch, setInquirySearch] = useState("");
  const [inquiryIntentFilter, setInquiryIntentFilter] = useState<string>("all");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Search misses state
  const [missesList, setMissesList] = useState<AdminSearchMissItem[]>(initialSearchMisses);
  const [missesSearch, setMissesSearch] = useState("");

  // Role Protection Gate
  const isAuthorized = role === "staff" || role === "admin";

  // Calculate live stats
  const computedStats = useMemo(() => {
    const total = speciesList.length;
    const inStock = speciesList.filter((s) => s.stockStatus === "in_stock").length;
    const madeToOrder = speciesList.filter((s) => s.stockStatus === "made_to_order").length;
    const seasonal = speciesList.filter((s) => s.stockStatus === "seasonal").length;
    return {
      species: {
        total: initialStats?.species?.total || total,
        inStock,
        madeToOrder,
        seasonal,
      },
      inquiriesCount: initialStats?.inquiriesCount || inquiriesList.length,
      searchMissesCount: initialStats?.searchMissesCount || missesList.length,
      totalUserPlants: initialStats?.totalUserPlants || 0,
    };
  }, [speciesList, inquiriesList, missesList, initialStats]);

  // Handle stock update
  const handleStockUpdate = useCallback(
    async (speciesId: string, newStatus: "in_stock" | "made_to_order" | "seasonal") => {
      const currentItem = speciesList.find((s) => s.id === speciesId);
      if (!currentItem || currentItem.stockStatus === newStatus) return;

      const previousStatus = currentItem.stockStatus;
      const now = new Date();

      // Optimistic update
      setSpeciesList((prev) =>
        prev.map((s) =>
          s.id === speciesId
            ? { ...s, stockStatus: newStatus, updatedAt: now.toISOString() }
            : s
        )
      );
      setUpdatingSpeciesId(speciesId);

      try {
        const res = await fetch("/api/admin/species/stock", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ speciesId, status: newStatus }),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to update stock");
        }

        addToast(t("admin.action_update_success"), "success");
      } catch (err: unknown) {
        console.error("Stock update failed:", err);
        // Rollback
        setSpeciesList((prev) =>
          prev.map((s) => (s.id === speciesId ? { ...s, stockStatus: previousStatus } : s))
        );
        addToast(t("admin.action_update_error"), "error");
      } finally {
        setUpdatingSpeciesId(null);
      }
    },
    [speciesList, addToast, t]
  );

  // Copy ref code helper
  const handleCopyRefCode = useCallback(
    (code: string) => {
      navigator.clipboard?.writeText(code);
      setCopiedCode(code);
      addToast(
        locale === "th" ? `คัดลอกรหัส ${code} แล้ว` : `Copied ref code ${code}`,
        "info"
      );
      setTimeout(() => setCopiedCode(null), 2500);
    },
    [locale, addToast]
  );

  // Copy LINE text helper
  const handleCopyLineText = useCallback(
    (inquiry: AdminInquiryItem) => {
      const plantName = inquiry.speciesNameTh || inquiry.speciesNameEn || "ต้นไม้";
      const customNote = (inquiry.payload as Record<string, unknown>)?.customNote as string | undefined;
      const text = formatLineMessage(
        inquiry.intent as InquiryIntent,
        plantName,
        inquiry.refCode,
        customNote
      );
      navigator.clipboard?.writeText(text);
      addToast(
        locale === "th"
          ? `คัดลอกข้อความสำหรับแชท LINE (${inquiry.refCode}) แล้ว`
          : `Copied LINE chat template for ${inquiry.refCode}`,
        "success"
      );
    },
    [locale, addToast]
  );

  // Filtered Species
  const filteredSpecies = useMemo(() => {
    return speciesList.filter((s) => {
      if (stockFilter !== "all" && s.stockStatus !== stockFilter) {
        return false;
      }
      if (speciesSearch.trim()) {
        const q = speciesSearch.toLowerCase();
        const matchTh = s.nameTh.toLowerCase().includes(q);
        const matchEn = s.nameEn.toLowerCase().includes(q);
        const matchSci = s.nameSci.toLowerCase().includes(q);
        if (!matchTh && !matchEn && !matchSci) return false;
      }
      return true;
    });
  }, [speciesList, stockFilter, speciesSearch]);

  // Filtered Inquiries
  const filteredInquiries = useMemo(() => {
    return inquiriesList.filter((inq) => {
      if (inquiryIntentFilter !== "all" && inq.intent !== inquiryIntentFilter) {
        return false;
      }
      if (inquirySearch.trim()) {
        const q = inquirySearch.toLowerCase();
        const matchCode = inq.refCode.toLowerCase().includes(q);
        const matchTh = (inq.speciesNameTh || "").toLowerCase().includes(q);
        const matchEn = (inq.speciesNameEn || "").toLowerCase().includes(q);
        const matchPage = inq.sourcePage.toLowerCase().includes(q);
        const customNote = (
          (inq.payload as Record<string, unknown>)?.customNote as string || ""
        ).toLowerCase();
        const matchNote = customNote.includes(q);
        if (!matchCode && !matchTh && !matchEn && !matchPage && !matchNote) return false;
      }
      return true;
    });
  }, [inquiriesList, inquiryIntentFilter, inquirySearch]);

  // Filtered & Ranked Search Misses (Count desc, then LastSeen desc)
  const filteredMisses = useMemo(() => {
    const list = missesList.slice().sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      const dateA = new Date(a.lastSeenAt).getTime();
      const dateB = new Date(b.lastSeenAt).getTime();
      return dateB - dateA;
    });

    if (!missesSearch.trim()) return list;

    const q = missesSearch.toLowerCase();
    return list.filter((item) => item.query.toLowerCase().includes(q));
  }, [missesList, missesSearch]);

  // Intent badge helper
  const getIntentBadge = (intent: string) => {
    switch (intent) {
      case "price":
        return {
          label: locale === "th" ? "สอบถามราคา/ขนาด" : "Price & Sizes",
          className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
        };
      case "availability":
        return {
          label: locale === "th" ? "เช็คสินค้าพร้อมส่ง" : "Availability",
          className: "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border-sky-200 dark:border-sky-800",
        };
      case "care_help":
        return {
          label: locale === "th" ? "ปรึกษาอาการ/ดูแล" : "Care Help",
          className: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800",
        };
      case "design_quote":
        return {
          label: locale === "th" ? "ขอใบเสนอราคาจัดมุม" : "Design Quote",
          className: "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200 dark:border-purple-800",
        };
      default:
        return {
          label: intent,
          className: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700",
        };
    }
  };

  // Stock badge helper
  const getStockBadge = (status: string) => {
    switch (status) {
      case "in_stock":
        return {
          label: t("admin.stock_in_stock"),
          className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
        };
      case "made_to_order":
        return {
          label: t("admin.stock_made_to_order"),
          className: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800",
        };
      case "seasonal":
        return {
          label: t("admin.stock_seasonal"),
          className: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800",
        };
      case "hidden":
        return {
          label: t("admin.stock_hidden"),
          className: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700",
        };
      default:
        return {
          label: status,
          className: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700",
        };
    }
  };

  // 1. Role Protection Gate: Guest / Customer upgrade notice
  if (!isAuthorized) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div
          role="alert"
          aria-live="polite"
          className="max-w-xl w-full bg-white dark:bg-zinc-900 border border-amber-200 dark:border-amber-800/80 rounded-2xl p-6 sm:p-8 shadow-xl text-center space-y-6"
        >
          <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-inner">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              <AlertTriangle className="w-3.5 h-3.5" />
              {t("admin.role_current")}: {t(`roles.${role}`)}
            </span>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              {t("admin.unauthorized")}
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {t("admin.role_upgrade_desc")}
            </p>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-800/60 p-4 rounded-xl text-left border border-zinc-200 dark:border-zinc-700/60 space-y-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300">
            <p className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              {locale === "th" ? "วิธีเข้าถึงหน้าจัดการร้าน:" : "How to access the Admin Portal:"}
            </p>
            <p>
              {locale === "th"
                ? "ใช้เมนูสลับบทบาทเดโม (Demo Role Switcher) ที่แถบเมนูด้านบน หรือคลิกปุ่มลัดด้านล่างนี้ได้ทันทีเพื่อทดสอบระบบ"
                : "Switch roles using the Demo Role Switcher in the top navigation bar, or click one of the quick switch buttons below to test."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              onClick={() => setRole("staff")}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-medium text-sm transition shadow-sm active:scale-95"
            >
              <UserCheck className="w-4 h-4" />
              {t("admin.switch_to_staff")}
            </button>
            <button
              onClick={() => setRole("admin")}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition shadow-sm active:scale-95"
            >
              <ShieldCheck className="w-4 h-4" />
              {t("admin.switch_to_admin_btn")}
            </button>
          </div>

          <div className="pt-2">
            <Link
              href="/"
              className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 inline-flex items-center gap-1"
            >
              {locale === "th" ? "← กลับหน้าหลักร้าน" : "← Back to Home"}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. Authorized Admin Dashboard View
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              {t("admin.portal_title")}
            </h1>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                role === "admin"
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                  : "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-sky-300 dark:border-sky-800"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              {role.toUpperCase()}
            </span>
          </div>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {locale === "th"
              ? `ผู้ใช้งานปัจจุบัน: ${user.displayName} | จัดการสต็อกพันธุ์ไม้ ติดตามคำถามลูกค้า และวิเคราะห์ความต้องการ`
              : `Logged in as: ${user.displayName} | Real-time stock toggles, customer inquiry verification, and search demand analytics`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/search"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition"
          >
            <ExternalLink className="w-4 h-4" />
            {locale === "th" ? "ดูหน้าร้านจริง" : "View Live Shop"}
          </Link>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Species & Stock */}
        <div className="bg-white dark:bg-zinc-900 p-4 sm:p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {t("admin.species_mgmt")}
            </span>
            <Package className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-50">
              {computedStats.species.total}
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {locale === "th" ? "ชนิด" : "species"}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {t("admin.stats_in_stock")}: {computedStats.species.inStock}
            </span>
            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              {t("admin.stats_made_to_order")}: {computedStats.species.madeToOrder}
            </span>
            <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              {t("admin.stats_seasonal")}: {computedStats.species.seasonal}
            </span>
          </div>
        </div>

        {/* Card 2: Inquiries Log */}
        <div className="bg-white dark:bg-zinc-900 p-4 sm:p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {t("admin.inquiries")}
            </span>
            <MessageSquare className="w-5 h-5 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-50">
              {computedStats.inquiriesCount}
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {locale === "th" ? "รายการ" : "leads"}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400">
            {locale === "th"
              ? "พร้อมรหัสอ้างอิงตรงกับแชท LINE"
              : "Paired with ref codes for LINE OA verification"}
          </div>
        </div>

        {/* Card 3: Search Misses Demand */}
        <div className="bg-white dark:bg-zinc-900 p-4 sm:p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {t("admin.search_misses")}
            </span>
            <TrendingUp className="w-5 h-5 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-50">
              {computedStats.searchMissesCount}
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {locale === "th" ? "คำค้นหา" : "terms"}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400">
            {locale === "th"
              ? "ความต้องการสินค้าที่ค้นหาไม่พบ"
              : "Unmet customer demand insights"}
          </div>
        </div>

        {/* Card 4: Customer Garden Plants */}
        <div className="bg-white dark:bg-zinc-900 p-4 sm:p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {locale === "th" ? "ต้นไม้ในสวนลูกค้า" : "Customer Plants"}
            </span>
            <Sprout className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-50">
              {computedStats.totalUserPlants}
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {locale === "th" ? "ต้นในระบบ" : "active plants"}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400">
            {locale === "th"
              ? "ระบบดูแลและตารางรดน้ำอัตโนมัติ"
              : "Automated 3-season scheduled care"}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-zinc-200 dark:border-zinc-800">
        <nav
          className="flex space-x-2 sm:space-x-4 overflow-x-auto pb-1"
          role="tablist"
          aria-label="Admin Sections"
        >
          <button
            role="tab"
            aria-selected={activeTab === "inventory"}
            onClick={() => setActiveTab("inventory")}
            className={`flex items-center gap-2 py-3 px-4 rounded-xl text-sm font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === "inventory"
                ? "border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-emerald-50/60 dark:bg-emerald-950/30"
                : "border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
            }`}
          >
            <Package className="w-4 h-4" />
            <span>{t("admin.tab_inventory")}</span>
            <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
              {speciesList.length}
            </span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === "inquiries"}
            onClick={() => setActiveTab("inquiries")}
            className={`flex items-center gap-2 py-3 px-4 rounded-xl text-sm font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === "inquiries"
                ? "border-sky-600 text-sky-700 dark:text-sky-400 bg-sky-50/60 dark:bg-sky-950/30"
                : "border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>{t("admin.tab_inquiries")}</span>
            <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
              {inquiriesList.length}
            </span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === "search_misses"}
            onClick={() => setActiveTab("search_misses")}
            className={`flex items-center gap-2 py-3 px-4 rounded-xl text-sm font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === "search_misses"
                ? "border-rose-600 text-rose-700 dark:text-rose-400 bg-rose-50/60 dark:bg-rose-950/30"
                : "border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>{t("admin.tab_search_misses")}</span>
            <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
              {missesList.length}
            </span>
          </button>
        </nav>
      </div>

      {/* Tab 1: Inventory Management */}
      {activeTab === "inventory" && (
        <section className="space-y-4" aria-labelledby="inventory-heading">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={speciesSearch}
                onChange={(e) => setSpeciesSearch(e.target.value)}
                placeholder={t("admin.search_placeholder")}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {speciesSearch && (
                <button
                  onClick={() => setSpeciesSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2 overflow-x-auto">
              {[
                { id: "all", label: t("admin.filter_stock_all") },
                { id: "in_stock", label: t("admin.stock_in_stock") },
                { id: "made_to_order", label: t("admin.stock_made_to_order") },
                { id: "seasonal", label: t("admin.stock_seasonal") },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setStockFilter(filter.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition ${
                    stockFilter === filter.id
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            {locale === "th"
              ? `แสดง ${filteredSpecies.length} จากทั้งหมด ${speciesList.length} รายการ (คลิกเปลี่ยนสถานะสต็อกได้ทันที)`
              : `Showing ${filteredSpecies.length} of ${speciesList.length} species (Instant inline stock toggle enabled)`}
          </div>

          {/* Species Table */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-800/50 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    <th scope="col" className="py-3.5 px-4 sm:px-6">
                      {locale === "th" ? "พันธุ์ไม้" : "Species"}
                    </th>
                    <th scope="col" className="py-3.5 px-4 hidden md:table-cell">
                      {locale === "th" ? "วงศ์ / สภาพแสง" : "Family / Light"}
                    </th>
                    <th scope="col" className="py-3.5 px-4">
                      {t("admin.stock_status")}
                    </th>
                    <th scope="col" className="py-3.5 px-4">
                      {locale === "th" ? "ปรับสถานะสต็อกแบบคลิกเดียว" : "Instant Stock Toggle"}
                    </th>
                    <th scope="col" className="py-3.5 px-4 text-right">
                      {t("admin.last_updated")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-sm">
                  {filteredSpecies.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-zinc-500 dark:text-zinc-400">
                        <Package className="w-8 h-8 mx-auto mb-2 text-zinc-400" />
                        <p>{t("admin.empty_inventory")}</p>
                      </td>
                    </tr>
                  ) : (
                    filteredSpecies.map((plant) => {
                      const badge = getStockBadge(plant.stockStatus);
                      const isUpdating = updatingSpeciesId === plant.id;

                      return (
                        <tr
                          key={plant.id}
                          className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition group"
                        >
                          {/* 1. Thumbnail & Name */}
                          <td className="py-3.5 px-4 sm:px-6">
                            <div className="flex items-center gap-3">
                              <img
                                src={plant.primaryImage}
                                alt={plant.imageAlt || plant.nameTh}
                                className="w-12 h-12 rounded-xl object-cover bg-zinc-100 dark:bg-zinc-800 flex-shrink-0 border border-zinc-200 dark:border-zinc-700"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=400&q=80";
                                }}
                              />
                              <div className="min-w-0">
                                <Link
                                  href={`/plants/${plant.slug}`}
                                  className="font-medium text-zinc-900 dark:text-zinc-100 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1.5 transition"
                                  target="_blank"
                                >
                                  <span className="truncate">{plant.nameTh}</span>
                                  <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-emerald-600" />
                                </Link>
                                <div className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                                  {plant.nameEn}
                                </div>
                                <div className="text-xs italic text-zinc-400 dark:text-zinc-500 font-mono truncate">
                                  {plant.nameSci}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* 2. Family & Placement */}
                          <td className="py-3.5 px-4 hidden md:table-cell text-xs text-zinc-600 dark:text-zinc-400">
                            <div>{plant.family || "-"}</div>
                            <div className="text-zinc-400 dark:text-zinc-500 mt-0.5">
                              {plant.light ? t(`filters.light_${plant.light}`) : ""}
                            </div>
                          </td>

                          {/* 3. Current Stock Status Badge */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.className}`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  plant.stockStatus === "in_stock"
                                    ? "bg-emerald-500"
                                    : plant.stockStatus === "made_to_order"
                                    ? "bg-amber-500"
                                    : plant.stockStatus === "seasonal"
                                    ? "bg-blue-500"
                                    : "bg-zinc-400"
                                }`}
                              />
                              {badge.label}
                            </span>
                          </td>

                          {/* 4. Instant Inline Stock Toggle */}
                          <td className="py-3.5 px-4">
                            <div
                              className="inline-flex rounded-xl p-1 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/80 gap-1"
                              role="group"
                              aria-label={`Stock status controls for ${plant.nameTh}`}
                            >
                              {/* In Stock */}
                              <button
                                type="button"
                                disabled={isUpdating}
                                onClick={() => handleStockUpdate(plant.id, "in_stock")}
                                aria-label={`Set ${plant.nameTh} in stock`}
                                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                                  plant.stockStatus === "in_stock"
                                    ? "bg-emerald-600 text-white shadow-sm font-semibold"
                                    : "text-zinc-600 dark:text-zinc-400 hover:bg-white/80 dark:hover:bg-zinc-700"
                                }`}
                              >
                                {t("admin.stock_in_stock")}
                              </button>

                              {/* Made to Order */}
                              <button
                                type="button"
                                disabled={isUpdating}
                                onClick={() => handleStockUpdate(plant.id, "made_to_order")}
                                aria-label={`Set ${plant.nameTh} made to order`}
                                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                                  plant.stockStatus === "made_to_order"
                                    ? "bg-amber-500 text-white shadow-sm font-semibold"
                                    : "text-zinc-600 dark:text-zinc-400 hover:bg-white/80 dark:hover:bg-zinc-700"
                                }`}
                              >
                                {t("admin.stock_made_to_order")}
                              </button>

                              {/* Seasonal */}
                              <button
                                type="button"
                                disabled={isUpdating}
                                onClick={() => handleStockUpdate(plant.id, "seasonal")}
                                aria-label={`Set ${plant.nameTh} seasonal`}
                                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                                  plant.stockStatus === "seasonal"
                                    ? "bg-blue-600 text-white shadow-sm font-semibold"
                                    : "text-zinc-600 dark:text-zinc-400 hover:bg-white/80 dark:hover:bg-zinc-700"
                                }`}
                              >
                                {t("admin.stock_seasonal")}
                              </button>
                            </div>
                          </td>

                          {/* 5. Last Updated */}
                          <td className="py-3.5 px-4 text-right text-xs text-zinc-500 dark:text-zinc-400 font-mono whitespace-nowrap">
                            {formatDateTime(plant.updatedAt || plant.createdAt, locale)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Tab 2: Inquiries Log */}
      {activeTab === "inquiries" && (
        <section className="space-y-4" aria-labelledby="inquiries-heading">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            {/* Inquiry Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={inquirySearch}
                onChange={(e) => setInquirySearch(e.target.value)}
                placeholder={
                  locale === "th"
                    ? "ค้นหารหัสอ้างอิง (TFL-), ชื่อต้นไม้ หรือข้อความ..."
                    : "Search ref code (TFL-), plant name, or note..."
                }
                className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              {inquirySearch && (
                <button
                  onClick={() => setInquirySearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Intent Filter */}
            <div className="flex items-center gap-2 overflow-x-auto">
              {[
                { id: "all", label: locale === "th" ? "ทุกความต้องการ" : "All Intents" },
                { id: "price", label: locale === "th" ? "ถามราคา" : "Price" },
                { id: "availability", label: locale === "th" ? "เช็คของ" : "Availability" },
                { id: "care_help", label: locale === "th" ? "ปรึกษาดูแล" : "Care Help" },
                { id: "design_quote", label: locale === "th" ? "ใบเสนอราคา" : "Design Quote" },
              ].map((intent) => (
                <button
                  key={intent.id}
                  onClick={() => setInquiryIntentFilter(intent.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition ${
                    inquiryIntentFilter === intent.id
                      ? "bg-sky-600 text-white shadow-sm"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  }`}
                >
                  {intent.label}
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
            <span>
              {locale === "th"
                ? `แสดง ${filteredInquiries.length} จากทั้งหมด ${inquiriesList.length} รายการ`
                : `Showing ${filteredInquiries.length} of ${inquiriesList.length} customer inquiries`}
            </span>
            <span className="text-zinc-400">
              {locale === "th"
                ? "ใช้รหัสอ้างอิงเพื่อจับคู่กับแชท LINE OA"
                : "Use ref codes to cross-reference with incoming LINE OA chats"}
            </span>
          </div>

          {/* Inquiries List Cards */}
          <div className="space-y-3">
            {filteredInquiries.length === 0 ? (
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-12 text-center text-zinc-500 dark:text-zinc-400">
                <Inbox className="w-10 h-10 mx-auto mb-2 text-zinc-400" />
                <p>{t("admin.empty_inquiries")}</p>
              </div>
            ) : (
              filteredInquiries.map((inq) => {
                const intentBadge = getIntentBadge(inq.intent);
                const customNote = (inq.payload as Record<string, unknown>)?.customNote as string | undefined;

                return (
                  <div
                    key={inq.id}
                    className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3 hover:border-zinc-300 dark:hover:border-zinc-700 transition"
                  >
                    {/* Top row: Ref Code & Intent & Timestamp */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-50 px-2.5 py-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 tracking-wider">
                          {inq.refCode}
                        </span>
                        <button
                          onClick={() => handleCopyRefCode(inq.refCode)}
                          title="Copy Ref Code"
                          className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                        >
                          {copiedCode === inq.refCode ? (
                            <Check className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${intentBadge.className}`}
                        >
                          {intentBadge.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500 font-mono">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDateTime(inq.createdAt, locale)}
                      </div>
                    </div>

                    {/* Middle: Plant Information */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                        {locale === "th" ? "ต้นไม้ที่สนใจ:" : "Target Plant:"}
                      </span>
                      {inq.speciesSlug ? (
                        <Link
                          href={`/plants/${inq.speciesSlug}`}
                          target="_blank"
                          className="font-medium text-emerald-700 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 text-sm"
                        >
                          <span>{inq.speciesNameTh || inq.speciesNameEn}</span>
                          {inq.speciesNameEn && inq.speciesNameTh && (
                            <span className="text-xs text-zinc-400">({inq.speciesNameEn})</span>
                          )}
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      ) : (
                        <span className="font-medium text-zinc-700 dark:text-zinc-300 text-sm">
                          {inq.speciesNameTh || inq.speciesNameEn || (locale === "th" ? "คำถามทั่วไป" : "General Inquiry")}
                        </span>
                      )}
                    </div>

                    {/* Customer Custom Note if present */}
                    {customNote && (
                      <div className="bg-zinc-50 dark:bg-zinc-800/60 rounded-xl p-3 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 border border-zinc-100 dark:border-zinc-800">
                        <span className="font-semibold text-zinc-500 dark:text-zinc-400 mr-2">
                          {locale === "th" ? "ข้อความจากลูกค้า:" : "Customer Note:"}
                        </span>
                        <span>"{customNote}"</span>
                      </div>
                    )}

                    {/* Bottom row: Payload metadata & Action Buttons */}
                    <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                      <div className="flex items-center gap-3">
                        <span>
                          {t("admin.source_page")}:{" "}
                          <span className="font-mono text-zinc-700 dark:text-zinc-300">
                            {inq.sourcePage}
                          </span>
                        </span>
                        {inq.userId ? (
                          <span className="text-emerald-600 dark:text-emerald-400">
                            ● {locale === "th" ? "สมาชิกล็อกอิน" : "Registered User"}
                          </span>
                        ) : (
                          <span className="text-zinc-400">
                            ○ {locale === "th" ? "ผู้เยี่ยมชม (Guest)" : "Guest Token"}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopyLineText(inq)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition font-medium text-xs"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          {locale === "th" ? "คัดลอกข้อความ LINE" : "Copy LINE Message"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      )}

      {/* Tab 3: Search Misses Demand Ranking */}
      {activeTab === "search_misses" && (
        <section className="space-y-4" aria-labelledby="misses-heading">
          {/* Header Explanation */}
          <div className="bg-gradient-to-r from-rose-50 to-amber-50 dark:from-rose-950/30 dark:to-amber-950/20 border border-rose-200 dark:border-rose-900/50 rounded-2xl p-4 sm:p-5 text-sm text-zinc-700 dark:text-zinc-300 flex items-start gap-3">
            <Flame className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                {locale === "th"
                  ? "วิเคราะห์ความต้องการที่ค้นหาไม่พบ (Unmet Customer Demand Ranking)"
                  : "Unmet Customer Demand & Search Misses Analysis"}
              </p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                {locale === "th"
                  ? "ระบบจะบันทึกคำค้นหาที่มีลูกค้าพิมพ์ค้นหาแต่ไม่พบผลลัพธ์ในร้าน เรียงตามจำนวนครั้งที่ค้นหา (Hit Count) เพื่อให้เจ้าของร้านใช้เป็นข้อมูลตัดสินใจในการนำเข้าพันธุ์ไม้ใหม่ หรือเพิ่ม alias คำพ้องในระบบ"
                  : "Automatically tracks queries that yielded 0 catalog results, prioritized by hit count and recent activity. Use this business intelligence to curate new species or register missing search aliases."}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {/* Search filter for misses */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={missesSearch}
                onChange={(e) => setMissesSearch(e.target.value)}
                placeholder={
                  locale === "th" ? "ค้นหาคำที่ไม่พบ..." : "Filter missed search queries..."
                }
                className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              {missesSearch && (
                <button
                  onClick={() => setMissesSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-600"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="text-xs text-zinc-500 dark:text-zinc-400">
              {locale === "th"
                ? `พบ ${filteredMisses.length} คำค้นหาที่ไม่พบผลลัพธ์`
                : `${filteredMisses.length} unhandled search queries recorded`}
            </div>
          </div>

          {/* Search Misses Table */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-800/50 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    <th scope="col" className="py-3.5 px-4 sm:px-6 w-16 text-center">
                      #
                    </th>
                    <th scope="col" className="py-3.5 px-4">
                      {t("admin.missed_query")}
                    </th>
                    <th scope="col" className="py-3.5 px-4 text-center">
                      {t("admin.demand_count")}
                    </th>
                    <th scope="col" className="py-3.5 px-4">
                      {locale === "th" ? "ระดับความต้องการ" : "Demand Priority"}
                    </th>
                    <th scope="col" className="py-3.5 px-4 text-right">
                      {t("admin.last_seen")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-sm">
                  {filteredMisses.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-zinc-500 dark:text-zinc-400">
                        <TrendingUp className="w-8 h-8 mx-auto mb-2 text-zinc-400" />
                        <p>{t("admin.empty_search_misses")}</p>
                      </td>
                    </tr>
                  ) : (
                    filteredMisses.map((item, index) => {
                      const rank = index + 1;

                      return (
                        <tr
                          key={item.id || item.query}
                          className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition"
                        >
                          {/* Rank */}
                          <td className="py-3.5 px-4 sm:px-6 text-center">
                            {rank === 1 ? (
                              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold text-xs shadow-inner">
                                🥇
                              </span>
                            ) : rank === 2 ? (
                              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-xs">
                                🥈
                              </span>
                            ) : rank === 3 ? (
                              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 font-bold text-xs">
                                🥉
                              </span>
                            ) : (
                              <span className="text-zinc-400 font-mono text-xs font-semibold">
                                #{rank}
                              </span>
                            )}
                          </td>

                          {/* Search Query Term */}
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-zinc-900 dark:text-zinc-100 font-mono px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-sm border border-zinc-200 dark:border-zinc-700">
                              "{item.query}"
                            </span>
                          </td>

                          {/* Count */}
                          <td className="py-3.5 px-4 text-center">
                            <span className="inline-flex items-center gap-1 font-bold text-sm text-zinc-900 dark:text-zinc-100 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800">
                              {item.count}{" "}
                              <span className="text-xs font-normal text-zinc-500">
                                {locale === "th" ? "ครั้ง" : "hits"}
                              </span>
                            </span>
                          </td>

                          {/* Demand Level Badge */}
                          <td className="py-3.5 px-4">
                            {item.count >= 5 ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                                <Flame className="w-3 h-3 text-rose-500" />
                                {locale === "th" ? "ความต้องการสูง" : "High Demand"}
                              </span>
                            ) : item.count >= 2 ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                {locale === "th" ? "ความต้องการปานกลาง" : "Moderate Demand"}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                                {locale === "th" ? "เพิ่งเริ่มค้นหา" : "Emerging"}
                              </span>
                            )}
                          </td>

                          {/* Last Seen Date */}
                          <td className="py-3.5 px-4 text-right text-xs text-zinc-500 dark:text-zinc-400 font-mono whitespace-nowrap">
                            {formatDateTime(item.lastSeenAt, locale)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
