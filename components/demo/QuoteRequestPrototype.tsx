"use client";

import React, { useState } from "react";
import {
  FileText,
  Calculator,
  Sun,
  CloudSun,
  Home,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Send,
  MessageCircle,
  HelpCircle,
  Layers,
  Trees,
  Check,
} from "lucide-react";

export type SunlightExposure = "แดดเต็มวัน" | "แดดรำไร" | "ในร่ม";
export type GardenStyle = "Minimal Zen" | "English Cottage" | "Modern Tropical";

export interface CostBreakdown {
  plantCost: number;
  soilMediumCost: number;
  laborInstallCost: number;
  addOnsCost: number;
  totalCost: number;
  recommendedPlants: string[];
}

export function QuoteRequestPrototype() {
  const [areaSize, setAreaSize] = useState<number>(25);
  const [sunlight, setSunlight] = useState<SunlightExposure>("แดดรำไร");
  const [style, setStyle] = useState<GardenStyle>("Modern Tropical");
  const [addIrrigation, setAddIrrigation] = useState<boolean>(true);
  const [addLighting, setAddLighting] = useState<boolean>(false);
  const [isCalculated, setIsCalculated] = useState<boolean>(false);
  const [lineHandoffSent, setLineHandoffSent] = useState<boolean>(false);

  // Style metadata
  const STYLE_CONFIG: Record<
    GardenStyle,
    {
      id: GardenStyle;
      name: string;
      description: string;
      baseRatePerSqm: number;
      plantExamples: Record<SunlightExposure, string[]>;
    }
  > = {
    "Minimal Zen": {
      id: "Minimal Zen",
      name: "Minimal Zen (มินิมอลเซน)",
      description: "เรียบสงบ สบายตา หินแม่น้ำ สนใบพาย ไผ่เลี้ยง และทางเดินแผ่นหิน",
      baseRatePerSqm: 850,
      plantExamples: {
        "แดดเต็มวัน": ["สนใบพายทรงพุ่ม", "ไผ่เลี้ยงแคระ", "หญ้ามาเลเซีย", "สนมังกรแคระ"],
        "แดดรำไร": ["ไผ่ฟิลิปปินส์", "จั๋งเชียงใหม่", "หินแม่น้ำตกแต่ง", "มอสสด"],
        "ในร่ม": ["ลิ้นมังกรคัดฟอร์ม", "จั๋งญี่ปุ่นแคระ", "หินเซนและกรวดขาวแม่น้ำ"],
      },
    },
    "English Cottage": {
      id: "English Cottage",
      name: "English Cottage (อิงลิชคอทเทจ)",
      description: "อบอุ่น หวานละมุน ซุ้มไม้ดอก กุหลาบ สมุนไพรฝรั่ง และขอบแปลงอิฐดินเผา",
      baseRatePerSqm: 1100,
      plantExamples: {
        "แดดเต็มวัน": ["กุหลาบอังกฤษ Clair Austin", "ไฮเดรนเยีย", "โรสแมรี่", "บลูซัลเวีย"],
        "แดดรำไร": ["กุหลาบหิน", "ฟอร์เก็ตมีน็อต", "เฟิร์นขนนก", "ลาเวนเดอร์พุ่ม"],
        "ในร่ม": ["กุหลาบหินกระถางอบอุ่น", "ไอวี่เลื้อยด่าง", "บีโกเนียดอกดก"],
      },
    },
    "Modern Tropical": {
      id: "Modern Tropical",
      name: "Modern Tropical (โมเดิร์นทรอปิคอล)",
      description: "เขียวชอุ่ม ร่มรื่นสไตล์รีสอร์ต มอนสเตอร่า ฟิโลเดนดรอน ปาล์ม และไม้ใบใหญ่",
      baseRatePerSqm: 950,
      plantExamples: {
        "แดดเต็มวัน": ["ปาล์มพัด", "เฮลิโคเนียก้ามกุ้ง", "เบิร์ดออฟพาราไดซ์", "จันผา"],
        "แดดรำไร": ["มอนสเตอร่าไจแอนท์", "ฟิโลเดนดรอนก้านส้ม", "ยางอินเดีย", "เฟิร์นข้าหลวง"],
        "ในร่ม": ["มอนสเตอร่าเดลิซิโอซา", "กวักมรกต", "เดหลีใบด่าง", "เขียวหมื่นปี"],
      },
    },
  };

  const styleOptions = STYLE_CONFIG[style];

  const calculateEstimate = (): CostBreakdown => {
    const base = styleOptions.baseRatePerSqm * areaSize;
    const plantCost = Math.round(base * 0.48);
    const soilMediumCost = Math.round(base * 0.24);
    const laborInstallCost = Math.round(base * 0.28);
    const addOnsCost = (addIrrigation ? 4500 : 0) + (addLighting ? 3200 : 0);
    const totalCost = plantCost + soilMediumCost + laborInstallCost + addOnsCost;

    return {
      plantCost,
      soilMediumCost,
      laborInstallCost,
      addOnsCost,
      totalCost,
      recommendedPlants: styleOptions.plantExamples[sunlight],
    };
  };

  const estimate = calculateEstimate();

  const handleGenerateQuote = () => {
    setIsCalculated(true);
    setLineHandoffSent(false);
  };

  return (
    <div className="bg-white dark:bg-forest-900 border border-sand-200 dark:border-forest-800 rounded-2xl shadow-card overflow-hidden">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-forest-800 via-forest-900 to-forest-950 p-5 sm:p-6 text-white relative">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              <Calculator className="w-3.5 h-3.5" />
              <span>Phase 3 Platform Feature</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-white flex items-center gap-2">
              <span>📋 ขอใบเสนอราคาจัดสวน</span>
            </h3>
            <p className="text-xs sm:text-sm text-sand-200 max-w-2xl">
              ระบบประเมินราคาจัดสวนและปรับภูมิทัศน์เบื้องต้น คำนวณตามขนาดพื้นที่ ทิศทางแสงแดด และสไตล์ที่คุณต้องการ พร้อมเชื่อมต่อทีมภูมิสถาปัตย์ผ่าน LINE
            </p>
          </div>
          <div className="text-right hidden sm:block">
            <span className="text-xs text-sand-300 uppercase tracking-wider block">Est. Response</span>
            <span className="text-sm font-semibold text-emerald-400">แบบ 3D ใน 2 ชม.</span>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-6">
        {/* Input Form Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Step 1: Area Size */}
          <div className="space-y-3 bg-sand-50/70 dark:bg-forest-950/50 p-4 rounded-xl border border-sand-200/80 dark:border-forest-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-forest-900 dark:text-sand-100 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-forest-800 text-white text-[11px] flex items-center justify-center font-bold">1</span>
                <span>ขนาดพื้นที่สวน (ตร.ม.)</span>
              </label>
              <div className="text-base font-bold text-forest-800 dark:text-emerald-400 font-mono">
                {areaSize} ตร.ม.
              </div>
            </div>

            <input
              type="range"
              role="slider"
              aria-label="ขนาดพื้นที่สวน (ตร.ม.)"
              min="5"
              max="150"
              step="5"
              value={areaSize}
              onChange={(e) => setAreaSize(Number(e.target.value))}
              className="w-full accent-forest-700 dark:accent-emerald-500 h-2 bg-sand-200 dark:bg-forest-800 rounded-lg cursor-pointer"
            />

            <div className="flex justify-between items-center text-[11px] text-sand-600 dark:text-sand-400">
              <span>5 ตร.ม. (กะทัดรัด)</span>
              <span>75 ตร.ม.</span>
              <span>150 ตร.ม. (กว้างขวาง)</span>
            </div>

            {/* Quick area chips */}
            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-sand-200/60 dark:border-forest-800">
              {[
                { label: "15 ตร.ม. (ระเบียง)", val: 15 },
                { label: "30 ตร.ม. (ข้างบ้าน)", val: 30 },
                { label: "60 ตร.ม. (หลังบ้าน)", val: 60 },
              ].map((chip) => (
                <button
                  key={chip.val}
                  type="button"
                  onClick={() => setAreaSize(chip.val)}
                  className={`px-2 py-1 rounded text-[11px] transition ${
                    areaSize === chip.val
                      ? "bg-forest-800 text-white dark:bg-emerald-600 font-medium"
                      : "bg-white dark:bg-forest-800 text-sand-700 dark:text-sand-300 hover:bg-sand-200 border border-sand-200/60 dark:border-forest-700"
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Sunlight Exposure */}
          <div className="space-y-3 bg-sand-50/70 dark:bg-forest-950/50 p-4 rounded-xl border border-sand-200/80 dark:border-forest-800">
            <label className="text-xs font-bold text-forest-900 dark:text-sand-100 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-forest-800 text-white text-[11px] flex items-center justify-center font-bold">2</span>
              <span>สภาพแสงแดดประจำวัน</span>
            </label>

            <div className="grid grid-cols-3 gap-2 pt-1">
              {[
                { id: "แดดเต็มวัน" as SunlightExposure, label: "แดดเต็มวัน", sub: "6+ ชม./วัน", icon: Sun },
                { id: "แดดรำไร" as SunlightExposure, label: "แดดรำไร", sub: "3-5 ชม./กรองแสง", icon: CloudSun },
                { id: "ในร่ม" as SunlightExposure, label: "ในร่ม", sub: "ใต้ชายคา/ในบ้าน", icon: Home },
              ].map((sun) => {
                const Icon = sun.icon;
                const isSelected = sunlight === sun.id;
                return (
                  <button
                    key={sun.id}
                    type="button"
                    onClick={() => setSunlight(sun.id)}
                    className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                      isSelected
                        ? "border-forest-600 bg-forest-100/60 dark:bg-forest-800 dark:border-emerald-500 ring-2 ring-forest-500/20 text-forest-900 dark:text-emerald-300 font-semibold"
                        : "border-sand-200 dark:border-forest-800 bg-white dark:bg-forest-900 text-sand-700 dark:text-sand-300 hover:bg-sand-100 dark:hover:bg-forest-800/50"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? "text-forest-700 dark:text-emerald-400" : "text-sand-500"}`} />
                    <span className="text-xs">{sun.label}</span>
                    <span className="text-[10px] text-sand-500 dark:text-sand-400">{sun.sub}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Preferred Style */}
          <div className="space-y-3 bg-sand-50/70 dark:bg-forest-950/50 p-4 rounded-xl border border-sand-200/80 dark:border-forest-800">
            <label className="text-xs font-bold text-forest-900 dark:text-sand-100 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-forest-800 text-white text-[11px] flex items-center justify-center font-bold">3</span>
              <span>สไตล์สวนที่ชื่นชอบ</span>
            </label>

            <div className="space-y-2">
              {(["Minimal Zen", "English Cottage", "Modern Tropical"] as GardenStyle[]).map((st) => {
                const isSelected = style === st;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStyle(st)}
                    className={`w-full p-2.5 rounded-xl border text-left text-xs transition flex items-center justify-between ${
                      isSelected
                        ? "border-forest-600 bg-forest-100/60 dark:bg-forest-800 dark:border-emerald-500 text-forest-900 dark:text-sand-100 font-semibold"
                        : "border-sand-200 dark:border-forest-800 bg-white dark:bg-forest-900 text-sand-700 dark:text-sand-300 hover:bg-sand-100 dark:hover:bg-forest-800/50"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Trees className="w-3.5 h-3.5 text-forest-600 dark:text-emerald-400" />
                      {st}
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-forest-700 dark:text-emerald-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Optional Add-ons */}
        <div className="p-4 bg-sand-50/50 dark:bg-forest-950/40 rounded-xl border border-sand-200/70 dark:border-forest-800/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-medium text-forest-900 dark:text-sand-200">
            <Layers className="w-4 h-4 text-forest-600 dark:text-emerald-400" />
            <span>บริการเสริมพิเศษ (Add-on Services):</span>
          </div>
          <div className="flex flex-wrap gap-4 text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={addIrrigation}
                onChange={(e) => setAddIrrigation(e.target.checked)}
                className="w-4 h-4 accent-forest-700 dark:accent-emerald-500 rounded"
              />
              <span className="text-sand-800 dark:text-sand-200">
                ระบบรดน้ำอัตโนมัติ (+฿4,500)
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={addLighting}
                onChange={(e) => setAddLighting(e.target.checked)}
                className="w-4 h-4 accent-forest-700 dark:accent-emerald-500 rounded"
              />
              <span className="text-sand-800 dark:text-sand-200">
                ระบบไฟตกแต่งสวนโซลาร์เซลล์ (+฿3,200)
              </span>
            </label>
          </div>
        </div>

        {/* Trigger Button */}
        <div className="text-center pt-2">
          <button
            type="button"
            role="button"
            onClick={handleGenerateQuote}
            className="w-full sm:w-auto px-8 py-3.5 bg-forest-800 hover:bg-forest-900 text-white font-medium text-sm sm:text-base rounded-xl shadow-md transition flex items-center justify-center gap-2 mx-auto active:scale-[0.99]"
          >
            <Calculator className="w-4 h-4 text-emerald-300" />
            <span>ประเมินราคา</span>
          </button>
        </div>

        {/* Estimate Result Display */}
        {isCalculated && (
          <div className="mt-8 border-2 border-forest-600/30 dark:border-emerald-500/30 bg-sand-50/50 dark:bg-forest-950/60 rounded-2xl p-6 sm:p-8 space-y-6 transition-all animate-fadeIn">
            {/* Quotation Header */}
            <div className="flex flex-wrap items-center justify-between pb-4 border-b border-sand-200 dark:border-forest-800 gap-3">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/60 px-2.5 py-1 rounded-md mb-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>คำนวณสำเร็จพร้อมใช้งาน</span>
                </div>
                <h4 className="text-lg sm:text-xl font-serif font-bold text-forest-950 dark:text-sand-50">
                  ใบเสนอราคาเบื้องต้น (Preliminary Quotation)
                </h4>
                <p className="text-xs text-sand-600 dark:text-sand-400">
                  รหัสอ้างอิง: QT-{style.replace(/\s+/g, "").toUpperCase()}-{areaSize}SQM • ใช้เป็นกรอบงบประมาณเบื้องต้น
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-sand-500 dark:text-sand-400 block">ประเมินรวมทั้งสิ้น</span>
                <span className="text-2xl sm:text-3xl font-bold font-mono text-forest-900 dark:text-emerald-400">
                  ฿{estimate.totalCost.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Cost Breakdown Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-white dark:bg-forest-900 rounded-xl border border-sand-200/80 dark:border-forest-800 shadow-sm space-y-1">
                <span className="text-xs text-sand-500 dark:text-sand-400">1. ค่าพันธุ์ไม้</span>
                <div className="text-lg font-bold font-mono text-forest-900 dark:text-sand-100">
                  ฿{estimate.plantCost.toLocaleString()}
                </div>
                <p className="text-[11px] text-sand-600 dark:text-sand-400">
                  รวมไม้ประธาน ไม้พุ่ม ไม้คลุมดิน ตามสภาพ {sunlight}
                </p>
              </div>

              <div className="p-4 bg-white dark:bg-forest-900 rounded-xl border border-sand-200/80 dark:border-forest-800 shadow-sm space-y-1">
                <span className="text-xs text-sand-500 dark:text-sand-400">2. ค่าปรับหน้าดิน/วัสดุปลูก</span>
                <div className="text-lg font-bold font-mono text-forest-900 dark:text-sand-100">
                  ฿{estimate.soilMediumCost.toLocaleString()}
                </div>
                <p className="text-[11px] text-sand-600 dark:text-sand-400">
                  ดินปลูกอินทรีย์, กาบมะพร้าว, หินระบายน้ำ และปุ๋ยรองก้นหลุม
                </p>
              </div>

              <div className="p-4 bg-white dark:bg-forest-900 rounded-xl border border-sand-200/80 dark:border-forest-800 shadow-sm space-y-1">
                <span className="text-xs text-sand-500 dark:text-sand-400">3. ค่าแรงและติดตั้ง</span>
                <div className="text-lg font-bold font-mono text-forest-900 dark:text-sand-100">
                  ฿{estimate.laborInstallCost.toLocaleString()}
                </div>
                <p className="text-[11px] text-sand-600 dark:text-sand-400">
                  ทีมช่างจัดสวนผู้ชำนาญการ ขุดหลุม ปลูก ยึดค้ำยัน และเก็บกวาด
                </p>
              </div>

              <div className="p-4 bg-emerald-50/60 dark:bg-forest-900/90 rounded-xl border border-emerald-300 dark:border-emerald-600 shadow-sm space-y-1">
                <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  4. การรับประกันดูแล 30 วัน
                </span>
                <div className="text-lg font-bold font-mono text-emerald-700 dark:text-emerald-300">
                  ฟรี รวมในแพ็กเกจ
                </div>
                <p className="text-[11px] text-sand-600 dark:text-sand-400">
                  เข้าตรวจสภาพต้นไม้ 2 ครั้ง เคลมเปลี่ยนต้นไม้ใหม่ฟรีหากมีอาการชะงัก
                </p>
              </div>
            </div>

            {/* Recommended Species List */}
            <div className="p-4 bg-white dark:bg-forest-900 rounded-xl border border-sand-200/80 dark:border-forest-800 space-y-2">
              <span className="text-xs font-bold text-forest-900 dark:text-sand-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-forest-600 dark:text-emerald-400" />
                <span>พันธุ์ไม้แนะนำประจำสเปก ({style} • {sunlight}):</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {estimate.recommendedPlants.map((plantName, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-sand-100 dark:bg-forest-800 text-forest-800 dark:text-sand-200 text-xs rounded-full border border-sand-200/60 dark:border-forest-700"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    {plantName}
                  </span>
                ))}
              </div>
            </div>

            {/* LINE Handoff Simulator */}
            <div className="p-5 bg-gradient-to-r from-emerald-50 via-forest-50 to-sand-50 dark:from-forest-900 dark:via-forest-900 dark:to-forest-950 rounded-xl border border-emerald-200 dark:border-forest-700 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#06C755] flex items-center justify-center text-white shrink-0 shadow-sm">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-sm font-bold text-forest-900 dark:text-sand-100">
                    ปรึกษาภูมิสถาปนิกผ่าน LINE Official
                  </h5>
                  <p className="text-xs text-sand-600 dark:text-sand-400">
                    ส่งข้อมูลพื้นที่ {areaSize} ตร.ม. พร้อมสเปกนี้เพื่อให้ทีมออกแบบร่างแบบ 3D แพลนเนอร์
                  </p>
                </div>
              </div>

              <div className="w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setLineHandoffSent(true)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-[#06C755] hover:bg-[#05b34c] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm transition flex items-center justify-center gap-2 active:scale-95"
                >
                  <Send className="w-4 h-4" />
                  <span>ส่งข้อมูลผ่าน LINE (@TreeForLife)</span>
                </button>
              </div>
            </div>

            {lineHandoffSent && (
              <div className="p-3.5 bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 rounded-xl text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  จำลองการส่งข้อมูลเรียบร้อยแล้ว! ข้อมูลใบเสนอราคา QT-{style.replace(/\s+/g, "")}-{areaSize}SQM ถูกเตรียมส่งเข้า LINE Official สำหรับเจ้าหน้าที่ภูมิสถาปัตย์ติดต่อกลับ
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
