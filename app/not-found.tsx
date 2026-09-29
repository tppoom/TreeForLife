import React from "react";
import Link from "next/link";
import {
  Compass,
  Search,
  Home,
  BookOpen,
  Sprout,
  MessageCircle,
  ExternalLink,
  ArrowRight,
} from "lucide-react";
import { getLineAddFriendUrl } from "@/lib/line/formatters";

export default function NotFound() {
  const lineAddFriendUrl = getLineAddFriendUrl();

  const quickLinks = [
    {
      href: "/",
      label: "กลับสู่หน้าแรก",
      description: "เริ่มต้นที่หน้าหลักและสำรวจพันธุ์ไม้ยอดนิยม",
      icon: Home,
      external: false,
    },
    {
      href: "/plants",
      label: "คลังพันธุ์ไม้",
      description: "เลือกชมและค้นหาพันธุ์ไม้ตามหมวดหมู่",
      icon: BookOpen,
      external: false,
    },
    {
      href: "/garden",
      label: "สวนของฉัน",
      description: "ดูแลและติดตามรอบรดน้ำต้นไม้ของคุณ",
      icon: Sprout,
      external: false,
    },
    {
      href: lineAddFriendUrl,
      label: "ติดต่อผ่าน LINE OA",
      description: "พูดคุยกับผู้เชี่ยวชาญเพื่อขอความช่วยเหลือ",
      icon: MessageCircle,
      external: true,
      highlight: true,
    },
  ];

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-sand-50/60 dark:bg-forest-950/70">
      {/* Decorative ambient botanical glows */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-forest-200/40 dark:bg-emerald-900/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-sand-200/50 dark:bg-forest-800/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-2xl w-full relative z-10 text-center space-y-8 bg-white/80 dark:bg-forest-900/70 backdrop-blur-md p-6 sm:p-10 rounded-3xl border border-sand-200/80 dark:border-forest-800 shadow-card">
        {/* Botanical compass badge */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-forest-100 dark:bg-forest-800/80 text-forest-700 dark:text-emerald-300 shadow-soft ring-8 ring-forest-50 dark:ring-forest-900/60 transition-transform hover:scale-105">
          <Compass className="w-10 h-10 stroke-[1.75]" />
        </div>

        {/* Heading & Subtitle */}
        <div className="space-y-3">
          <h1 className="font-serif font-bold text-2xl sm:text-3xl lg:text-4xl text-forest-950 dark:text-sand-50 tracking-tight">
            404 — ไม่พบหน้าที่คุณต้องการ
          </h1>
          <p className="text-sm sm:text-base text-forest-800/80 dark:text-sand-300 max-w-lg mx-auto leading-relaxed">
            หน้าที่คุณกำลังค้นหาอาจถูกย้าย หรือที่อยู่เว็บไซต์อาจไม่ถูกต้อง
          </p>
        </div>

        {/* Quick Search Bar */}
        <div className="max-w-md mx-auto">
          <form action="/search" method="GET" className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-forest-600/70 dark:text-sand-400 group-focus-within:text-forest-800 dark:group-focus-within:text-emerald-400 transition" />
            <input
              type="text"
              name="q"
              placeholder="ค้นหาชื่อพันธุ์ไม้ เช่น มอนสเตอร่า, ไทรใบสัก..."
              aria-label="ค้นหาพันธุ์ไม้"
              className="w-full pl-10 pr-24 py-3 text-sm rounded-xl border border-sand-300 dark:border-forest-700 bg-sand-50/80 dark:bg-forest-950/80 text-forest-950 dark:text-sand-100 placeholder:text-forest-600/50 dark:placeholder:text-sand-500 focus:outline-none focus:ring-2 focus:ring-forest-500/50 dark:focus:ring-emerald-500/50 focus:border-forest-500 transition shadow-inner"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-1.5 text-xs font-semibold rounded-lg bg-forest-700 hover:bg-forest-800 dark:bg-forest-600 dark:hover:bg-forest-500 text-sand-50 shadow-sm transition active:scale-[0.98]"
            >
              ค้นหา
            </button>
          </form>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 text-xs text-forest-600/60 dark:text-sand-400">
          <div className="flex-1 h-px bg-sand-200 dark:bg-forest-800" />
          <span>หรือเลือกไปยังเมนูหลัก</span>
          <div className="flex-1 h-px bg-sand-200 dark:bg-forest-800" />
        </div>

        {/* Quick Links Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
          {quickLinks.map((item) => {
            const Icon = item.icon;
            const content = (
              <div
                className={`group flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                  item.highlight
                    ? "bg-[#06C755]/10 hover:bg-[#06C755]/15 border-[#06C755]/30 dark:border-[#06C755]/40"
                    : "bg-sand-50/60 dark:bg-forest-950/50 hover:bg-sand-100/70 dark:hover:bg-forest-800/60 border-sand-200 dark:border-forest-800"
                } hover:shadow-soft active:scale-[0.99]`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      item.highlight
                        ? "bg-[#06C755] text-white"
                        : "bg-forest-100 dark:bg-forest-800 text-forest-700 dark:text-emerald-300 group-hover:bg-forest-700 group-hover:text-sand-50 dark:group-hover:bg-emerald-600 dark:group-hover:text-white"
                    } transition-colors`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-forest-950 dark:text-sand-50 group-hover:text-forest-800 dark:group-hover:text-sand-100 truncate">
                      {item.label}
                    </p>
                    <p className="text-xs text-forest-700/70 dark:text-sand-400 truncate">
                      {item.description}
                    </p>
                  </div>
                </div>
                {item.external ? (
                  <ExternalLink className="w-4 h-4 text-forest-500/70 dark:text-sand-400 shrink-0 ml-2" />
                ) : (
                  <ArrowRight className="w-4 h-4 text-forest-500/70 dark:text-sand-400 group-hover:translate-x-0.5 transition-transform shrink-0 ml-2" />
                )}
              </div>
            );

            return item.external ? (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#06C755] rounded-2xl"
              >
                {content}
              </a>
            ) : (
              <Link
                key={item.label}
                href={item.href}
                className="focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 rounded-2xl"
              >
                {content}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
