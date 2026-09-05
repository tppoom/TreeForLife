"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [guestToken, setGuestToken] = useState<string>("");
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [inquiryModal, setInquiryModal] = useState<InquiryModalData>({
    isOpen: false,
    defaultIntent: "price",
  });

  // Initialize guest token & favorites from localStorage
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
    } catch (e) {
      console.error("Storage error:", e);
    }
  }, []);

  const toggleFavorite = (speciesId: string) => {
    setFavorites((prev) => {
      const next = prev.includes(speciesId)
        ? prev.filter((id) => id !== speciesId)
        : [...prev, speciesId];
      try {
        localStorage.setItem("tfl_favorites", JSON.stringify(next));
      } catch (e) {}
      showToast(
        next.includes(speciesId) ? "บันทึกในรายการที่สนใจแล้ว" : "นำออกจากรายการที่สนใจแล้ว",
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
          showToast(`ย้ายต้นไม้ ${data.plantCount} ต้นที่บันทึกไว้เข้าบัญชีแล้ว 🌿`, "success");
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
    showToast("ออกจากระบบแล้ว", "info");
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
