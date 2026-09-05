"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Locale, translations } from "@/lib/i18n/translations";

export type ThemeMode = "light" | "dark";

export interface UserSession {
  id: string;
  displayName: string;
  email?: string;
  role: "customer" | "staff" | "admin";
  avatarUrl?: string;
}

export interface InquiryModalData {
  isOpen: boolean;
  speciesId?: string | null;
  speciesNameTh?: string;
  speciesPhoto?: string;
  sourcePage?: string;
  defaultIntent?: "price" | "availability" | "care_help" | "design_quote";
  customNote?: string;
}

interface Toast {
  id: string;
  type: "success" | "info" | "warning";
  message: string;
}

interface AppContextType {
  guestToken: string;
  currentUser: UserSession | null;
  favorites: string[]; // species IDs
  toggleFavorite: (speciesId: string) => void;
  isFavorite: (speciesId: string) => boolean;
  loginAsDemoUser: (role?: "customer" | "admin") => Promise<void>;
  logout: () => void;
  inquiryModal: InquiryModalData;
  openInquiryModal: (data: Partial<InquiryModalData>) => void;
  closeInquiryModal: () => void;
  toasts: Toast[];
  showToast: (message: string, type?: "success" | "info" | "warning") => void;
  removeToast: (id: string) => void;
  // i18n & Theme
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  theme: ThemeMode;
  toggleTheme: () => void;
  t: typeof translations.th;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [guestToken, setGuestToken] = useState<string>("");
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [locale, setLocaleState] = useState<Locale>("th");
  const [theme, setThemeState] = useState<ThemeMode>("light");

  const [inquiryModal, setInquiryModal] = useState<InquiryModalData>({
    isOpen: false,
    defaultIntent: "price",
  });

  // Initialize guest token, favorites, theme, and locale from localStorage
  useEffect(() => {
    try {
      let token = localStorage.getItem("tfl_guest_token");
      if (!token) {
        token = "guest_" + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
        localStorage.setItem("tfl_guest_token", token);
      }
      setGuestToken(token);

      const savedFavs = localStorage.getItem("tfl_favorites");
      if (savedFavs) {
        setFavorites(JSON.parse(savedFavs));
      }

      const savedUser = localStorage.getItem("tfl_user");
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      }

      const savedLocale = localStorage.getItem("tfl_locale") as Locale;
      if (savedLocale === "en" || savedLocale === "th") {
        setLocaleState(savedLocale);
        document.documentElement.lang = savedLocale;
      }

      const savedTheme = localStorage.getItem("tfl_theme") as ThemeMode;
      if (savedTheme === "dark" || (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
        setThemeState("dark");
        document.documentElement.classList.add("dark");
      } else {
        setThemeState("light");
        document.documentElement.classList.remove("dark");
      }
    } catch (e) {
      console.error("Storage error:", e);
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem("tfl_locale", newLocale);
      document.documentElement.lang = newLocale;
    } catch (e) {}
  };

  const toggleLocale = () => {
    setLocale(locale === "th" ? "en" : "th");
  };

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setThemeState(nextTheme);
    try {
      localStorage.setItem("tfl_theme", nextTheme);
      if (nextTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } catch (e) {}
  };

  const toggleFavorite = (speciesId: string) => {
    setFavorites((prev) => {
      const next = prev.includes(speciesId)
        ? prev.filter((id) => id !== speciesId)
        : [...prev, speciesId];
      try {
        localStorage.setItem("tfl_favorites", JSON.stringify(next));
      } catch (e) {}
      showToast(
        next.includes(speciesId)
          ? (locale === "th" ? "บันทึกในรายการที่สนใจแล้ว" : "Added to saved list")
          : (locale === "th" ? "นำออกจากรายการที่สนใจแล้ว" : "Removed from saved list"),
        "info"
      );
      return next;
    });
  };

  const isFavorite = (speciesId: string) => favorites.includes(speciesId);

  const loginAsDemoUser = async (role: "customer" | "admin" = "customer") => {
    const user: UserSession = {
      id: role === "admin" ? "a0000000-0000-0000-0000-000000000001" : "u0000000-0000-0000-0000-000000000002",
      displayName: role === "admin" ? "เจ้าของร้าน TreeForLife" : "คุณนุ่น (สมาชิกคนรักต้นไม้)",
      email: role === "admin" ? "admin@treeforlife.shop" : "noon.plantlover@example.com",
      role,
      avatarUrl: role === "admin" ? undefined : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    };

    setCurrentUser(user);
    try {
      localStorage.setItem("tfl_user", JSON.stringify(user));

      // Merge guest plants
      if (guestToken) {
        const res = await fetch("/api/garden/merge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ guestToken, userId: user.id }),
        });
        const data = await res.json();
        if (data.plantCount > 0) {
          showToast(
            locale === "th"
              ? `ย้ายต้นไม้ ${data.plantCount} ต้นที่บันทึกไว้เข้าบัญชีแล้ว 🌿`
              : `Migrated ${data.plantCount} saved plants to your account! 🌿`,
            "success"
          );
        } else {
          showToast(`ยินดีต้อนรับ ${user.displayName}!`, "success");
        }
      }
    } catch (e) {
      showToast(`ยินดีต้อนรับ ${user.displayName}!`, "success");
    }
  };

  const logout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem("tfl_user");
    } catch (e) {}
    showToast(locale === "th" ? "ออกจากระบบแล้ว" : "Signed out", "info");
  };

  const openInquiryModal = (data: Partial<InquiryModalData>) => {
    setInquiryModal({
      isOpen: true,
      speciesId: data.speciesId,
      speciesNameTh: data.speciesNameTh,
      speciesPhoto: data.speciesPhoto,
      sourcePage: data.sourcePage || (typeof window !== "undefined" ? window.location.pathname : "/"),
      defaultIntent: data.defaultIntent || "price",
      customNote: data.customNote,
    });
  };

  const closeInquiryModal = () => {
    setInquiryModal((prev) => ({ ...prev, isOpen: false }));
  };

  const showToast = (message: string, type: "success" | "info" | "warning" = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const t = translations[locale];

  return (
    <AppContext.Provider
      value={{
        guestToken,
        currentUser,
        favorites,
        toggleFavorite,
        isFavorite,
        loginAsDemoUser,
        logout,
        inquiryModal,
        openInquiryModal,
        closeInquiryModal,
        toasts,
        showToast,
        removeToast,
        locale,
        setLocale,
        toggleLocale,
        theme,
        toggleTheme,
        t,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
