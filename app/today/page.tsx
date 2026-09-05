import React from "react";
import { Metadata } from "next";
import { TodayTasksClient } from "@/components/today/TodayTasksClient";

export const metadata: Metadata = {
  title: "ภารกิจประจำวันนี้ | TreeForLife",
  description: "บันทึกการรดน้ำและดูแลต้นไม้ประจำวันนี้อย่างรวดเร็วในคลิกเดียว",
};

export default function TodayPage() {
  return <TodayTasksClient />;
}
