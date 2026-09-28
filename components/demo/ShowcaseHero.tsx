import React from "react";
import { Sparkles } from "lucide-react";

export interface ShowcaseHeroProps {
  activeTab: "all" | "phase1" | "phase2" | "phase3";
  onTabChange: (tab: "all" | "phase1" | "phase2" | "phase3") => void;
}

export function ShowcaseHero({ activeTab, onTabChange }: ShowcaseHeroProps) {
  const tabs = [
    { id: "all", label: "ทั้งหมด (All Phases)" },
    { id: "phase1", label: "Phase 1: ระบบหลัก" },
    { id: "phase2", label: "Phase 2: AI อัจฉริยะ" },
    { id: "phase3", label: "Phase 3: ชุมชน & เติบโต" },
  ] as const;

  return (
    <section className="bg-gradient-to-b from-sand-100 to-sand-50 dark:from-forest-900 dark:to-forest-950 py-12 px-4 sm:px-6 lg:px-8 border-b border-sand-200 dark:border-forest-800">
      <div className="max-w-6xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Interactive All-Phases Prototype</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-forest-900 dark:text-sand-50 tracking-tight">
          🌿 TreeForLife Experience Hub
        </h1>
        <p className="max-w-2xl mx-auto text-base sm:text-lg text-sand-700 dark:text-sand-300">
          ภาพรวมโครงการครบทุกเฟสของร้านต้นไม้ ทดลองสัมผัสประสบการณ์ฟีเจอร์ AI และระบบการดูแลต้นไม้อัจฉริยะล่วงหน้าได้ในหน้าเดียว
        </p>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition min-h-[44px] ${
                activeTab === tab.id
                  ? "bg-forest-800 text-sand-50 shadow-md dark:bg-emerald-700"
                  : "bg-white dark:bg-forest-800/60 text-forest-800 dark:text-sand-200 hover:bg-sand-100 dark:hover:bg-forest-700 border border-sand-200 dark:border-forest-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
