"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import {
  type Locale,
  type TranslationDictionary,
  getTranslation,
} from "@/lib/i18n/translations";

export type Theme = "light" | "dark";
export type UserRole = "guest" | "customer" | "staff" | "admin";
export type ToastType = "success" | "error" | "info" | "warning";

export interface DemoUser {
  id: string | null;
  displayName: string;
  role: UserRole;
  email?: string | null;
  avatarUrl?: string | null;
}

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

export const DEMO_USERS_BY_LOCALE: Record<Locale, Record<UserRole, DemoUser>> = {
  th: {
    guest: {
      id: null,
      displayName: "ผู้เยี่ยมชม (Guest)",
      role: "guest",
      email: null,
    },
    customer: {
      id: "11111111-1111-4111-a111-111111111111",
      displayName: "คุณนุ่น (Customer)",
      role: "customer",
      email: "noon@example.com",
    },
    staff: {
      id: "22222222-2222-4222-a222-222222222222",
      displayName: "สมชาย พนักงานร้าน (Staff)",
      role: "staff",
      email: "staff@treeforlife.shop",
    },
    admin: {
      id: "33333333-3333-4333-a333-333333333333",
      displayName: "เจ้าของร้าน (Admin)",
      role: "admin",
      email: "admin@treeforlife.shop",
    },
  },
  en: {
    guest: {
      id: null,
      displayName: "Guest",
      role: "guest",
      email: null,
    },
    customer: {
      id: "11111111-1111-4111-a111-111111111111",
      displayName: "Noon (Customer)",
      role: "customer",
      email: "noon@example.com",
    },
    staff: {
      id: "22222222-2222-4222-a222-222222222222",
      displayName: "Somchai (Shop Staff)",
      role: "staff",
      email: "staff@treeforlife.shop",
    },
    admin: {
      id: "33333333-3333-4333-a333-333333333333",
      displayName: "Shop Owner (Admin)",
      role: "admin",
      email: "admin@treeforlife.shop",
    },
  },
};

export const DEMO_USERS: Record<UserRole, DemoUser> = DEMO_USERS_BY_LOCALE.th;

export interface AppContextValue {
  // Locale & i18n
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;

  // Theme
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;

  // Demo Auth & User
  guestToken: string;
  user: DemoUser;
  role: UserRole;
  setRole: (role: UserRole) => void;
  loginAsDemoUser: (role: UserRole) => void;

  // Toast notifications
  toasts: Toast[];
  addToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

export const AppContext = createContext<AppContextValue | null>(null);

export function generateUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function AppContextProvider({ children }: { children: ReactNode }) {
  // 1. Locale state
  const [locale, setLocaleState] = useState<Locale>("th");

  // 2. Theme state
  const [theme, setThemeState] = useState<Theme>("light");

  // 3. Guest token state
  const [guestToken, setGuestToken] = useState<string>("");

  // 4. Role & User state
  const [role, setRoleState] = useState<UserRole>("guest");
  const user = useMemo<DemoUser>(() => {
    return DEMO_USERS_BY_LOCALE[locale]?.[role] || DEMO_USERS_BY_LOCALE.th[role] || DEMO_USERS.guest;
  }, [locale, role]);

  // 5. Toasts state
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Initialize client storage on mount
  useEffect(() => {
    try {
      // Restore Locale
      const savedLocale = localStorage.getItem("tfl_locale") as Locale | null;
      if (savedLocale === "en" || savedLocale === "th") {
        setLocaleState(savedLocale);
        if (typeof document !== "undefined") {
          document.documentElement.lang = savedLocale;
        }
      }

      // Restore Theme
      const savedTheme = localStorage.getItem("tfl_theme") as Theme | null;
      if (savedTheme === "dark" || savedTheme === "light") {
        setThemeState(savedTheme);
        if (typeof document !== "undefined") {
          document.documentElement.classList.toggle("dark", savedTheme === "dark");
        }
      } else if (
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      ) {
        setThemeState("dark");
        document.documentElement.classList.add("dark");
      }

      // Restore or generate Guest Token
      let token = localStorage.getItem("tfl_guest_token");
      if (!token) {
        token = generateUUID();
        localStorage.setItem("tfl_guest_token", token);
      }
      setGuestToken(token);

      // Restore Demo Role
      const savedRole = localStorage.getItem("tfl_demo_role") as UserRole | null;
      if (savedRole && DEMO_USERS[savedRole]) {
        setRoleState(savedRole);
      }
    } catch {
      // Safe fallback if localStorage is blocked (private browsing/iframes)
    }
  }, []);

  // Update locale helper
  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof document !== "undefined") {
      document.documentElement.lang = newLocale;
    }
    try {
      localStorage.setItem("tfl_locale", newLocale);
    } catch {}
  }, []);

  // Translation helper
  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      return getTranslation(locale, key, params);
    },
    [locale]
  );

  // Update theme helper
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", newTheme === "dark");
    }
    try {
      localStorage.setItem("tfl_theme", newTheme);
    } catch {}
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "light" ? "dark" : "light");
  }, [theme, setTheme]);

  // Remove toast
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Add toast
  const addToast = useCallback(
    (message: string, type: ToastType = "info", duration = 4000) => {
      const id = generateUUID();
      setToasts((prev) => [...prev, { id, message, type, duration }]);
      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  // Role switching
  const setRole = useCallback(
    (newRole: UserRole) => {
      const previousRole = role;
      setRoleState(newRole);
      const targetUser = DEMO_USERS_BY_LOCALE[locale]?.[newRole] || DEMO_USERS[newRole] || DEMO_USERS.guest;

      try {
        localStorage.setItem("tfl_demo_role", newRole);
      } catch {}

      const roleLabel = getTranslation(locale, `roles.${newRole}`);
      addToast(getTranslation(locale, "toasts.role_switched", { role: roleLabel }), "info");

      // Auto-migrate guest data when switching from guest to customer
      if (previousRole === "guest" && newRole === "customer" && guestToken && targetUser.id) {
        fetch("/api/garden/merge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ guestToken, userId: targetUser.id }),
        })
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (
              data &&
              ((typeof data.plantCount === "number" && data.plantCount > 0) ||
                (typeof data.favoriteCount === "number" && data.favoriteCount > 0) ||
                (typeof data.mergedCount === "number" && data.mergedCount > 0))
            ) {
              addToast(getTranslation(locale, "toasts.guest_merged"), "success");
            }
          })
          .catch((err) => {
            console.error("Auto guest merge failed:", err);
          });
      }
    },
    [role, guestToken, locale, addToast]
  );

  const loginAsDemoUser = useCallback(
    (newRole: UserRole) => {
      setRole(newRole);
    },
    [setRole]
  );

  const value = useMemo<AppContextValue>(
    () => ({
      locale,
      setLocale,
      t,
      theme,
      setTheme,
      toggleTheme,
      guestToken,
      user,
      role,
      setRole,
      loginAsDemoUser,
      toasts,
      addToast,
      removeToast,
    }),
    [
      locale,
      setLocale,
      t,
      theme,
      setTheme,
      toggleTheme,
      guestToken,
      user,
      role,
      setRole,
      loginAsDemoUser,
      toasts,
      addToast,
      removeToast,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppContextProvider");
  }
  return context;
}
