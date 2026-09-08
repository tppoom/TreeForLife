import React from "react";
import type { Metadata } from "next";
import { TodayTasksClient } from "@/components/today/TodayTasksClient";

export const metadata: Metadata = {
  title: "งานดูแลวันนี้ (Today's Tasks) & Checklist | TreeForLife",
  description:
    "รายการงานดูแลต้นไม้ประจำวัน งานที่เลยกำหนดและงานที่ต้องทำวันนี้ พร้อมฟังก์ชันทำครบในคลิกเดียว เลื่อน และข้ามรอบ",
};

export default function TodayPage() {
  return <TodayTasksClient />;
}
