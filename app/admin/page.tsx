import React from "react";
import type { Metadata } from "next";
import { getAllSpecies } from "@/lib/services/speciesService";
import {
  getAdminInquiriesList,
  getSearchMisses,
  getAdminStats,
} from "@/lib/services/adminService";
import { AdminDashboardClient } from "@/components/admin/AdminDashboardClient";

export const metadata: Metadata = {
  title: "ระบบจัดการร้าน (Shop Admin Dashboard) | TreeForLife",
  description:
    "ระบบจัดการหลังร้านสำหรับทีมงาน TreeForLife จัดการสต็อกสินค้า ตรวจสอบคำถามลูกค้า และวิเคราะห์สถิติความต้องการ",
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [speciesList, inquiries, searchMisses, stats] = await Promise.all([
    getAllSpecies({ stockStatus: "all" }),
    getAdminInquiriesList(100),
    getSearchMisses(100),
    getAdminStats(),
  ]);

  return (
    <AdminDashboardClient
      initialSpecies={speciesList}
      initialInquiries={inquiries}
      initialSearchMisses={searchMisses}
      initialStats={stats}
    />
  );
}
