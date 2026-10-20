export type InquiryIntent = "price" | "availability" | "care_help" | "design_quote";

/** LINE OA basic/premium ID without the "@" (tolerates one in the env value). */
export const LINE_OA_ID = (process.env.NEXT_PUBLIC_LINE_OA_ID || "treeforlife").replace(/^@/, "");

/** The OA handle as shown to customers, e.g. "@treeforlife". */
export const LINE_OA_HANDLE = `@${LINE_OA_ID}`;

/** Add-friend / open-chat link for the shop's LINE OA. */
export const LINE_OA_URL = `https://line.me/R/ti/p/${LINE_OA_HANDLE}`;

/** Opens a chat with the OA with `message` prefilled. */
export function lineOaMessageUrl(message: string): string {
  return `https://line.me/R/oaMessage/${LINE_OA_HANDLE}/?${encodeURIComponent(message)}`;
}

/**
 * Generates a short, readable reference code like TFL-4K9P
 */
export function generateRefCode(): string {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // Remove ambiguous characters 0, 1, O, I
  let randomPart = "";
  for (let i = 0; i < 4; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `TFL-${randomPart}`;
}

export function formatLineMessage(
  intent: InquiryIntent,
  speciesName: string,
  refCode: string,
  customNote?: string
): string {
  const noteSuffix = customNote ? ` (${customNote})` : "";

  switch (intent) {
    case "price":
      return `สนใจ "${speciesName}" จากหน้าเว็บครับ/ค่ะ ขอทราบราคาและขนาดที่มีหน่อยครับ${noteSuffix} [${refCode}]`;
    case "availability":
      return `อยากทราบว่า "${speciesName}" ตอนนี้มีของพร้อมส่งไหมครับ/ค่ะ${noteSuffix} [${refCode}]`;
    case "care_help":
      return `ขอคำแนะนำเรื่องการดูแล "${speciesName}" หน่อยครับ/ค่ะ${noteSuffix} [${refCode}]`;
    case "design_quote":
      return `สนใจปรึกษาจัดมุมต้นไม้ตามแบบจากเว็บครับ/ค่ะ${noteSuffix} [${refCode}]`;
    default:
      return `สอบถามข้อมูล "${speciesName}" จากหน้าเว็บ TreeForLife [${refCode}]`;
  }
}

export function getLineDeepLink(message: string, lineOaId: string = LINE_OA_ID): string {
  // Mobile app direct deep link with prefilled text
  return `https://line.me/R/oaMessage/@${lineOaId}/?${encodeURIComponent(message)}`;
}

export function getLineAddFriendUrl(lineOaId: string = LINE_OA_ID): string {
  return `https://line.me/R/ti/p/@${lineOaId}`;
}
