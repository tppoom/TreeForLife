"use client";

import React from "react";
import Link from "next/link";
import { Sprout, MessageCircle, Clock, MapPin, ExternalLink, Shield } from "lucide-react";
import { useApp } from "@/lib/context/AppContext";

export function Footer() {
  const { t } = useApp();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-sand-200 dark:border-forest-800 bg-sand-100/70 dark:bg-forest-950/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Col 1: Shop Brand & Philosophy (5 cols on lg) */}
          <div className="lg:col-span-5 space-y-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 rounded-lg"
            >
              <div className="w-8 h-8 rounded-lg bg-forest-700 dark:bg-forest-600 flex items-center justify-center text-white shadow-soft">
                <Sprout className="w-5 h-5 text-sand-100" />
              </div>
              <span className="font-serif font-bold text-xl tracking-tight text-forest-950 dark:text-sand-50">
                TreeForLife
              </span>
            </Link>
            <p className="text-sm text-forest-800/80 dark:text-sand-300 leading-relaxed max-w-md">
              {t("footer.about_desc")}
            </p>

            <div className="pt-2 space-y-2 text-xs text-forest-700 dark:text-sand-400">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-forest-600 dark:text-forest-400 shrink-0" />
                <span>
                  <strong className="font-semibold text-forest-900 dark:text-sand-200">
                    {t("footer.hours_label")}:
                  </strong>{" "}
                  {t("footer.hours_val")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-forest-600 dark:text-forest-400 shrink-0" />
                <span>
                  <strong className="font-semibold text-forest-900 dark:text-sand-200">
                    {t("footer.location_label")}:
                  </strong>{" "}
                  {t("footer.location_val")}
                </span>
              </div>
            </div>
          </div>

          {/* Col 2: Quick Links (3 cols on lg) */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-forest-900 dark:text-sand-100">
              {t("footer.quick_links")}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/search"
                  className="text-forest-700 dark:text-sand-300 hover:text-forest-950 dark:hover:text-sand-50 hover:underline transition"
                >
                  {t("nav.catalog")}
                </Link>
              </li>
              <li>
                <Link
                  href="/garden"
                  className="text-forest-700 dark:text-sand-300 hover:text-forest-950 dark:hover:text-sand-50 hover:underline transition"
                >
                  {t("nav.garden")}
                </Link>
              </li>
              <li>
                <Link
                  href="/today"
                  className="text-forest-700 dark:text-sand-300 hover:text-forest-950 dark:hover:text-sand-50 hover:underline transition"
                >
                  {t("nav.today")}
                </Link>
              </li>
              <li>
                <Link
                  href="/search?fav=true"
                  className="text-forest-700 dark:text-sand-300 hover:text-forest-950 dark:hover:text-sand-50 hover:underline transition"
                >
                  {t("nav.favorites")}
                </Link>
              </li>
              <li>
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 text-forest-700 dark:text-sand-300 hover:text-forest-950 dark:hover:text-sand-50 hover:underline transition"
                >
                  <Shield className="w-3.5 h-3.5 text-forest-600 dark:text-forest-400" />
                  <span>{t("nav.admin")}</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: LINE Contact CTA (4 cols on lg) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-5 rounded-2xl bg-forest-50/80 dark:bg-forest-900/50 border border-forest-200/70 dark:border-forest-800 shadow-soft">
              <h3 className="font-serif text-base font-bold text-forest-950 dark:text-sand-50 mb-1.5 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-forest-600 dark:text-forest-400" />
                <span>{t("footer.line_cta_title")}</span>
              </h3>
              <p className="text-xs text-forest-800/80 dark:text-sand-300 mb-4 leading-relaxed">
                {t("search.no_results_desc")}
              </p>

              <a
                href="https://line.me/R/ti/p/@treeforlife"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#06C755] hover:bg-[#05b34c] shadow-sm transition active:scale-[0.98] min-h-[44px]"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>{t("footer.line_cta_button")}</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>

              <div className="mt-2.5 text-center text-[11px] text-forest-600 dark:text-forest-400 font-medium">
                {t("footer.line_id")}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright and Tagline */}
        <div className="mt-10 pt-6 border-t border-sand-200 dark:border-forest-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-forest-600 dark:text-sand-400">
          <div>
            {t("footer.copyright", { year: currentYear })}
          </div>
          <div className="font-serif italic text-forest-700 dark:text-sand-300">
            {t("footer.nurtured_note")}
          </div>
        </div>
      </div>
    </footer>
  );
}
