"use client";

import React from "react";
import Link from "next/link";
import { MessageCircle, Shield, Sparkles, MapPin, Heart } from "lucide-react";
import { useApp } from "@/lib/context/AppContext";

export function Footer() {
  const { t } = useApp();

  return (
    <footer className="bg-forest-950 text-sand-100 border-t border-forest-900/60 dark:border-forest-900/90 pt-16 pb-28 md:pb-16 mt-20 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-forest-900">
          {/* Brand & Philosophy */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-forest-900 dark:bg-forest-800 flex items-center justify-center text-gold-400 border border-forest-800 dark:border-forest-700">
                <span className="font-serif text-lg font-bold">T</span>
              </div>
              <span className="font-serif text-2xl font-medium tracking-tight text-sand-50">
                TreeForLife
              </span>
            </div>
            <p className="text-sm text-sand-300/80 max-w-md leading-relaxed font-light">
              {t.footer.philosophy}
            </p>
            <div className="flex items-center gap-2 text-xs text-gold-400 font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.footer.shotInStoreNote}</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="font-serif text-sm font-semibold tracking-wider text-sand-50 uppercase mb-4">
              {t.footer.navTitle}
            </h4>
            <ul className="space-y-2.5 text-xs text-sand-300">
              <li>
                <Link href="/search" className="hover:text-gold-300 transition-colors">
                  {t.footer.navCatalog}
                </Link>
              </li>
              <li>
                <Link href="/garden" className="hover:text-gold-300 transition-colors">
                  {t.footer.navGarden}
                </Link>
              </li>
              <li>
                <Link href="/today" className="hover:text-gold-300 transition-colors">
                  {t.footer.navToday}
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-gold-300 transition-colors">
                  {t.footer.navAdmin}
                </Link>
              </li>
            </ul>
          </div>

          {/* Direct Shop Contact */}
          <div>
            <h4 className="font-serif text-sm font-semibold tracking-wider text-sand-50 uppercase mb-4">
              {t.footer.contactTitle}
            </h4>
            <div className="space-y-3 text-xs text-sand-300">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{t.footer.openingHours}</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-[#06C755] shrink-0" />
                <span>{t.footer.lineOa}</span>
              </div>
              <div className="flex items-center gap-2 text-sand-400">
                <Shield className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{t.footer.pdpaNote}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-sand-400 font-light">
          <p>© {new Date().getFullYear()} TreeForLife. {t.footer.rights}</p>
          <div className="flex items-center gap-6">
            <span>{t.footer.privacyLink}</span>
            <span className="flex items-center gap-1">
              {t.footer.madeWith} <Heart className="w-3 h-3 text-rose-400 fill-rose-400 inline" /> {t.footer.forPlants}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
