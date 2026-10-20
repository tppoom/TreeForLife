"use client";

import React, { useMemo } from "react";
import { Sun, CloudRain, Snowflake, Sparkles, AlertCircle, Droplets } from "lucide-react";
import { calculateCareInterval } from "@/lib/care/scheduler";
import { useApp } from "@/lib/context/AppContext";

export interface CareTemplateData {
  waterDaysHot: number;
  waterDaysRainy: number;
  waterDaysCool: number;
  fertilizeDays?: number | null;
  fertilizePauseMonths?: number[];
  repotMonths?: number | null;
  pruneDays?: number | null;
  pestCheckDays?: number;
  notesTh?: string | null;
}

interface SpeciesCareEditorProps {
  careTemplate?: CareTemplateData | null;
  onChange: (updated: CareTemplateData) => void;
}

export function SpeciesCareEditor({ careTemplate, onChange }: SpeciesCareEditorProps) {
  const { t } = useApp();
  const template: CareTemplateData = careTemplate || {
    waterDaysHot: 3,
    waterDaysRainy: 5,
    waterDaysCool: 4,
    fertilizeDays: 14,
    fertilizePauseMonths: [],
    repotMonths: 12,
    pruneDays: null,
    pestCheckDays: 14,
    notesTh: "",
  };

  const handleChange = (field: keyof CareTemplateData, val: any) => {
    onChange({
      ...template,
      [field]: val,
    });
  };

  // Live calculation preview matrix for 3 seasons and potting/placement scenarios
  const previewData = useMemo(() => {
    const seasons: Array<"hot" | "rainy" | "cool"> = ["hot", "rainy", "cool"];

    const scenarios = [
      {
        potLabelKey: "filters.pot_terracotta",
        placeLabelKey: "filters.placement_outdoor_sun",
        potMaterial: "terracotta" as const,
        placement: "outdoor_sun" as const,
      },
      {
        potLabelKey: "filters.pot_terracotta",
        placeLabelKey: "filters.placement_indoor_window",
        potMaterial: "terracotta" as const,
        placement: "indoor_window" as const,
      },
      {
        potLabelKey: "filters.pot_plastic",
        placeLabelKey: "filters.placement_outdoor_sun",
        potMaterial: "plastic" as const,
        placement: "outdoor_sun" as const,
      },
      {
        potLabelKey: "filters.pot_plastic",
        placeLabelKey: "filters.placement_indoor_window",
        potMaterial: "plastic" as const,
        placement: "indoor_window" as const,
      },
    ];

    return scenarios.map((sc) => {
      const intervals = seasons.map((s) => {
        const days = calculateCareInterval({
          waterDaysHot: template.waterDaysHot || 3,
          waterDaysRainy: template.waterDaysRainy || 5,
          waterDaysCool: template.waterDaysCool || 4,
          season: s,
          potMaterial: sc.potMaterial,
          placement: sc.placement,
        });
        return { season: s, days };
      });
      return {
        ...sc,
        intervals,
      };
    });
  }, [template.waterDaysHot, template.waterDaysRainy, template.waterDaysCool]);

  return (
    <div className="space-y-8">
      {/* 1. Base 3-Season Water Intervals */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Droplets className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            {t("cms.care.base_title")}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            {t("cms.care.base_subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Hot Season */}
          <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 space-y-2">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-semibold text-sm">
              <Sun className="w-4 h-4 text-amber-500" />
              <span>{t("cms.care.hot")}</span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{t("cms.care.hot_hint")}</p>
            <div className="flex items-center gap-2 pt-1">
              <input
                type="number"
                min="1"
                max="30"
                value={template.waterDaysHot ?? 3}
                onChange={(e) => handleChange("waterDaysHot", parseInt(e.target.value) || 1)}
                className="w-20 px-3 py-2 text-center text-lg font-bold rounded-xl border border-amber-300 dark:border-amber-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[44px]"
              />
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">{t("cms.care.days_per_time")}</span>
            </div>
          </div>

          {/* Rainy Season */}
          <div className="p-4 rounded-xl border border-sky-200 dark:border-sky-900/60 bg-sky-50/50 dark:bg-sky-950/20 space-y-2">
            <div className="flex items-center gap-2 text-sky-700 dark:text-sky-400 font-semibold text-sm">
              <CloudRain className="w-4 h-4 text-sky-500" />
              <span>{t("cms.care.rainy")}</span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{t("cms.care.rainy_hint")}</p>
            <div className="flex items-center gap-2 pt-1">
              <input
                type="number"
                min="1"
                max="30"
                value={template.waterDaysRainy ?? 5}
                onChange={(e) => handleChange("waterDaysRainy", parseInt(e.target.value) || 1)}
                className="w-20 px-3 py-2 text-center text-lg font-bold rounded-xl border border-sky-300 dark:border-sky-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-sky-500 min-h-[44px]"
              />
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">{t("cms.care.days_per_time")}</span>
            </div>
          </div>

          {/* Cool Season */}
          <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/20 space-y-2">
            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-semibold text-sm">
              <Snowflake className="w-4 h-4 text-indigo-500" />
              <span>{t("cms.care.cool")}</span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{t("cms.care.cool_hint")}</p>
            <div className="flex items-center gap-2 pt-1">
              <input
                type="number"
                min="1"
                max="30"
                value={template.waterDaysCool ?? 4}
                onChange={(e) => handleChange("waterDaysCool", parseInt(e.target.value) || 1)}
                className="w-20 px-3 py-2 text-center text-lg font-bold rounded-xl border border-indigo-300 dark:border-indigo-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
              />
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">{t("cms.care.days_per_time")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Live Calculation Preview Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              {t("cms.care.preview_title")}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              {t("cms.care.preview_subtitle")}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">{t("cms.care.col_pot")}</th>
                <th className="py-3 px-4">{t("cms.care.col_placement")}</th>
                <th className="py-3 px-4 text-center text-amber-600 dark:text-amber-400">{t("cms.care.col_hot")}</th>
                <th className="py-3 px-4 text-center text-sky-600 dark:text-sky-400">{t("cms.care.col_rainy")}</th>
                <th className="py-3 px-4 text-center text-indigo-600 dark:text-indigo-400">{t("cms.care.col_cool")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {previewData.map((row, idx) => (
                <tr key={idx} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition">
                  <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-zinc-100">
                    {t(row.potLabelKey)}
                  </td>
                  <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">
                    {t(row.placeLabelKey)}
                  </td>
                  {row.intervals.map((iv, i) => (
                    <td key={i} className="py-3 px-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        {t("cms.care.every_days", { days: iv.days })}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Additional Care Intervals */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
            {t("cms.care.extra_title")}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            {t("cms.care.extra_subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Fertilize */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              {t("cms.care.fertilize_days")}
            </label>
            <input
              type="number"
              min="1"
              value={template.fertilizeDays ?? ""}
              placeholder={t("cms.care.example", { value: 14 })}
              onChange={(e) =>
                handleChange("fertilizeDays", e.target.value ? parseInt(e.target.value) : null)
              }
              className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
            />
          </div>

          {/* Repot */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              {t("cms.care.repot_months")}
            </label>
            <input
              type="number"
              min="1"
              value={template.repotMonths ?? ""}
              placeholder={t("cms.care.example", { value: 12 })}
              onChange={(e) =>
                handleChange("repotMonths", e.target.value ? parseInt(e.target.value) : null)
              }
              className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
            />
          </div>

          {/* Prune */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              {t("cms.care.prune_days")}
            </label>
            <input
              type="number"
              min="1"
              value={template.pruneDays ?? ""}
              placeholder={t("cms.care.example", { value: 30 })}
              onChange={(e) =>
                handleChange("pruneDays", e.target.value ? parseInt(e.target.value) : null)
              }
              className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
            />
          </div>

          {/* Pest Check */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              {t("cms.care.pest_check_days")}
            </label>
            <input
              type="number"
              min="1"
              value={template.pestCheckDays ?? 14}
              placeholder="14"
              onChange={(e) =>
                handleChange("pestCheckDays", e.target.value ? parseInt(e.target.value) : 14)
              }
              className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
            />
          </div>
        </div>

        {/* Care Notes */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            {t("cms.care.notes")}
          </label>
          <textarea
            rows={3}
            value={template.notesTh ?? ""}
            onChange={(e) => handleChange("notesTh", e.target.value)}
            placeholder={t("cms.care.notes_placeholder")}
            className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
}
