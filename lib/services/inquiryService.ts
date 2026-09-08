import { getDb } from "@/lib/db";
import { inquiries, species } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";

export type InquiryIntent = "price" | "availability" | "care_help" | "design_quote";

export const LINE_OA_ID = process.env.NEXT_PUBLIC_LINE_OA_ID || "treeforlife";

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

export interface CreateInquiryInput {
  speciesId?: string | null;
  speciesNameTh?: string;
  userId?: string | null;
  guestToken?: string | null;
  sourcePage: string;
  intent: InquiryIntent;
  payload?: Record<string, unknown>;
  customNote?: string;
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

export async function createInquiry(input: CreateInquiryInput) {
  const db = await getDb();
  const refCode = generateRefCode();

  const [row] = await db
    .insert(inquiries)
    .values({
      speciesId: input.speciesId || null,
      userId: input.userId || null,
      guestToken: input.guestToken || null,
      sourcePage: input.sourcePage,
      refCode,
      intent: input.intent,
      payload: input.payload || {},
      createdAt: new Date(),
    })
    .returning();

  const speciesName = input.speciesNameTh || "ต้นไม้";
  const message = formatLineMessage(input.intent, speciesName, refCode, input.customNote);
  const lineUrl = getLineDeepLink(message);

  return {
    inquiry: row,
    refCode,
    message,
    lineUrl,
    lineOaId: LINE_OA_ID,
  };
}

export interface GetInquiriesParams {
  userId?: string | null;
  guestToken?: string | null;
  refCode?: string | null;
  limit?: number;
}

export async function getInquiries(params: GetInquiriesParams = {}) {
  const db = await getDb();
  const conditions = [];

  if (params.userId) {
    conditions.push(eq(inquiries.userId, params.userId));
  }
  if (params.guestToken) {
    conditions.push(eq(inquiries.guestToken, params.guestToken));
  }
  if (params.refCode) {
    conditions.push(eq(inquiries.refCode, params.refCode));
  }

  const query = db
    .select({
      id: inquiries.id,
      refCode: inquiries.refCode,
      intent: inquiries.intent,
      sourcePage: inquiries.sourcePage,
      payload: inquiries.payload,
      createdAt: inquiries.createdAt,
      userId: inquiries.userId,
      guestToken: inquiries.guestToken,
      speciesId: inquiries.speciesId,
      speciesNameTh: species.nameTh,
      speciesNameEn: species.nameEn,
      speciesSlug: species.slug,
    })
    .from(inquiries)
    .leftJoin(species, eq(inquiries.speciesId, species.id))
    .orderBy(desc(inquiries.createdAt));

  if (conditions.length > 0) {
    query.where(and(...conditions));
  }

  if (params.limit) {
    query.limit(params.limit);
  }

  const rows = await query;
  return rows;
}
