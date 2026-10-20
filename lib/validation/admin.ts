import { z } from "zod";

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Species attribute vocabularies. These map 1:1 to `filters.*` i18n keys, so an
// unknown value would render as a raw translation key on the storefront.
const LightSchema = z.enum(["full_sun", "partial", "shade", "indoor_bright", "low_light"]);
const WaterNeedSchema = z.enum(["low", "medium", "high"]);
const SpeciesPlacementSchema = z.enum(["indoor", "outdoor", "balcony", "bathroom"]);
const PetSafeSchema = z.enum(["safe", "toxic", "unknown"]);
const MatureSizeSchema = z.enum(["xs", "sm", "md", "lg", "xl"]);
const GrowthRateSchema = z.enum(["slow", "medium", "fast"]);

export const AdminCareUpdateSchema = z.object({
  waterDaysHot: z.coerce.number().int().positive("รอบรดน้ำฤดูร้อนต้องมากกว่า 0").optional(),
  waterDaysRainy: z.coerce.number().int().positive("รอบรดน้ำฤดูฝนต้องมากกว่า 0").optional(),
  waterDaysCool: z.coerce.number().int().positive("รอบรดน้ำฤดูหนาวต้องมากกว่า 0").optional(),
  fertilizeDays: z.coerce.number().int().positive().optional().nullable(),
  fertilizePauseMonths: z.array(z.coerce.number().int().min(1).max(12)).optional(),
  repotMonths: z.coerce.number().int().positive().optional().nullable(),
  pruneDays: z.coerce.number().int().positive().optional().nullable(),
  pestCheckDays: z.coerce.number().int().positive().optional(),
  notesTh: z.string().optional().nullable(),
});

export const AdminProblemUpdateSchema = z.object({
  id: z.string().uuid("รหัสปัญหาไม่ถูกต้อง").optional(),
  symptomTh: z.string().trim().min(1, "กรุณาระบุอาการ"),
  causeTh: z.string().trim().min(1, "กรุณาระบุสาเหตุ"),
  fixTh: z.string().trim().min(1, "กรุณาระบุวิธีแก้ไข"),
  severity: z.enum(["low", "medium", "high"]).optional().default("medium"),
  sortOrder: z.coerce.number().int().optional().default(0),
});

export const AdminSpeciesCreateSchema = z.object({
  nameTh: z.string().trim().min(1, "กรุณาระบุชื่อภาษาไทย"),
  nameEn: z.string().trim().min(1, "กรุณาระบุชื่อภาษาอังกฤษ"),
  slug: z
    .string()
    .trim()
    .min(1, "กรุณาระบุ slug")
    .regex(SLUG_REGEX, "slug ต้องประกอบด้วยตัวพิมพ์เล็ก ตัวเลข และยัติภังค์ (-) เท่านั้น"),
  copyFromId: z.string().uuid("รหัสพันธุ์ไม้ต้นแบบไม่ถูกต้อง").optional().nullable(),
  nameSci: z.string().trim().optional(),
  family: z.string().trim().optional(),
  summary: z.string().trim().optional(),
  light: LightSchema.optional(),
  waterNeed: WaterNeedSchema.optional(),
  placement: z.array(SpeciesPlacementSchema).optional(),
  difficulty: z.coerce.number().int().min(1).max(5).optional(),
  petSafe: PetSafeSchema.optional(),
  matureSize: MatureSizeSchema.optional(),
  matureHeightCm: z.coerce.number().int().positive().optional().nullable(),
  growthRate: GrowthRateSchema.optional(),
  soilMix: z.string().trim().optional(),
  fertilizerNote: z.string().trim().optional().nullable(),
  propagation: z.string().trim().optional().nullable(),
  shopNote: z.string().trim().optional(),
  stockStatus: z.enum(["in_stock", "made_to_order", "seasonal", "hidden"]).optional(),
  priceRangeInternal: z.string().trim().optional().nullable(),
  aliases: z.array(z.string().trim()).optional(),
  careTemplate: AdminCareUpdateSchema.optional(),
  problems: z.array(AdminProblemUpdateSchema).optional(),
});

export const AdminSpeciesUpdateSchema = z.object({
  nameTh: z.string().trim().min(1, "ชื่อภาษาไทยต้องไม่ว่างเปล่า").optional(),
  nameEn: z.string().trim().min(1, "ชื่อภาษาอังกฤษต้องไม่ว่างเปล่า").optional(),
  slug: z
    .string()
    .trim()
    .min(1, "slug ต้องไม่ว่างเปล่า")
    .regex(SLUG_REGEX, "slug ต้องประกอบด้วยตัวพิมพ์เล็ก ตัวเลข และยัติภังค์ (-) เท่านั้น")
    .optional(),
  nameSci: z.string().trim().optional(),
  family: z.string().trim().optional(),
  summary: z.string().trim().optional(),
  light: LightSchema.optional(),
  waterNeed: WaterNeedSchema.optional(),
  placement: z.array(SpeciesPlacementSchema).optional(),
  difficulty: z.coerce.number().int().min(1).max(5).optional(),
  petSafe: PetSafeSchema.optional(),
  matureSize: MatureSizeSchema.optional(),
  matureHeightCm: z.coerce.number().int().positive().optional().nullable(),
  growthRate: GrowthRateSchema.optional(),
  soilMix: z.string().trim().optional(),
  fertilizerNote: z.string().trim().optional().nullable(),
  propagation: z.string().trim().optional().nullable(),
  shopNote: z.string().trim().optional(),
  stockStatus: z.enum(["in_stock", "made_to_order", "seasonal", "hidden"]).optional(),
  priceRangeInternal: z.string().trim().optional().nullable(),
  aliases: z.array(z.string().trim()).optional(),
  careTemplate: AdminCareUpdateSchema.optional(),
  problems: z.array(AdminProblemUpdateSchema).optional(),
  updatedAt: z.union([z.string(), z.date()]).optional(),
});

export const AdminMediaCreateSchema = z
  .object({
    speciesId: z.string().uuid("รหัสพันธุ์ไม้ไม่ถูกต้อง"),
    url: z.string().trim().min(1, "URL ไม่ถูกต้อง").optional(),
    blobUrl: z.string().trim().min(1, "URL ไม่ถูกต้อง").optional(),
    alt: z.string().trim().optional(),
    altTh: z.string().trim().optional(),
    isCover: z.boolean().optional(),
    isPrimary: z.boolean().optional(),
    sortOrder: z.coerce.number().int().optional().default(0),
    credit: z.string().trim().optional().default("ถ่ายที่ร้าน"),
    storagePath: z.string().trim().optional().nullable(),
  })
  .refine((data) => Boolean(data.url || data.blobUrl), {
    message: "กรุณาระบุ URL ของรูปภาพ",
    path: ["url"],
  });

export const AdminMediaUploadUrlSchema = z.object({
  filename: z.string().trim().min(1, "กรุณาระบุชื่อไฟล์"),
  contentType: z.string().trim().min(1, "กรุณาระบุประเภทไฟล์"),
  speciesId: z.string().uuid("รหัสพันธุ์ไม้ไม่ถูกต้อง").optional().nullable(),
});

export const AdminMediaUpdateSchema = z.object({
  alt: z.string().trim().optional(),
  altTh: z.string().trim().optional(),
  isCover: z.boolean().optional(),
  isPrimary: z.boolean().optional(),
  sortOrder: z.coerce.number().int().optional(),
  credit: z.string().trim().optional(),
});

export type AdminSpeciesCreateInput = z.infer<typeof AdminSpeciesCreateSchema>;
export type AdminSpeciesUpdateInput = z.infer<typeof AdminSpeciesUpdateSchema>;
export type AdminCareUpdateInput = z.infer<typeof AdminCareUpdateSchema>;
export type AdminProblemUpdateInput = z.infer<typeof AdminProblemUpdateSchema>;
export type AdminMediaCreateInput = z.infer<typeof AdminMediaCreateSchema>;
export type AdminMediaUploadUrlInput = z.infer<typeof AdminMediaUploadUrlSchema>;
export type AdminMediaUpdateInput = z.infer<typeof AdminMediaUpdateSchema>;
