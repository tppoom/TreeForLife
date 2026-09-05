import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getUserPlantById } from "@/lib/services/gardenService";
import { PlantGardenDetailClient } from "@/components/garden/PlantGardenDetailClient";

interface PlantGardenPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: PlantGardenPageProps): Promise<Metadata> {
  const { id } = await params;
  const plant = await getUserPlantById(id);

  if (!plant) {
    return { title: "ไม่พบข้อมูลต้นไม้ | TreeForLife" };
  }

  return {
    title: `${plant.nickname} — สวนของฉัน | TreeForLife`,
    description: `ตารางดูแลและประวัติการรดน้ำของ ${plant.nickname}`,
  };
}

export default async function PlantGardenPage({ params }: PlantGardenPageProps) {
  const { id } = await params;
  const plant = await getUserPlantById(id);

  if (!plant) {
    notFound();
  }

  return <PlantGardenDetailClient plant={plant as any} />;
}
