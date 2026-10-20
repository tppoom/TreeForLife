"use client";

import React, { useState } from "react";
import {
  DollarSign,
  Sliders,
  CheckCircle2,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  Leaf,
  Layers,
} from "lucide-react";
import { useDemoCopy, fill } from "@/lib/i18n/demo";

export type StyleOption = "minimal" | "tropical" | "air-purifier";

export interface BundlePlant {
  nameTh: string;
  nameEn: string;
  potSize: string;
  price: number;
  highlight: string;
}

export interface CuratedBundle {
  styleName: string;
  plants: BundlePlant[];
  totalPrice: number;
  remainingBudget: number;
  curatorNote: string;
  placementTips: string;
}

// Prices are language-independent; names and notes live in lib/i18n/demo/budget.ts.
// Each style has three tiers: under 1,200 ฿, under 2,600 ฿, and above.
const PRICES: Record<StyleOption, number[][]> = {
  minimal: [
    [250, 390],
    [490, 350, 390, 220],
    [1350, 650, 450, 590],
  ],
  tropical: [
    [450, 190],
    [590, 380, 450, 180],
    [1800, 790, 550, 250],
  ],
  "air-purifier": [
    [290, 280],
    [450, 390, 420, 90],
    [1100, 890, 750, 220],
  ],
};

const QUICK_BUDGETS = [800, 1500, 3000, 5000];

export function BudgetRecommenderPrototype() {
  const c = useDemoCopy().budget;
  const [budget, setBudget] = useState<number>(1500);
  const [selectedStyle, setSelectedStyle] = useState<StyleOption>("minimal");

  const styles = (["minimal", "tropical", "air-purifier"] as const).map((id) => ({ id, ...c.styles[id] }));

  const quickBudgetPresets = QUICK_BUDGETS.map((value, i) => ({ label: c.quick_presets[i], value }));

  // Helper to generate dynamic bundle based on budget & style
  const getBundle = (b: number, style: StyleOption): CuratedBundle => {
    const tier = b < 1200 ? 0 : b < 2600 ? 1 : 2;
    const copy = c.bundles[style][tier];
    const plants: BundlePlant[] = copy.items.map((item, i) => ({
      nameTh: item.name,
      nameEn: item.nameEn,
      potSize: item.potSize,
      price: PRICES[style][tier][i],
      highlight: item.highlight,
    }));
    const totalPrice = plants.reduce((sum, p) => sum + p.price, 0);
    return {
      styleName: copy.styleName,
      plants,
      totalPrice,
      remainingBudget: b - totalPrice,
      curatorNote: copy.curatorNote,
      placementTips: copy.placementTips,
    };
  };

  const currentBundle = getBundle(budget, selectedStyle);

  return (
    <div className="rounded-2xl border border-sand-200 dark:border-forest-800 bg-white dark:bg-forest-900 shadow-soft overflow-hidden">
      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-sand-200 dark:border-forest-800 bg-sand-50/50 dark:bg-forest-950/40">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-medium mb-1">
          <DollarSign className="w-3.5 h-3.5" />
          <span>Phase 2 AI Prototype</span>
        </div>
        <h3 className="text-xl font-bold font-serif text-forest-900 dark:text-sand-100">
          {c.title}
        </h3>
        <p className="text-xs sm:text-sm text-sand-700 dark:text-sand-300">
          {c.subtitle}
        </p>

        {/* Budget Slider Section */}
        <div className="mt-5 space-y-3 p-4 rounded-xl bg-white dark:bg-forest-900 border border-sand-200 dark:border-forest-800">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="text-xs font-semibold text-sand-700 dark:text-sand-300 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-forest-700 dark:text-emerald-400" />
              <span>{c.budget_label}</span>
            </label>
            <div className="text-sm sm:text-base font-bold text-forest-900 dark:text-emerald-400 font-mono">
              {fill(c.budget_value, { amount: budget.toLocaleString() })}
            </div>
          </div>

          <input
            type="range"
            role="slider"
            aria-label={c.slider_label}
            min="500"
            max="5000"
            step="100"
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            className="w-full accent-forest-700 dark:accent-emerald-500 h-2 bg-sand-200 dark:bg-forest-800 rounded-lg cursor-pointer"
          />

          <div className="flex justify-between items-center text-[11px] text-sand-600 dark:text-sand-400">
            <span>{c.min}</span>
            <span>{c.mid}</span>
            <span>{c.max}</span>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-sand-200/60 dark:border-forest-800">
            <span className="text-[11px] text-sand-600 dark:text-sand-400 self-center">
              {c.quick}
            </span>
            {quickBudgetPresets.map((preset) => (
              <button
                key={preset.value}
                onClick={() => setBudget(preset.value)}
                className={`px-2.5 py-1 rounded-lg text-xs transition ${
                  budget === preset.value
                    ? "bg-forest-800 text-sand-50 dark:bg-emerald-600 font-semibold"
                    : "bg-sand-100 dark:bg-forest-800 text-forest-800 dark:text-sand-200 hover:bg-sand-200"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Style Filter Pills */}
        <div className="mt-4 space-y-2">
          <label className="block text-xs font-semibold text-sand-700 dark:text-sand-300">
            {c.style_label}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {styles.map((style) => {
              const isSelected = style.id === selectedStyle;
              return (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  className={`text-left p-3 rounded-xl border text-xs transition ${
                    isSelected
                      ? "border-forest-600 bg-forest-50/70 dark:bg-forest-800/80 dark:border-emerald-500 font-medium text-forest-900 dark:text-sand-100 ring-2 ring-forest-500/20"
                      : "border-sand-200 dark:border-forest-800 bg-white dark:bg-forest-900/60 text-sand-800 dark:text-sand-300 hover:bg-sand-50 dark:hover:bg-forest-800/40"
                  }`}
                >
                  <div className="font-semibold">{style.label}</div>
                  <div className="text-[11px] text-sand-600 dark:text-sand-400 mt-0.5 line-clamp-1">
                    {style.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Bundle Listing */}
      <div className="p-5 sm:p-6 space-y-6">
        {/* Curated Bundle Card */}
        <div className="rounded-xl border border-sand-200 dark:border-forest-800 bg-sand-50/40 dark:bg-forest-950/30 p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-sand-200 dark:border-forest-800">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-forest-700 dark:text-emerald-400">
                {c.curated_for_you}
              </span>
              <h4 className="text-base font-bold text-forest-900 dark:text-sand-100">
                {currentBundle.styleName}
              </h4>
            </div>
            <div className="text-right">
              <span className="text-xs text-sand-600 dark:text-sand-400 block">
                {c.total_label}
              </span>
              <div className="text-lg font-bold text-emerald-800 dark:text-emerald-400 font-mono">
                {fill(c.total, { amount: currentBundle.totalPrice.toLocaleString() })}
              </div>
              <span className="text-[11px] text-sand-600 dark:text-sand-400">
                {fill(c.remaining, { amount: currentBundle.remainingBudget.toLocaleString() })}
              </span>
            </div>
          </div>

          {/* Plant Items Table/List */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-sand-700 dark:text-sand-300 block">
              {fill(c.items_label, { count: currentBundle.plants.length })}
            </span>
            <div className="grid grid-cols-1 gap-2">
              {currentBundle.plants.map((item, idx) => (
                <div
                  key={idx}
                  className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-white dark:bg-forest-900 border border-sand-200 dark:border-forest-800 text-xs sm:text-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0">
                      <Leaf className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-forest-900 dark:text-sand-100">
                        {item.nameTh}
                      </div>
                      <div className="text-[11px] text-sand-600 dark:text-sand-400">
                        {item.nameEn} · {item.potSize}
                      </div>
                      <div className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                        {fill(c.highlight, { text: item.highlight })}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-bold text-forest-900 dark:text-sand-100 font-mono">
                      {item.price.toLocaleString()} ฿
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rationale & Placement Tips */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-2">
            <div className="p-3 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 space-y-1">
              <strong className="text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{c.why}</span>
              </strong>
              <p className="text-forest-900 dark:text-sand-200 leading-relaxed">
                {currentBundle.curatorNote}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-sand-100/60 dark:bg-forest-900/60 border border-sand-200 dark:border-forest-800 space-y-1">
              <strong className="text-forest-900 dark:text-sand-100 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>{c.placement}</span>
              </strong>
              <p className="text-sand-800 dark:text-sand-300 leading-relaxed">
                {currentBundle.placementTips}
              </p>
            </div>
          </div>

          {/* Action CTA */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-sand-200 dark:border-forest-800">
            <div className="text-xs text-sand-600 dark:text-sand-400">
              {c.price_note}
            </div>
            <a
              href="https://line.me"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-forest-800 hover:bg-forest-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-sand-50 text-xs font-semibold shadow-soft transition"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{c.order}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
