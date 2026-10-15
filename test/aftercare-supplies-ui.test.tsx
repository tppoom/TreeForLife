import { describe, it, expect, vi } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import { SuppliesNudgeCard } from "@/components/care/SuppliesNudgeCard";
import { AftercareCheckinBanner } from "@/components/care/AftercareCheckinBanner";
import { AppContextProvider } from "@/lib/context/AppContext";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/today",
  useSearchParams: () => new URLSearchParams(),
}));

describe("SuppliesNudgeCard (F08)", () => {
  it("renders repot suggestion with pot upsize (+2 inches)", () => {
    const html = renderToString(
      <AppContextProvider>
        <SuppliesNudgeCard
          userPlantId="plant-1"
          plantNickname="น้องมอน"
          speciesName="มอนสเตอร่า เดลิซิโอซา"
          potSizeInch={8}
          soilMix="กาบมะพร้าวสับ + เพอร์ไลท์"
        />
      </AppContextProvider>
    );

    expect(html).toContain("อุปกรณ์แนะนำสำหรับ");
    expect(html).toContain("น้องมอน");
    expect(html).toContain("แนะนำ 10&quot;");
    expect(html).toContain("สั่งกระถาง &amp; ดินสูตรร้านทาง LINE");
  });

  it("does not render when dismissed", () => {
    const html = renderToString(
      <AppContextProvider>
        <SuppliesNudgeCard
          userPlantId="plant-1"
          plantNickname="น้องมอน"
          speciesName="มอนสเตอร่า เดลิซิโอซา"
          potSizeInch={8}
          nudgeDismissedAt={new Date()}
        />
      </AppContextProvider>
    );

    expect(html).not.toContain("อุปกรณ์แนะนำสำหรับ น้องมอน");
  });
});

describe("AftercareCheckinBanner (F06)", () => {
  it("renders null initially before checkins are loaded", () => {
    const html = renderToString(
      <AppContextProvider>
        <AftercareCheckinBanner />
      </AppContextProvider>
    );

    // Initial server-side render has no checkins loaded
    expect(html).toBe("");
  });
});
