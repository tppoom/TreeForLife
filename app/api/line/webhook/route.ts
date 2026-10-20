import { NextResponse, type NextRequest } from "next/server";
import crypto from "crypto";
import { getDb } from "@/lib/db";
import { users, lineEventsSeen, careTasks, userPlants } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { completeTask } from "@/lib/services/gardenService";
import { formatDate } from "@/lib/care/scheduler";

function verifyLineSignature(body: string, signature: string, secret: string): boolean {
  const hash = crypto.createHmac("sha256", secret).update(body).digest("base64");
  try {
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-line-signature");
  const channelSecret = process.env.LINE_MESSAGING_CHANNEL_SECRET || "";

  // Verify signature if secret is configured and not in test bypass
  if (channelSecret && process.env.NODE_ENV === "production") {
    if (!signature || !verifyLineSignature(rawBody, signature, channelSecret)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  let body: any;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const events: any[] = body.events || [];
  const db = await getDb();

  for (const event of events) {
    const eventId = event.webhookEventId;
    if (eventId) {
      // Deduplicate webhook events
      const [seen] = await db
        .select({ id: lineEventsSeen.eventId })
        .from(lineEventsSeen)
        .where(eq(lineEventsSeen.eventId, eventId))
        .limit(1);

      if (seen) continue;
      await db.insert(lineEventsSeen).values({ eventId }).onConflictDoNothing();
    }

    const lineUserId = event.source?.userId;
    if (!lineUserId) continue;

    if (event.type === "follow") {
      await db
        .update(users)
        .set({ lineFriend: true })
        .where(eq(users.lineUserId, lineUserId));
    } else if (event.type === "unfollow") {
      await db
        .update(users)
        .set({ lineFriend: false })
        .where(eq(users.lineUserId, lineUserId));
    } else if (event.type === "postback") {
      const dataStr = event.postback?.data || "";
      const params = new URLSearchParams(dataStr);
      const action = params.get("action");
      const dateStr = params.get("d") || formatDate(new Date());

      if (action === "done_all") {
        // Find user by lineUserId
        const [user] = await db
          .select({ id: users.id })
          .from(users)
          .where(eq(users.lineUserId, lineUserId))
          .limit(1);

        if (user) {
          // Find pending tasks for this user due today or earlier
          const pendingTasks = await db
            .select({
              taskId: careTasks.id,
              userPlantId: careTasks.userPlantId,
            })
            .from(careTasks)
            .innerJoin(userPlants, eq(careTasks.userPlantId, userPlants.id))
            .where(
              and(
                eq(userPlants.userId, user.id),
                eq(careTasks.status, "pending"),
                sql`${careTasks.dueDate} <= ${dateStr}`
              )
            );

          for (const t of pendingTasks) {
            try {
              await completeTask({
                taskId: t.taskId,
                userPlantId: t.userPlantId,
                source: "line",
              });
            } catch (err) {
              console.error("Failed to complete task from LINE postback:", err);
            }
          }

          // Reply to user in LINE chat
          const replyToken = event.replyToken;
          const token = process.env.LINE_MESSAGING_CHANNEL_ACCESS_TOKEN;
          if (replyToken && token) {
            try {
              await fetch("https://api.line.me/v2/bot/message/reply", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  replyToken,
                  messages: [
                    {
                      type: "text",
                      text: `บันทึกงานดูแลครบแล้วทั้ง ${pendingTasks.length} รายการ 🌿 ยอดเยี่ยมมากครับ!`,
                    },
                  ],
                }),
              });
            } catch {}
          }
        }
      }
    }
  }

  return NextResponse.json({ success: true });
}
