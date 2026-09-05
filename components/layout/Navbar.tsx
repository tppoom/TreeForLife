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
  Sun,
  Moon,
  Globe,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const {
    currentUser,
    loginAsDemoUser,
    logout,
    favorites,
    openInquiryModal,
    locale,
    toggleLocale,
    theme,
    toggleTheme,
    t,
  } = useApp();

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navLinks = [
    { href: "/search", label: t.nav.catalog, icon: <Compass className="w-4 h-4" /> },
    { href: "/garden", label: t.nav.garden, icon: <Sprout className="w-4 h-4" /> },
    { href: "/today", label: t.nav.today, icon: <CheckCircle className="w-4 h-4" /> },
    { href: "/admin", label: t.nav.admin, icon: <ShieldCheck className="w-4 h-4" /> },
  ];

  const isActive = (href: string) => {
    if (href === "/search") return pathname === "/search" || pathname.startsWith("/plants/");
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Top Main Navbar (Desktop + Tablet) */}
      <header className="sticky top-0 z-40 bg-sand-50/90 dark:bg-[#091710]/95 backdrop-blur-md border-b border-sand-200/80 dark:border-forest-900/60 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-forest-900 dark:bg-forest-800 flex items-center justify-center text-gold-400 shadow-card border border-forest-800 dark:border-forest-700 transition-transform group-hover:scale-105">
              <span className="font-serif text-xl font-bold tracking-tighter">T</span>
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-xl font-medium tracking-tight text-forest-950 dark:text-sand-50 group-hover:text-forest-800 dark:group-hover:text-gold-300 transition-colors">
                TreeForLife
              </span>
              <span className="text-[10px] tracking-widest text-stone-500 dark:text-stone-400 uppercase font-sans -mt-1">
                {t.nav.tagline}
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1.5 bg-sand-100/70 dark:bg-forest-950/60 p-1.5 rounded-2xl border border-sand-200/80 dark:border-forest-900/60">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                    active
                      ? "bg-forest-900 dark:bg-forest-800 text-sand-50 shadow-sm"
                      : "text-stone-700 dark:text-sand-300 hover:text-forest-900 dark:hover:text-sand-50 hover:bg-sand-200/60 dark:hover:bg-forest-900/50"
                  }`}
                >
                  <span className={active ? "text-gold-400" : "text-stone-400 dark:text-stone-500"}>
                    {link.icon}
                  </span>
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons & Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Language Switcher Button (TH / EN) */}
            <button
              onClick={toggleLocale}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-sand-300 dark:border-forest-800 bg-white dark:bg-forest-950 hover:bg-sand-100 dark:hover:bg-forest-900 text-xs font-semibold text-stone-800 dark:text-sand-200 transition-colors cursor-pointer shadow-sm"
              title="Switch Language (TH/EN)"
            >
              <Globe className="w-3.5 h-3.5 text-gold-500" />
              <span className="uppercase text-[11px] tracking-wider">{locale === "th" ? "TH" : "EN"}</span>
            </button>

            {/* Dark/Light Mode Switcher Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-sand-300 dark:border-forest-800 bg-white dark:bg-forest-950 hover:bg-sand-100 dark:hover:bg-forest-900 text-stone-700 dark:text-gold-400 transition-colors cursor-pointer shadow-sm"
              title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
            >
              {theme === "light" ? (
                <Moon className="w-4 h-4 text-stone-700 hover:text-forest-900" />
              ) : (
                <Sun className="w-4 h-4 text-gold-400 hover:text-gold-300" />
              )}
            </button>

            {/* Direct Line Inquiry Trigger */}
            <button
              onClick={() => openInquiryModal({ defaultIntent: "care_help" })}
              className="hidden lg:flex items-center gap-2 px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100/80 dark:hover:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-xs font-medium transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5 text-[#06C755]" />
              <span>{t.nav.consultShop}</span>
            </button>

            {/* Favorites Counter */}
            {favorites.length > 0 && (
              <Link
                href="/search?fav=true"
                className="relative p-2 text-stone-600 dark:text-sand-300 hover:text-rose-600 transition-colors rounded-xl hover:bg-sand-100 dark:hover:bg-forest-900"
                title={t.search.savedTitle}
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
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-sand-300 dark:border-forest-800 bg-white dark:bg-forest-950 hover:bg-sand-50 dark:hover:bg-forest-900 text-xs font-medium text-stone-800 dark:text-sand-200 transition-all shadow-sm cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-forest-800 text-sand-50 flex items-center justify-center text-[11px] font-bold">
                    {currentUser.displayName.charAt(0)}
                  </div>
                  <span className="hidden sm:inline max-w-[110px] truncate">{currentUser.displayName}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] uppercase font-bold tracking-wider ${
                      currentUser.role === "admin"
                        ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800/60"
                        : "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300"
                    }`}
                  >
                    {currentUser.role}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                </button>
              ) : (
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-forest-900 dark:bg-forest-800 hover:bg-forest-800 dark:hover:bg-forest-700 text-sand-50 text-xs font-medium transition-all shadow-sm cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-gold-400" />
                  <span>{t.nav.login}</span>
                  <ChevronDown className="w-3 h-3 text-sand-300" />
                </button>
              )}

              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-64 bg-white dark:bg-forest-950 rounded-2xl shadow-elevated border border-sand-200 dark:border-forest-800 py-2 text-xs text-stone-700 dark:text-sand-200 z-50 animate-in fade-in zoom-in-95 duration-150"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  <div className="px-4 py-2.5 border-b border-sand-100 dark:border-forest-900">
                    <p className="text-[11px] uppercase tracking-wider text-stone-400 dark:text-stone-500 font-semibold">
                      {t.nav.userStatus}
                    </p>
                    <p className="font-semibold text-stone-900 dark:text-sand-50 mt-0.5">
                      {currentUser ? currentUser.displayName : t.nav.guest}
                    </p>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">
                      {currentUser?.email || t.nav.savedInDevice}
                    </p>
                  </div>

                  <div className="p-2 space-y-1">
                    <p className="px-2 pt-1 text-[10px] uppercase tracking-wider text-stone-400 dark:text-stone-500 font-bold">
                      {t.nav.switchRole}
                    </p>
                    <button
                      onClick={() => loginAsDemoUser("customer")}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-sand-100 dark:hover:bg-forest-900 flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>{t.nav.customer}</span>
                      </div>
                      {currentUser?.role === "customer" && (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                          {t.nav.usingNow}
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => loginAsDemoUser("admin")}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-sand-100 dark:hover:bg-forest-900 flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        <span>{t.nav.adminRole}</span>
                      </div>
                      {currentUser?.role === "admin" && (
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                          {t.nav.usingNow}
                        </span>
                      )}
                    </button>
                  </div>

                  {currentUser && (
                    <div className="border-t border-sand-100 dark:border-forest-900 p-1.5">
                      <button
                        onClick={logout}
                        className="w-full text-left px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>{t.nav.logout}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (SPEC §6.10 mobile-first) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-sand-50/95 dark:bg-[#091710]/95 backdrop-blur-lg border-t border-sand-200/80 dark:border-forest-900/80 px-2 py-2 flex items-center justify-around shadow-lg">
        {navLinks.map((link) => {
          const active = isActive(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
                active
                  ? "text-forest-900 dark:text-gold-400 font-semibold"
                  : "text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-sand-100"
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  active
                    ? "bg-forest-900 dark:bg-forest-800 text-gold-400"
                    : "text-stone-500 dark:text-stone-400"
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
