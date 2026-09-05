import { describe, it, expect } from "vitest";
import {
  getThaiSeason,
  calculateWateringInterval,
  calculateNextDueDate,
  checkAdaptiveIntervalSuggestion,
} from "./scheduler";

describe("Care Schedule Engine (§5)", () => {
  it("determines Thai seasons correctly", () => {
    expect(getThaiSeason(new Date(2026, 2, 15))).toBe("hot"); // March (0-indexed: 2)
    expect(getThaiSeason(new Date(2026, 4, 30))).toBe("hot"); // May (0-indexed: 4)
    expect(getThaiSeason(new Date(2026, 5, 1))).toBe("rainy"); // June (0-indexed: 5)
    expect(getThaiSeason(new Date(2026, 9, 31))).toBe("rainy"); // October (0-indexed: 9)
    expect(getThaiSeason(new Date(2026, 10, 1))).toBe("cool"); // November (0-indexed: 10)
    expect(getThaiSeason(new Date(2026, 1, 28))).toBe("cool"); // February (0-indexed: 1)
  });

  it("calculates SPEC §5.4 Example 1: Rainy season + Glazed ceramic 12 inch + Indoor far", () => {
    const template = {
      waterDaysHot: 4,
      waterDaysRainy: 6,
      waterDaysCool: 5,
    };
    const conditions = {
      potSizeInch: 12,
      potMaterial: "ceramic_glazed" as const,
      placement: "indoor_far" as const,
    };
    // 6 * 1.15 * 1.20 * 1.25 = 10.35 -> rounds to 10
    const rainyDate = new Date(2026, 6, 15); // July
    const result = calculateWateringInterval(template, conditions, rainyDate);

    expect(result.season).toBe("rainy");
    expect(result.baseDays).toBe(6);
    expect(result.potMaterialFactor).toBe(1.15);
    expect(result.potSizeFactor).toBe(1.20);
    expect(result.placementFactor).toBe(1.25);
    expect(result.finalDays).toBe(10);
    expect(result.rawCalculation).toBeCloseTo(10.35, 2);
  });

  it("calculates SPEC §5.4 Example 2: Hot season + Terracotta 5 inch + Balcony shade", () => {
    const template = {
      waterDaysHot: 4,
      waterDaysRainy: 6,
      waterDaysCool: 5,
    };
    const conditions = {
      potSizeInch: 5,
      potMaterial: "terracotta" as const,
      placement: "balcony_shade" as const,
    };
    // 4 * 0.80 * 0.85 * 0.90 = 2.448 -> rounds to 2
    const hotDate = new Date(2026, 3, 15); // April
    const result = calculateWateringInterval(template, conditions, hotDate);

    expect(result.season).toBe("hot");
    expect(result.baseDays).toBe(4);
    expect(result.potMaterialFactor).toBe(0.80);
    expect(result.potSizeFactor).toBe(0.85);
    expect(result.placementFactor).toBe(0.90);
    expect(result.finalDays).toBe(2);
    expect(result.rawCalculation).toBeCloseTo(2.448, 2);
  });

  it("honors customWaterDays without multiplying factors", () => {
    const template = {
      waterDaysHot: 4,
      waterDaysRainy: 6,
      waterDaysCool: 5,
    };
    const conditions = {
      potSizeInch: 12,
      potMaterial: "ceramic_glazed" as const,
      placement: "indoor_far" as const,
      customWaterDays: 7,
    };
    const result = calculateWateringInterval(template, conditions);
    expect(result.isCustom).toBe(true);
    expect(result.finalDays).toBe(7);
  });

  it("clamps interval within 1 to 30 days", () => {
    const templateLow = {
      waterDaysHot: 1,
      waterDaysRainy: 1,
      waterDaysCool: 1,
    };
    const conditionsLow = {
      potSizeInch: 3,
      potMaterial: "terracotta" as const,
      placement: "outdoor_sun" as const,
    };
    // 1 * 0.8 * 0.85 * 0.7 = 0.476 -> clamped to 1
    const resultLow = calculateWateringInterval(templateLow, conditionsLow);
    expect(resultLow.finalDays).toBe(1);

    const templateHigh = {
      waterDaysHot: 30,
      waterDaysRainy: 35,
      waterDaysCool: 30,
    };
    const conditionsHigh = {
      potSizeInch: 16,
      potMaterial: "cement" as const,
      placement: "indoor_far" as const,
    };
    // Clamped to 30
    const resultHigh = calculateWateringInterval(templateHigh, conditionsHigh);
    expect(resultHigh.finalDays).toBe(30);
  });

  it("advances next due date accurately based on performed date", () => {
    const performed = new Date(2026, 8, 5); // Sep 5, 2026
    const next = calculateNextDueDate(performed, 5);
    expect(next.getDate()).toBe(10);
    expect(next.getMonth()).toBe(8);
  });

  it("triggers adaptive suggestion if watered late by >= 2x interval", () => {
    const scheduled = new Date(2026, 8, 1);
    const actualWatered = new Date(2026, 8, 7); // 6 days late, interval is 4
    const suggestion = checkAdaptiveIntervalSuggestion(scheduled, actualWatered, 4);

    expect(suggestion.shouldSuggest).toBe(true);
    expect(suggestion.suggestedIntervalDays).toBe(7); // 4 + Math.round(6/2) = 7
  });
});
