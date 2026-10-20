"use client";

import React, { useState } from "react";
import {
  Sun,
  Droplet,
  Compass,
  Sparkles,
  Layers,
  ChevronRight,
  Maximize2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { useDemoCopy, fill } from "@/lib/i18n/demo";

export interface SpaceOption {
  id: "living-room" | "balcony";
  title: string;
  subtitle: string;
  lightingDetail: string;
  airflowDetail: string;
  dimension: string;
}

export interface SpeciesOption {
  id: "monstera-albo" | "ficus-lyrata" | "sansevieria";
  nameTh: string;
  nameEn: string;
  styleTag: string;
}

export interface DesignAssessment {
  lightMatchPercent: number;
  lightStatusLabel: string;
  potSizeRecommended: string;
  potTypeRecommended: string;
  advice: string;
  isHighCompatibility: boolean;
}

const SPACE_IDS: SpaceOption["id"][] = ["living-room", "balcony"];

const SPECIES_META: Array<Pick<SpeciesOption, "id" | "nameEn" | "styleTag">> = [
  { id: "monstera-albo", nameEn: "Monstera Albo Variegata", styleTag: "Tropical Luxury" },
  { id: "ficus-lyrata", nameEn: "Ficus Lyrata", styleTag: "Scandinavian Elegance" },
  { id: "sansevieria", nameEn: "Sansevieria Trifasciata", styleTag: "Modern Minimalist" },
];

// Scores are language-independent; the copy for each pairing lives in lib/i18n/demo/designer.ts
const LIGHT_MATCH: Record<string, Record<string, { lightMatchPercent: number; isHighCompatibility: boolean }>> = {
  "living-room": {
    "monstera-albo": { lightMatchPercent: 92, isHighCompatibility: true },
    "ficus-lyrata": { lightMatchPercent: 72, isHighCompatibility: false },
    sansevieria: { lightMatchPercent: 98, isHighCompatibility: true },
  },
  balcony: {
    "monstera-albo": { lightMatchPercent: 45, isHighCompatibility: false },
    "ficus-lyrata": { lightMatchPercent: 96, isHighCompatibility: true },
    sansevieria: { lightMatchPercent: 90, isHighCompatibility: true },
  },
};

export interface GardenDesignerPrototypeProps {
  initialSpace?: "living-room" | "balcony";
  initialSpecies?: "monstera-albo" | "ficus-lyrata" | "sansevieria";
}

export function GardenDesignerPrototype({
  initialSpace = "living-room",
  initialSpecies = "monstera-albo",
}: GardenDesignerPrototypeProps) {
  const [selectedSpaceId, setSelectedSpaceId] = useState<"living-room" | "balcony">(initialSpace);
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<
    "monstera-albo" | "ficus-lyrata" | "sansevieria"
  >(initialSpecies);
  const [sliderPosition, setSliderPosition] = useState<number>(50);

  const c = useDemoCopy().designer;
  const SPACES: SpaceOption[] = SPACE_IDS.map((id) => ({ id, ...c.spaces[id] }));
  const SPECIES: SpeciesOption[] = SPECIES_META.map((sp) => ({ ...sp, nameTh: c.species[sp.id] }));

  const selectedSpace = SPACES.find((s) => s.id === selectedSpaceId) || SPACES[0];
  const selectedSpecies = SPECIES.find((sp) => sp.id === selectedSpeciesId) || SPECIES[0];
  const assessment: DesignAssessment = {
    ...(c.assessments[selectedSpaceId]?.[selectedSpeciesId] || c.fallback),
    ...(LIGHT_MATCH[selectedSpaceId]?.[selectedSpeciesId] || { lightMatchPercent: 80, isHighCompatibility: true }),
  };

  return (
    <div className="rounded-2xl border border-sand-200 dark:border-forest-800 bg-white dark:bg-forest-900 shadow-soft overflow-hidden">
      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-sand-200 dark:border-forest-800 bg-sand-50/50 dark:bg-forest-950/40">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-medium mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Phase 2 AI Prototype</span>
        </div>
        <h3 className="text-xl font-bold font-serif text-forest-900 dark:text-sand-100">
          {c.title}
        </h3>
        <p className="text-xs sm:text-sm text-sand-700 dark:text-sand-300">
          {c.subtitle}
        </p>

        {/* Space Selector */}
        <div className="mt-4 space-y-2">
          <label className="block text-xs font-semibold text-sand-700 dark:text-sand-300">
            {c.step_space}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SPACES.map((space) => {
              const isSelected = space.id === selectedSpace.id;
              return (
                <button
                  key={space.id}
                  onClick={() => setSelectedSpaceId(space.id)}
                  className={`text-left p-3 rounded-xl border text-xs transition ${
                    isSelected
                      ? "border-forest-600 bg-forest-50/70 dark:bg-forest-800/80 dark:border-emerald-500 font-medium text-forest-900 dark:text-sand-100 ring-2 ring-forest-500/20"
                      : "border-sand-200 dark:border-forest-800 bg-white dark:bg-forest-900/60 text-sand-800 dark:text-sand-300 hover:bg-sand-50 dark:hover:bg-forest-800/40"
                  }`}
                >
                  <div className="font-semibold">{space.title}</div>
                  <div className="text-[11px] text-sand-600 dark:text-sand-400 mt-0.5">
                    {space.subtitle}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Species Selector */}
        <div className="mt-4 space-y-2">
          <label className="block text-xs font-semibold text-sand-700 dark:text-sand-300">
            {c.step_species}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {SPECIES.map((sp) => {
              const isSelected = sp.id === selectedSpecies.id;
              return (
                <button
                  key={sp.id}
                  onClick={() => setSelectedSpeciesId(sp.id)}
                  className={`text-left p-3 rounded-xl border text-xs transition ${
                    isSelected
                      ? "border-forest-600 bg-forest-50/70 dark:bg-forest-800/80 dark:border-emerald-500 font-medium text-forest-900 dark:text-sand-100 ring-2 ring-forest-500/20"
                      : "border-sand-200 dark:border-forest-800 bg-white dark:bg-forest-900/60 text-sand-800 dark:text-sand-300 hover:bg-sand-50 dark:hover:bg-forest-800/40"
                  }`}
                >
                  <div className="font-semibold">{sp.nameTh}</div>
                  <div className="text-[11px] text-sand-600 dark:text-sand-400 mt-0.5 truncate">
                    {sp.nameEn}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Interactive Stage: Before / After Visual */}
      <div className="p-5 sm:p-6 space-y-6">
        {/* Interactive Before / After Visual Box */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-sand-700 dark:text-sand-300">
            <span className="font-semibold flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-forest-700 dark:text-emerald-400" />
              <span>{c.compare_label}</span>
            </span>
            <span className="text-[11px] font-mono bg-sand-100 dark:bg-forest-800 px-2 py-0.5 rounded text-forest-800 dark:text-sand-200">
              {fill(c.after_percent, { percent: sliderPosition })}
            </span>
          </div>

          {/* Visual Container */}
          <div className="relative h-64 sm:h-72 rounded-xl overflow-hidden border border-sand-200 dark:border-forest-800 bg-sand-100 dark:bg-forest-950 select-none">
            {/* Before Layer (Underneath / Background) */}
            <div className="absolute inset-0 flex flex-col justify-center items-center p-6 bg-gradient-to-br from-sand-100 to-sand-200 dark:from-forest-950 dark:to-forest-900 text-center">
              <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-sand-400 dark:border-forest-700 flex items-center justify-center text-sand-500 dark:text-forest-600 mb-3">
                <Maximize2 className="w-8 h-8" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-sand-600 dark:text-forest-400">
                {c.before_badge}
              </span>
              <p className="text-sm font-semibold text-forest-900 dark:text-sand-200 mt-1">
                {selectedSpace.title}
              </p>
              <p className="text-xs text-sand-600 dark:text-sand-400 mt-0.5">
                {selectedSpace.dimension} · {selectedSpace.lightingDetail}
              </p>
            </div>

            {/* After Layer (Overlay with Clip-Path) */}
            <div
              className="absolute inset-0 flex flex-col justify-center items-center p-6 bg-gradient-to-br from-emerald-950 via-forest-900 to-forest-950 text-sand-50 text-center transition-all duration-75"
              style={{
                clipPath: `polygon(${100 - sliderPosition}% 0, 100% 0, 100% 100%, ${
                  100 - sliderPosition
                }% 100%)`,
              }}
            >
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 mb-3 shadow-elevated backdrop-blur-sm">
                <Sparkles className="w-8 h-8 text-emerald-400" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                {c.after_badge}
              </span>
              <p className="text-sm font-bold text-sand-100 mt-1">
                {selectedSpecies.nameTh} ({selectedSpecies.nameEn})
              </p>
              <p className="text-xs text-sand-300 mt-0.5">
                {fill(c.after_detail, { pot: assessment.potSizeRecommended, style: selectedSpecies.styleTag })}
              </p>
            </div>

            {/* Slider Divider Bar */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-white shadow-lg pointer-events-none z-10"
              style={{ left: `${100 - sliderPosition}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-forest-800 text-sand-50 border-2 border-white flex items-center justify-center text-[10px] font-bold shadow-md">
                ↔
              </div>
            </div>
          </div>

          {/* Interactive Slider Input */}
          <div className="space-y-2 pt-1">
            <input
              type="range"
              role="slider"
              aria-label={c.slider_label}
              min="0"
              max="100"
              value={sliderPosition}
              onChange={(e) => setSliderPosition(Number(e.target.value))}
              className="w-full accent-forest-700 dark:accent-emerald-500 h-2 bg-sand-200 dark:bg-forest-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between items-center text-[11px] text-sand-600 dark:text-sand-400">
              <button
                onClick={() => setSliderPosition(0)}
                className="hover:text-forest-900 dark:hover:text-sand-100 transition"
              >
                {c.view_before}
              </button>
              <button
                onClick={() => setSliderPosition(50)}
                className="font-medium hover:text-forest-900 dark:hover:text-sand-100 transition"
              >
                {c.view_half}
              </button>
              <button
                onClick={() => setSliderPosition(100)}
                className="hover:text-forest-900 dark:hover:text-sand-100 transition"
              >
                {c.view_after}
              </button>
            </div>
          </div>
        </div>

        {/* Environmental Suitability Rating Card */}
        <div className="rounded-xl border border-sand-200 dark:border-forest-800 bg-sand-50/40 dark:bg-forest-950/30 p-4 sm:p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-sand-200 dark:border-forest-800">
            <h4 className="text-sm font-bold text-forest-900 dark:text-sand-100 flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{c.suitability}</span>
            </h4>
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                assessment.isHighCompatibility
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                  : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
              }`}
            >
              {assessment.isHighCompatibility ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5" />
              )}
              <span>{fill(c.light_match, { percent: assessment.lightMatchPercent })}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-white dark:bg-forest-900 border border-sand-200 dark:border-forest-800 space-y-1">
              <div className="text-sand-600 dark:text-sand-400 flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-gold-500" />
                <span className="font-semibold text-forest-900 dark:text-sand-200">
                  {c.light_level}
                </span>
              </div>
              <p className="text-forest-800 dark:text-sand-300">{selectedSpace.lightingDetail}</p>
              <div className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 pt-1">
                {fill(c.verdict, { label: assessment.lightStatusLabel })}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-white dark:bg-forest-900 border border-sand-200 dark:border-forest-800 space-y-1">
              <div className="text-sand-600 dark:text-sand-400 flex items-center gap-1.5">
                <Droplet className="w-3.5 h-3.5 text-blue-500" />
                <span className="font-semibold text-forest-900 dark:text-sand-200">
                  {c.pot_size}
                </span>
              </div>
              <p className="text-forest-800 dark:text-sand-300 font-semibold">
                {assessment.potSizeRecommended}
              </p>
              <div className="text-[11px] text-sand-600 dark:text-sand-400 pt-1">
                {fill(c.pot_material, { material: assessment.potTypeRecommended })}
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 text-xs text-forest-900 dark:text-sand-200">
            <strong className="text-emerald-900 dark:text-emerald-300">
              {c.advice}
            </strong>
            {assessment.advice}
          </div>
        </div>
      </div>
    </div>
  );
}
