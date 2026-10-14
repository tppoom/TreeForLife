import { NextResponse, type NextRequest } from "next/server";
import { getActor } from "@/lib/auth/actor";
import { getDb } from "@/lib/db";
import { pushSubscriptions, users, notificationsLog } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sendWebPushNotification } from "@/lib/notify/web-push";
import { sendLineCareDigest } from "@/lib/notify/line-push";

export async function POST(req: NextRequest) {
  const actor = await getActor(req);
  if (actor.kind === "anonymous") {
    return NextResponse.json(
      { error: "Must be a guest or logged-in user to send test notification." },
      { status: 401 }
    );
  }

  const db = await getDb();
  let pushSent = false;
  let lineSent = false;

  // 1. Test Web Push
  const subs = await db
    .select()
    .from(pushSubscriptions)
    .where(
      actor.kind === "user"
        ? eq(pushSubscriptions.userId, actor.userId)
        : eq(pushSubscriptions.guestToken, actor.guestToken)
    );

  for (const sub of subs) {
    const res = await sendWebPushNotification(
      {
        endpoint: sub.endpoint,
        p256dh: sub.p256dh,
        auth: sub.auth,
      },
      {
        title: "TreeForLife — ทดสอบการแจ้งเตือน 🌿",
        body: "ระบบพร้อมแจ้งเตือนดูแลต้นไม้ของคุณแล้วครับ!",
        url: "/today?src=test",
      }
    );
    if (res.success) {
      pushSent = true;
    }
  }

  // 2. Test LINE Push (if user)
  if (actor.kind === "user") {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, actor.userId))
      .limit(1);

    if (user?.lineUserId) {
      const res = await sendLineCareDigest({
        toUserId: user.lineUserId,
        dateStr: new Date().toISOString().slice(0, 10),
        tasks: [
          {
            type: "water",
            plantNickname: "ต้นไม้ทดสอบ",
            speciesName: "มอนสเตอร่า",
          },
        ],
        shopTip: "การทดสอบแจ้งเตือนจากระบบ TreeForLife สำเร็จเรียบร้อย!",
      });

      if (res.success) {
        lineSent = true;
      }
    }
  }

  // In test or dev env, if no active subscription exists, we still return success with mock note
  return NextResponse.json({
    success: true,
    message: "Test notification dispatched",
    webPushSent: pushSent,
    linePushSent: lineSent,
  });
}
