import React from "react";
import type { Metadata } from "next";
import { getDb } from "@/lib/db";
import { species, speciesMedia } from "@/db/schema";
import { desc, asc, inArray } from "drizzle-orm";
import { AdminSpeciesListClient } from "@/components/admin/AdminSpeciesListClient";

export const metadata: Metadata = {
  title: "คลังพันธุ์ไม้ (Species Catalog CMS) | TreeForLife Admin",
  description: "จัดการข้อมูลพันธุ์ไม้ สต็อกสินค้า สูตรดูแล และรูปภาพ",
};

export const dynamic = "force-dynamic";

export default async function AdminSpeciesListPage() {
  const db = await getDb();

  const speciesList = await db
    .select({
      id: species.id,
      slug: species.slug,
      nameTh: species.nameTh,
      nameEn: species.nameEn,
      nameSci: species.nameSci,
      stockStatus: species.stockStatus,
      publishedAt: species.publishedAt,
      createdAt: species.createdAt,
    })
    .from(species)
    .orderBy(desc(species.createdAt));

  const speciesIds = speciesList.map((s) => s.id);
  const mediaRows =
    speciesIds.length > 0
      ? await db
          .select({
            speciesId: speciesMedia.speciesId,
            blobUrl: speciesMedia.blobUrl,
            isPrimary: speciesMedia.isPrimary,
          })
          .from(speciesMedia)
          .where(inArray(speciesMedia.speciesId, speciesIds))
          .orderBy(desc(speciesMedia.isPrimary), asc(speciesMedia.sortOrder))
      : [];

  const mediaMap = new Map<string, string>();
  for (const m of mediaRows) {
    if (!mediaMap.has(m.speciesId)) {
      mediaMap.set(m.speciesId, m.blobUrl);
    }
  }

  const items = speciesList.map((s) => ({
    ...s,
    primaryImage: mediaMap.get(s.id) || "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=400&q=80",
  }));

  return <AdminSpeciesListClient initialSpecies={items} />;
}
