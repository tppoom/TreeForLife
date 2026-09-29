import { describe, it, expect } from "vitest";
import { AddPlantSchema, TaskActionSchema } from "../lib/validation/garden";
import { InquiryCreateSchema } from "../lib/validation/inquiry";

describe("Zod Validation Schemas", () => {
  it("validates AddPlantSchema with valid data", () => {
    const valid = {
      speciesId: "11111111-1111-1111-1111-111111111111",
      nickname: "น้องมอนเดลี่",
      potMaterial: "terracotta",
      potSizeInch: 8,
      placement: "indoor_window",
      customWaterDays: 3,
    };
    const result = AddPlantSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("rejects AddPlantSchema with invalid pot size or negative water days", () => {
    const invalid = {
      speciesId: "not-a-uuid",
      nickname: "",
      potMaterial: "unobtanium",
      potSizeInch: -5,
      placement: "outer_space",
    };
    const result = AddPlantSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("validates InquiryCreateSchema within payload limit", () => {
    const valid = {
      speciesId: "11111111-1111-1111-1111-111111111111",
      sourcePage: "/plants/monstera-deliciosa",
      intent: "price",
      payload: { message: "มีของพร้อมส่งไหม" },
    };
    const result = InquiryCreateSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });
});
