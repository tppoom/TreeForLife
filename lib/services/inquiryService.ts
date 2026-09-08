import { getDb } from "@/lib/db";
import { inquiries, species } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";

export * from "@/lib/line/formatters";
import {
  type InquiryIntent,
  LINE_OA_ID,
  generateRefCode,
  formatLineMessage,
  getLineDeepLink,
  getLineAddFriendUrl,
} from "@/lib/line/formatters";

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
    messageText: message,
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
