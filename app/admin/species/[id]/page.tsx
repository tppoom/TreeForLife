import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSpeciesById } from "@/lib/services/speciesService";
import { SpeciesEditorClient } from "@/components/admin/SpeciesEditorClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const item = await getSpeciesById(id);

  if (!item) {
    return {
      title: "ไม่พบพันธุ์ไม้ | TreeForLife Admin",
    };
  }

  return {
    title: `แก้ไข ${item.nameTh} (${item.nameEn}) | TreeForLife Admin`,
    description: `ระบบตัดแต่งพันธุ์ไม้ ${item.nameTh} จัดการภาพถ่าย สูตรดูแล และปัญหาที่พบบ่อย`,
  };
}

export const dynamic = "force-dynamic";

export default async function AdminSpeciesEditPage({ params }: PageProps) {
  const { id } = await params;
  const fullSpecies = await getSpeciesById(id);

  if (!fullSpecies) {
    notFound();
  }

  return <SpeciesEditorClient initialSpecies={fullSpecies as any} />;
}
