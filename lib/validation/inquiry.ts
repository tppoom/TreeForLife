import { z } from "zod";

export const InquiryCreateSchema = z.object({
  speciesId: z.string().uuid("รหัสพันธุ์ไม้ไม่ถูกต้อง").optional().nullable(),
  sourcePage: z.string().trim().min(1).max(100),
  intent: z.enum(["price", "availability", "care_help", "design_quote"], {
    errorMap: () => ({ message: "ประเภทคำถามไม่ถูกต้อง" }),
  }),
  payload: z
    .record(z.unknown())
    .default({})
    .refine((val) => JSON.stringify(val).length <= 4096, {
      message: "ข้อมูลประกอบมีขนาดเกินกำหนด (สูงสุด 4KB)",
    }),
});

export type InquiryCreateInput = z.infer<typeof InquiryCreateSchema>;
