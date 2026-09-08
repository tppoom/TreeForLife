"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sprout,
  BookOpen,
  CalendarCheck,
  Heart,
  ShieldCheck,
  Sun,
  Moon,
  Globe,
  Menu,
  X,
  ChevronDown,
  UserCheck,
  MessageCircle,
} from "lucide-react";
import { useApp, type UserRole } from "@/lib/context/AppContext";
import {
  InquiryModal,
  type InquiryIntent,
  type InquiryModalSpecies,
} from "@/components/ui/InquiryModal";

export function triggerInquiry(options?: {
  species?: InquiryModalSpecies;
  intent?: InquiryIntent;
}) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("open-tfl-inquiry", { detail: options }));
  }
}

export function Navbar() {
  const pathname = usePathname();
  const {
    locale,
    setLocale,
    t,
    theme,
    toggleTheme,
    role,
    setRole,
    user,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const roleDropdownRef = useRef<HTMLDivElement>(null);

  // LINE Inquiry Modal state
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [inquirySpecies, setInquirySpecies] = useState<InquiryModalSpecies | null>(null);
  const [inquiryIntent, setInquiryIntent] = useState<InquiryIntent | undefined>(undefined);

  // Listen to global trigger event
  useEffect(() => {
    const handleGlobalInquiry = (event: Event) => {
      const customEvent = event as CustomEvent<{
        species?: InquiryModalSpecies;
        intent?: InquiryIntent;
      }>;
      if (customEvent.detail) {
        if (customEvent.detail.species) {
          setInquirySpecies(customEvent.detail.species);
        }
        if (customEvent.detail.intent) {
          setInquiryIntent(customEvent.detail.intent);
        }
      }
      setInquiryOpen(true);
    };

    window.addEventListener("open-tfl-inquiry", handleGlobalInquiry);
    return () => window.removeEventListener("open-tfl-inquiry", handleGlobalInquiry);
  }, []);

  // Close role dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        roleDropdownRef.current &&
        !roleDropdownRef.current.contains(event.target as Node)
      ) {
        setRoleDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [searchParamsStr, setSearchParamsStr] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setSearchParamsStr(window.location.search);
    }
  }, [pathname]);

  const navLinks = [
    { href: "/search", label: t("nav.catalog"), icon: BookOpen },
    { href: "/garden", label: t("nav.garden"), icon: Sprout },
    { href: "/today", label: t("nav.today"), icon: CalendarCheck },
    { href: "/search?fav=true", label: t("nav.favorites"), icon: Heart },
    {
      href: "/admin",
      label: t("nav.admin"),
      icon: ShieldCheck,
      badge: role === "admin" || role === "staff" ? role.toUpperCase() : undefined,
    },
  ];

  const isLinkActive = (href: string) => {
    if (href === "/search") {
      if (pathname.startsWith("/plants")) return true;
      if (pathname === "/search") {
        return !searchParamsStr.includes("fav=true");
      }
      return false;
    }
    if (href === "/search?fav=true") {
      return pathname === "/search" && searchParamsStr.includes("fav=true");
    }
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  const rolesList: { id: UserRole; label: string; desc: string }[] = [
    {
      id: "guest",
      label: t("roles.guest"),
      desc: t("roles.guest_desc"),
    },
    {
      id: "customer",
      label: t("roles.customer"),
      desc: t("roles.customer_desc"),
    },
    {
      id: "staff",
      label: t("roles.staff"),
      desc: t("roles.staff_desc"),
    },
    {
      id: "admin",
      label: t("roles.admin"),
      desc: t("roles.admin_desc"),
    },
  ];

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    setRoleDropdownOpen(false);
  };

  const handleToggleLocale = () => {
    setLocale(locale === "th" ? "en" : "th");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-sand-200 dark:border-forest-800/80 bg-sand-50/90 dark:bg-forest-950/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 rounded-lg p-1"
            aria-label="TreeForLife Home"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-forest-600 to-forest-800 dark:from-forest-500 dark:to-forest-700 flex items-center justify-center text-white shadow-soft group-hover:scale-105 transition-transform duration-200">
              <Sprout className="w-5 h-5 sm:w-6 sm:h-6 text-sand-100" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-lg sm:text-xl tracking-tight text-forest-950 dark:text-sand-50 leading-tight">
                TreeForLife
              </span>
              <span className="text-[10px] sm:text-[11px] font-medium tracking-wide uppercase text-forest-600 dark:text-forest-400">
                Boutique & Care
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = isLinkActive(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "text-forest-800 dark:text-sand-50 bg-forest-100/60 dark:bg-forest-900/60 font-semibold"
                      : "text-forest-700 dark:text-sand-300 hover:text-forest-950 dark:hover:text-sand-50 hover:bg-sand-200/50 dark:hover:bg-forest-900/40"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-forest-600 dark:text-forest-400" : ""}`} />
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full font-semibold uppercase bg-forest-200 dark:bg-forest-800 text-forest-800 dark:text-forest-200">
                      {link.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-forest-600 dark:bg-forest-400 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Right Actions: Inquiry, Role Selector, Locale, Theme */}
          <div className="hidden md:flex items-center gap-2 lg:gap-3">
            {/* LINE OA Inquiry Button */}
            <button
              type="button"
              onClick={() => {
                setInquirySpecies(null);
                setInquiryIntent(undefined);
                setInquiryOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#06C755]/40 bg-[#06C755]/10 text-emerald-800 dark:text-emerald-300 hover:bg-[#06C755]/20 transition text-xs font-semibold min-h-[44px]"
              aria-label={t("inquiry.chat_line_title")}
              title={t("inquiry.chat_line_title")}
            >
              <MessageCircle className="w-4 h-4 text-[#06C755]" />
              <span className="hidden xl:inline">{t("nav.ask_shop_line")}</span>
              <span className="xl:hidden">LINE</span>
            </button>

            {/* Demo Role Switcher Dropdown */}
            <div className="relative" ref={roleDropdownRef}>
              <button
                type="button"
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-sand-300 dark:border-forest-700 bg-sand-100/70 dark:bg-forest-900/60 text-xs font-medium text-forest-800 dark:text-sand-200 hover:bg-sand-200/80 dark:hover:bg-forest-800 transition min-h-[44px]"
                aria-expanded={roleDropdownOpen}
                aria-label={t("roles.switch_role")}
              >
                <UserCheck className="w-3.5 h-3.5 text-forest-600 dark:text-forest-400" />
                <span className="capitalize">{role}</span>
                <ChevronDown className="w-3 h-3 text-sand-600 dark:text-sand-400" />
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl border border-sand-200 dark:border-forest-700 bg-white dark:bg-forest-900 shadow-elevated p-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-2 py-1.5 text-[11px] font-semibold text-sand-500 dark:text-sand-400 uppercase tracking-wider">
                    {t("roles.switch_role")}
                  </div>
                  <div className="space-y-1">
                    {rolesList.map((r) => {
                      const isSelected = r.id === role;
                      return (
                        <button
                          key={r.id}
                          onClick={() => handleRoleChange(r.id)}
                          className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition flex flex-col gap-0.5 ${
                            isSelected
                              ? "bg-forest-50 dark:bg-forest-800/80 text-forest-900 dark:text-sand-100 font-semibold border-l-2 border-forest-600"
                              : "text-forest-700 dark:text-sand-300 hover:bg-sand-100 dark:hover:bg-forest-800/40"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{r.label}</span>
                            {isSelected && (
                              <span className="text-[10px] font-bold text-forest-600 dark:text-forest-400">✓</span>
                            )}
                          </div>
                          <span className="text-[11px] font-normal text-sand-600 dark:text-sand-400 line-clamp-1">
                            {r.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-2 pt-2 border-t border-sand-200 dark:border-forest-800 px-2 text-[11px] text-sand-500 dark:text-sand-400">
                    <span className="font-medium">{user.displayName}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Language Toggle (TH/EN) */}
            <button
              type="button"
              onClick={handleToggleLocale}
              className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg border border-sand-300 dark:border-forest-700 bg-sand-100/70 dark:bg-forest-900/60 text-xs font-semibold text-forest-800 dark:text-sand-200 hover:bg-sand-200/80 dark:hover:bg-forest-800 transition min-h-[44px] min-w-[44px]"
              aria-label={t("nav.language")}
              title={t("nav.language")}
            >
              <Globe className="w-3.5 h-3.5 text-forest-600 dark:text-forest-400" />
              <span className="uppercase">{locale}</span>
            </button>

            {/* Theme Toggle (Light/Dark) */}
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center justify-center p-2 rounded-lg border border-sand-300 dark:border-forest-700 bg-sand-100/70 dark:bg-forest-900/60 text-forest-800 dark:text-sand-200 hover:bg-sand-200/80 dark:hover:bg-forest-800 transition min-h-[44px] min-w-[44px]"
              aria-label={theme === "dark" ? t("nav.light") : t("nav.dark")}
              title={theme === "dark" ? t("nav.light") : t("nav.dark")}
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-gold-400" />
              ) : (
                <Moon className="w-4 h-4 text-forest-700" />
              )}
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={handleToggleLocale}
              className="px-2 py-1.5 rounded-lg text-xs font-bold border border-sand-300 dark:border-forest-700 text-forest-800 dark:text-sand-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label={t("nav.language")}
            >
              {locale.toUpperCase()}
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-lg text-forest-800 dark:text-sand-200 border border-sand-300 dark:border-forest-700 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label={theme === "dark" ? t("nav.light") : t("nav.dark")}
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-gold-400" />
              ) : (
                <Moon className="w-4 h-4 text-forest-700" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg border border-sand-300 dark:border-forest-700 text-forest-800 dark:text-sand-200 hover:bg-sand-200/50 dark:hover:bg-forest-900/50 transition min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label={mobileMenuOpen ? t("nav.close_menu") : t("nav.open_menu")}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-sand-200 dark:border-forest-800 bg-sand-50 dark:bg-forest-950 px-4 pt-3 pb-6 space-y-4 shadow-lg animate-in slide-in-from-top duration-200">
          {/* Navigation Links */}
          <div className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = isLinkActive(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-3 rounded-xl text-base font-medium min-h-[48px] ${
                    isActive
                      ? "bg-forest-100 dark:bg-forest-900/80 text-forest-900 dark:text-sand-50 font-semibold"
                      : "text-forest-700 dark:text-sand-200 hover:bg-sand-200/60 dark:hover:bg-forest-900/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isActive ? "text-forest-600 dark:text-forest-400" : ""}`} />
                    <span>{link.label}</span>
                  </div>
                  {link.badge && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-forest-200 dark:bg-forest-800 text-forest-800 dark:text-forest-200">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* LINE Inquiry Button in Mobile Drawer */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setInquirySpecies(null);
                setInquiryIntent(undefined);
                setInquiryOpen(true);
              }}
              className="w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium min-h-[48px] bg-[#06C755]/10 border border-[#06C755]/30 text-emerald-900 dark:text-emerald-200 hover:bg-[#06C755]/20 transition"
            >
              <div className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5 text-[#06C755]" />
                <span className="font-semibold">{t("inquiry.chat_line_title")}</span>
              </div>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#06C755]/20 text-emerald-800 dark:text-emerald-300">
                LINE OA
              </span>
            </button>
          </div>

          {/* Role Switcher in Mobile Menu */}
          <div className="pt-3 border-t border-sand-200 dark:border-forest-800">
            <div className="text-xs font-semibold text-sand-600 dark:text-sand-400 uppercase tracking-wider mb-2">
              {t("roles.switch_role")}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {rolesList.map((r) => {
                const isSelected = r.id === role;
                return (
                  <button
                    key={r.id}
                    onClick={() => handleRoleChange(r.id)}
                    className={`px-3 py-2.5 rounded-lg text-xs font-medium text-left border min-h-[44px] flex items-center justify-between ${
                      isSelected
                        ? "border-forest-600 bg-forest-100/70 dark:bg-forest-900/80 text-forest-900 dark:text-sand-50 font-semibold"
                        : "border-sand-200 dark:border-forest-800 bg-white/50 dark:bg-forest-900/20 text-forest-700 dark:text-sand-300"
                    }`}
                  >
                    <span>{r.label.split(" ")[0]}</span>
                    {isSelected && <span className="text-forest-600 dark:text-forest-400">✓</span>}
                  </button>
                );
              })}
            </div>
            <div className="mt-2 text-xs text-sand-500 dark:text-sand-400 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-forest-600 dark:text-forest-400" />
              <span>{user.displayName}</span>
            </div>
          </div>
        </div>
      )}

      {/* Global LINE Inquiry Modal */}
      <InquiryModal
        isOpen={inquiryOpen}
        onClose={() => setInquiryOpen(false)}
        species={inquirySpecies}
        intent={inquiryIntent}
        sourcePage={pathname}
      />
    </header>
  );
}
