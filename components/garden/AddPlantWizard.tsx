"use client";

import React, { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useApp } from "@/lib/context/AppContext";
import {
  calculateWateringInterval,
  PotMaterial,
  Placement,
  POT_MATERIAL_FACTORS,
  PLACEMENT_FACTORS,
} from "@/lib/care/scheduler";
import {
  Search,
  Check,
  ArrowRight,
  ArrowLeft,
  Sprout,
  HelpCircle,
  Calendar,
  Sparkles,
  Info,
} from "lucide-react";

interface SpeciesOption {
  id: string;
  nameTh: string;
  nameEn: string;
  primaryImage: string;
  careTemplate: {
    waterDaysHot: number;
    waterDaysRainy: number;
    waterDaysCool: number;
  } | null;
}

interface AddPlantWizardProps {
  availableSpecies: SpeciesOption[];
}

export function AddPlantWizard({ availableSpecies }: AddPlantWizardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSpeciesId = searchParams.get("speciesId");

  const { guestToken, currentUser, showToast } = useApp();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<string | null>(initialSpeciesId || null);
  const [customSpeciesName, setCustomSpeciesName] = useState("");
  const [isOtherSpecies, setIsOtherSpecies] = useState(false);
  const [speciesSearch, setSpeciesSearch] = useState("");

  const [nickname, setNickname] = useState("");
  const [acquiredAt, setAcquiredAt] = useState(new Date().toISOString().split("T")[0]);
  const [acquiredFrom, setAcquiredFrom] = useState<"shop" | "elsewhere" | "gift" | "propagated">("shop");

  const [potSizeInch, setPotSizeInch] = useState(6);
  const [potMaterial, setPotMaterial] = useState<PotMaterial>("plastic");

  const [placement, setPlacement] = useState<Placement>("indoor_window");
  const [customWaterDays, setCustomWaterDays] = useState<number | "">("");

  // Filtered species for search
  const filteredSpecies = useMemo(() => {
    if (!speciesSearch.trim()) return availableSpecies;
    const q = speciesSearch.toLowerCase();
    return availableSpecies.filter(
      (s) => s.nameTh.toLowerCase().includes(q) || s.nameEn.toLowerCase().includes(q)
    );
  }, [availableSpecies, speciesSearch]);

  const selectedSpecies = useMemo(
    () => availableSpecies.find((s) => s.id === selectedSpeciesId),
    [availableSpecies, selectedSpeciesId]
  );

  // Real-time calculation preview
  const previewCalculation = useMemo(() => {
    const template = selectedSpecies?.careTemplate || {
      waterDaysHot: 3,
      waterDaysRainy: 6,
      waterDaysCool: 5,
    };

    return calculateWateringInterval(template, {
      potSizeInch: Number(potSizeInch),
      potMaterial,
      placement,
      customWaterDays: customWaterDays ? Number(customWaterDays) : undefined,
    });
  }, [selectedSpecies, potSizeInch, potMaterial, placement, customWaterDays]);

  const handleSubmit = async () => {
    if (!nickname.trim()) {
      showToast("กรุณาระบุชื่อเล่นของต้นไม้", "warning");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/garden/plants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser?.id,
          guestToken,
          speciesId: isOtherSpecies ? null : selectedSpeciesId,
          customSpeciesName: isOtherSpecies ? customSpeciesName : null,
          nickname: nickname.trim(),
          acquiredAt,
          acquiredFrom,
          potSizeInch,
          potMaterial,
          placement,
          customWaterDays: customWaterDays ? Number(customWaterDays) : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add plant");

      showToast(`เพิ่ม "${nickname}" เข้าสวนเรียบร้อยแล้ว! 🌿`, "success");
      router.push(`/garden/${data.plant.id}`);
    } catch (err: any) {
      showToast(err.message || "เกิดข้อผิดพลาดในการบันทึก", "warning");
    } finally {
      setSubmitting(false);
    }
  };

  const potMaterialCards: { key: PotMaterial; title: string; desc: string }[] = [
    { key: "terracotta", title: "ดินเผา (ระบายน้ำเร็ว)", desc: "ระเหยผ่านผนังกระถาง ดินแห้งไว (×0.80)" },
    { key: "plastic", title: "พลาสติก", desc: "มาตรฐาน กักเก็บความชื้นพอเหมาะ (×1.00)" },
    { key: "ceramic_glazed", title: "เซรามิกเคลือบ", desc: "ไม่ระบายน้ำทางผนัง ดินชื้นนาน (×1.15)" },
    { key: "cement", title: "ปูนเปลือย/คอนกรีต", desc: "ผนังหนา เก็บความชื้นสูง (×1.15)" },
    { key: "hanging", title: "กระถางแขวน", desc: "ลมโกรกผ่านดี (×1.00)" },
  ];

  const placementCards: { key: Placement; title: string; desc: string }[] = [
    { key: "outdoor_sun", title: "กลางแจ้งแดดเต็มวัน", desc: "รับแดดและลมแรง ดินแห้งไวที่สุด (×0.70)" },
    { key: "balcony_shade", title: "ระเบียง/มีร่มรำไร", desc: "มีลมระบาย แสงรำไรสว่าง (×0.90)" },
    { key: "indoor_window", title: "ในบ้านใกล้หน้าต่าง", desc: "แสงสว่างทางอ้อม ลมปกติ (×1.00)" },
    { key: "indoor_far", title: "ในบ้านห่างหน้าต่าง", desc: "แสงน้อย คายน้ำช้า ต้องการน้ำน้อยลง (×1.25)" },
    { key: "air_con", title: "ห้องแอร์", desc: "ไม่มีแดด อุณหภูมิเย็น ดินชื้นนานกว่า (×1.20)" },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Wizard Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-900/5 text-forest-800 text-xs font-semibold">
          <Sprout className="w-3.5 h-3.5 text-emerald-600" />
          <span>เพิ่มต้นไม้เข้าสวนของคุณ (ขั้นตอนที่ {step} จาก 4)</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-stone-900">
          ลงทะเบียนต้นไม้ใหม่
        </h1>
        <p className="text-xs sm:text-sm text-stone-600">
          ระบบจะวิเคราะห์เพื่อสร้างตารางรดน้ำที่แม่นยำที่สุดให้ต้นไม้ของคุณ
        </p>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-2 flex-1 rounded-full transition-all ${
              step >= i ? "bg-forest-900" : "bg-sand-200"
            }`}
          />
        ))}
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-200 shadow-soft space-y-6">
        {/* STEP 1: Select Species (SPEC §6.6 #1) */}
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <h2 className="font-serif text-xl font-semibold text-stone-900">
                1. เลือกพันธุ์ต้นไม้ของคุณ
              </h2>
              <p className="text-xs text-stone-500">
                เลือกพันธุ์จากแคตตาล็อกของร้านเพื่อให้ระบบดึงสูตรดูแล 3 ฤดูกาลไทยอัตโนมัติ
              </p>
            </div>

            {/* Search Box */}
            <div className="relative">
              <input
                type="text"
                value={speciesSearch}
                onChange={(e) => setSpeciesSearch(e.target.value)}
                placeholder="ค้นหาชื่อพันธุ์ เช่น มอนสเตอร่า, ยางอินเดีย..."
                className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 bg-sand-50 border border-sand-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-700 text-stone-800 placeholder-stone-400"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            </div>

            {/* Species Grid */}
            <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
              {filteredSpecies.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setSelectedSpeciesId(item.id);
                    setIsOtherSpecies(false);
                    if (!nickname) setNickname(item.nameTh);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all text-left cursor-pointer ${
                    selectedSpeciesId === item.id && !isOtherSpecies
                      ? "bg-forest-900 text-sand-50 border-forest-900 shadow-sm"
                      : "bg-white border-sand-200 hover:bg-sand-50 text-stone-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-sand-300">
                      <Image src={item.primaryImage} alt={item.nameTh} fill className="object-cover" />
                    </div>
                    <div>
                      <h4 className="font-serif text-sm font-semibold truncate">{item.nameTh}</h4>
                      <p className="text-xs opacity-75 font-serif italic truncate">{item.nameEn}</p>
                    </div>
                  </div>
                  {selectedSpeciesId === item.id && !isOtherSpecies && (
                    <Check className="w-5 h-5 text-gold-400 shrink-0" />
                  )}
                </button>
              ))}

              {/* Option: Other species (SPEC §6.6 #1) */}
              <button
                type="button"
                onClick={() => {
                  setIsOtherSpecies(true);
                  setSelectedSpeciesId(null);
                }}
                className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  isOtherSpecies
                    ? "bg-forest-900 text-sand-50 border-forest-900 shadow-sm"
                    : "bg-sand-50 border-sand-300 hover:bg-sand-100 text-stone-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">พันธุ์อื่น ๆ (ไม่อยู่ในรายการด้านบน)</span>
                  {isOtherSpecies && <Check className="w-4 h-4 text-gold-400" />}
                </div>
                {isOtherSpecies && (
                  <input
                    type="text"
                    value={customSpeciesName}
                    onChange={(e) => setCustomSpeciesName(e.target.value)}
                    placeholder="พิมพ์ชื่อพันธุ์ของคุณที่นี่..."
                    className="mt-3 w-full text-xs px-3 py-2 bg-white text-stone-800 rounded-xl border border-sand-300 focus:outline-none"
                    onClick={(e) => e.stopPropagation()}
                  />
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Basic Info (SPEC §6.6 #2) */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <h2 className="font-serif text-xl font-semibold text-stone-900">
                2. ข้อมูลทั่วไปของต้นไม้
              </h2>
              <p className="text-xs text-stone-500">
                ตั้งชื่อเล่นให้น้องเพื่อความผูกพันและบันทึกที่มา
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                ชื่อเล่นต้นไม้ *
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="เช่น เจ้าอ้วน, มอนด่างมุมห้อง, ยางอินเดียโต๊ะทำงาน"
                className="w-full text-sm px-4 py-3 bg-sand-50 border border-sand-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-700 text-stone-800"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                  วันที่รับมาเลี้ยง
                </label>
                <input
                  type="date"
                  value={acquiredAt}
                  onChange={(e) => setAcquiredAt(e.target.value)}
                  className="w-full text-sm px-4 py-2.5 bg-sand-50 border border-sand-300 rounded-xl focus:outline-none text-stone-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                  ได้มาจากไหน
                </label>
                <select
                  value={acquiredFrom}
                  onChange={(e) => setAcquiredFrom(e.target.value as any)}
                  className="w-full text-sm px-4 py-2.5 bg-sand-50 border border-sand-300 rounded-xl focus:outline-none text-stone-800"
                >
                  <option value="shop">ซื้อจากร้าน TreeForLife</option>
                  <option value="elsewhere">ซื้อจากที่อื่น</option>
                  <option value="gift">เพื่อนหรือผู้ใหญ่ให้มา</option>
                  <option value="propagated">ขยายพันธุ์/ตอนกิ่งเอง</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Pot Details (SPEC §6.6 #3) */}
        {step === 3 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <h2 className="font-serif text-xl font-semibold text-stone-900">
                3. ขนาดและวัสดุกระถาง
              </h2>
              <p className="text-xs text-stone-500">
                วัสดุกระถางมีผลต่ออัตราการระเหยของน้ำในดินอย่างมาก
              </p>
            </div>

            {/* Pot Size */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                ขนาดเส้นผ่านศูนย์กลางปากกระถาง: <span className="text-forest-800 font-bold">{potSizeInch} นิ้ว</span>
              </label>
              <input
                type="range"
                min="3"
                max="24"
                step="1"
                value={potSizeInch}
                onChange={(e) => setPotSizeInch(Number(e.target.value))}
                className="w-full accent-forest-800"
              />
              <div className="flex justify-between text-[11px] text-stone-400 mt-1">
                <span>กระถางเล็ก (&lt;6")</span>
                <span>มาตรฐาน (6-10")</span>
                <span>กระถางใหญ่ (&gt;10")</span>
              </div>
            </div>

            {/* Visual Material Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
                วัสดุกระถาง (แตะเลือก)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {potMaterialCards.map((card) => (
                  <button
                    key={card.key}
                    type="button"
                    onClick={() => setPotMaterial(card.key)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      potMaterial === card.key
                        ? "bg-forest-900 text-sand-50 border-forest-900 shadow-sm"
                        : "bg-white border-sand-200 hover:bg-sand-50 text-stone-800"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-serif text-sm font-semibold">{card.title}</span>
                      {potMaterial === card.key && <Check className="w-4 h-4 text-gold-400" />}
                    </div>
                    <p className="text-xs opacity-75 mt-1">{card.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Placement & Instant Calculation (SPEC §6.6 #4, §5.4) */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="font-serif text-xl font-semibold text-stone-900">
                4. ตำแหน่งที่วาง & ตารางดูแล
              </h2>
              <p className="text-xs text-stone-500">
                เลือกจุดที่คุณตั้งต้นไม้ไว้ในบ้าน
              </p>
            </div>

            {/* Placement Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {placementCards.map((card) => (
                <button
                  key={card.key}
                  type="button"
                  onClick={() => setPlacement(card.key)}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    placement === card.key
                      ? "bg-forest-900 text-sand-50 border-forest-900 shadow-sm"
                      : "bg-white border-sand-200 hover:bg-sand-50 text-stone-800"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-sm font-semibold">{card.title}</span>
                    {placement === card.key && <Check className="w-4 h-4 text-gold-400" />}
                  </div>
                  <p className="text-xs opacity-75 mt-1">{card.desc}</p>
                </button>
              ))}
            </div>

            {/* Instant Care Schedule Calculation Breakdown (SPEC §5.4) */}
            <div className="p-5 rounded-2xl bg-forest-950 text-sand-50 border border-gold-500/40 shadow-soft space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gold-400">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    คำนวณรอบรดน้ำอัจฉริยะ (Care Schedule Engine)
                  </span>
                </div>
                <span className="px-3 py-1 rounded-full bg-gold-400 text-forest-950 font-bold text-xs">
                  รดทุก {previewCalculation.finalDays} วัน
                </span>
              </div>

              <div className="text-xs text-sand-300 space-y-1.5 pt-1 border-t border-forest-800">
                <p>
                  <span className="text-sand-100 font-medium">ฤดูกาลปัจจุบัน:</span>{" "}
                  {previewCalculation.seasonNameTh} (ฐาน {previewCalculation.baseDays} วัน)
                </p>
                <p>
                  <span className="text-sand-100 font-medium">สูตรคำนวณจริง:</span>{" "}
                  {previewCalculation.explanationTh}
                </p>
              </div>

              <div className="pt-2 text-[11px] text-stone-400">
                * ระบบจะปรับรอบอัตโนมัติเมื่อเข้าสู่ฤดูถัดไป หรือคุณสามารถปรับวันเองได้เสมอ
              </div>
            </div>
          </div>
        )}

        {/* Wizard Navigation Buttons */}
        <div className="pt-4 border-t border-sand-200 flex items-center justify-between gap-3">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-5 py-2.5 rounded-xl bg-sand-100 hover:bg-sand-200 text-stone-700 font-medium text-xs flex items-center gap-2 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>ย้อนกลับ</span>
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => {
                if (step === 1 && !selectedSpeciesId && !isOtherSpecies) {
                  showToast("กรุณาเลือกพันธุ์ไม้", "warning");
                  return;
                }
                if (step === 2 && !nickname.trim()) {
                  showToast("กรุณาระบุชื่อเล่นของต้นไม้", "warning");
                  return;
                }
                setStep(step + 1);
              }}
              className="px-6 py-2.5 rounded-xl bg-forest-900 hover:bg-forest-800 text-sand-50 font-medium text-xs flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
            >
              <span>ถัดไป</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="px-7 py-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-forest-950 font-bold text-xs flex items-center gap-2 transition-all shadow-gold cursor-pointer disabled:opacity-50"
            >
              <span>{submitting ? "กำลังสร้างตารางดูแล..." : "เสร็จสิ้น & สร้างตารางดูแล"}</span>
              <Check className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
