"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Compass,
  Droplets,
  CalendarCheck2,
  MessageCircle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { InquiryModal } from "@/components/ui/InquiryModal";
import { useDemoCopy } from "@/lib/i18n/demo";

export function Phase1Recap() {
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);

  const c = useDemoCopy().phase1;
  const cards = [
    { id: "catalog", ...c.cards.catalog, isInquiryModal: false, href: "/search", icon: Compass },
    { id: "garden", ...c.cards.garden, isInquiryModal: false, href: "/garden", icon: Droplets },
    { id: "today", ...c.cards.today, isInquiryModal: false, href: "/today", icon: CalendarCheck2 },
    { id: "inquiry", ...c.cards.inquiry, isInquiryModal: true, href: "/search", icon: MessageCircle },
  ];

  return (
    <section id="phase1" className="space-y-6">
      {/* Section Header */}
      <div className="bg-sand-100/70 dark:bg-forest-900/40 border border-sand-200 dark:border-forest-800 rounded-3xl p-6 sm:p-8 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{c.live_badge}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-forest-900 dark:text-sand-50">
              {c.title}
            </h2>
            <p className="text-sm sm:text-base text-sand-700 dark:text-sand-300 max-w-3xl">
              {c.desc}
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-center px-3 py-1.5 rounded-2xl bg-white dark:bg-forest-800 border border-sand-200 dark:border-forest-700 text-xs text-forest-700 dark:text-sand-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-medium">{c.live}</span>
          </div>
        </div>

        {/* 4 Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-8">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                className="group relative bg-white dark:bg-forest-900/90 border border-sand-200 dark:border-forest-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60">
                      {card.badge}
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-sand-100 dark:bg-forest-800 flex items-center justify-center text-forest-800 dark:text-sand-200 group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="text-lg font-serif font-bold text-forest-900 dark:text-sand-100 group-hover:text-emerald-800 dark:group-hover:text-emerald-300 transition-colors">
                    {card.title}
                  </h3>

                  <p className="mt-2 text-xs sm:text-sm text-sand-700 dark:text-sand-300 leading-relaxed">
                    {card.description}
                  </p>

                  <ul className="mt-4 space-y-1.5">
                    {card.features.map((feat, idx) => (
                      <li
                        key={idx}
                        className="text-xs text-sand-600 dark:text-sand-400 flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-sand-100 dark:border-forest-800/80">
                  {card.isInquiryModal ? (
                    <button
                      type="button"
                      onClick={() => setInquiryModalOpen(true)}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-sand-50 text-xs sm:text-sm font-medium shadow-sm transition"
                    >
                      <span>{card.linkText}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <Link
                      href={card.href}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-sand-50 text-xs sm:text-sm font-medium shadow-sm transition"
                    >
                      <span>{card.linkText}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Inquiry Modal */}
      <InquiryModal
        isOpen={inquiryModalOpen}
        onClose={() => setInquiryModalOpen(false)}
        defaultIntent="care_help"
        sourcePage="demo-phase1"
      />
    </section>
  );
}
