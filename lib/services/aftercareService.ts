import { getDb } from "@/lib/db";
import {
  aftercareCheckins,
  userPlants,
  species,
  speciesProblems,
  careLogs,
  inquiries,
} from "@/db/schema";
import { eq, and, sql, desc } from "drizzle-orm";
import { formatDate } from "@/lib/care/scheduler";
import { generateRefCode } from "@/lib/services/inquiryService";
import { lineOaMessageUrl } from "@/lib/line/formatters";

export interface CreateCheckinOptions {
  userPlantId: string;
  acquiredAt: string | Date;
  acquiredFrom: string;
}

/**
 * Creates 3, 14, and 30 day aftercare check-ins for plants bought from shop (F06)
 */
export async function generateAftercareCheckins(opts: CreateCheckinOptions) {
  if (opts.acquiredFrom !== "shop") return;
  const db = await getDb();
  const acqDate = new Date(opts.acquiredAt);
  const now = new Date();
  const daysOld = Math.floor((now.getTime() - acqDate.getTime()) / (1000 * 60 * 60 * 24));

  // Only create for recently acquired plants (within 30 days)
  if (daysOld > 30) return;

  const marks = [3, 14, 30];
  for (const dayMark of marks) {
    const dueDate = new Date(acqDate);
    dueDate.setDate(dueDate.getDate() + dayMark);

    await db
      .insert(aftercareCheckins)
      .values({
        userPlantId: opts.userPlantId,
        dayMark,
        dueDate: formatDate(dueDate),
      })
      .onConflictDoNothing();
  }
}

/**
 * Fetches pending aftercare check-ins for a user or guest
 */
export async function getDueCheckins(opts: {
  userId?: string | null;
  guestToken?: string | null;
  todayStr?: string;
}) {
  if (!opts.userId && !opts.guestToken) return [];
  const db = await getDb();
  const today = opts.todayStr || formatDate(new Date());

  const userCondition = opts.userId
    ? eq(userPlants.userId, opts.userId)
    : eq(userPlants.guestToken, opts.guestToken!);

  const rows = await db
    .select({
      id: aftercareCheckins.id,
      dayMark: aftercareCheckins.dayMark,
      dueDate: aftercareCheckins.dueDate,
      answer: aftercareCheckins.answer,
      symptoms: aftercareCheckins.symptoms,
      userPlantId: userPlants.id,
      plantNickname: userPlants.nickname,
      potMaterial: userPlants.potMaterial,
      potSizeInch: userPlants.potSizeInch,
      placement: userPlants.placement,
      acquiredAt: userPlants.acquiredAt,
      speciesId: species.id,
      speciesNameTh: species.nameTh,
      speciesNameEn: species.nameEn,
      speciesSlug: species.slug,
      shopNote: species.shopNote,
    })
    .from(aftercareCheckins)
    .innerJoin(userPlants, eq(aftercareCheckins.userPlantId, userPlants.id))
    .leftJoin(species, eq(userPlants.speciesId, species.id))
    .where(
      and(
        userCondition,
        eq(userPlants.isActive, true),
        sql`${aftercareCheckins.dueDate} <= ${today}`,
        sql`${aftercareCheckins.answer} IS NULL`
      )
    )
    .orderBy(aftercareCheckins.dueDate);

  return rows;
}

/**
 * Answers a check-in (good, unsure, bad) and generates LINE inquiry if needed (F06)
 */
export async function answerCheckin(opts: {
  checkinId: string;
  answer: "good" | "unsure" | "bad";
  symptoms?: string[];
  userId?: string | null;
  guestToken?: string | null;
}) {
  const db = await getDb();

  // Find checkin and plant details
  const [row] = await db
    .select({
      id: aftercareCheckins.id,
      dayMark: aftercareCheckins.dayMark,
      userPlantId: aftercareCheckins.userPlantId,
      plantNickname: userPlants.nickname,
      potMaterial: userPlants.potMaterial,
      potSizeInch: userPlants.potSizeInch,
      placement: userPlants.placement,
      acquiredAt: userPlants.acquiredAt,
      speciesId: userPlants.speciesId,
      speciesNameTh: species.nameTh,
      speciesNameEn: species.nameEn,
      shopNote: species.shopNote,
      userId: userPlants.userId,
      guestToken: userPlants.guestToken,
    })
    .from(aftercareCheckins)
    .innerJoin(userPlants, eq(aftercareCheckins.userPlantId, userPlants.id))
    .leftJoin(species, eq(userPlants.speciesId, species.id))
    .where(eq(aftercareCheckins.id, opts.checkinId))
    .limit(1);

  if (!row) {
    throw new Error("Check-in not found");
  }

  let inquiryId: string | null = null;
  let inquiryRefCode: string | null = null;
  let lineUrl: string | null = null;

  if (opts.answer === "bad") {
    // 1. Fetch recent care logs (past 14 days)
    const logs = await db
      .select({
        type: careLogs.type,
        performedAt: careLogs.performedAt,
      })
      .from(careLogs)
      .where(eq(careLogs.userPlantId, row.userPlantId))
      .orderBy(desc(careLogs.performedAt))
      .limit(10);

    const acqDate = new Date(row.acquiredAt);
    const ageDays = Math.max(1, Math.floor((Date.now() - acqDate.getTime()) / (1000 * 60 * 60 * 24)));
    const refCode = generateRefCode();

    const payload = {
      userPlantId: row.userPlantId,
      nickname: row.plantNickname,
      speciesName: row.speciesNameTh || "ต้นไม้",
      ageDays,
      potSizeInch: row.potSizeInch,
      potMaterial: row.potMaterial,
      placement: row.placement,
      symptoms: opts.symptoms || [],
      recentLogsCount: logs.length,
      dayMark: row.dayMark,
    };

    const [inq] = await db
      .insert(inquiries)
      .values({
        speciesId: row.speciesId,
        userId: row.userId,
        guestToken: row.guestToken,
        sourcePage: `/garden/${row.userPlantId}`,
        refCode,
        intent: "care_help",
        payload,
      })
      .returning();

    inquiryId = inq.id;
    inquiryRefCode = inq.refCode;

    // Form prefilled LINE inquiry text with context
    const symptomText = opts.symptoms && opts.symptoms.length > 0 ? opts.symptoms.join(", ") : "ต้องการคำแนะนำการดูแล";
    const lineMessage = `ต้น "${row.speciesNameTh || row.plantNickname}" ที่ซื้อจากร้านเมื่อ ${ageDays} วันก่อน ดูไม่ค่อยดีครับ/ค่ะ อาการ: ${symptomText} · ปลูกในกระถาง ${row.potSizeInch}" (${row.potMaterial}) [${refCode}]`;
    lineUrl = lineOaMessageUrl(lineMessage);
  }

  await db
    .update(aftercareCheckins)
    .set({
      answer: opts.answer,
      symptoms: opts.symptoms || [],
      inquiryId,
      answeredAt: new Date(),
    })
    .where(eq(aftercareCheckins.id, opts.checkinId));

  return {
    success: true,
    answer: opts.answer,
    shopNote: row.shopNote,
    inquiry: inquiryRefCode
      ? {
          id: inquiryId,
          refCode: inquiryRefCode,
          lineUrl,
        }
      : null,
  };
}
