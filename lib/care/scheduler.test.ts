import { describe, it, expect } from "vitest";
import {
  getThaiSeason,
  getThaiSeasonInfo,
  POT_MATERIAL_MULTIPLIERS,
  POT_SIZE_MULTIPLIERS,
  PLACEMENT_MULTIPLIERS,
  getPotMaterialFactor,
  getPotSizeFactor,
  getPlacementFactor,
  calculateCareInterval,
  explainCareSchedule,
  generateNextTaskDue,
  calculateSnoozeDueDate,
  calculateCompletionNextDue,
  calculateSkipNextDue,
  rolloverTask,
} from "./scheduler";

describe("Care Schedule Engine", () => {
  describe("1. Thai 3-Season Detection (getThaiSeason)", () => {
    it("should classify Hot Season (Mar - May, months 3, 4, 5)", () => {
      // March (month 3)
      expect(getThaiSeason(new Date(2026, 2, 1))).toBe("hot");
      expect(getThaiSeason("2026-03-15")).toBe("hot");
      // April (month 4)
      expect(getThaiSeason(new Date(2026, 3, 13))).toBe("hot");
      expect(getThaiSeason("2026-04-30")).toBe("hot");
      // May (month 5)
      expect(getThaiSeason(new Date(2026, 4, 31))).toBe("hot");
      expect(getThaiSeason("2026-05-01")).toBe("hot");
    });

    it("should classify Rainy Season (Jun - Oct, months 6, 7, 8, 9, 10)", () => {
      // June (month 6)
      expect(getThaiSeason(new Date(2026, 5, 1))).toBe("rainy");
      expect(getThaiSeason("2026-06-15")).toBe("rainy");
      // July (month 7)
      expect(getThaiSeason("2026-07-20")).toBe("rainy");
      // August (month 8)
      expect(getThaiSeason("2026-08-12")).toBe("rainy");
      // September (month 9)
      expect(getThaiSeason("2026-09-08")).toBe("rainy");
      // October (month 10)
      expect(getThaiSeason(new Date(2026, 9, 31))).toBe("rainy");
      expect(getThaiSeason("2026-10-31")).toBe("rainy");
    });

    it("should classify Cool/Dry Season (Nov - Feb, months 11, 12, 1, 2)", () => {
      // November (month 11)
      expect(getThaiSeason(new Date(2026, 10, 1))).toBe("cool");
      expect(getThaiSeason("2026-11-15")).toBe("cool");
      // December (month 12)
      expect(getThaiSeason(new Date(2026, 11, 31))).toBe("cool");
      expect(getThaiSeason("2026-12-25")).toBe("cool");
      // January (month 1)
      expect(getThaiSeason(new Date(2026, 0, 1))).toBe("cool");
      expect(getThaiSeason("2026-01-01")).toBe("cool");
      // February (month 2)
      expect(getThaiSeason(new Date(2026, 1, 28))).toBe("cool");
      expect(getThaiSeason("2026-02-14")).toBe("cool");
    });

    it("should provide localized metadata via getThaiSeasonInfo", () => {
      const hotInfo = getThaiSeasonInfo("hot");
      expect(hotInfo.season).toBe("hot");
      expect(hotInfo.nameTh).toContain("ร้อน");
      expect(hotInfo.nameEn).toContain("Hot");

      const rainyInfo = getThaiSeasonInfo("rainy");
      expect(rainyInfo.season).toBe("rainy");
      expect(rainyInfo.nameTh).toContain("ฝน");
      expect(rainyInfo.nameEn).toContain("Rainy");

      const coolInfo = getThaiSeasonInfo("cool");
      expect(coolInfo.season).toBe("cool");
      expect(coolInfo.nameTh).toContain("หนาว");
      expect(coolInfo.nameEn).toContain("Cool");
    });
  });

  describe("2. Environmental Multipliers", () => {
    it("should return correct Pot Material multipliers", () => {
      expect(getPotMaterialFactor("terracotta")).toBe(0.80);
      expect(getPotMaterialFactor("plastic")).toBe(1.00);
      expect(getPotMaterialFactor("hanging")).toBe(1.00);
      expect(getPotMaterialFactor("ceramic_glazed")).toBe(1.15);
      expect(getPotMaterialFactor("cement")).toBe(1.15);
      // Defaults to 1.00 for unknown or undefined
      expect(getPotMaterialFactor(undefined)).toBe(1.00);
      expect(getPotMaterialFactor("unknown_material")).toBe(1.00);
    });

    it("should return correct Pot Size multipliers", () => {
      // < 6 inches: 0.85
      expect(getPotSizeFactor(3)).toBe(0.85);
      expect(getPotSizeFactor(5.9)).toBe(0.85);
      expect(getPotSizeFactor("4")).toBe(0.85);

      // 6 - 10 inches: 1.00
      expect(getPotSizeFactor(6)).toBe(1.00);
      expect(getPotSizeFactor(8)).toBe(1.00);
      expect(getPotSizeFactor(10)).toBe(1.00);
      expect(getPotSizeFactor("8.5")).toBe(1.00);

      // > 10 inches: 1.20
      expect(getPotSizeFactor(10.1)).toBe(1.20);
      expect(getPotSizeFactor(12)).toBe(1.20);
      expect(getPotSizeFactor("14")).toBe(1.20);

      // Fallback for null/undefined
      expect(getPotSizeFactor(undefined)).toBe(1.00);
      expect(getPotSizeFactor(null)).toBe(1.00);
    });

    it("should return correct Placement multipliers", () => {
      expect(getPlacementFactor("outdoor_sun")).toBe(0.70);
      expect(getPlacementFactor("balcony_shade")).toBe(0.90);
      expect(getPlacementFactor("indoor_window")).toBe(1.00);
      expect(getPlacementFactor("indoor_far")).toBe(1.25);
      expect(getPlacementFactor("air_con")).toBe(1.20);
      // Fallback for unknown or undefined
      expect(getPlacementFactor(undefined)).toBe(1.00);
      expect(getPlacementFactor("unknown_place")).toBe(1.00);
    });
  });

  describe("3. Care Interval Calculation (calculateCareInterval)", () => {
    it("should match SPEC §5.4 Example 1: Monstera in rainy season, glazed 12in, indoor far = 10 days", () => {
      // 6 × 1.15 × 1.20 × 1.25 = 10.35 → 10 days
      const interval = calculateCareInterval({
        waterDaysHot: 4,
        waterDaysRainy: 6,
        waterDaysCool: 8,
        season: "rainy",
        potMaterial: "ceramic_glazed",
        potSizeInch: 12,
        placement: "indoor_far",
      });
      expect(interval).toBe(10);
    });

    it("should match SPEC §5.4 Example 2: Monstera in hot season, terracotta 5in, balcony shade = 2 days", () => {
      // 4 × 0.80 × 0.85 × 0.90 = 2.448 → 2 days
      const interval = calculateCareInterval({
        waterDaysHot: 4,
        waterDaysRainy: 6,
        waterDaysCool: 8,
        season: "hot",
        potMaterial: "terracotta",
        potSizeInch: 5,
        placement: "balcony_shade",
      });
      expect(interval).toBe(2);
    });

    it("should infer season from date when season is not explicitly specified", () => {
      // April date → hot season (base 4)
      // plastic (1.0), 8" (1.0), indoor_window (1.0) → 4 days
      const intervalHot = calculateCareInterval({
        waterDaysHot: 4,
        waterDaysRainy: 7,
        waterDaysCool: 10,
        date: "2026-04-15",
        potMaterial: "plastic",
        potSizeInch: 8,
        placement: "indoor_window",
      });
      expect(intervalHot).toBe(4);

      // August date → rainy season (base 7)
      const intervalRainy = calculateCareInterval({
        waterDaysHot: 4,
        waterDaysRainy: 7,
        waterDaysCool: 10,
        date: "2026-08-15",
        potMaterial: "plastic",
        potSizeInch: 8,
        placement: "indoor_window",
      });
      expect(intervalRainy).toBe(7);

      // December date → cool season (base 10)
      const intervalCool = calculateCareInterval({
        waterDaysHot: 4,
        waterDaysRainy: 7,
        waterDaysCool: 10,
        date: "2026-12-15",
        potMaterial: "plastic",
        potSizeInch: 8,
        placement: "indoor_window",
      });
      expect(intervalCool).toBe(10);
    });

    it("should support nested template and plantConfig objects", () => {
      const interval = calculateCareInterval({
        template: {
          waterDaysHot: 3,
          waterDaysRainy: 5,
          waterDaysCool: 7,
        },
        plantConfig: {
          potMaterial: "cement",
          potSizeInch: "12",
          placement: "air_con",
        },
        season: "hot",
      });
      // 3 × 1.15 × 1.20 × 1.20 = 4.968 → 5
      expect(interval).toBe(5);
    });

    it("should clamp intervals to minimum 1 day", () => {
      // 1 × 0.80 × 0.85 × 0.70 = 0.476 → Math.round is 0 → clamped to 1
      const interval = calculateCareInterval({
        waterDaysHot: 1,
        waterDaysRainy: 2,
        waterDaysCool: 3,
        season: "hot",
        potMaterial: "terracotta",
        potSizeInch: 4,
        placement: "outdoor_sun",
      });
      expect(interval).toBe(1);
    });

    it("should clamp intervals to maximum 30 days", () => {
      // 30 × 1.15 × 1.20 × 1.25 = 51.75 → Math.round is 52 → clamped to 30
      const interval = calculateCareInterval({
        waterDaysHot: 20,
        waterDaysRainy: 25,
        waterDaysCool: 30,
        season: "cool",
        potMaterial: "ceramic_glazed",
        potSizeInch: 14,
        placement: "indoor_far",
      });
      expect(interval).toBe(30);
    });

    it("should bypass all multipliers when custom_water_days is provided", () => {
      const interval = calculateCareInterval({
        waterDaysHot: 2,
        waterDaysRainy: 5,
        waterDaysCool: 10,
        season: "cool",
        potMaterial: "terracotta",
        potSizeInch: 4,
        placement: "outdoor_sun",
        customWaterDays: 7,
      });
      expect(interval).toBe(7);
    });

    it("should clamp custom_water_days within 1 to 30 days", () => {
      expect(
        calculateCareInterval({
          waterDaysHot: 3,
          waterDaysRainy: 5,
          waterDaysCool: 7,
          customWaterDays: 0,
        })
      ).toBeGreaterThanOrEqual(1);

      expect(
        calculateCareInterval({
          waterDaysHot: 3,
          waterDaysRainy: 5,
          waterDaysCool: 7,
          customWaterDays: 45,
        })
      ).toBe(30);
    });
  });

  describe("4. Schedule Explanation (explainCareSchedule)", () => {
    it("should provide breakdown of formula, factors, and localized descriptions", () => {
      const explanation = explainCareSchedule({
        waterDaysHot: 4,
        waterDaysRainy: 6,
        waterDaysCool: 8,
        season: "rainy",
        potMaterial: "ceramic_glazed",
        potSizeInch: 12,
        placement: "indoor_far",
      });

      expect(explanation.season).toBe("rainy");
      expect(explanation.baseDays).toBe(6);
      expect(explanation.materialFactor).toBe(1.15);
      expect(explanation.sizeFactor).toBe(1.20);
      expect(explanation.placementFactor).toBe(1.25);
      expect(explanation.rawCalculatedDays).toBeCloseTo(10.35, 2);
      expect(explanation.finalIntervalDays).toBe(10);
      expect(explanation.isCustom).toBe(false);

      // Formula string
      expect(explanation.formula).toContain("6");
      expect(explanation.formula).toContain("1.15");
      expect(explanation.formula).toContain("1.2");
      expect(explanation.formula).toContain("1.25");
      expect(explanation.formula).toContain("10");

      // Localized strings
      expect(explanation.descriptionTh).toContain("10");
      expect(explanation.descriptionTh).toContain("วัน");
      expect(explanation.descriptionEn).toContain("10");
      expect(explanation.descriptionEn).toContain("days");

      // Factor details
      expect(explanation.factors.potMaterial.factor).toBe(1.15);
      expect(explanation.factors.potSize.factor).toBe(1.20);
      expect(explanation.factors.placement.factor).toBe(1.25);
    });

    it("should clearly explain custom override", () => {
      const explanation = explainCareSchedule({
        waterDaysHot: 4,
        waterDaysRainy: 6,
        waterDaysCool: 8,
        customWaterDays: 3,
      });

      expect(explanation.isCustom).toBe(true);
      expect(explanation.finalIntervalDays).toBe(3);
      expect(explanation.descriptionTh).toContain("กำหนดเอง");
      expect(explanation.descriptionEn).toContain("Custom");
    });
  });

  describe("5. Task Due Date Calculation (generateNextTaskDue)", () => {
    it("should calculate correct next due date in YYYY-MM-DD format", () => {
      expect(generateNextTaskDue("2026-03-01", 5)).toBe("2026-03-06");
      expect(generateNextTaskDue(new Date(2026, 2, 1), 5)).toBe("2026-03-06");
    });

    it("should handle month boundaries correctly", () => {
      expect(generateNextTaskDue("2026-03-28", 5)).toBe("2026-04-02");
    });

    it("should handle year boundaries correctly", () => {
      expect(generateNextTaskDue("2026-12-28", 7)).toBe("2027-01-04");
    });
  });

  describe("6. Task Rollover Transitions", () => {
    it("should schedule next cycle upon completion from completedDate + interval", () => {
      // Completed on March 8 with 5-day interval -> March 13
      const nextDue = calculateCompletionNextDue("2026-03-08", 5);
      expect(nextDue).toBe("2026-03-13");
    });

    it("should snooze by +1 day up to 3 consecutive times", () => {
      // Snooze 1
      const snooze1 = calculateSnoozeDueDate("2026-03-10", 0);
      expect(snooze1.nextDueDate).toBe("2026-03-11");
      expect(snooze1.newSnoozeCount).toBe(1);
      expect(snooze1.canSnooze).toBe(true);

      // Snooze 2
      const snooze2 = calculateSnoozeDueDate(snooze1.nextDueDate, snooze1.newSnoozeCount);
      expect(snooze2.nextDueDate).toBe("2026-03-12");
      expect(snooze2.newSnoozeCount).toBe(2);
      expect(snooze2.canSnooze).toBe(true);

      // Snooze 3
      const snooze3 = calculateSnoozeDueDate(snooze2.nextDueDate, snooze2.newSnoozeCount);
      expect(snooze3.nextDueDate).toBe("2026-03-13");
      expect(snooze3.newSnoozeCount).toBe(3);
      expect(snooze3.canSnooze).toBe(false); // Max reached
    });

    it("should prevent snoozing when snooze limit of 3 is reached", () => {
      const blocked = calculateSnoozeDueDate("2026-03-13", 3);
      expect(blocked.canSnooze).toBe(false);
      expect(blocked.nextDueDate).toBe("2026-03-13"); // Unchanged
      expect(blocked.newSnoozeCount).toBe(3);
    });

    it("should schedule next regular cycle upon skip without logging", () => {
      const nextDue = calculateSkipNextDue("2026-03-10", 7);
      expect(nextDue).toBe("2026-03-17");
    });

    it("should handle full rollover state transitions via rolloverTask", () => {
      // 1. Complete action
      const completed = rolloverTask({
        action: "complete",
        currentDueDate: "2026-03-10",
        actionDate: "2026-03-10",
        intervalDays: 6,
        snoozeCount: 1,
      });
      expect(completed.taskStatus).toBe("done");
      expect(completed.nextDueDate).toBe("2026-03-16");
      expect(completed.snoozeCount).toBe(0);
      expect(completed.shouldLog).toBe(true);

      // 2. Snooze action
      const snoozed = rolloverTask({
        action: "snooze",
        currentDueDate: "2026-03-10",
        actionDate: "2026-03-10",
        intervalDays: 6,
        snoozeCount: 1,
      });
      expect(snoozed.taskStatus).toBe("snoozed");
      expect(snoozed.nextDueDate).toBe("2026-03-11");
      expect(snoozed.snoozeCount).toBe(2);
      expect(snoozed.shouldLog).toBe(false);

      // 3. Skip action
      const skipped = rolloverTask({
        action: "skip",
        currentDueDate: "2026-03-10",
        actionDate: "2026-03-10",
        intervalDays: 6,
        snoozeCount: 2,
      });
      expect(skipped.taskStatus).toBe("skipped");
      expect(skipped.nextDueDate).toBe("2026-03-16");
      expect(skipped.snoozeCount).toBe(0);
      expect(skipped.shouldLog).toBe(false);
    });
  });
});
