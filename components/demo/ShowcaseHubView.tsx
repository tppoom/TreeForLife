"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles, Users } from "lucide-react";
import { isProductionMode } from "@/lib/config/app-mode";
import { ShowcaseHero } from "@/components/demo/ShowcaseHero";
import { Phase1Recap } from "@/components/demo/Phase1Recap";
import { PlantDoctorPrototype } from "@/components/demo/PlantDoctorPrototype";
import { GardenDesignerPrototype } from "@/components/demo/GardenDesignerPrototype";
import { AssistantChatPrototype } from "@/components/demo/AssistantChatPrototype";
import { BudgetRecommenderPrototype } from "@/components/demo/BudgetRecommenderPrototype";
import { QuoteRequestPrototype } from "@/components/demo/QuoteRequestPrototype";
import { CommunityBoardPrototype } from "@/components/demo/CommunityBoardPrototype";
import { MemberPointsPrototype } from "@/components/demo/MemberPointsPrototype";
import { ShopAnalyticsPrototype } from "@/components/demo/ShopAnalyticsPrototype";
import { useDemoCopy } from "@/lib/i18n/demo";

export interface ShowcaseHubViewProps {
  initialTab?: "all" | "phase1" | "phase2" | "phase3";
}

export function ShowcaseHubView({ initialTab }: ShowcaseHubViewProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const c = useDemoCopy().hub;
  const queryTab = searchParams?.get("tab") as ("all" | "phase1" | "phase2" | "phase3") | null;
  const [activeTab, setActiveTab] = useState<"all" | "phase1" | "phase2" | "phase3">(
    initialTab || (queryTab && ["all", "phase1", "phase2", "phase3"].includes(queryTab) ? queryTab : "all")
  );

  React.useEffect(() => {
    // If accessed while in production mode, redirect cleanly to homepage
    if (isProductionMode()) {
      router.replace("/");
    }
  }, [router]);

  if (isProductionMode()) {
    return null;
  }

  const showPhase1 = activeTab === "all" || activeTab === "phase1";
  const showPhase2 = activeTab === "all" || activeTab === "phase2";
  const showPhase3 = activeTab === "all" || activeTab === "phase3";

  return (
    <div className="min-h-screen bg-sand-50 dark:bg-forest-950 pb-24">
      <ShowcaseHero activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div id="showcase-content" className="space-y-16">
          {/* Phase 1: Core System (Live on Production) */}
          {showPhase1 && <Phase1Recap />}

          {showPhase1 && (showPhase2 || showPhase3) && (
            <hr className="border-t border-sand-200 dark:border-forest-800 my-12" />
          )}

          {/* Phase 2: AI Prototypes */}
          {showPhase2 && (
            <section id="phase2" className="space-y-8 scroll-mt-8">
              <div className="border-b border-sand-200 dark:border-forest-800 pb-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Phase 2 AI Suite</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-forest-900 dark:text-sand-50">
                  {c.phase2_title}
                </h2>
                <p className="text-sm sm:text-base text-sand-700 dark:text-sand-300 mt-1">
                  {c.phase2_desc}
                </p>
              </div>

              <div className="space-y-12">
                <PlantDoctorPrototype />
                <GardenDesignerPrototype />
                <AssistantChatPrototype />
                <BudgetRecommenderPrototype />
              </div>
            </section>
          )}

          {showPhase2 && showPhase3 && (
            <hr className="border-t border-sand-200 dark:border-forest-800 my-12" />
          )}

          {/* Phase 3: Community & Scale Prototypes */}
          {showPhase3 && (
            <section id="phase3" className="space-y-8 scroll-mt-8">
              <div className="border-b border-sand-200 dark:border-forest-800 pb-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-2">
                  <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Phase 3 Platform & Community</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-forest-900 dark:text-sand-50">
                  {c.phase3_title}
                </h2>
                <p className="text-sm sm:text-base text-sand-700 dark:text-sand-300 mt-1">
                  {c.phase3_desc}
                </p>
              </div>

              <div className="space-y-12">
                <QuoteRequestPrototype />
                <CommunityBoardPrototype />
                <MemberPointsPrototype />
                <ShopAnalyticsPrototype />
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
