import React from "react";
import { Metadata } from "next";
import { GardenListClient } from "@/components/garden/GardenListClient";

export const metadata: Metadata = {
  title: "สวนของฉัน & ตารางรดน้ำ | TreeForLife",
  description: "จัดการต้นไม้ทั้งหมดของคุณในที่เดียว คำนวณรอบรดน้ำอัตโนมัติตาม 3 ฤดูกาลไทยและสภาพกระถางจริง",
};

export default function GardenPage() {
  return <GardenListClient />;
}
