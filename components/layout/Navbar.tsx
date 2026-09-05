"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/lib/context/AppContext";
import {
  Compass,
  Sprout,
  CheckCircle,
  ShieldCheck,
  User,
  LogOut,
  ChevronDown,
  Sparkles,
  Heart,
  MessageCircle,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const { currentUser, loginAsDemoUser, logout, favorites, openInquiryModal } = useApp();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navLinks = [
    { href: "/search", label: "ค้นหาต้นไม้", icon: <Compass className="w-4 h-4" /> },
    { href: "/garden", label: "สวนของฉัน", icon: <Sprout className="w-4 h-4" /> },
    { href: "/today", label: "งานวันนี้", icon: <CheckCircle className="w-4 h-4" /> },
    { href: "/admin", label: "หลังบ้าน", icon: <ShieldCheck className="w-4 h-4" /> },
  ];

  const isActive = (href: string) => {
    if (href === "/search") return pathname === "/search" || pathname.startsWith("/plants/");
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Top Main Navbar (Desktop + Tablet) */}
      <header className="sticky top-0 z-40 bg-sand-50/90 backdrop-blur-md border-b border-sand-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-forest-900 flex items-center justify-center text-gold-400 shadow-card border border-forest-800 transition-transform group-hover:scale-105">
              <span className="font-serif text-xl font-bold tracking-tighter">T</span>
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-xl font-medium tracking-tight text-forest-950 group-hover:text-forest-800 transition-colors">
                TreeForLife
              </span>
              <span className="text-[10px] tracking-widest text-stone-500 uppercase font-sans -mt-1">
                Boutique Botanical
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1.5 bg-sand-100/70 p-1.5 rounded-2xl border border-sand-200/80">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                    active
                      ? "bg-forest-900 text-sand-50 shadow-sm"
                      : "text-stone-700 hover:text-forest-900 hover:bg-sand-200/60"
                  }`}
                >
                  <span className={active ? "text-gold-400" : "text-stone-400"}>{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons & User Switcher */}
          <div className="flex items-center gap-2.5">
            {/* Direct Line Inquiry Trigger */}
            <button
              onClick={() => openInquiryModal({ defaultIntent: "care_help" })}
              className="hidden lg:flex items-center gap-2 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-medium transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>ปรึกษาร้าน</span>
            </button>

            {/* Favorites Counter */}
            {favorites.length > 0 && (
              <Link
                href="/search?fav=true"
                className="relative p-2 text-stone-600 hover:text-rose-600 transition-colors rounded-xl hover:bg-sand-100"
                title="รายการที่บันทึกไว้"
              >
                <Heart className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {favorites.length}
                </span>
              </Link>
            )}

            {/* User Dropdown */}
            <div className="relative">
              {currentUser ? (
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-sand-300 bg-white hover:bg-sand-50 text-xs font-medium text-stone-800 transition-all shadow-sm"
                >
                  <div className="w-6 h-6 rounded-full bg-forest-800 text-sand-50 flex items-center justify-center text-[11px] font-bold">
                    {currentUser.displayName.charAt(0)}
                  </div>
                  <span className="hidden sm:inline max-w-[110px] truncate">{currentUser.displayName}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] uppercase font-bold tracking-wider ${
                      currentUser.role === "admin"
                        ? "bg-amber-100 text-amber-800 border border-amber-300"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {currentUser.role}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                </button>
              ) : (
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-forest-900 hover:bg-forest-800 text-sand-50 text-xs font-medium transition-all shadow-sm"
                >
                  <User className="w-3.5 h-3.5 text-gold-400" />
                  <span>เข้าสู่ระบบ</span>
                  <ChevronDown className="w-3 h-3 text-sand-300" />
                </button>
              )}

              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-elevated border border-sand-200 py-2 text-xs text-stone-700 z-50 animate-in fade-in zoom-in-95 duration-150"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  <div className="px-4 py-2.5 border-b border-sand-100">
                    <p className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold">
                      สถานะผู้ใช้งาน
                    </p>
                    <p className="font-semibold text-stone-900 mt-0.5">
                      {currentUser ? currentUser.displayName : "ผู้เยี่ยมชม (Guest-first)"}
                    </p>
                    <p className="text-[11px] text-stone-500">
                      {currentUser?.email || "ข้อมูลบันทึกในอุปกรณ์"}
                    </p>
                  </div>

                  <div className="p-2 space-y-1">
                    <p className="px-2 pt-1 text-[10px] uppercase tracking-wider text-stone-400 font-bold">
                      สลับโหมดทดสอบ
                    </p>
                    <button
                      onClick={() => loginAsDemoUser("customer")}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-sand-100 flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        <span>สมาชิกคนรักต้นไม้</span>
                      </div>
                      {currentUser?.role === "customer" && (
                        <span className="text-[10px] text-emerald-600 font-bold">กำลังใช้</span>
                      )}
                    </button>

                    <button
                      onClick={() => loginAsDemoUser("admin")}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-sand-100 flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                        <span>เจ้าของร้าน (Admin)</span>
                      </div>
                      {currentUser?.role === "admin" && (
                        <span className="text-[10px] text-amber-600 font-bold">กำลังใช้</span>
                      )}
                    </button>
                  </div>

                  {currentUser && (
                    <div className="border-t border-sand-100 p-1.5">
                      <button
                        onClick={logout}
                        className="w-full text-left px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>ออกจากระบบ (กลับเป็น Guest)</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (Matching SPEC §6.10 mobile-first) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-sand-50/95 backdrop-blur-lg border-t border-sand-200/80 px-2 py-2 flex items-center justify-around shadow-lg">
        {navLinks.map((link) => {
          const active = isActive(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
                active ? "text-forest-900 font-semibold" : "text-stone-500 hover:text-stone-800"
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  active ? "bg-forest-900 text-gold-400" : "text-stone-500"
                }`}
              >
                {link.icon}
              </div>
              <span className="text-[10px] tracking-tight">{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
