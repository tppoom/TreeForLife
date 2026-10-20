import { describe, it, expect, vi } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import { SpeciesEditorClient } from "../components/admin/SpeciesEditorClient";
import { SpeciesCareEditor } from "../components/admin/SpeciesCareEditor";
import { SpeciesMediaManager } from "../components/admin/SpeciesMediaManager";
import { AdminSpeciesListClient } from "../components/admin/AdminSpeciesListClient";
import { NewSpeciesWizardClient } from "../components/admin/NewSpeciesWizardClient";
import { AppContextProvider } from "../lib/context/AppContext";

const render = (el: React.ReactElement) => renderToString(<AppContextProvider>{el}</AppContextProvider>);

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

describe("Admin Species UI Components", () => {
  const mockSpecies = {
    id: "11111111-1111-1111-1111-111111111111",
    nameTh: "มอนสเตอร่า",
    nameEn: "Monstera Deliciosa",
    nameSci: "Monstera deliciosa Liebm.",
    family: "Araceae",
    slug: "monstera-deliciosa",
    difficulty: 2,
    light: "indoor_bright",
    waterNeed: "medium",
    placement: ["indoor", "balcony"],
    matureSize: "lg",
    matureHeightCm: 150,
    growthRate: "medium",
    soilMix: "กาบมะพร้าวสับ ใบก้ามปู เพอร์ไลต์",
    shopNote: "ต้นไม้ฟอกอากาศยอดนิยม เลี้ยงง่ายในบ้าน",
    summary: "ราชินีไม้ใบ ใบฉลุสวยงาม",
    stockStatus: "in_stock",
    aliases: ["พลูฉีก", "มอน"],
    publishedAt: new Date("2026-01-01T00:00:00Z"),
    media: [
      {
        id: "media-1",
        speciesId: "11111111-1111-1111-1111-111111111111",
        blobUrl: "https://example.com/photo.webp",
        altTh: "มอนสเตอร่าในกระถางดินเผา",
        isPrimary: true,
        sortOrder: 0,
        credit: "ถ่ายที่ร้าน",
      },
    ],
    careTemplate: {
      speciesId: "11111111-1111-1111-1111-111111111111",
      waterDaysHot: 2,
      waterDaysRainy: 4,
      waterDaysCool: 3,
      fertilizeDays: 14,
      fertilizePauseMonths: [12, 1],
      repotMonths: 12,
      pruneDays: 30,
      pestCheckDays: 14,
      notesTh: "เช็ดใบเดือนละครั้งเพื่อสังเกตไรแดง",
    },
    problems: [
      {
        id: "prob-1",
        speciesId: "11111111-1111-1111-1111-111111111111",
        symptomTh: "ใบเหลืองโคนต้น",
        causeTh: "รดน้ำถี่เกินไป ดินระบายน้ำไม่ทัน",
        fixTh: "เว้นช่วงรดน้ำให้ผิวดินแห้ง 2-3 นิ้วก่อนรดน้ำรอบถัดไป",
        severity: "medium",
        sortOrder: 0,
      },
    ],
  };

  it("renders SpeciesEditorClient with 4 tabs and sticky header", () => {
    const html = render(<SpeciesEditorClient initialSpecies={mockSpecies as any} />);
    expect(html).toContain("ข้อมูลทั่วไป");
    expect(html).toContain("รูปภาพ");
    expect(html).toContain("สูตรดูแล 3 ฤดู");
    expect(html).toContain("ปัญหาพบบ่อย");
    expect(html).toContain("มอนสเตอร่า");
    expect(html).toContain("ดูหน้าร้าน");
    expect(html).toContain("บันทึกแล้ว");
  });

  it("renders SpeciesCareEditor with 3 seasons and live calculation preview table", () => {
    const html = render(
      <SpeciesCareEditor
        careTemplate={mockSpecies.careTemplate as any}
        onChange={() => {}}
      />
    );
    expect(html).toContain("ฤดูร้อน");
    expect(html).toContain("ฤดูฝน");
    expect(html).toContain("ฤดูหนาว");
    expect(html).toContain("ตารางคำนวณรอบรดน้ำจำลอง");
    expect(html).toContain("ดินเผา");
    expect(html).toContain("พลาสติก");
  });

  it("renders SpeciesMediaManager with uploaded photos and add button", () => {
    const html = render(
      <SpeciesMediaManager
        speciesId={mockSpecies.id}
        media={mockSpecies.media as any}
        onMediaChange={() => {}}
      />
    );
    expect(html).toContain("มอนสเตอร่าในกระถางดินเผา");
    expect(html).toContain("เพิ่มรูปภาพ");
    expect(html).toContain("ภาพหน้าปก");
  });

  it("renders AdminSpeciesListClient catalog list with add button and badges", () => {
    const html = render(
      <AdminSpeciesListClient
        initialSpecies={[
          {
            id: mockSpecies.id,
            slug: mockSpecies.slug,
            nameTh: mockSpecies.nameTh,
            nameEn: mockSpecies.nameEn,
            nameSci: mockSpecies.nameSci,
            stockStatus: "in_stock",
            publishedAt: mockSpecies.publishedAt,
            primaryImage: mockSpecies.media[0].blobUrl,
          },
          {
            id: "22222222-2222-2222-2222-222222222222",
            slug: "draft-plant",
            nameTh: "ต้นไม้ฉบับร่าง",
            nameEn: "Draft Plant",
            nameSci: "Plantus draftus",
            stockStatus: "seasonal",
            publishedAt: null,
          },
        ]}
      />
    );
    expect(html).toContain("คลังพันธุ์ไม้ (Catalog CMS)");
    expect(html).toContain("+ เพิ่มพันธุ์ใหม่");
    expect(html).toContain("มอนสเตอร่า");
    expect(html).toContain("ต้นไม้ฉบับร่าง");
    expect(html).toContain("เผยแพร่แล้ว");
    expect(html).toContain("ฉบับร่าง (Draft)");
  });

  it("renders NewSpeciesWizardClient creation wizard with copyFromId dropdown", () => {
    const html = render(
      <NewSpeciesWizardClient
        existingSpecies={[
          {
            id: mockSpecies.id,
            nameTh: mockSpecies.nameTh,
            nameEn: mockSpecies.nameEn,
          },
        ]}
      />
    );
    expect(html).toContain("เพิ่มพันธุ์ไม้ใหม่ (New Species)");
    expect(html).toContain("ชื่อภาษาไทย");
    expect(html).toContain("ชื่อภาษาอังกฤษ");
    expect(html).toContain("URL Slug");
    expect(html).toContain("คัดลอกสูตรดูแลจากพันธุ์ไม้ต้นแบบ");
    expect(html).toContain("มอนสเตอร่า (Monstera Deliciosa)");
    expect(html).toContain("บันทึกและไปหน้าตัดแต่ง");
  });
});
