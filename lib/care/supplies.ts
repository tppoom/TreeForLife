export interface SuppliesNudgeInput {
  currentPotInch: number;
  speciesName: string;
  soilMix?: string | null;
  fertilizerNote?: string | null;
  ageDays?: number;
  nudgeDismissedAt?: Date | string | null;
}

export interface RepotNudgeInfo {
  shouldShow: boolean;
  suggestedPotInch: number;
  messageTh: string;
  messageEn: string;
  inquiryPayload: {
    kind: "repot";
    currentPotInch: number;
    suggestedPotInch: number;
    soilMix?: string;
  };
}

export interface FertilizerNudgeInfo {
  shouldShow: boolean;
  messageTh: string;
  messageEn: string;
  inquiryPayload: {
    kind: "fertilizer";
    fertilizerNote?: string;
  };
}

/**
 * Calculates suggested pot size and generates repot nudge recommendation (F08)
 * Suggests min(current + 2, 16) inches
 */
export function getRepotNudge(input: SuppliesNudgeInput): RepotNudgeInfo {
  if (input.nudgeDismissedAt) {
    return {
      shouldShow: false,
      suggestedPotInch: input.currentPotInch,
      messageTh: "",
      messageEn: "",
      inquiryPayload: { kind: "repot", currentPotInch: input.currentPotInch, suggestedPotInch: input.currentPotInch },
    };
  }

  const suggestedPotInch = Math.min(input.currentPotInch + 2, 16);
  const soilDesc = input.soilMix ? ` · ดินสูตรร้าน: ${input.soilMix}` : "";

  return {
    shouldShow: true,
    suggestedPotInch,
    messageTh: `ถึงเวลาเปลี่ยนกระถางใหม่แล้ว (ตอนนี้ ${input.currentPotInch}" → แนะนำ ${suggestedPotInch}"${soilDesc})`,
    messageEn: `Time to repot! (Currently ${input.currentPotInch}" → Recommended ${suggestedPotInch}")`,
    inquiryPayload: {
      kind: "repot",
      currentPotInch: input.currentPotInch,
      suggestedPotInch,
      soilMix: input.soilMix || undefined,
    },
  };
}

/**
 * Evaluates fertilizer seasonal nudge (F08)
 */
export function getFertilizerNudge(input: SuppliesNudgeInput): FertilizerNudgeInfo {
  if (input.nudgeDismissedAt) {
    return {
      shouldShow: false,
      messageTh: "",
      messageEn: "",
      inquiryPayload: { kind: "fertilizer" },
    };
  }

  const fertNote = input.fertilizerNote ? `สูตรที่ร้านแนะนำ: ${input.fertilizerNote}` : "สูตรบำรุงของร้าน";

  return {
    shouldShow: true,
    messageTh: `รอบนี้ถึงเวลาให้ปุ๋ยบำรุงต้น (${fertNote})`,
    messageEn: `Seasonal fertilizing time (${fertNote})`,
    inquiryPayload: {
      kind: "fertilizer",
      fertilizerNote: input.fertilizerNote || undefined,
    },
  };
}
