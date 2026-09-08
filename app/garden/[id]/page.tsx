import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getUserPlantById } from "@/lib/services/gardenService";
import { PlantGardenDetailClient } from "@/components/garden/PlantGardenDetailClient";

export const dynamic = "force-dynamic";

interface GardenPlantDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: GardenPlantDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const plant = await getUserPlantById(id);

  if (!plant || !plant.isActive) {
    return {
      title: "ไม่พบต้นไม้ | Plant Not Found | TreeForLife",
    };
  }

  const speciesName = plant.speciesNameTh || plant.customSpeciesName || "ต้นไม้ในสวน";
  return {
    title: `${plant.nickname} (${speciesName}) | ปฏิทินดูแล 30 วัน & บันทึกสุขภาพ | TreeForLife`,
    description: `ตารางรดน้ำและปฏิทินดูแล 30 วันสำหรับ ${plant.nickname}. คำนวณตาม 3 ฤดูไทย ขนาดกระถาง ${plant.potSizeInch} นิ้ว`,
  };
}

export default async function GardenPlantDetailPage({
  params,
}: GardenPlantDetailPageProps) {
  const { id } = await params;
  if (!id) {
    notFound();
  }

  const plant = await getUserPlantById(id);
  if (!plant || !plant.isActive) {
    notFound();
  }

  return <PlantGardenDetailClient initialPlant={plant} />;
}
