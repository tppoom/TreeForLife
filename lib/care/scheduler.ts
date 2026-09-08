/**
 * TreeForLife Care Schedule Engine
 * Implements SPEC.md §5 and Phase 1 Design Spec §4:
 * - Thai 3-Season calendar mapping (Hot, Rainy, Cool)
 * - Environmental microclimate multipliers (Pot Material, Pot Size, Placement)
 * - Dynamic interval calculation with clamping (1 to 30 days) and custom overrides
 * - Real-time schedule explanations (Thai & English)
 * - Task rollover transitions (Complete, Snooze up to 3x, Skip)
 * - Adaptive watering suggestions & care summaries
 */

export type ThaiSeason = "hot" | "rainy" | "cool";

export type PotMaterial =
  | "terracotta"
  | "plastic"
  | "ceramic_glazed"
  | "cement"
  | "hanging";

export type Placement =
  | "outdoor_sun"
  | "balcony_shade"
  | "indoor_window"
  | "indoor_far"
  | "air_con";

export const MIN_WATER_DAYS = 1;
export const MAX_WATER_DAYS = 30;
export const MAX_SNOOZE_COUNT = 3;

/**
 * Pot material multipliers (§4.2)
 * Terracotta: dries quickly due to porous walls (0.80)
 * Plastic / Hanging: standard baseline (1.00)
 * Glazed ceramic / Cement: retains moisture longer (1.15)
 */
export const POT_MATERIAL_MULTIPLIERS: Record<PotMaterial, number> = {
  terracotta: 0.8,
  plastic: 1.0,
  hanging: 1.0,
  ceramic_glazed: 1.15,
  cement: 1.15,
};

export const POT_MATERIAL_FACTORS: Record<
  PotMaterial,
  { factor: number; labelTh: string; descTh: string; labelEn: string; descEn: string }
> = {
  terracotta: {
    factor: 0.8,
    labelTh: "ดินเผา",
    descTh: "ระเหยผ่านผนังกระถาง ดินแห้งเร็วกว่าปกติ",
    labelEn: "Terracotta",
    descEn: "Porous walls allow moisture to evaporate quickly",
  },
  plastic: {
    factor: 1.0,
    labelTh: "พลาสติก",
    descTh: "ค่ามาตรฐาน ไม่อมน้ำและไม่ระเหยออกข้าง",
    labelEn: "Plastic",
    descEn: "Standard baseline container",
  },
  hanging: {
    factor: 1.0,
    labelTh: "กระถางแขวน",
    descTh: "ค่ามาตรฐาน แขวนรับลมระบายดี",
    labelEn: "Hanging Basket",
    descEn: "Standard baseline hanging container",
  },
  ceramic_glazed: {
    factor: 1.15,
    labelTh: "เซรามิกเคลือบ",
    descTh: "ไม่ระบายน้ำทางผนัง อุ้มความชื้นนานกว่าปกติ",
    labelEn: "Glazed Ceramic",
    descEn: "Non-porous glaze traps moisture inside soil longer",
  },
  cement: {
    factor: 1.15,
    labelTh: "ปูน/คอนกรีต",
    descTh: "ผนังหนา เก็บความชื้นได้นานกว่าพลาสติก",
    labelEn: "Cement / Concrete",
    descEn: "Thick walls retain moisture longer than plastic",
  },
};

/**
 * Pot size multipliers (§4.2)
 * < 6 inches: small soil mass, dries faster (0.85)
 * 6 - 10 inches: medium standard baseline (1.00)
 * > 10 inches: large soil volume, retains water longer (1.20)
 */
export const POT_SIZE_MULTIPLIERS = {
  small: 0.85,
  medium: 1.0,
  large: 1.2,
} as const;

export function getPotSizeDetail(inches: number): {
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
      descTh: "ปริมาณดินน้อย แห้งเร็วกว่า",
      labelEn: `< 6" (${inches}")`,
      descEn: "Small soil mass dries faster",
    };
  }
  if (inches <= 10) {
    return {
      factor: 1.0,
      labelTh: `6–10 นิ้ว (${inches}")`,
      descTh: "ขนาดกระถางมาตรฐาน",
      labelEn: `6–10" (${inches}")`,
      descEn: "Standard pot size",
    };
  }
  return {
    factor: 1.2,
    labelTh: `> 10 นิ้ว (${inches}")`,
    descTh: "ปริมาณดินมาก อุ้มน้ำและความชื้นได้นาน",
    labelEn: `> 10" (${inches}")`,
    descEn: "Large soil volume, retains moisture longer",
  };
}

/**
 * Placement microclimate multipliers (§4.2)
 * Full Sun Outdoor: fastest evaporation (0.70)
 * Balcony / Partial Shade: moderate evaporation (0.90)
 * Bright Indoor Window: baseline (1.00)
 * Dim Indoor / Far from Window: slow evaporation (1.25)
 * Air-conditioned room: low temp, net slower soil dry time (1.20)
 */
export const PLACEMENT_MULTIPLIERS: Record<Placement, number> = {
  outdoor_sun: 0.7,
  balcony_shade: 0.9,
  indoor_window: 1.0,
  indoor_far: 1.25,
  air_con: 1.2,
};

export const PLACEMENT_FACTORS: Record<
  Placement,
  { factor: number; labelTh: string; descTh: string; labelEn: string; descEn: string }
> = {
  outdoor_sun: {
    factor: 0.7,
    labelTh: "กลางแจ้งแดดเต็มวัน",
    descTh: "รับแดดจัดและลม ดินแห้งเร็วที่สุด",
    labelEn: "Outdoor Full Sun",
    descEn: "Direct sun and high wind, dries fastest",
  },
  balcony_shade: {
    factor: 0.9,
    labelTh: "ระเบียง/มีร่มรำไร",
    descTh: "มีลมถ่ายเท แสงสว่างพอเหมาะ",
    labelEn: "Balcony / Filtered",
    descEn: "Good breeze and bright filtered light",
  },
  indoor_window: {
    factor: 1.0,
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
    factor: 1.2,
    labelTh: "ห้องแอร์",
    descTh: "ไม่มีแดด อุณหภูมิเย็น สุทธิแล้วดินชื้นนานกว่า",
    labelEn: "Air-Conditioned Room",
    descEn: "No direct sunlight, cooler temperature",
  },
};

export interface SeasonInfo {
  season: ThaiSeason;
  nameTh: string;
  nameEn: string;
  monthsTh: string;
  monthsEn: string;
}

export const THAI_SEASONS_INFO: Record<ThaiSeason, SeasonInfo> = {
  hot: {
    season: "hot",
    nameTh: "ฤดูร้อน",
    nameEn: "Hot Season",
    monthsTh: "มี.ค. – พ.ค.",
    monthsEn: "Mar – May",
  },
  rainy: {
    season: "rainy",
    nameTh: "ฤดูฝน",
    nameEn: "Rainy Season",
    monthsTh: "มิ.ย. – ต.ค.",
    monthsEn: "Jun – Oct",
  },
  cool: {
    season: "cool",
    nameTh: "ฤดูหนาว/แล้ง",
    nameEn: "Cool / Dry Season",
    monthsTh: "พ.ย. – ก.พ.",
    monthsEn: "Nov – Feb",
  },
};

/**
 * Returns Thai season name in Thai
 */
export function getThaiSeasonName(season: ThaiSeason): string {
  switch (season) {
    case "hot":
      return "ฤดูร้อน (มี.ค.–พ.ค.)";
    case "rainy":
      return "ฤดูฝน (มิ.ย.–ต.ค.)";
    case "cool":
      return "ฤดูหนาว/แล้ง (พ.ย.–ก.พ.)";
  }
}

/**
 * Returns Thai season name in English
 */
export function getThaiSeasonNameEn(season: ThaiSeason): string {
  switch (season) {
    case "hot":
      return "Hot Season (Mar–May)";
    case "rainy":
      return "Rainy Season (Jun–Oct)";
    case "cool":
      return "Cool / Dry Season (Nov–Feb)";
  }
}

/**
 * Determine Thai Season based on calendar date (§4.1 / §5.2)
 * - Hot (ฤดูร้อน): March – May (months 3, 4, 5)
 * - Rainy (ฤดูฝน): June – October (months 6, 7, 8, 9, 10)
 * - Cool / Dry (ฤดูหนาว/แล้ง): November – February (months 11, 12, 1, 2)
 */
export function getThaiSeason(dateInput?: Date | string | number | null): ThaiSeason {
  if (!dateInput) {
    const now = new Date();
    const month = now.getMonth() + 1; // 1-12
    return getSeasonFromMonth(month);
  }

  if (typeof dateInput === "string") {
    const match = dateInput.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const month = parseInt(match[2], 10);
      return getSeasonFromMonth(month);
    }
  }

  const d = new Date(dateInput);
  if (isNaN(d.getTime())) {
    const now = new Date();
    return getSeasonFromMonth(now.getMonth() + 1);
  }

  return getSeasonFromMonth(d.getMonth() + 1);
}

function getSeasonFromMonth(month: number): ThaiSeason {
  if (month >= 3 && month <= 5) {
    return "hot";
  }
  if (month >= 6 && month <= 10) {
    return "rainy";
  }
  return "cool";
}

/**
 * Get localized season metadata
 */
export function getThaiSeasonInfo(season: ThaiSeason): SeasonInfo {
  return THAI_SEASONS_INFO[season] ?? THAI_SEASONS_INFO.hot;
}

/**
 * Pot material factor lookup
 */
export function getPotMaterialFactor(material?: string | null): number {
  if (!material) return 1.0;
  return POT_MATERIAL_MULTIPLIERS[material as PotMaterial] ?? 1.0;
}

/**
 * Pot size factor lookup
 */
export function getPotSizeFactor(sizeInch?: number | string | null): number {
  if (sizeInch === null || sizeInch === undefined || sizeInch === "") return 1.0;
  const size = typeof sizeInch === "string" ? parseFloat(sizeInch) : sizeInch;
  if (isNaN(size)) return 1.0;

  if (size < 6) return POT_SIZE_MULTIPLIERS.small;
  if (size <= 10) return POT_SIZE_MULTIPLIERS.medium;
  return POT_SIZE_MULTIPLIERS.large;
}

/**
 * Placement factor lookup
 */
export function getPlacementFactor(placement?: string | null): number {
  if (!placement) return 1.0;
  return PLACEMENT_MULTIPLIERS[placement as Placement] ?? 1.0;
}

export interface CareTemplateInput {
  waterDaysHot: number;
  waterDaysRainy: number;
  waterDaysCool: number;
  water_days_hot?: number;
  water_days_rainy?: number;
  water_days_cool?: number;
  fertilizeDays?: number | null;
  fertilizePauseMonths?: number[] | null;
  repotMonths?: number | null;
  pruneDays?: number | null;
  pestCheckDays?: number | null;
}

export interface PlantCareConfig {
  potSizeInch?: number | string | null;
  pot_size_inch?: number | string | null;
  potMaterial?: PotMaterial | string | null;
  pot_material?: PotMaterial | string | null;
  placement?: Placement | string | null;
  customWaterDays?: number | null;
  custom_water_days?: number | null;
}

export type PlantConditionsInput = PlantCareConfig;

export interface CalculateCareIntervalParams {
  waterDaysHot?: number;
  waterDaysRainy?: number;
  waterDaysCool?: number;
  potMaterial?: PotMaterial | string | null;
  potSizeInch?: number | string | null;
  placement?: Placement | string | null;
  customWaterDays?: number | null;
  date?: Date | string | null;
  season?: ThaiSeason;
  template?: CareTemplateInput;
  plantConfig?: PlantCareConfig;
}

/**
 * Calculate care interval in days (§4.2 / §4.3)
 * Formula: Math.round(base_days(season) * material * size * placement)
 * Clamped between 1 and 30 days.
 * Custom days override bypasses multipliers.
 */
export function calculateCareInterval(params: CalculateCareIntervalParams): number {
  const customDays =
    params.customWaterDays ??
    params.plantConfig?.customWaterDays ??
    params.plantConfig?.custom_water_days;

  if (customDays !== undefined && customDays !== null && customDays > 0) {
    return Math.min(MAX_WATER_DAYS, Math.max(MIN_WATER_DAYS, Math.round(customDays)));
  }

  const season = params.season ?? getThaiSeason(params.date);

  const hotBase =
    params.waterDaysHot ??
    params.template?.waterDaysHot ??
    params.template?.water_days_hot ??
    3;
  const rainyBase =
    params.waterDaysRainy ??
    params.template?.waterDaysRainy ??
    params.template?.water_days_rainy ??
    5;
  const coolBase =
    params.waterDaysCool ??
    params.template?.waterDaysCool ??
    params.template?.water_days_cool ??
    7;

  let baseDays = rainyBase;
  if (season === "hot") baseDays = hotBase;
  else if (season === "cool") baseDays = coolBase;

  const potMaterial =
    params.potMaterial ??
    params.plantConfig?.potMaterial ??
    params.plantConfig?.pot_material;
  const potSize =
    params.potSizeInch ??
    params.plantConfig?.potSizeInch ??
    params.plantConfig?.pot_size_inch;
  const placement = params.placement ?? params.plantConfig?.placement;

  const materialFactor = getPotMaterialFactor(potMaterial);
  const sizeFactor = getPotSizeFactor(potSize);
  const placementFactor = getPlacementFactor(placement);

  const rawCalculated = baseDays * materialFactor * sizeFactor * placementFactor;
  const rounded = Math.round(rawCalculated);

  return Math.min(MAX_WATER_DAYS, Math.max(MIN_WATER_DAYS, rounded));
}

export interface FactorDetail<T = string | number> {
  value: T;
  factor: number;
  labelTh: string;
  labelEn: string;
  reasonTh?: string;
  reasonEn?: string;
}

export interface CareScheduleExplanation {
  season: ThaiSeason;
  seasonLabelTh: string;
  seasonLabelEn: string;
  baseDays: number;
  materialFactor: number;
  sizeFactor: number;
  placementFactor: number;
  rawCalculatedDays: number;
  finalIntervalDays: number;
  isCustom: boolean;
  formula: string;
  descriptionTh: string;
  descriptionEn: string;
  factors: {
    potMaterial: FactorDetail<string>;
    potSize: FactorDetail<number | string>;
    placement: FactorDetail<string>;
    season: FactorDetail<ThaiSeason>;
  };
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

const MATERIAL_LABELS: Record<
  PotMaterial,
  { labelTh: string; labelEn: string; reasonTh: string; reasonEn: string }
> = {
  terracotta: {
    labelTh: "กระถางดินเผา",
    labelEn: "Terracotta Pot",
    reasonTh: "ระเหยผ่านผนังกระถาง แห้งเร็ว (×0.80)",
    reasonEn: "Porous walls allow fast evaporation (×0.80)",
  },
  plastic: {
    labelTh: "กระถางพลาสติก",
    labelEn: "Plastic Pot",
    reasonTh: "ค่ามาตรฐาน (×1.00)",
    reasonEn: "Standard baseline (×1.00)",
  },
  hanging: {
    labelTh: "กระถางแขวน",
    labelEn: "Hanging Basket",
    reasonTh: "ค่ามาตรฐาน (×1.00)",
    reasonEn: "Standard baseline (×1.00)",
  },
  ceramic_glazed: {
    labelTh: "เซรามิกเคลือบ",
    labelEn: "Glazed Ceramic",
    reasonTh: "ไม่ระบายน้ำ อุ้มความชื้นนาน (×1.15)",
    reasonEn: "Non-porous glaze retains moisture longer (×1.15)",
  },
  cement: {
    labelTh: "กระถางปูน/คอนกรีต",
    labelEn: "Cement / Concrete",
    reasonTh: "ผนังหนา ชื้นนาน (×1.15)",
    reasonEn: "Thick walls retain moisture longer (×1.15)",
  },
};

const PLACEMENT_LABELS: Record<
  Placement,
  { labelTh: string; labelEn: string; reasonTh: string; reasonEn: string }
> = {
  outdoor_sun: {
    labelTh: "กลางแจ้งแดดเต็ม",
    labelEn: "Full Sun Outdoor",
    reasonTh: "แดดแรง ดินแห้งเร็วสุด (×0.70)",
    reasonEn: "High sunlight and wind dry soil fastest (×0.70)",
  },
  balcony_shade: {
    labelTh: "ระเบียง/มีร่มรำไร",
    labelEn: "Balcony / Partial Shade",
    reasonTh: "แดดรำไร ระบายอากาศดี (×0.90)",
    reasonEn: "Moderate light and good airflow (×0.90)",
  },
  indoor_window: {
    labelTh: "ในบ้านใกล้หน้าต่าง",
    labelEn: "Bright Indoor Window",
    reasonTh: "แสงสว่างสม่ำเสมอ มาตรฐาน (×1.00)",
    reasonEn: "Consistent indirect bright light (×1.00)",
  },
  indoor_far: {
    labelTh: "ในบ้านห่างหน้าต่าง",
    labelEn: "Dim Indoor / Far from Window",
    reasonTh: "แสงน้อย ดินแห้งช้า (×1.25)",
    reasonEn: "Lower light, soil dries slowly (×1.25)",
  },
  air_con: {
    labelTh: "ห้องแอร์",
    labelEn: "Air-Conditioned Room",
    reasonTh: "อุณหภูมิต่ำ สุทธิแล้วชื้นนานกว่า (×1.20)",
    reasonEn: "Cool temperature slows down soil drying (×1.20)",
  },
};

/**
 * Explain Care Schedule with formula breakdown (§4.3 / §5.4)
 */
export function explainCareSchedule(
  params: CalculateCareIntervalParams
): CareScheduleExplanation {
  const customDays =
    params.customWaterDays ??
    params.plantConfig?.customWaterDays ??
    params.plantConfig?.custom_water_days;

  const season = params.season ?? getThaiSeason(params.date);
  const seasonInfo = getThaiSeasonInfo(season);

  const hotBase =
    params.waterDaysHot ??
    params.template?.waterDaysHot ??
    params.template?.water_days_hot ??
    3;
  const rainyBase =
    params.waterDaysRainy ??
    params.template?.waterDaysRainy ??
    params.template?.water_days_rainy ??
    5;
  const coolBase =
    params.waterDaysCool ??
    params.template?.waterDaysCool ??
    params.template?.water_days_cool ??
    7;

  let baseDays = rainyBase;
  if (season === "hot") baseDays = hotBase;
  else if (season === "cool") baseDays = coolBase;

  const potMaterial =
    params.potMaterial ??
    params.plantConfig?.potMaterial ??
    params.plantConfig?.pot_material ??
    "plastic";
  const potSize =
    params.potSizeInch ??
    params.plantConfig?.potSizeInch ??
    params.plantConfig?.pot_size_inch ??
    8;
  const placement =
    params.placement ?? params.plantConfig?.placement ?? "indoor_window";

  const materialFactor = getPotMaterialFactor(potMaterial);
  const sizeFactor = getPotSizeFactor(potSize);
  const placementFactor = getPlacementFactor(placement);

  const isCustom = customDays !== undefined && customDays !== null && customDays > 0;
  const rawCalculatedDays = isCustom
    ? Number(customDays)
    : baseDays * materialFactor * sizeFactor * placementFactor;
  const finalIntervalDays = calculateCareInterval(params);

  const matMeta =
    MATERIAL_LABELS[potMaterial as PotMaterial] ?? {
      labelTh: String(potMaterial),
      labelEn: String(potMaterial),
      reasonTh: `(×${materialFactor.toFixed(2)})`,
      reasonEn: `(×${materialFactor.toFixed(2)})`,
    };

  const placeMeta =
    PLACEMENT_LABELS[placement as Placement] ?? {
      labelTh: String(placement),
      labelEn: String(placement),
      reasonTh: `(×${placementFactor.toFixed(2)})`,
      reasonEn: `(×${placementFactor.toFixed(2)})`,
    };

  const numericSize =
    typeof potSize === "string" ? parseFloat(potSize) || 8 : Number(potSize);
  let sizeLabelTh = '6–10" (มาตรฐาน)';
  let sizeLabelEn = '6–10" (Standard)';
  let sizeReasonTh = "ขนาดมาตรฐาน (×1.00)";
  let sizeReasonEn = "Standard size (×1.00)";

  if (numericSize < 6) {
    sizeLabelTh = '< 6" (เล็ก)';
    sizeLabelEn = '< 6" (Small)';
    sizeReasonTh = "ดินน้อย แห้งเร็ว (×0.85)";
    sizeReasonEn = "Small soil volume dries faster (×0.85)";
  } else if (numericSize > 10) {
    sizeLabelTh = '> 10" (ใหญ่)';
    sizeLabelEn = '> 10" (Large)';
    sizeReasonTh = "ดินเยอะ อุ้มน้ำนาน (×1.20)";
    sizeReasonEn = "Large soil mass holds moisture longer (×1.20)";
  }

  let formula = "";
  let descriptionTh = "";
  let descriptionEn = "";

  if (isCustom) {
    formula = `กำหนดเอง: ${finalIntervalDays} วัน (ข้ามตัวคูณทั้งหมด)`;
    descriptionTh = `รอบรดน้ำถูกกำหนดเอง: ทุก ${finalIntervalDays} วัน (ไม่ใช้ตัวคูณอัตโนมัติ)`;
    descriptionEn = `Custom watering interval: every ${finalIntervalDays} days (bypasses automatic multipliers)`;
  } else {
    formula = `${baseDays} × ${materialFactor.toFixed(2)} × ${sizeFactor.toFixed(2)} × ${placementFactor.toFixed(2)} = ${rawCalculatedDays.toFixed(2)} → ${finalIntervalDays} วัน`;
    descriptionTh = `ช่วง${seasonInfo.nameTh} (${seasonInfo.monthsTh}): ค่าพื้นฐาน ${baseDays} วัน × ${matMeta.labelTh} × กระถาง ${sizeLabelTh} × ${placeMeta.labelTh} → แนะนำรดน้ำทุก ${finalIntervalDays} วัน`;
    descriptionEn = `During ${seasonInfo.nameEn} (${seasonInfo.monthsEn}): base ${baseDays} days × ${matMeta.labelEn} × Pot ${sizeLabelEn} × ${placeMeta.labelEn} → Recommended interval: every ${finalIntervalDays} days`;
  }

  return {
    season,
    seasonLabelTh: seasonInfo.nameTh,
    seasonLabelEn: seasonInfo.nameEn,
    baseDays,
    materialFactor,
    sizeFactor,
    placementFactor,
    rawCalculatedDays,
    finalIntervalDays,
    isCustom,
    formula,
    descriptionTh,
    descriptionEn,
    factors: {
      potMaterial: {
        value: String(potMaterial),
        factor: materialFactor,
        labelTh: matMeta.labelTh,
        labelEn: matMeta.labelEn,
        reasonTh: matMeta.reasonTh,
        reasonEn: matMeta.reasonEn,
      },
      potSize: {
        value: potSize,
        factor: sizeFactor,
        labelTh: sizeLabelTh,
        labelEn: sizeLabelEn,
        reasonTh: sizeReasonTh,
        reasonEn: sizeReasonEn,
      },
      placement: {
        value: String(placement),
        factor: placementFactor,
        labelTh: placeMeta.labelTh,
        labelEn: placeMeta.labelEn,
        reasonTh: placeMeta.reasonTh,
        reasonEn: placeMeta.reasonEn,
      },
      season: {
        value: season,
        factor: 1.0,
        labelTh: seasonInfo.nameTh,
        labelEn: seasonInfo.nameEn,
        reasonTh: seasonInfo.monthsTh,
        reasonEn: seasonInfo.monthsEn,
      },
    },
  };
}

/**
 * Legacy wrapper: Calculates watering interval in days with full transparency & explanation
 */
export function calculateWateringInterval(
  template: CareTemplateInput,
  conditions: PlantConditionsInput,
  date: Date = new Date()
): CalculationBreakdown {
  const explanation = explainCareSchedule({
    template,
    plantConfig: conditions,
    date,
  });

  return {
    season: explanation.season,
    seasonNameTh: explanation.seasonLabelTh,
    seasonNameEn: explanation.seasonLabelEn,
    baseDays: explanation.baseDays,
    potMaterialFactor: explanation.materialFactor,
    potMaterialDesc: explanation.factors.potMaterial.labelTh,
    potSizeFactor: explanation.sizeFactor,
    potSizeDesc: explanation.factors.potSize.labelTh,
    placementFactor: explanation.placementFactor,
    placementDesc: explanation.factors.placement.labelTh,
    rawCalculation: explanation.rawCalculatedDays,
    finalDays: explanation.finalIntervalDays,
    isCustom: explanation.isCustom,
    explanationTh: explanation.descriptionTh,
    explanationEn: explanation.descriptionEn,
  };
}

/**
 * Helper to format a Date into YYYY-MM-DD
 */
export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Helper to parse Date | string safely without timezone skew
 */
export function parseDateSafe(dateInput: Date | string): Date {
  if (dateInput instanceof Date) {
    return new Date(dateInput.getTime());
  }
  if (typeof dateInput === "string") {
    const match = dateInput.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const y = parseInt(match[1], 10);
      const m = parseInt(match[2], 10);
      const d = parseInt(match[3], 10);
      return new Date(y, m - 1, d);
    }
  }
  return new Date(dateInput);
}

/**
 * Generate next task due date string in YYYY-MM-DD format (§4.4)
 */
export function generateNextTaskDue(currentDate: Date | string, intervalDays: number): string {
  const d = parseDateSafe(currentDate);
  d.setDate(d.getDate() + intervalDays);
  return formatDate(d);
}

/**
 * Calculates next due date as a Date object
 */
export function calculateNextDueDate(performedDate: Date, intervalDays: number): Date {
  const next = new Date(performedDate);
  next.setDate(next.getDate() + intervalDays);
  return next;
}

/**
 * Rollover: Calculate next due date when marking task complete (§4.4 / §5.5)
 * Next due date = completedDate + interval
 */
export function calculateCompletionNextDue(
  completedDate: Date | string,
  intervalDays: number
): string {
  return generateNextTaskDue(completedDate, intervalDays);
}

/**
 * Rollover: Calculate snooze due date (§4.4 / §5.5)
 * Postpones dueDate by +1 day (up to 3 consecutive times)
 */
export function calculateSnoozeDueDate(
  currentDueDate: Date | string,
  currentSnoozeCount: number = 0
): {
  nextDueDate: string;
  newSnoozeCount: number;
  canSnooze: boolean;
} {
  const formattedCurrent =
    typeof currentDueDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(currentDueDate)
      ? currentDueDate
      : formatDate(parseDateSafe(currentDueDate));

  if (currentSnoozeCount >= MAX_SNOOZE_COUNT) {
    return {
      nextDueDate: formattedCurrent,
      newSnoozeCount: currentSnoozeCount,
      canSnooze: false,
    };
  }

  const nextDueDate = generateNextTaskDue(currentDueDate, 1);
  const newSnoozeCount = currentSnoozeCount + 1;
  const canSnooze = newSnoozeCount < MAX_SNOOZE_COUNT;

  return {
    nextDueDate,
    newSnoozeCount,
    canSnooze,
  };
}

/**
 * Rollover: Calculate next cycle when skipping a task (§4.4 / §5.5)
 * Advances to next regular cycle without writing to care logs.
 */
export function calculateSkipNextDue(
  baseDate: Date | string,
  intervalDays: number
): string {
  return generateNextTaskDue(baseDate, intervalDays);
}

export interface TaskRolloverInput {
  action: "complete" | "snooze" | "skip";
  currentDueDate: Date | string;
  actionDate?: Date | string;
  intervalDays: number;
  snoozeCount?: number;
}

export interface TaskRolloverResult {
  taskStatus: "done" | "snoozed" | "skipped";
  nextDueDate: string;
  snoozeCount: number;
  shouldLog: boolean;
}

/**
 * Handle state transitions for task lifecycle actions (§4.4)
 */
export function rolloverTask(input: TaskRolloverInput): TaskRolloverResult {
  const actionDate = input.actionDate ?? new Date();
  const currentSnoozes = input.snoozeCount ?? 0;

  switch (input.action) {
    case "complete": {
      return {
        taskStatus: "done",
        nextDueDate: calculateCompletionNextDue(actionDate, input.intervalDays),
        snoozeCount: 0,
        shouldLog: true,
      };
    }
    case "snooze": {
      const snooze = calculateSnoozeDueDate(input.currentDueDate, currentSnoozes);
      return {
        taskStatus: "snoozed",
        nextDueDate: snooze.nextDueDate,
        snoozeCount: snooze.newSnoozeCount,
        shouldLog: false,
      };
    }
    case "skip": {
      return {
        taskStatus: "skipped",
        nextDueDate: calculateSkipNextDue(actionDate, input.intervalDays),
        snoozeCount: 0,
        shouldLog: false,
      };
    }
  }
}

/**
 * Evaluates whether user's watering behavior suggests adjusting the interval
 * If watered late by more than 2x the interval, prompt user to adapt
 */
export function checkAdaptiveIntervalSuggestion(
  scheduledDueDate: Date,
  actualWateredDate: Date,
  currentIntervalDays: number
): {
  shouldSuggest: boolean;
  suggestedIntervalDays?: number;
  messageTh?: string;
  messageEn?: string;
} {
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
      const monthNames = [
        "ม.ค.",
        "ก.พ.",
        "มี.ค.",
        "เม.ย.",
        "พ.ค.",
        "มิ.ย.",
        "ก.ค.",
        "ส.ค.",
        "ก.ย.",
        "ต.ค.",
        "พ.ย.",
        "ธ.ค.",
      ];
      const pausedNames = template.fertilizePauseMonths
        .map((m) => monthNames[m - 1])
        .join(", ");
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
