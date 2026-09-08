import React from "react";
import type { Metadata } from "next";
import { GardenListClient } from "@/components/garden/GardenListClient";

export const metadata: Metadata = {
  title: "สวนของฉัน (My Garden) & ตารางรดน้ำ | TreeForLife",
  description:
    "จัดการต้นไม้ทั้งหมดของคุณในที่เดียว คำนวณรอบรดน้ำอัตโนมัติตาม 3 ฤดูกาลไทยและสภาพแวดล้อมกระถางจริง",
};

export default function GardenPage() {
  return <GardenListClient />;
}
