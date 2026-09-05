import React from "react";
import { Metadata } from "next";
import { getAdminStats, getAdminInquiriesList, getAdminSearchMisses } from "@/lib/services/adminService";
import { getSpeciesList } from "@/lib/services/speciesService";
import { AdminDashboardClient } from "@/components/admin/AdminDashboardClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ระบบหลังบ้านร้าน | TreeForLife",
  description: "จัดการสต็อกพันธุ์ไม้ ตรวจสอบรหัสถามร้าน และดูคำค้นที่ไม่เจอผลลัพธ์",
};

export default async function AdminPage() {
  const [stats, species, inquiries, misses] = await Promise.all([
    getAdminStats(),
    getSpeciesList({ stockStatus: "all" }),
    getAdminInquiriesList(50),
    getAdminSearchMisses(50),
  ]);

  return (
    <AdminDashboardClient
      stats={stats}
      initialSpecies={species}
      initialInquiries={inquiries}
      initialMisses={misses}
    />
  );
}
