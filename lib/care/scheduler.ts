/**
 * Care Schedule Engine — The Heart of TreeForLife
 * Implements SPEC.md Section 5: Thai 3-Season Plant Care Logic & Factors
 */

export type ThaiSeason = "hot" | "rainy" | "cool";

export type PotMaterial = "terracotta" | "plastic" | "ceramic_glazed" | "cement" | "hanging";
export type Placement = "outdoor_sun" | "balcony_shade" | "indoor_window" | "indoor_far" | "air_con";

export interface CareTemplateInput {
  waterDaysHot: number;
  waterDaysRainy: number;
  waterDaysCool: number;
  fertilizeDays?: number | null;
  fertilizePauseMonths?: number[];
  repotMonths?: number | null;
  pruneDays?: number | null;
  pestCheckDays?: number | null;
}

export interface PlantConditionsInput {
  potSizeInch: number;
  potMaterial: PotMaterial;
  placement: Placement;
  customWaterDays?: number | null;
}

export interface CalculationBreakdown {
  season: ThaiSeason;
  seasonNameTh: string;
  seasonNameEn: string;
  baseDays: number;
  potMaterialFactor: number;
  potMaterialDesc: string;
  potSizeFactor: number;
  potSizeDesc: string;
  placementFactor: number;
  placementDesc: string;
  rawCalculation: number;
  finalDays: number;
  isCustom: boolean;
  explanationTh: string;
  explanationEn: string;
}

/**
 * Returns current Thai season based on month (1-12)
 * Hot: Mar-May (3-5)
 * Rainy: Jun-Oct (6-10)
 * Cool/Dry: Nov-Feb (11, 12, 1, 2)
 */
export function getThaiSeason(date: Date = new Date()): ThaiSeason {
  const month = date.getMonth() + 1; // 1-12
  if (month >= 3 && month <= 5) return "hot";
  if (month >= 6 && month <= 10) return "rainy";
  return "cool";
}

export function getThaiSeasonName(season: ThaiSeason): string {
  switch (season) {
    case "hot": return "ฤดูร้อน (มี.ค.–พ.ค.)";
    case "rainy": return "ฤดูฝน (มิ.ย.–ต.ค.)";
    case "cool": return "ฤดูหนาว/แล้ง (พ.ย.–ก.พ.)";
  }
}

export function getThaiSeasonNameEn(season: ThaiSeason): string {
  switch (season) {
    case "hot": return "Hot Season (Mar–May)";
    case "rainy": return "Rainy Season (Jun–Oct)";
    case "cool": return "Cool / Dry Season (Nov–Feb)";
  }
}

export const POT_MATERIAL_FACTORS: Record<
  PotMaterial,
  { factor: number; labelTh: string; descTh: string; labelEn: string; descEn: string }
> = {
  terracotta: {
    factor: 0.80,
    labelTh: "ดินเผา",
    descTh: "ระเหยผ่านผนังกระถาง ดินแห้งเร็ว",
    labelEn: "Terracotta",
    descEn: "Evaporates via porous walls, dries faster",
  },
  plastic: {
    factor: 1.00,
    labelTh: "พลาสติก",
    descTh: "กักเก็บความชื้นมาตรฐาน",
    labelEn: "Plastic",
    descEn: "Standard moisture retention",
  },
  hanging: {
    factor: 1.00,
    labelTh: "กระถางแขวน",
    descTh: "กักเก็บความชื้นมาตรฐาน ลมผ่านดี",
    labelEn: "Hanging Basket",
    descEn: "Standard moisture retention with good airflow",
  },
  ceramic_glazed: {
    factor: 1.15,
    labelTh: "เซรามิกเคลือบ",
    descTh: "ไม่ระบายน้ำทางผนัง ดินชื้นนาน",
    labelEn: "Glazed Ceramic",
    descEn: "Non-porous walls, stays moist longer",
  },
  cement: {
    factor: 1.15,
    labelTh: "ปูน/คอนกรีต",
    descTh: "ผนังหนา กักเก็บความชื้นสูง",
    labelEn: "Concrete / Cement",
    descEn: "Thick walls, high moisture retention",
  },
};

export function getPotSizeFactor(inches: number): {
  factor: number;
  labelTh: string;
  descTh: string;
  labelEn: string;
  descEn: string;
} {
  if (inches < 6) {
    return {
      factor: 0.85,
      labelTh: `< 6 นิ้ว (${inches}")`,
      descTh: "ดินน้อย ระเหยไว ดินแห้งเร็ว",
      labelEn: `< 6" (${inches}")`,
      descEn: "Low soil volume, dries faster",
    };
  }
  if (inches <= 10) {
    return {
      factor: 1.00,
      labelTh: `6–10 นิ้ว (${inches}")`,
      descTh: "ขนาดกระถางมาตรฐาน",
      labelEn: `6–10" (${inches}")`,
      descEn: "Standard pot size",
    };
  }
  return {
    factor: 1.20,
    labelTh: `> 10 นิ้ว (${inches}")`,
    descTh: "ปริมาณดินมาก อุ้มน้ำและความชื้นได้นาน",
    labelEn: `> 10" (${inches}")`,
    descEn: "Large soil volume, retains moisture longer",
  };
}

export const PLACEMENT_FACTORS: Record<
  Placement,
  { factor: number; labelTh: string; descTh: string; labelEn: string; descEn: string }
> = {
  outdoor_sun: {
    factor: 0.70,
    labelTh: "กลางแจ้งแดดเต็มวัน",
    descTh: "รับแดดจัดและลม ดินแห้งเร็วที่สุด",
    labelEn: "Outdoor Full Sun",
    descEn: "Direct sun and high wind, dries fastest",
  },
  balcony_shade: {
    factor: 0.90,
    labelTh: "ระเบียง/มีร่มรำไร",
    descTh: "มีลมถ่ายเท แสงสว่างพอเหมาะ",
    labelEn: "Balcony / Filtered",
    descEn: "Good breeze and bright filtered light",
  },
  indoor_window: {
    factor: 1.00,
    labelTh: "ในบ้านใกล้หน้าต่าง",
    descTh: "แสงทางอ้อมสว่าง ระบายอากาศปกติ",
    labelEn: "Indoor by Window",
    descEn: "Bright indirect light and standard ventilation",
  },
  indoor_far: {
    factor: 1.25,
    labelTh: "ในบ้านห่างหน้าต่าง",
    descTh: "แสงน้อย ดินคายน้ำช้า ต้องการน้ำน้อยลง",
    labelEn: "Indoor away from Window",
    descEn: "Lower light, slower water uptake",
  },
  air_con: {
    factor: 1.20,
    labelTh: "ห้องแอร์",
    descTh: "ไม่มีแดด อุณหภูมิเย็น สุทธิแล้วดินชื้นนานกว่า",
    labelEn: "Air-Conditioned Room",
    descEn: "No direct sunlight, cooler temperature",
  },
};

/**
 * Calculates watering interval in days with full transparency & explanation
 */
export function calculateWateringInterval(
  template: CareTemplateInput,
  conditions: PlantConditionsInput,
  date: Date = new Date()
): CalculationBreakdown {
  const season = getThaiSeason(date);
  const seasonNameTh = getThaiSeasonName(season);
  const seasonNameEn = getThaiSeasonNameEn(season);

  if (conditions.customWaterDays && conditions.customWaterDays > 0) {
    const finalDays = Math.min(30, Math.max(1, Math.round(conditions.customWaterDays)));
    return {
      season,
      seasonNameTh,
      seasonNameEn,
      baseDays: finalDays,
      potMaterialFactor: 1,
      potMaterialDesc: "กำหนดเอง",
      potSizeFactor: 1,
      potSizeDesc: "กำหนดเอง",
      placementFactor: 1,
      placementDesc: "กำหนดเอง",
      rawCalculation: finalDays,
      finalDays,
      isCustom: true,
      explanationTh: `คุณตั้งค่ารอบรดน้ำเอง: รดทุก ${finalDays} วัน`,
      explanationEn: `Custom interval: Every ${finalDays} days`,
    };
  }

  let baseDays = template.waterDaysRainy;
  if (season === "hot") baseDays = template.waterDaysHot;
  if (season === "cool") baseDays = template.waterDaysCool;

  const mat = POT_MATERIAL_FACTORS[conditions.potMaterial] || POT_MATERIAL_FACTORS.plastic;
  const size = getPotSizeFactor(Number(conditions.potSizeInch) || 6);
  const place = PLACEMENT_FACTORS[conditions.placement] || PLACEMENT_FACTORS.indoor_window;

  const raw = baseDays * mat.factor * size.factor * place.factor;
  // Rule: Round to integer, clamp between 1 and 30 days
  const finalDays = Math.min(30, Math.max(1, Math.round(raw)));

  const explanationTh = `${seasonNameTh} (ฐาน ${baseDays} วัน) × กระถาง${mat.labelTh} (×${mat.factor}) × ขนาด ${size.labelTh} (×${size.factor}) × ตำแหน่ง${place.labelTh} (×${place.factor}) = ${raw.toFixed(2)} → รดทุก ${finalDays} วัน`;
  const explanationEn = `${seasonNameEn} (Base ${baseDays}d) × Pot ${mat.labelEn} (×${mat.factor}) × Size ${size.labelEn} (×${size.factor}) × Location ${place.labelEn} (×${place.factor}) = ${raw.toFixed(2)} → Every ${finalDays} days`;

  return {
    season,
    seasonNameTh,
    seasonNameEn,
    baseDays,
    potMaterialFactor: mat.factor,
    potMaterialDesc: mat.descTh,
    potSizeFactor: size.factor,
    potSizeDesc: size.descTh,
    placementFactor: place.factor,
    placementDesc: place.descTh,
    rawCalculation: raw,
    finalDays,
    isCustom: false,
    explanationTh,
    explanationEn,
  };
}

/**
 * Calculates next due date when watered on a specific date
 */
export function calculateNextDueDate(performedDate: Date, intervalDays: number): Date {
  const next = new Date(performedDate);
  next.setDate(next.getDate() + intervalDays);
  return next;
}

/**
 * Evaluates whether user's watering behavior suggests adjusting the interval
 * If watered late by more than 2x the interval, prompt user to adapt
 */
export function checkAdaptiveIntervalSuggestion(
  scheduledDueDate: Date,
  actualWateredDate: Date,
  currentIntervalDays: number
): { shouldSuggest: boolean; suggestedIntervalDays?: number; messageTh?: string; messageEn?: string } {
  const diffTime = actualWateredDate.getTime() - scheduledDueDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  // Overdue by more than interval (total elapsed since previous water >= 2x interval)
  if (diffDays >= currentIntervalDays && currentIntervalDays < 20) {
    const suggested = Math.min(30, currentIntervalDays + Math.round(diffDays / 2));
    return {
      shouldSuggest: true,
      suggestedIntervalDays: suggested,
      messageTh: `รอบนี้คุณรดช้ากว่ากำหนด ${diffDays} วัน หากต้นไม้ยังดูสดชื่นดี อยากปรับรอบเป็นทุก ${suggested} วันแทนไหมครับ?`,
      messageEn: `You watered ${diffDays} days later than scheduled. If your plant looks healthy, would you like to adjust the interval to every ${suggested} days?`,
    };
  }

  return { shouldSuggest: false };
}

/**
 * Human readable Thai care summary for plant detail pages
 */
export function formatCareSummaryTh(template: CareTemplateInput): {
  waterSummary: string;
  fertilizeSummary: string;
  repotSummary: string;
} {
  const waterSummary = `ฤดูร้อนรดทุก ${template.waterDaysHot} วัน · ฤดูฝนทุก ${template.waterDaysRainy} วัน · ฤดูหนาว/แล้งทุก ${template.waterDaysCool} วัน (ปรับตามกระถางและตำแหน่งจริง)`;

  let fertilizeSummary = "ให้ปุ๋ยบำรุงตามความเหมาะสม";
  if (template.fertilizeDays) {
    fertilizeSummary = `ใส่ปุ๋ยทุก ~${template.fertilizeDays} วัน`;
    if (template.fertilizePauseMonths && template.fertilizePauseMonths.length > 0) {
      const monthNames = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
      const pausedNames = template.fertilizePauseMonths.map(m => monthNames[m - 1]).join(", ");
      fertilizeSummary += ` (งดปุ๋ยช่วง ${pausedNames})`;
    }
  }

  const repotSummary = template.repotMonths
    ? `เปลี่ยนกระถาง/เติมดินทุกประมาณ ${template.repotMonths} เดือน`
    : "เปลี่ยนกระถางเมื่อรากเริ่มแน่นก้นกระถาง";

  return {
    waterSummary,
    fertilizeSummary,
    repotSummary,
  };
}
