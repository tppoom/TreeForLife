"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isProductionMode } from "@/lib/config/app-mode";
import { ShowcaseHero } from "@/components/demo/ShowcaseHero";

export default function DemoPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"all" | "phase1" | "phase2" | "phase3">("all");

  React.useEffect(() => {
    // If accessed while in production mode, redirect cleanly to homepage
    if (isProductionMode()) {
      router.replace("/");
    }
  }, [router]);

  if (isProductionMode()) {
    return null;
  }

  return (
    <main className="min-h-screen bg-sand-50 dark:bg-forest-950 pb-20">
      <ShowcaseHero activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div id="showcase-content" className="space-y-16">
          {/* Phase cards will be mounted here in subsequent tasks */}
        </div>
      </div>
    </main>
  );
}
