"use client";

import React, { useState } from "react";
import {
  DollarSign,
  Sliders,
  CheckCircle2,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  Leaf,
  Layers,
} from "lucide-react";

export type StyleOption = "minimal" | "tropical" | "air-purifier";

export interface BundlePlant {
  nameTh: string;
  nameEn: string;
  potSize: string;
  price: number;
  highlight: string;
}

export interface CuratedBundle {
  styleName: string;
  plants: BundlePlant[];
  totalPrice: number;
  remainingBudget: number;
  curatorNote: string;
  placementTips: string;
}

export function BudgetRecommenderPrototype() {
  const [budget, setBudget] = useState<number>(1500);
  const [selectedStyle, setSelectedStyle] = useState<StyleOption>("minimal");

  const styles = [
    { id: "minimal", label: "มินิมอลโมเดิร์น (Minimal)", desc: "รูปทรงเรียบหรู ดูแลง่าย เข้ากับบ้านสมัยใหม่" },
    { id: "tropical", label: "ทรอปิคอลคาเฟ่ (Tropical Cafe)", desc: "ใบฉลุ ฟอร์มป่าดิบชื้น สร้างบรรยากาศคาเฟ่" },
    { id: "air-purifier", label: "ไม้ฟอกอากาศเลี้ยงง่าย (Air Purifier)", desc: "ดูดซับสารพิษ คายออกซิเจน ทนต่อห้องแอร์" },
  ] as const;

  const quickBudgetPresets = [
    { label: "800฿ (ชุดเริ่มต้น)", value: 800 },
    { label: "1,500฿ (ยอดนิยม)", value: 1500 },
    { label: "3,000฿ (จัดเต็มมุมห้อง)", value: 3000 },
    { label: "5,000฿ (คอมโบพรีเมียม)", value: 5000 },
  ];

  // Helper to generate dynamic bundle based on budget & style
  const getBundle = (b: number, style: StyleOption): CuratedBundle => {
    if (style === "minimal") {
      if (b < 1200) {
        const plants: BundlePlant[] = [
          {
            nameTh: "ลิ้นมังกรขอบทอง",
            nameEn: "Sansevieria Golden Hahnii",
            potSize: "กระถาง 6 นิ้ว",
            price: 250,
            highlight: "รูปทรงคอมแพ็กต์ วางโต๊ะทำงานได้",
          },
          {
            nameTh: "ยางอินเดียดำ",
            nameEn: "Rubber Plant Burgundy",
            potSize: "กระถาง 6 นิ้ว",
            price: 390,
            highlight: "ใบสีเข้มมันเงา มินิมอลทรงพลัง",
          },
        ];
        const totalPrice = plants.reduce((sum, p) => sum + p.price, 0);
        return {
          styleName: "มินิมอลโมเดิร์น (Starter Set)",
          plants,
          totalPrice,
          remainingBudget: b - totalPrice,
          curatorNote: "จับคู่ไม้ใบเข้มกับไม้ทรงตั้ง ให้มิติความต่างของทรงใบในงบประหยัด",
          placementTips: "วางคู่กันบนชั้นวาง หรือวางแยกโต๊ะทำงานและข้างหน้าต่างรับแดดรำไร",
        };
      } else if (b < 2600) {
        const plants: BundlePlant[] = [
          {
            nameTh: "ยางอินเดียดำพุ่มโต",
            nameEn: "Rubber Plant Burgundy",
            potSize: "กระถาง 8 นิ้ว",
            price: 490,
            highlight: "ใบใหญ่ฟอร์มสวย ลำต้นแข็งแรง",
          },
          {
            nameTh: "ลิ้นมังกรแสงจันทร์",
            nameEn: "Sansevieria Moonshine",
            potSize: "กระถาง 6 นิ้ว",
            price: 350,
            highlight: "ใบสีเขียวมินต์นวลตา เรียบหรู",
          },
          {
            nameTh: "กวักมรกตเขียว",
            nameEn: "ZZ Plant",
            potSize: "กระถาง 8 นิ้ว",
            price: 390,
            highlight: "ก้านตั้งตรง ทนแอร์ ไม่ต้องการน้ำบ่อย",
          },
          {
            nameTh: "กระถางเซรามิกสีทรายมินิมอล",
            nameEn: "Sand Ceramic Pot with Tray",
            potSize: "ขนาด 8 นิ้ว",
            price: 220,
            highlight: "เซรามิกดินเผาเนื้อเนียน พร้อมจานรองน้ำ",
          },
        ];
        const totalPrice = plants.reduce((sum, p) => sum + p.price, 0);
        return {
          styleName: "มินิมอลโมเดิร์น (Comfort Suite)",
          plants,
          totalPrice,
          remainingBudget: b - totalPrice,
          curatorNote: "ชุดคอมโบระดับยอดนิยม ผสานใบเงา ใบมินต์ และก้านตั้ง พร้อมกระถางเซรามิกเข้าเซ็ต",
          placementTips: "วางเรียง 3 ระดับข้างโซฟาห้องนั่งเล่น ช่วยเติมชีวิตชีวาให้มุมพักผ่อน",
        };
      } else {
        const plants: BundlePlant[] = [
          {
            nameTh: "ไทรใบสักฟอร์มต้นใหญ่",
            nameEn: "Ficus Lyrata Specimen",
            potSize: "กระถาง 12 นิ้ว",
            price: 1350,
            highlight: "จุดโฟกัสสายตา เสริมความภูมิฐานให้ห้อง",
          },
          {
            nameTh: "ยางอินเดียด่างสามสี",
            nameEn: "Ficus Elastica Variegata",
            potSize: "กระถาง 8 นิ้ว",
            price: 650,
            highlight: "ลวดลายด่างชมพู-ครีม-เขียว สะกดสายตา",
          },
          {
            nameTh: "ลิ้นมังกรซามูไร",
            nameEn: "Sansevieria Samurai",
            potSize: "กระถาง 6 นิ้ว",
            price: 450,
            highlight: "ฟอร์มใบหนาบิดเกลียวแบบสถาปัตยกรรม",
          },
          {
            nameTh: "ชุดขาตั้งไม้สักแท้ + กระถางไฟเบอร์ซีเมนต์",
            nameEn: "Teak Stand & Fiber Cement Pot",
            potSize: "สำหรับกระถาง 12 นิ้ว",
            price: 590,
            highlight: "ยกระดับต้นไม้ให้ดูโปร่ง โมเดิร์นระดับพรีเมียม",
          },
        ];
        const totalPrice = plants.reduce((sum, p) => sum + p.price, 0);
        return {
          styleName: "มินิมอลโมเดิร์น (Grand Gallery Set)",
          plants,
          totalPrice,
          remainingBudget: b - totalPrice,
          curatorNote: "ชุดแต่งบ้านระดับสถาปัตย์ โดดเด่นด้วยไทรใบสักต้นใหญ่และงานไม้สักแท้คราฟต์มือ",
          placementTips: "เหมาะเป็นจุดเด่นประจำห้องรับแขก โถงต้อนรับ หรือมุมติดผนังปูนเปลือย",
        };
      }
    } else if (style === "tropical") {
      if (b < 1200) {
        const plants: BundlePlant[] = [
          {
            nameTh: "มอนสเตอร่าเดลิซิโอซา",
            nameEn: "Monstera Deliciosa",
            potSize: "กระถาง 6 นิ้ว",
            price: 450,
            highlight: "ใบฉลุฟอร์มสวย ซิกเนเจอร์ป่าดิบชื้น",
          },
          {
            nameTh: "พลูด่างราชินีหินอ่อน",
            nameEn: "Marble Queen Pothos",
            potSize: "กระถางแขวน 6 นิ้ว",
            price: 190,
            highlight: "ใบด่างขาวลายหินอ่อน เลื้อยคลุมขอบกระถาง",
          },
        ];
        const totalPrice = plants.reduce((sum, p) => sum + p.price, 0);
        return {
          styleName: "ทรอปิคอลคาเฟ่ (Mini Jungle)",
          plants,
          totalPrice,
          remainingBudget: b - totalPrice,
          curatorNote: "สร้างบรรยากาศร้านกาแฟในมุมเล็ก ด้วยมอนสเตอร่าและพลูด่างห้อยระย้า",
          placementTips: "วางมอนสเตอร่าบนโต๊ะ แขวนพลูด่างข้างหน้าต่างให้กิ่งเลื้อยลงมา",
        };
      } else if (b < 2600) {
        const plants: BundlePlant[] = [
          {
            nameTh: "มอนสเตอร่าเดลิซิโอซา พุ่มใหญ่",
            nameEn: "Monstera Deliciosa",
            potSize: "กระถาง 8 นิ้ว",
            price: 590,
            highlight: "ใบฉลุลึกหลายแฉก พุ่มหนาแน่น",
          },
          {
            nameTh: "ฟิโลเดนดรอนซานาดู",
            nameEn: "Philodendron Xanadu",
            potSize: "กระถาง 8 นิ้ว",
            price: 380,
            highlight: "ใบหยักทรงพุ่มแน่น สไตล์ป่าดงดิบ",
          },
          {
            nameTh: "เงินไหลมาด่างขาว",
            nameEn: "Syngonium Albo Variegata",
            potSize: "กระถาง 6 นิ้ว",
            price: 450,
            highlight: "ด่างขาวสะดุดตา เลื้อยเกาะหลัก",
          },
          {
            nameTh: "ชุดดินโปร่ง + เสาใยมะพร้าวค้ำทรง",
            nameEn: "Aroid Mix & Coco Pole",
            potSize: "เซ็ตดูแลไม้เลื้อย",
            price: 180,
            highlight: "กาบมะพร้าวสับหมัก + เพอร์ไลต์พร้อมใช้",
          },
        ];
        const totalPrice = plants.reduce((sum, p) => sum + p.price, 0);
        return {
          styleName: "ทรอปิคอลคาเฟ่ (Tropical Oasis)",
          plants,
          totalPrice,
          remainingBudget: b - totalPrice,
          curatorNote: "ดึงบรรยากาศป่าฝนเข้าสู่บ้านได้อย่างสมบูรณ์แบบ ทั้งไม้พุ่มและไม้เลื้อยพร้อมเสาค้ำ",
          placementTips: "จัดเป็นกลุ่มก้อนมุมห้องที่มีแสงรำไร ฉีดละอองน้ำช่วงเช้าเพื่อความสดชื่น",
        };
      } else {
        const plants: BundlePlant[] = [
          {
            nameTh: "มอนสเตอร่าด่างขาว Albo",
            nameEn: "Monstera Deliciosa Albo Variegata",
            potSize: "กระถาง 8 นิ้ว",
            price: 1800,
            highlight: "แรร์ไอเทม ลายด่างขาวกระจายทั่วใบ",
          },
          {
            nameTh: "เสน่ห์จันทร์ประกายดาว",
            nameEn: "Homalomena Rubescens Variegata",
            potSize: "กระถาง 8 นิ้ว",
            price: 790,
            highlight: "ด่างจุดชมพูประกายดาว ใบรูปหัวใจ",
          },
          {
            nameTh: "ฟิโลเดนดรอนก้ามกุ้งด่าง",
            nameEn: "Philodendron Florida Beauty",
            potSize: "กระถาง 8 นิ้ว",
            price: 550,
            highlight: "ฟอร์มใบแปลกตา ด่างเหลืองเข้ม",
          },
          {
            nameTh: "เซ็ตอุปกรณ์ดูแล & ปุ๋ยอินทรีย์พรีเมียม",
            nameEn: "Care Kit & Organic Booster",
            potSize: "ครบชุด",
            price: 250,
            highlight: "น้ำส้มควันไม้ + เชื้อราไตรโคเดอร์มา + ปุ๋ยออสโมโค้ท",
          },
        ];
        const totalPrice = plants.reduce((sum, p) => sum + p.price, 0);
        return {
          styleName: "ทรอปิคอลคาเฟ่ (Collector's Rainforest)",
          plants,
          totalPrice,
          remainingBudget: b - totalPrice,
          curatorNote: "เซ็ตสะสมพันธุ์ไม้ด่างระดับไฮเอนด์ สำหรับผู้หลงใหลในความงามและเสน่ห์ของธรรมชาติ",
          placementTips: "วางในจุดแสงรำไร อากาศถ่ายเทดี เลี่ยงแดดบ่ายตรงเพื่อปกป้องลายด่าง",
        };
      }
    } else {
      // air-purifier
      if (b < 1200) {
        const plants: BundlePlant[] = [
          {
            nameTh: "ลิ้นมังกรขอบเหลือง",
            nameEn: "Sansevieria Laurentii",
            potSize: "กระถาง 8 นิ้ว",
            price: 290,
            highlight: "ปล่อยออกซิเจนเวลากลางคืน เลี้ยงง่ายสุด",
          },
          {
            nameTh: "เดหลีใบมัน ดอกขาว",
            nameEn: "Peace Lily (Spathiphyllum)",
            potSize: "กระถาง 6 นิ้ว",
            price: 280,
            highlight: "ฟอกไอสารเคมีจากสีทาบ้านและน้ำยาทำความสะอาด",
          },
        ];
        const totalPrice = plants.reduce((sum, p) => sum + p.price, 0);
        return {
          styleName: "ไม้ฟอกอากาศเลี้ยงง่าย (Clean Air Duo)",
          plants,
          totalPrice,
          remainingBudget: b - totalPrice,
          curatorNote: "คู่หูฟอกอากาศตามมาตรฐาน NASA คายออกซิเจนทั้งกลางวันและกลางคืน",
          placementTips: "วางลิ้นมังกรในห้องนอน และวางเดหลีในห้องนั่งเล่นหรือห้องน้ำที่มีแสงรำไร",
        };
      } else if (b < 2600) {
        const plants: BundlePlant[] = [
          {
            nameTh: "ลิ้นมังกรทรงสูง พุ่มแน่น",
            nameEn: "Sansevieria Trifasciata 10\"",
            potSize: "กระถาง 10 นิ้ว",
            price: 450,
            highlight: "ฟอร์มสูงสง่า ดักจับฝุ่นละออง PM 2.5",
          },
          {
            nameTh: "กวักมรกตเขียว",
            nameEn: "ZZ Plant",
            potSize: "กระถาง 8 นิ้ว",
            price: 390,
            highlight: "ทนแล้ง ทนแสงน้อย ใบมันเงาขับสารพิษ",
          },
          {
            nameTh: "เดหลีด่างฟอกอากาศ",
            nameEn: "Spathiphyllum Domino Variegated",
            potSize: "กระถาง 8 นิ้ว",
            price: 420,
            highlight: "ดูดซับฟอร์มาลดีไฮด์และเบนซีน",
          },
          {
            nameTh: "เม็ดดินเผาโรยหน้ากระถาง Popper",
            nameEn: "Expanded Clay Pebbles",
            potSize: "ถุง 2 ลิตร",
            price: 90,
            highlight: "ช่วยเก็บความชื้นและกันหน้าดินกระเด็น",
          },
        ];
        const totalPrice = plants.reduce((sum, p) => sum + p.price, 0);
        return {
          styleName: "ไม้ฟอกอากาศเลี้ยงง่าย (Healthy Home Trio)",
          plants,
          totalPrice,
          remainingBudget: b - totalPrice,
          curatorNote: "ชุดสามสหายฟอกอากาศครบวงจร ทนทานต่อเครื่องปรับอากาศ รดน้ำสัปดาห์ละครั้ง",
          placementTips: "กระจายวางตามจุดต่างๆ ของบ้าน: ห้องนอน ห้องนั่งเล่น และห้องทำงาน",
        };
      } else {
        const plants: BundlePlant[] = [
          {
            nameTh: "ไทรใบสักทรงพุ่ม",
            nameEn: "Ficus Lyrata Tree",
            potSize: "กระถาง 12 นิ้ว",
            price: 1100,
            highlight: "ดักจับฝุ่นละอองในอากาศด้วยผิวใบขนาดใหญ่",
          },
          {
            nameTh: "กวักมรกตดำด่าง Raven",
            nameEn: "Zamioculcas Raven Variegated",
            potSize: "กระถาง 8 นิ้ว",
            price: 890,
            highlight: "ใบสีดำขลับตัดด่างเขียว ฟอกอากาศขั้นสูง",
          },
          {
            nameTh: "ชุดลิ้นมังกร 3 สายพันธุ์",
            nameEn: "Sansevieria Triple Collector",
            potSize: "กระถาง 8 นิ้ว",
            price: 750,
            highlight: "รวมพันธุ์ขอบทอง ซามูไร และมูนไชน์",
          },
          {
            nameTh: "ชุดดินผสมไบโอชาร์ดูดซับสารพิษ",
            nameEn: "Biochar Detox Soil Mix",
            potSize: "ถุง 10 ลิตร",
            price: 220,
            highlight: "ถ่านชีวภาพดูดซับกลิ่นอับและโลหะหนักในดิน",
          },
        ];
        const totalPrice = plants.reduce((sum, p) => sum + p.price, 0);
        return {
          styleName: "ไม้ฟอกอากาศเลี้ยงง่าย (Pure Sanctuary Suite)",
          plants,
          totalPrice,
          remainingBudget: b - totalPrice,
          curatorNote: "ที่สุดของการฟอกอากาศระดับพรีเมียม ผสานพันธุ์ไม้ฟอกอากาศที่ทนทานและทรงคุณค่า",
          placementTips: "เหมาะสำหรับบ้านพักอาศัยหรือคอนโดใจกลางเมืองที่ต้องการอากาศบริสุทธิ์สูงสุด",
        };
      }
    }
  };

  const currentBundle = getBundle(budget, selectedStyle);

  return (
    <div className="rounded-2xl border border-sand-200 dark:border-forest-800 bg-white dark:bg-forest-900 shadow-soft overflow-hidden">
      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-sand-200 dark:border-forest-800 bg-sand-50/50 dark:bg-forest-950/40">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-medium mb-1">
          <DollarSign className="w-3.5 h-3.5" />
          <span>Phase 2 AI Prototype</span>
        </div>
        <h3 className="text-xl font-bold font-serif text-forest-900 dark:text-sand-100">
          💰 โหมดงบเท่านี้ (Budget Plant Recommender)
        </h3>
        <p className="text-xs sm:text-sm text-sand-700 dark:text-sand-300">
          จัดเซ็ตต้นไม้และอุปกรณ์ดูแลให้คุ้มค่าที่สุดตามงบประมาณที่คุณกำหนด
        </p>

        {/* Budget Slider Section */}
        <div className="mt-5 space-y-3 p-4 rounded-xl bg-white dark:bg-forest-900 border border-sand-200 dark:border-forest-800">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="text-xs font-semibold text-sand-700 dark:text-sand-300 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-forest-700 dark:text-emerald-400" />
              <span>กำหนดงบประมาณที่คุณต้องการ (Budget Range):</span>
            </label>
            <div className="text-sm sm:text-base font-bold text-forest-900 dark:text-emerald-400 font-mono">
              งบประมาณ: {budget.toLocaleString()} บาท
            </div>
          </div>

          <input
            type="range"
            role="slider"
            aria-label="งบประมาณที่คุณต้องการ"
            min="500"
            max="5000"
            step="100"
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            className="w-full accent-forest-700 dark:accent-emerald-500 h-2 bg-sand-200 dark:bg-forest-800 rounded-lg cursor-pointer"
          />

          <div className="flex justify-between items-center text-[11px] text-sand-600 dark:text-sand-400">
            <span>500 ฿ (ขั้นต่ำ)</span>
            <span>2,500 ฿</span>
            <span>5,000 ฿ (สูงสุด)</span>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-sand-200/60 dark:border-forest-800">
            <span className="text-[11px] text-sand-600 dark:text-sand-400 self-center">
              งบลัด:
            </span>
            {quickBudgetPresets.map((preset) => (
              <button
                key={preset.value}
                onClick={() => setBudget(preset.value)}
                className={`px-2.5 py-1 rounded-lg text-xs transition ${
                  budget === preset.value
                    ? "bg-forest-800 text-sand-50 dark:bg-emerald-600 font-semibold"
                    : "bg-sand-100 dark:bg-forest-800 text-forest-800 dark:text-sand-200 hover:bg-sand-200"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Style Filter Pills */}
        <div className="mt-4 space-y-2">
          <label className="block text-xs font-semibold text-sand-700 dark:text-sand-300">
            เลือกสไตล์และบรรยากาศที่คุณชอบ:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {styles.map((style) => {
              const isSelected = style.id === selectedStyle;
              return (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  className={`text-left p-3 rounded-xl border text-xs transition ${
                    isSelected
                      ? "border-forest-600 bg-forest-50/70 dark:bg-forest-800/80 dark:border-emerald-500 font-medium text-forest-900 dark:text-sand-100 ring-2 ring-forest-500/20"
                      : "border-sand-200 dark:border-forest-800 bg-white dark:bg-forest-900/60 text-sand-800 dark:text-sand-300 hover:bg-sand-50 dark:hover:bg-forest-800/40"
                  }`}
                >
                  <div className="font-semibold">{style.label}</div>
                  <div className="text-[11px] text-sand-600 dark:text-sand-400 mt-0.5 line-clamp-1">
                    {style.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Bundle Listing */}
      <div className="p-5 sm:p-6 space-y-6">
        {/* Curated Bundle Card */}
        <div className="rounded-xl border border-sand-200 dark:border-forest-800 bg-sand-50/40 dark:bg-forest-950/30 p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-sand-200 dark:border-forest-800">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-forest-700 dark:text-emerald-400">
                เซ็ตที่คัดสรรให้คุณ:
              </span>
              <h4 className="text-base font-bold text-forest-900 dark:text-sand-100">
                {currentBundle.styleName}
              </h4>
            </div>
            <div className="text-right">
              <span className="text-xs text-sand-600 dark:text-sand-400 block">
                รวมงบประมาณที่ใช้:
              </span>
              <div className="text-lg font-bold text-emerald-800 dark:text-emerald-400 font-mono">
                รวมงบประมาณ {currentBundle.totalPrice.toLocaleString()} ฿
              </div>
              <span className="text-[11px] text-sand-600 dark:text-sand-400">
                (เหลืองบ {currentBundle.remainingBudget.toLocaleString()} ฿)
              </span>
            </div>
          </div>

          {/* Plant Items Table/List */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-sand-700 dark:text-sand-300 block">
              รายการพันธุ์ไม้และอุปกรณ์ในชุดนี้ ({currentBundle.plants.length} รายการ):
            </span>
            <div className="grid grid-cols-1 gap-2">
              {currentBundle.plants.map((item, idx) => (
                <div
                  key={idx}
                  className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-white dark:bg-forest-900 border border-sand-200 dark:border-forest-800 text-xs sm:text-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0">
                      <Leaf className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-forest-900 dark:text-sand-100">
                        {item.nameTh}
                      </div>
                      <div className="text-[11px] text-sand-600 dark:text-sand-400">
                        {item.nameEn} · {item.potSize}
                      </div>
                      <div className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                        จุดเด่น: {item.highlight}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-bold text-forest-900 dark:text-sand-100 font-mono">
                      {item.price.toLocaleString()} ฿
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rationale & Placement Tips */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-2">
            <div className="p-3 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 space-y-1">
              <strong className="text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>เหตุผลที่คัดสรรเซ็ตนี้:</span>
              </strong>
              <p className="text-forest-900 dark:text-sand-200 leading-relaxed">
                {currentBundle.curatorNote}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-sand-100/60 dark:bg-forest-900/60 border border-sand-200 dark:border-forest-800 space-y-1">
              <strong className="text-forest-900 dark:text-sand-100 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>คำแนะนำการจัดวาง:</span>
              </strong>
              <p className="text-sand-800 dark:text-sand-300 leading-relaxed">
                {currentBundle.placementTips}
              </p>
            </div>
          </div>

          {/* Action CTA */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-sand-200 dark:border-forest-800">
            <div className="text-xs text-sand-600 dark:text-sand-400">
              💡 ราคานี้รวมการจัดเตรียมวัสดุปลูกและบรรจุห่อกันกระแทกอย่างดี
            </div>
            <a
              href="https://line.me"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-forest-800 hover:bg-forest-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-sand-50 text-xs font-semibold shadow-soft transition"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>สั่งซื้อเซ็ตนี้ทาง LINE OA</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
