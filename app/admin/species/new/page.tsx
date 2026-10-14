import React from "react";
import type { Metadata } from "next";
import { getDb } from "@/lib/db";
import { species } from "@/db/schema";
import { asc } from "drizzle-orm";
import { NewSpeciesWizardClient } from "@/components/admin/NewSpeciesWizardClient";

export const metadata: Metadata = {
  title: "เพิ่มพันธุ์ไม้ใหม่ (New Species) | TreeForLife Admin",
  description: "สร้างพันธุ์ไม้ใหม่และคัดลอกสูตรการดูแล",
};

export const dynamic = "force-dynamic";

export default async function NewSpeciesPage() {
  const db = await getDb();

  const existingSpecies = await db
    .select({
      id: species.id,
      nameTh: species.nameTh,
      nameEn: species.nameEn,
    })
    .from(species)
    .orderBy(asc(species.nameTh));

  return <NewSpeciesWizardClient existingSpecies={existingSpecies} />;
}
