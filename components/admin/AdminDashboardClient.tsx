"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useApp } from "@/lib/context/AppContext";
import {
  ShieldCheck,
  Package,
  MessageSquare,
  TrendingUp,
  Search,
  Check,
  ExternalLink,
  Plus,
  RefreshCw,
  AlertCircle,
  Clock,
  Sparkles,
  Layers,
} from "lucide-react";

interface AdminDashboardClientProps {
  stats: {
    species: {
      total: number;
      inStock: number;
      madeToOrder: number;
      seasonal: number;
    };
    inquiriesCount: number;
    searchMissesCount: number;
    totalUserPlants: number;
  };
  initialSpecies: any[];
  initialInquiries: any[];
  initialMisses: any[];
}

export function AdminDashboardClient({
  stats,
  initialSpecies,
  initialInquiries,
  initialMisses,
}: AdminDashboardClientProps) {
  const { currentUser, loginAsDemoUser, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<"species" | "inquiries" | "misses">("species");
  const [speciesList, setSpeciesList] = useState(initialSpecies);
  const [speciesSearch, setSpeciesSearch] = useState("");
  const [stockUpdatingId, setStockUpdatingId] = useState<string | null>(null);

  const filteredSpecies = speciesList.filter(
    (s) =>
      s.nameTh.toLowerCase().includes(speciesSearch.toLowerCase()) ||
      s.nameEn.toLowerCase().includes(speciesSearch.toLowerCase())
  );

  const handleStockToggle = async (speciesId: string, currentStatus: string) => {
    const statuses = ["in_stock", "made_to_order", "seasonal", "hidden"];
    const nextIndex = (statuses.indexOf(currentStatus) + 1) % statuses.length;
    const nextStatus = statuses[nextIndex];

    setStockUpdatingId(speciesId);
    try {
      const res = await fetch("/api/admin/species/stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ speciesId, status: nextStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      setSpeciesList((prev) =>
        prev.map((s) => (s.id === speciesId ? { ...s, stockStatus: nextStatus } : s))
      );
      showToast("อัปเดตสถานะของเรียบร้อย", "success");
    } catch (err: any) {
      showToast(err.message, "warning");
    } finally {
      setStockUpdatingId(null);
    }
  };

  const getStockBadge = (status: string) => {
    switch (status) {
      case "in_stock":
        return <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">มีที่ร้านพร้อมส่ง</span>;
      case "made_to_order":
        return <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">สั่งได้ ~7-14 วัน</span>;
      case "seasonal":
        return <span className="px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 text-xs font-semibold">ตามฤดูกาล</span>;
      case "hidden":
        return <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-semibold">ซ่อนจากหน้าเว็บ</span>;
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-20">
      {/* Header & Role Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sand-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-forest-700">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span>ระบบหลังบ้านสำหรับเจ้าของร้าน</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-stone-950 mt-1">
            แดชบอร์ดร้าน TreeForLife
          </h1>
          <p className="text-xs sm:text-sm text-stone-600">
            อัปเดตสถานะของ ตรวจสอบรหัสลูกค้าที่ทัก LINE และดูคำค้นที่ไม่เจอผลลัพธ์
          </p>
        </div>

        {currentUser?.role !== "admin" && (
          <button
            onClick={() => loginAsDemoUser("admin")}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-forest-950 font-semibold rounded-xl text-xs flex items-center gap-2 transition-all shadow-sm cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>สลับเป็นบัญชีเจ้าของร้าน (Admin Demo)</span>
          </button>
        )}
      </div>

      {/* Top 4 Key Metric Cards (SPEC §8.3, §6.9) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-sand-200 shadow-soft space-y-2">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-600">พันธุ์ไม้ทั้งหมด</span>
            <Package className="w-5 h-5 text-forest-800" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-stone-900">{stats.species.total}</span>
            <span className="text-xs text-emerald-700 font-semibold">(มีของ {stats.species.inStock})</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-sand-200 shadow-soft space-y-2">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-600">ลูกค้ากด "ถามร้าน"</span>
            <MessageSquare className="w-5 h-5 text-[#06C755]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-stone-900">{stats.inquiriesCount}</span>
            <span className="text-xs text-stone-500 font-medium">ครั้ง (นำทางสู่ LINE)</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-sand-200 shadow-soft space-y-2">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-600">คำค้นที่หาไม่เจอ</span>
            <TrendingUp className="w-5 h-5 text-rose-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-stone-900">{stats.searchMissesCount}</span>
            <span className="text-xs text-rose-600 font-medium">รายการที่ควรหามาขาย</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-sand-200 shadow-soft space-y-2">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-600">ต้นไม้ในสวนผู้ใช้</span>
            <Sparkles className="w-5 h-5 text-gold-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-stone-900">{stats.totalUserPlants}</span>
            <span className="text-xs text-stone-500 font-medium">ต้นที่ดูแลอยู่</span>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-sand-200">
        <button
          onClick={() => setActiveTab("species")}
          className={`py-3 px-5 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === "species"
              ? "border-forest-900 text-forest-900"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          จัดการพันธุ์ไม้ & สถานะของ ({speciesList.length})
        </button>

        <button
          onClick={() => setActiveTab("inquiries")}
          className={`py-3 px-5 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === "inquiries"
              ? "border-forest-900 text-forest-900"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          รายการคนทัก LINE (Inquiries Log)
        </button>

        <button
          onClick={() => setActiveTab("misses")}
          className={`py-3 px-5 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === "misses"
              ? "border-forest-900 text-forest-900"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          คำค้นที่ลูกค้าหาไม่เจอ (Search Misses) 🔥
        </button>
      </div>

      {/* TAB 1: SPECIES LIST (SPEC §6.9 /admin/species) */}
      {activeTab === "species" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative max-w-sm w-full">
              <input
                type="text"
                value={speciesSearch}
                onChange={(e) => setSpeciesSearch(e.target.value)}
                placeholder="ค้นหาชื่อพันธุ์ในระบบ..."
                className="w-full text-xs px-3.5 py-2 pl-9 bg-white border border-sand-300 rounded-xl focus:outline-none text-stone-800"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            </div>

            <span className="text-xs text-stone-500">
              💡 แตะที่ป้ายสถานะเพื่อสลับ: มีที่ร้าน → สั่งได้ → ตามฤดูกาล → ซ่อน
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-sand-200 overflow-hidden shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-sand-100/70 border-b border-sand-200 text-stone-600 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">พันธุ์ไม้</th>
                    <th className="py-3 px-4">วงศ์</th>
                    <th className="py-3 px-4">ความยาก</th>
                    <th className="py-3 px-4">สถานะที่ร้าน (คลิกเพื่อเปลี่ยน)</th>
                    <th className="py-3 px-4 text-right">ลิงก์หน้าเว็บ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-100">
                  {filteredSpecies.map((plant) => (
                    <tr key={plant.id} className="hover:bg-sand-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-sand-100 border border-sand-200">
                            <Image src={plant.primaryImage} alt={plant.nameTh} fill className="object-cover" />
                          </div>
                          <div>
                            <p className="font-semibold text-stone-900">{plant.nameTh}</p>
                            <p className="text-[11px] text-stone-500 italic font-serif">{plant.nameSci}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-stone-600">{plant.family}</td>
                      <td className="py-3 px-4 text-stone-700">ระดับ {plant.difficulty}/5</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleStockToggle(plant.id, plant.stockStatus)}
                          disabled={stockUpdatingId === plant.id}
                          className="cursor-pointer hover:opacity-80 transition-opacity"
                          title="คลิกเพื่อเปลี่ยนสถานะ"
                        >
                          {getStockBadge(plant.stockStatus)}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/plants/${plant.slug}`}
                          target="_blank"
                          className="text-forest-800 hover:text-forest-600 font-semibold inline-flex items-center gap-1"
                        >
                          <span>เปิดดู</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INQUIRIES LIST (SPEC §6.9 /admin/inquiries) */}
      {activeTab === "inquiries" && (
        <div className="space-y-4">
          <p className="text-xs text-stone-500">
            ทุกแถวคือ 1 ครั้งที่ลูกค้ากด "ถามร้าน" พร้อมรหัสอ้างอิง Ref Code สำหรับตรวจสอบกับแชท LINE
          </p>

          <div className="bg-white rounded-2xl border border-sand-200 overflow-hidden shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-sand-100/70 border-b border-sand-200 text-stone-600 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">รหัสอ้างอิง (Ref Code)</th>
                    <th className="py-3 px-4">เรื่องที่ถาม</th>
                    <th className="py-3 px-4">ต้นไม้ที่สนใจ</th>
                    <th className="py-3 px-4">หน้าต้นทาง</th>
                    <th className="py-3 px-4 text-right">วันเวลา</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-100">
                  {initialInquiries.length > 0 ? (
                    initialInquiries.map((inq) => (
                      <tr key={inq.id} className="hover:bg-sand-50/60 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-xs px-2 py-0.5 rounded-full bg-forest-900 text-gold-300">
                            {inq.refCode}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-stone-800 font-medium">
                          {inq.intent === "price" && "สอบถามราคา & ขนาด"}
                          {inq.intent === "availability" && "เช็คของพร้อมส่ง"}
                          {inq.intent === "care_help" && "ปรึกษาการดูแล"}
                          {inq.intent === "design_quote" && "จัดมุมสวน"}
                        </td>
                        <td className="py-3 px-4 text-stone-900 font-semibold">
                          {inq.speciesNameTh || "สอบถามทั่วไป"}
                        </td>
                        <td className="py-3 px-4 text-stone-500 font-mono text-[11px]">
                          {inq.sourcePage}
                        </td>
                        <td className="py-3 px-4 text-right text-stone-500">
                          {new Date(inq.createdAt).toLocaleString("th-TH")}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-stone-400">
                        ยังไม่มีประวัติการกดถามร้าน
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SEARCH MISSES (SPEC §6.9 /admin/misses) */}
      {activeTab === "misses" && (
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900">
            <span className="font-bold">ข้อมูลที่มีค่าที่สุดสำหรับร้าน:</span> รายการคำที่ลูกค้าค้นหาในเว็บแล้วไม่เจอผลลัพธ์ นำไปใช้ตัดสินใจคัดเลือกพันธุ์ไม้มาเข้าร้านเพื่อตอบสนองความต้องการของตลาดจริง
          </div>

          <div className="bg-white rounded-2xl border border-sand-200 overflow-hidden shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-sand-100/70 border-b border-sand-200 text-stone-600 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">คำค้นที่ลูกค้าหา (Search Query)</th>
                    <th className="py-3 px-4">จำนวนครั้งที่ค้นหา</th>
                    <th className="py-3 px-4 text-right">ค้นหาล่าสุด</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-100">
                  {initialMisses.length > 0 ? (
                    initialMisses.map((m) => (
                      <tr key={m.id} className="hover:bg-sand-50/60 transition-colors">
                        <td className="py-3 px-4 font-semibold text-stone-900">
                          "{m.query}"
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold">
                            {m.count} ครั้ง
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-stone-500">
                          {new Date(m.lastSeenAt).toLocaleString("th-TH")}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-stone-400">
                        ยังไม่มีคำค้นที่ตกหล่น (ทุกคำค้นมีผลลัพธ์ในระบบ)
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
