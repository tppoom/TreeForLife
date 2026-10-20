"use client";

import React, { useState } from "react";
import {
  Stethoscope,
  Activity,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Leaf,
  ShieldAlert,
  Info,
} from "lucide-react";
import { useDemoCopy, fill } from "@/lib/i18n/demo";
import { doctorTh } from "@/lib/i18n/demo/doctor";

export interface DiagnosticPreset {
  id: string;
  name: string;
  speciesNameTh: string;
  speciesNameEn: string;
  symptomTitle: string;
  symptomSummary: string;
  environmentInfo: string;
  diagnosis: {
    diseaseNameTh: string;
    diseaseNameEn: string;
    severity: "low" | "medium" | "high";
    severityLabel: string;
    cause: string;
    actionPlan: string[];
    organicRemedy: string;
    preventativeTips: string;
  };
}

export const DIAGNOSTIC_PRESETS: DiagnosticPreset[] = doctorTh.presets;

export interface PlantDoctorPrototypeProps {
  initialPresetId?: string;
  initialState?: "idle" | "analyzing" | "diagnosed";
  scanDurationMs?: number;
}

export function PlantDoctorPrototype({
  initialPresetId = "monstera",
  initialState = "idle",
  scanDurationMs = 500,
}: PlantDoctorPrototypeProps) {
  const c = useDemoCopy().doctor;
  const presets: DiagnosticPreset[] = c.presets;
  const [selectedPresetId, setSelectedPresetId] = useState(initialPresetId);
  const [status, setStatus] = useState<"idle" | "analyzing" | "diagnosed">(initialState);

  const selectedPreset =
    presets.find((p) => p.id === selectedPresetId) || presets[0];

  const handleStartAnalysis = () => {
    if (scanDurationMs === 0) {
      setStatus("diagnosed");
      return;
    }
    setStatus("analyzing");
    setTimeout(() => {
      setStatus("diagnosed");
    }, scanDurationMs);
  };

  const handleReset = () => {
    setStatus("idle");
  };

  const getSeverityBadgeClass = (severity: "low" | "medium" | "high") => {
    switch (severity) {
      case "low":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
      case "medium":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800";
      case "high":
        return "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 border-rose-200 dark:border-rose-800";
    }
  };

  return (
    <div className="rounded-2xl border border-sand-200 dark:border-forest-800 bg-white dark:bg-forest-900 shadow-soft overflow-hidden">
      {/* Prototype Header */}
      <div className="p-5 sm:p-6 border-b border-sand-200 dark:border-forest-800 bg-sand-50/50 dark:bg-forest-950/40">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-medium">
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Phase 2 AI Prototype</span>
            </div>
            <h3 className="text-xl font-bold font-serif text-forest-900 dark:text-sand-100">
              {c.title}
            </h3>
            <p className="text-xs sm:text-sm text-sand-700 dark:text-sand-300">
              {c.subtitle}
            </p>
          </div>
          {status === "diagnosed" && (
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-sand-100 dark:bg-forest-800 text-forest-850 dark:text-sand-200 hover:bg-sand-200 dark:hover:bg-forest-700 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{c.reset}</span>
            </button>
          )}
        </div>

        {/* Preset Selector */}
        <div className="mt-4">
          <label className="block text-xs font-semibold text-sand-700 dark:text-sand-300 mb-2">
            {c.pick_case}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {presets.map((preset) => {
              const isSelected = preset.id === selectedPreset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => {
                    setSelectedPresetId(preset.id);
                    setStatus("idle");
                  }}
                  className={`text-left p-3 rounded-xl border text-xs transition ${
                    isSelected
                      ? "border-forest-600 bg-forest-50/70 dark:bg-forest-800/80 dark:border-emerald-500 font-medium text-forest-900 dark:text-sand-100 ring-2 ring-forest-500/20"
                      : "border-sand-200 dark:border-forest-800 bg-white dark:bg-forest-900/60 text-sand-800 dark:text-sand-300 hover:bg-sand-50 dark:hover:bg-forest-800/40"
                  }`}
                >
                  <div className="font-semibold">{preset.name}</div>
                  <div className="text-[11px] text-sand-600 dark:text-sand-400 mt-0.5 truncate">
                    {preset.speciesNameTh}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="p-5 sm:p-6 space-y-6">
        {/* Symptom & Observation Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-sand-200 dark:border-forest-800 p-4 bg-sand-50/30 dark:bg-forest-950/20 relative overflow-hidden">
            {status === "analyzing" && (
              <div className="absolute inset-0 bg-emerald-500/10 dark:bg-emerald-400/15 pointer-events-none z-10 flex flex-col justify-center items-center backdrop-blur-[1px] animate-pulse">
                <div className="w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-lg shadow-emerald-400/50" />
                <div className="mt-3 inline-flex items-center gap-2 bg-forest-900/80 text-sand-50 px-3 py-1 rounded-full text-xs font-medium">
                  <Activity className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                  <span>{c.scanning}</span>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2 text-forest-800 dark:text-sand-200 font-semibold text-sm mb-2">
              <Leaf className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{c.observed}</span>
            </div>
            <div className="space-y-1.5 text-xs text-sand-800 dark:text-sand-200">
              <p>
                <strong className="text-forest-900 dark:text-sand-100">{c.species}</strong>{" "}
                {selectedPreset.speciesNameTh} ({selectedPreset.speciesNameEn})
              </p>
              <p>
                <strong className="text-forest-900 dark:text-sand-100">{c.symptoms}</strong>{" "}
                {selectedPreset.symptomSummary}
              </p>
              <p>
                <strong className="text-forest-900 dark:text-sand-100">{c.environment}</strong>{" "}
                {selectedPreset.environmentInfo}
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-center items-center p-6 rounded-xl border border-dashed border-sand-300 dark:border-forest-700 bg-sand-50/20 dark:bg-forest-950/10 text-center">
            {status === "idle" && (
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center mx-auto text-emerald-700 dark:text-emerald-300">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-semibold text-sm text-forest-900 dark:text-sand-100">
                    {c.ready_title}
                  </h4>
                  <p className="text-xs text-sand-600 dark:text-sand-400 max-w-xs">
                    {c.ready_desc}
                  </p>
                </div>
                <button
                  role="button"
                  onClick={handleStartAnalysis}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-sand-50 text-xs sm:text-sm font-semibold shadow-soft transition"
                >
                  <Activity className="w-4 h-4" />
                  <span>{c.analyze}</span>
                </button>
              </div>
            )}

            {status === "analyzing" && (
              <div className="space-y-3 py-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center mx-auto text-emerald-700 dark:text-emerald-300 animate-spin">
                  <RefreshCw className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-semibold text-sm text-forest-900 dark:text-sand-100">
                    {c.processing_title}
                  </h4>
                  <p className="text-xs text-sand-600 dark:text-sand-400">
                    {c.processing_desc}
                  </p>
                </div>
              </div>
            )}

            {status === "diagnosed" && (
              <div className="space-y-2 text-center py-2">
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h4 className="font-semibold text-sm text-forest-900 dark:text-sand-100">
                  {c.done_title}
                </h4>
                <p className="text-xs text-sand-600 dark:text-sand-400">
                  {c.done_desc}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Formatted Diagnostic Result Card */}
        {status === "diagnosed" && (
          <div className="rounded-xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/40 dark:bg-forest-950/60 p-5 sm:p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-emerald-200/60 dark:border-emerald-800/60">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h4 className="text-base font-bold text-forest-950 dark:text-sand-50">
                  {c.result_title}
                </h4>
              </div>
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${getSeverityBadgeClass(
                  selectedPreset.diagnosis.severity
                )}`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{fill(c.severity, { label: selectedPreset.diagnosis.severityLabel })}</span>
              </div>
            </div>

            {/* Disease Name & Cause */}
            <div className="space-y-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-forest-800 dark:text-emerald-400">
                  {c.disease}
                </span>
                <h5 className="text-lg font-bold text-forest-900 dark:text-sand-100">
                  {selectedPreset.diagnosis.diseaseNameTh}{" "}
                  <span className="text-xs sm:text-sm font-normal text-sand-700 dark:text-sand-300">
                    ({selectedPreset.diagnosis.diseaseNameEn})
                  </span>
                </h5>
              </div>
              <div className="text-xs sm:text-sm text-sand-800 dark:text-sand-200 bg-white/70 dark:bg-forest-900/60 p-3 rounded-lg border border-emerald-100 dark:border-forest-800">
                <strong className="text-forest-950 dark:text-sand-100">{c.cause}</strong>
                {selectedPreset.diagnosis.cause}
              </div>
            </div>

            {/* 3-Step Action Plan */}
            <div className="space-y-2">
              <h5 className="text-xs sm:text-sm font-bold text-forest-900 dark:text-sand-100 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{c.action_plan}</span>
              </h5>
              <div className="grid grid-cols-1 gap-2">
                {selectedPreset.diagnosis.actionPlan.map((step, index) => (
                  <div
                    key={index}
                    className="p-2.5 rounded-lg bg-white/80 dark:bg-forest-900/80 border border-sand-200 dark:border-forest-800 text-xs sm:text-sm text-forest-900 dark:text-sand-100"
                  >
                    {step}
                  </div>
                ))}
              </div>
            </div>

            {/* Organic Remedy */}
            <div className="rounded-lg bg-emerald-100/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-3 text-xs sm:text-sm">
              <div className="flex items-start gap-2">
                <Leaf className="w-4 h-4 text-emerald-700 dark:text-emerald-300 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-emerald-900 dark:text-emerald-200">
                    {c.organic}
                  </strong>
                  <span className="text-forest-900 dark:text-sand-100">
                    {selectedPreset.diagnosis.organicRemedy}
                  </span>
                </div>
              </div>
            </div>

            {/* Prevention tips */}
            <div className="text-xs text-sand-600 dark:text-sand-400 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span>{fill(c.prevention, { tips: selectedPreset.diagnosis.preventativeTips })}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
