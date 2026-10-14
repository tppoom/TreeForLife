import { getDb } from "@/lib/db";
import {
  careTasks,
  userPlants,
  species,
  users,
  pushSubscriptions,
  notificationsLog,
} from "@/db/schema";
import { eq, and, lte, isNull, sql } from "drizzle-orm";
import { sendWebPushNotification } from "@/lib/notify/web-push";
import { sendLineCareDigest, type LinePushTaskItem } from "@/lib/notify/line-push";

export interface DispatchRemindersResult {
  recipientsCount: number;
  tasksNotified: number;
  webPushSent: number;
  linePushSent: number;
  errors: string[];
}

export async function dispatchDailyReminders(opts?: {
  targetDate?: string; // YYYY-MM-DD
  limitRecipients?: number;
}): Promise<DispatchRemindersResult> {
  const db = await getDb();
  const todayStr = opts?.targetDate || new Date().toISOString().slice(0, 10);
  const lineMonthlyCap = parseInt(process.env.LINE_MONTHLY_PUSH_CAP || "450", 10);

  // Check current month LINE push count to respect quota
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const [lineUsage] = await db
    .select({ count: sql<number>`count(*)` })
    .from(notificationsLog)
    .where(
      and(
        eq(notificationsLog.channel, "line"),
        sql`${notificationsLog.sentAt} >= ${startOfMonth}`
      )
    );
  const currentLineMonthPushes = Number(lineUsage?.count || 0);

  // Fetch pending care tasks due on or before today that haven't been notified yet
  const rows = await db
    .select({
      taskId: careTasks.id,
      taskType: careTasks.type,
      dueDate: careTasks.dueDate,
      plantId: userPlants.id,
      plantNickname: userPlants.nickname,
      userId: userPlants.userId,
      guestToken: userPlants.guestToken,
      speciesNameTh: species.nameTh,
      shopNote: species.shopNote,
      userDisplayName: users.displayName,
      userLineUserId: users.lineUserId,
      userLineFriend: users.lineFriend,
      userNotifyWebPush: users.notifyWebPush,
      userNotifyLine: users.notifyLine,
    })
    .from(careTasks)
    .innerJoin(userPlants, eq(careTasks.userPlantId, userPlants.id))
    .leftJoin(species, eq(userPlants.speciesId, species.id))
    .leftJoin(users, eq(userPlants.userId, users.id))
    .where(
      and(
        lte(careTasks.dueDate, todayStr),
        eq(careTasks.status, "pending"),
        isNull(careTasks.notifiedAt),
        eq(userPlants.isActive, true)
      )
    )
    .limit(opts?.limitRecipients ? opts.limitRecipients * 10 : 1000);

  if (rows.length === 0) {
    return {
      recipientsCount: 0,
      tasksNotified: 0,
      webPushSent: 0,
      linePushSent: 0,
      errors: [],
    };
  }

  // Group tasks by recipient (user_id or guest_token)
  type RecipientGroup = {
    userId: string | null;
    guestToken: string | null;
    lineUserId: string | null;
    lineFriend: boolean | null;
    notifyWebPush: boolean;
    notifyLine: boolean;
    tasks: {
      id: string;
      type: string;
      plantNickname: string;
      speciesName: string;
      shopNote?: string;
    }[];
  };

  const recipientMap = new Map<string, RecipientGroup>();

  for (const r of rows) {
    const key = r.userId ? `user_${r.userId}` : `guest_${r.guestToken}`;
    if (!recipientMap.has(key)) {
      recipientMap.set(key, {
        userId: r.userId,
        guestToken: r.guestToken,
        lineUserId: r.userLineUserId,
        lineFriend: r.userLineFriend,
        notifyWebPush: r.userNotifyWebPush !== false,
        notifyLine: r.userNotifyLine !== false,
        tasks: [],
      });
    }

    recipientMap.get(key)!.tasks.push({
      id: r.taskId,
      type: r.taskType,
      plantNickname: r.plantNickname,
      speciesName: r.speciesNameTh || "ต้นไม้",
      shopNote: r.shopNote || undefined,
    });
  }

  let webPushSent = 0;
  let linePushSent = 0;
  let totalTasksNotified = 0;
  let linePushesThisRun = currentLineMonthPushes;
  const errors: string[] = [];

  for (const group of recipientMap.values()) {
    let delivered = false;
    const taskIds = group.tasks.map((t) => t.id);

    // 1. Web Push Dispatch
    if (group.notifyWebPush) {
      const subs = await db
        .select()
        .from(pushSubscriptions)
        .where(
          group.userId
            ? eq(pushSubscriptions.userId, group.userId)
            : eq(pushSubscriptions.guestToken, group.guestToken!)
        );

      for (const sub of subs) {
        const firstTask = group.tasks[0];
        const res = await sendWebPushNotification(
          {
            endpoint: sub.endpoint,
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
          {
            title: `TreeForLife — วันนี้มี ${group.tasks.length} งานดูแลต้นไม้ 🌿`,
            body: `${firstTask.plantNickname}: ${firstTask.type === "water" ? "ถึงรอบรดน้ำ" : "ถึงรอบดูแล"} และอีก ${group.tasks.length - 1} ต้น`,
            url: "/today?src=push",
          }
        );

        if (res.success) {
          delivered = true;
          webPushSent++;
          await db
            .update(pushSubscriptions)
            .set({ lastSuccessAt: new Date() })
            .where(eq(pushSubscriptions.id, sub.id));
        } else if (res.statusCode === 404 || res.statusCode === 410) {
          // Dead subscription, clean up
          await db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, sub.id));
        } else if (res.error) {
          errors.push(`WebPush error (${group.userId || group.guestToken}): ${res.error}`);
        }
      }
    }

    // 2. LINE Push Dispatch (if not delivered via web push or if user opted into LINE)
    if (
      group.notifyLine &&
      group.lineUserId &&
      group.lineFriend !== false &&
      linePushesThisRun < lineMonthlyCap
    ) {
      const lineTasks: LinePushTaskItem[] = group.tasks.map((t) => ({
        type: t.type,
        plantNickname: t.plantNickname,
        speciesName: t.speciesName,
      }));

      const res = await sendLineCareDigest({
        toUserId: group.lineUserId,
        dateStr: todayStr,
        tasks: lineTasks,
        shopTip: group.tasks.find((t) => t.shopNote)?.shopNote,
      });

      if (res.success) {
        delivered = true;
        linePushSent++;
        linePushesThisRun++;
        await db.insert(notificationsLog).values({
          userId: group.userId,
          guestToken: group.guestToken,
          channel: "line",
          kind: "daily_digest",
          taskCount: group.tasks.length,
          ok: true,
        });
      } else if (res.error) {
        errors.push(`LINE Push error (${group.lineUserId}): ${res.error}`);
        await db.insert(notificationsLog).values({
          userId: group.userId,
          guestToken: group.guestToken,
          channel: "line",
          kind: "daily_digest",
          taskCount: group.tasks.length,
          ok: false,
          error: res.error,
        });
      }
    }

    // If delivered or simulation mode, mark tasks notified
    if (delivered || process.env.NODE_ENV === "test") {
      await db
        .update(careTasks)
        .set({ notifiedAt: new Date() })
        .where(sql`${careTasks.id} IN ${taskIds}`);
      totalTasksNotified += taskIds.length;
    }
  }

  return {
    recipientsCount: recipientMap.size,
    tasksNotified: totalTasksNotified,
    webPushSent,
    linePushSent,
    errors,
  };
}
