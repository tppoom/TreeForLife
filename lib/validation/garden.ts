import { z } from "zod";

export const AddPlantSchema = z.object({
  speciesId: z.string().uuid("รหัสพันธุ์ไม้ไม่ถูกต้อง"),
  nickname: z.string().trim().min(1, "กรุณาระบุชื่อต้นไม้").max(40, "ชื่อยาวเกิน 40 ตัวอักษร"),
  potMaterial: z.enum(["terracotta", "plastic", "ceramic_glazed", "cement", "hanging"], {
    errorMap: () => ({ message: "ประเภทกระถางไม่ถูกต้อง" }),
  }),
  potSizeInch: z.coerce.number().int().min(1, "ขนาดกระถางต้องอย่างน้อย 1 นิ้ว").max(40, "ขนาดกระถางสูงสุด 40 นิ้ว"),
  placement: z.enum(["outdoor_sun", "balcony_shade", "indoor_window", "indoor_far", "air_con"], {
    errorMap: () => ({ message: "ตำแหน่งวางไม่ถูกต้อง" }),
  }),
  customWaterDays: z.coerce.number().int().min(1).max(30).optional().nullable(),
  notes: z.string().max(500, "บันทึกยาวเกิน 500 ตัวอักษร").optional().nullable(),
});

export const UpdatePlantSchema = AddPlantSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const TaskActionSchema = z.object({
  taskId: z.string().uuid("รหัสงานไม่ถูกต้อง"),
  action: z.enum(["done", "snooze", "skip"], {
    errorMap: () => ({ message: "คำสั่งงานไม่ถูกต้อง" }),
  }),
  notes: z.string().max(500).optional().nullable(),
});

export type AddPlantInput = z.infer<typeof AddPlantSchema>;
export type UpdatePlantInput = z.infer<typeof UpdatePlantSchema>;
export type TaskActionInput = z.infer<typeof TaskActionSchema>;
