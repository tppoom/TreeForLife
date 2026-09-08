import React, { Suspense } from "react";
import type { Metadata } from "next";
import { getDb } from "@/lib/db";
import { species, speciesMedia, careTemplates } from "@/db/schema";
import { eq, asc, desc, sql } from "drizzle-orm";
import { AddPlantWizard, AvailableSpeciesOption } from "@/components/garden/AddPlantWizard";

export const metadata: Metadata = {
  title: "เพิ่มต้นไม้ใหม่ (Add Plant Wizard) | TreeForLife",
  description:
    "เพิ่มต้นไม้เข้าสู่สวนของคุณ พร้อมสูตรคำนวณรอบรดน้ำแบบเรียลไทม์ตาม 3 ฤดูกาลไทยและสภาพแวดล้อมกระถางจริง",
};

export default async function AddPlantPage() {
  const db = await getDb();

  const speciesRows = await db
    .select({
      id: species.id,
      nameTh: species.nameTh,
      nameEn: species.nameEn,
      nameSci: species.nameSci,
      slug: species.slug,
      waterDaysHot: careTemplates.waterDaysHot,
      waterDaysRainy: careTemplates.waterDaysRainy,
      waterDaysCool: careTemplates.waterDaysCool,
      fertilizeDays: careTemplates.fertilizeDays,
    })
    .from(species)
    .leftJoin(careTemplates, eq(species.id, careTemplates.speciesId))
    .where(sql`${species.stockStatus} != 'hidden'`)
    .orderBy(asc(species.nameTh));

  const speciesIds = speciesRows.map((s) => s.id);
  const mediaRows =
    speciesIds.length > 0
      ? await db
          .select()
          .from(speciesMedia)
          .where(sql`${speciesMedia.speciesId} IN ${speciesIds}`)
          .orderBy(desc(speciesMedia.isPrimary), asc(speciesMedia.sortOrder))
      : [];

  const mediaMap = new Map<string, string>();
  for (const m of mediaRows) {
    if (!mediaMap.has(m.speciesId)) {
      mediaMap.set(m.speciesId, m.blobUrl);
    }
  }

  const availableSpecies: AvailableSpeciesOption[] = speciesRows.map((s) => ({
    id: s.id,
    nameTh: s.nameTh,
    nameEn: s.nameEn,
    nameSci: s.nameSci || undefined,
    slug: s.slug,
    primaryImage:
      mediaMap.get(s.id) ||
      "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=600&q=80",
    careTemplate: {
      waterDaysHot: s.waterDaysHot ?? 3,
      waterDaysRainy: s.waterDaysRainy ?? 5,
      waterDaysCool: s.waterDaysCool ?? 7,
      fertilizeDays: s.fertilizeDays ?? 30,
    },
  }));

  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-140px)] flex items-center justify-center bg-sand-50 dark:bg-forest-950">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-forest-800 dark:border-forest-200" />
        </div>
      }
    >
      <AddPlantWizard availableSpecies={availableSpecies} />
    </Suspense>
  );
}
