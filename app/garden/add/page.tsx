import React, { Suspense } from "react";
import { Metadata } from "next";
import { getDb } from "@/lib/db";
import { species, speciesMedia, careTemplates } from "@/db/schema";
import { eq, desc, asc, sql } from "drizzle-orm";
import { AddPlantWizard } from "@/components/garden/AddPlantWizard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "เพิ่มต้นไม้ใหม่เข้าสวน | TreeForLife",
  description: "ลงทะเบียนต้นไม้เพื่อสร้างตารางรดน้ำอัจฉริยะ 3 ฤดูกาลไทย",
};

export default async function AddPlantPage() {
  const db = await getDb();

  const rows = await db
    .select({
      id: species.id,
      nameTh: species.nameTh,
      nameEn: species.nameEn,
    })
    .from(species)
    .where(sql`${species.stockStatus} != 'hidden'`)
    .orderBy(asc(species.nameTh));

  const speciesIds = rows.map((r) => r.id);

  const [mediaRows, templateRows] = await Promise.all([
    db
      .select()
      .from(speciesMedia)
      .where(sql`${speciesMedia.speciesId} IN ${speciesIds}`)
      .orderBy(desc(speciesMedia.isPrimary)),
    db
      .select()
      .from(careTemplates)
      .where(sql`${careTemplates.speciesId} IN ${speciesIds}`),
  ]);

  const mediaMap = new Map<string, string>();
  for (const m of mediaRows) {
    if (!mediaMap.has(m.speciesId)) {
      mediaMap.set(m.speciesId, m.blobUrl);
    }
  }

  const templateMap = new Map<string, typeof templateRows[0]>();
  for (const t of templateRows) {
    templateMap.set(t.speciesId, t);
  }

  const availableSpecies = rows.map((s) => ({
    id: s.id,
    nameTh: s.nameTh,
    nameEn: s.nameEn,
    primaryImage: mediaMap.get(s.id) || "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=600&q=80",
    careTemplate: templateMap.get(s.id)
      ? {
          waterDaysHot: templateMap.get(s.id)!.waterDaysHot,
          waterDaysRainy: templateMap.get(s.id)!.waterDaysRainy,
          waterDaysCool: templateMap.get(s.id)!.waterDaysCool,
        }
      : null,
  }));

  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-stone-500">กำลังโหลด...</div>}>
      <AddPlantWizard availableSpecies={availableSpecies} />
    </Suspense>
  );
}

