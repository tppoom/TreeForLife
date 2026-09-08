import { getDb } from "@/lib/db";
import { userPlants, species, speciesMedia, careTemplates, careTasks, careLogs, favorites } from "@/db/schema";
import { eq, and, desc, asc, sql } from "drizzle-orm";
import {
  calculateCareInterval,
  calculateWateringInterval,
  explainCareSchedule,
  generateNextTaskDue,
  calculateSnoozeDueDate,
  checkAdaptiveIntervalSuggestion,
  PotMaterial,
  Placement,
} from "@/lib/care/scheduler";

export interface AddUserPlantInput {
  userId?: string | null;
  guestToken?: string | null;
  speciesId?: string | null;
  customSpeciesName?: string | null;
  nickname: string;
  photoUrl?: string | null;
  acquiredAt: string; // YYYY-MM-DD
  acquiredFrom?: "shop" | "elsewhere" | "gift" | "propagated";
  potSizeInch: number | string;
  potMaterial: PotMaterial;
  placement: Placement;
  customWaterDays?: number | null;
  notes?: string | null;
}

export async function getUserPlants(userId?: string | null, guestToken?: string | null) {
  if (!userId && !guestToken) return [];
  const db = await getDb();

  const userCondition = userId
    ? eq(userPlants.userId, userId)
    : eq(userPlants.guestToken, guestToken!);

  const plants = await db
    .select({
      id: userPlants.id,
      nickname: userPlants.nickname,
      photoUrl: userPlants.photoUrl,
      acquiredAt: userPlants.acquiredAt,
      acquiredFrom: userPlants.acquiredFrom,
      potSizeInch: userPlants.potSizeInch,
      potMaterial: userPlants.potMaterial,
      placement: userPlants.placement,
      customWaterDays: userPlants.customWaterDays,
      customSpeciesName: userPlants.customSpeciesName,
      speciesId: userPlants.speciesId,
      createdAt: userPlants.createdAt,
      speciesNameTh: species.nameTh,
      speciesNameEn: species.nameEn,
      speciesSlug: species.slug,
    })
    .from(userPlants)
    .leftJoin(species, eq(userPlants.speciesId, species.id))
    .where(and(userCondition, eq(userPlants.isActive, true)))
    .orderBy(desc(userPlants.createdAt));

  if (plants.length === 0) return [];

  const plantIds = plants.map((p) => p.id);

  // Fetch next pending task for each plant
  const tasks = await db
    .select()
    .from(careTasks)
    .where(
      and(
        sql`${careTasks.userPlantId} IN ${plantIds}`,
        eq(careTasks.status, "pending")
      )
    )
    .orderBy(asc(careTasks.dueDate));

  const taskMap = new Map<string, typeof tasks[0]>();
  for (const t of tasks) {
    if (!taskMap.has(t.userPlantId)) {
      taskMap.set(t.userPlantId, t);
    }
  }

  // Fetch species media if plant doesn't have custom photo
  const speciesIds = plants.map((p) => p.speciesId).filter(Boolean) as string[];
  const mediaMap = new Map<string, string>();
  if (speciesIds.length > 0) {
    const media = await db
      .select()
      .from(speciesMedia)
      .where(sql`${speciesMedia.speciesId} IN ${speciesIds}`)
      .orderBy(desc(speciesMedia.isPrimary));
    for (const m of media) {
      if (!mediaMap.has(m.speciesId)) {
        mediaMap.set(m.speciesId, m.blobUrl);
      }
    }
  }

  const todayStr = new Date().toISOString().split("T")[0];
  const today = new Date(todayStr);

  const result = plants.map((plant) => {
    const nextTask = taskMap.get(plant.id);
    let statusBadge = {
      type: "upcoming" as "overdue" | "today" | "upcoming",
      label: "ยังไม่มีงาน",
      days: 0,
    };

    if (nextTask) {
      const due = new Date(nextTask.dueDate);
      const diffMs = due.getTime() - today.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        statusBadge = {
          type: "overdue",
          label: `เลยกำหนด ${Math.abs(diffDays)} วัน`,
          days: diffDays,
        };
      } else if (diffDays === 0) {
        statusBadge = {
          type: "today",
          label: "รดน้ำวันนี้",
          days: 0,
        };
      } else {
        statusBadge = {
          type: "upcoming",
          label: `อีก ${diffDays} วัน`,
          days: diffDays,
        };
      }
    }

    const defaultImg = "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=600&q=80";
    const displayPhoto = plant.photoUrl || (plant.speciesId ? mediaMap.get(plant.speciesId) : null) || defaultImg;

    return {
      ...plant,
      displayPhoto,
      nextTask: nextTask || null,
      statusBadge,
    };
  });

  // Sort plants by urgency: overdue (<0) first, then today (0), then upcoming (>0)
  result.sort((a, b) => {
    const aDays = a.nextTask ? a.statusBadge.days : 999;
    const bDays = b.nextTask ? b.statusBadge.days : 999;
    return aDays - bDays;
  });

  return result;
}

export async function getUserPlantById(id: string) {
  const db = await getDb();

  const [plant] = await db
    .select({
      id: userPlants.id,
      userId: userPlants.userId,
      guestToken: userPlants.guestToken,
      nickname: userPlants.nickname,
      photoUrl: userPlants.photoUrl,
      acquiredAt: userPlants.acquiredAt,
      acquiredFrom: userPlants.acquiredFrom,
      potSizeInch: userPlants.potSizeInch,
      potMaterial: userPlants.potMaterial,
      placement: userPlants.placement,
      customWaterDays: userPlants.customWaterDays,
      customSpeciesName: userPlants.customSpeciesName,
      speciesId: userPlants.speciesId,
      notes: userPlants.notes,
      isActive: userPlants.isActive,
      createdAt: userPlants.createdAt,
      speciesNameTh: species.nameTh,
      speciesNameEn: species.nameEn,
      speciesNameSci: species.nameSci,
      speciesSlug: species.slug,
      shopNote: species.shopNote,
      soilMix: species.soilMix,
    })
    .from(userPlants)
    .leftJoin(species, eq(userPlants.speciesId, species.id))
    .where(eq(userPlants.id, id))
    .limit(1);

  if (!plant) return null;

  let template = null;
  let calculation = null;

  if (plant.speciesId) {
    const [tmpl] = await db
      .select()
      .from(careTemplates)
      .where(eq(careTemplates.speciesId, plant.speciesId))
      .limit(1);
    template = tmpl;

    if (tmpl) {
      calculation = explainCareSchedule({
        template: tmpl,
        plantConfig: {
          potSizeInch: Number(plant.potSizeInch),
          potMaterial: plant.potMaterial as PotMaterial,
          placement: plant.placement as Placement,
          customWaterDays: plant.customWaterDays,
        },
      });
    }
  }

  const [tasks, logs] = await Promise.all([
    db
      .select()
      .from(careTasks)
      .where(eq(careTasks.userPlantId, plant.id))
      .orderBy(asc(careTasks.dueDate))
      .limit(30),
    db
      .select()
      .from(careLogs)
      .where(eq(careLogs.userPlantId, plant.id))
      .orderBy(desc(careLogs.performedAt))
      .limit(20),
  ]);

  return {
    ...plant,
    template,
    calculation,
    tasks,
    logs,
  };
}

export async function addUserPlant(input: AddUserPlantInput) {
  const db = await getDb();

  const [plant] = await db
    .insert(userPlants)
    .values({
      userId: input.userId || null,
      guestToken: input.guestToken || null,
      speciesId: input.speciesId || null,
      customSpeciesName: input.customSpeciesName || null,
      nickname: input.nickname,
      photoUrl: input.photoUrl || null,
      acquiredAt: input.acquiredAt,
      acquiredFrom: input.acquiredFrom || "shop",
      potSizeInch: String(input.potSizeInch),
      potMaterial: input.potMaterial,
      placement: input.placement,
      customWaterDays: input.customWaterDays || null,
      notes: input.notes || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  // Determine care schedule using scheduler
  let intervalDays = 3;
  let tmpl: typeof careTemplates.$inferSelect | null = null;

  if (input.customWaterDays) {
    intervalDays = input.customWaterDays;
  } else if (input.speciesId) {
    const [foundTmpl] = await db
      .select()
      .from(careTemplates)
      .where(eq(careTemplates.speciesId, input.speciesId))
      .limit(1);
    tmpl = foundTmpl || null;

    if (tmpl) {
      intervalDays = calculateCareInterval({
        template: tmpl,
        potSizeInch: input.potSizeInch,
        potMaterial: input.potMaterial,
        placement: input.placement,
      });
    }
  }

  // Seed upcoming care tasks (water, and optionally fertilize/pest_check if configured)
  const today = new Date();
  const firstDueDateStr = generateNextTaskDue(today, intervalDays);

  await db.insert(careTasks).values({
    userPlantId: plant.id,
    type: "water",
    dueDate: firstDueDateStr,
    status: "pending",
    createdAt: new Date(),
  });

  if (tmpl?.fertilizeDays) {
    const firstFertilizeDate = generateNextTaskDue(today, tmpl.fertilizeDays);
    await db
      .insert(careTasks)
      .values({
        userPlantId: plant.id,
        type: "fertilize",
        dueDate: firstFertilizeDate,
        status: "pending",
        createdAt: new Date(),
      })
      .onConflictDoNothing();
  }

  return plant;
}

export async function updateUserPlant(id: string, input: Partial<AddUserPlantInput>) {
  const db = await getDb();

  const updateData: Record<string, unknown> = {
    updatedAt: new Date(),
  };

  if (input.nickname !== undefined) updateData.nickname = input.nickname;
  if (input.photoUrl !== undefined) updateData.photoUrl = input.photoUrl;
  if (input.acquiredAt !== undefined) updateData.acquiredAt = input.acquiredAt;
  if (input.acquiredFrom !== undefined) updateData.acquiredFrom = input.acquiredFrom;
  if (input.potSizeInch !== undefined) updateData.potSizeInch = String(input.potSizeInch);
  if (input.potMaterial !== undefined) updateData.potMaterial = input.potMaterial;
  if (input.placement !== undefined) updateData.placement = input.placement;
  if (input.customWaterDays !== undefined) updateData.customWaterDays = input.customWaterDays;
  if (input.customSpeciesName !== undefined) updateData.customSpeciesName = input.customSpeciesName;
  if (input.notes !== undefined) updateData.notes = input.notes;

  const [updated] = await db
    .update(userPlants)
    .set(updateData)
    .where(eq(userPlants.id, id))
    .returning();

  return updated;
}

export async function archiveUserPlant(id: string) {
  const db = await getDb();
  await db
    .update(userPlants)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(userPlants.id, id));

  return { success: true };
}

export interface CompleteTaskInput {
  taskId: string;
  userPlantId: string;
  note?: string;
  photoUrl?: string;
  source?: "app" | "line" | "backfill";
}

export async function completeTask(input: CompleteTaskInput) {
  const db = await getDb();

  const [task] = await db
    .select()
    .from(careTasks)
    .where(and(eq(careTasks.id, input.taskId), eq(careTasks.userPlantId, input.userPlantId)))
    .limit(1);

  if (!task) {
    throw new Error("Task not found");
  }

  const [plant] = await db
    .select()
    .from(userPlants)
    .where(eq(userPlants.id, input.userPlantId))
    .limit(1);

  if (!plant) {
    throw new Error("Plant not found");
  }

  const performedAt = new Date();

  // Mark current task done
  await db
    .update(careTasks)
    .set({ status: "done", doneAt: performedAt })
    .where(eq(careTasks.id, task.id));

  // Create care log
  await db.insert(careLogs).values({
    userPlantId: plant.id,
    type: task.type,
    performedAt,
    note: input.note || null,
    photoUrl: input.photoUrl || null,
    source: input.source || "app",
  });

  // Calculate next interval using scheduler
  let intervalDays = 3;
  if (task.type === "water") {
    if (plant.customWaterDays) {
      intervalDays = plant.customWaterDays;
    } else if (plant.speciesId) {
      const [tmpl] = await db
        .select()
        .from(careTemplates)
        .where(eq(careTemplates.speciesId, plant.speciesId))
        .limit(1);
      if (tmpl) {
        intervalDays = calculateCareInterval({
          template: tmpl,
          potSizeInch: Number(plant.potSizeInch),
          potMaterial: plant.potMaterial as PotMaterial,
          placement: plant.placement as Placement,
        });
      }
    }
  } else if (task.type === "fertilize") {
    if (plant.speciesId) {
      const [tmpl] = await db
        .select()
        .from(careTemplates)
        .where(eq(careTemplates.speciesId, plant.speciesId))
        .limit(1);
      intervalDays = tmpl?.fertilizeDays || 30;
    } else {
      intervalDays = 30;
    }
  } else if (task.type === "pest_check") {
    if (plant.speciesId) {
      const [tmpl] = await db
        .select()
        .from(careTemplates)
        .where(eq(careTemplates.speciesId, plant.speciesId))
        .limit(1);
      intervalDays = tmpl?.pestCheckDays || 14;
    } else {
      intervalDays = 14;
    }
  } else {
    intervalDays = 30;
  }

  const nextDueDateStr = generateNextTaskDue(performedAt, intervalDays);

  // Create next task
  await db
    .insert(careTasks)
    .values({
      userPlantId: plant.id,
      type: task.type,
      dueDate: nextDueDateStr,
      status: "pending",
      createdAt: new Date(),
    })
    .onConflictDoNothing();

  // Check for adaptive suggestion
  const scheduled = new Date(task.dueDate);
  const adaptiveSuggestion =
    task.type === "water"
      ? checkAdaptiveIntervalSuggestion(scheduled, performedAt, intervalDays)
      : { shouldSuggest: false };

  return {
    success: true,
    action: "complete",
    nextDueDate: nextDueDateStr,
    adaptiveSuggestion,
  };
}

export interface SnoozeTaskInput {
  taskId: string;
  userPlantId: string;
}

export async function snoozeTask(input: SnoozeTaskInput) {
  const db = await getDb();

  const [task] = await db
    .select()
    .from(careTasks)
    .where(and(eq(careTasks.id, input.taskId), eq(careTasks.userPlantId, input.userPlantId)))
    .limit(1);

  if (!task) {
    throw new Error("Task not found");
  }

  if (task.snoozeCount >= 3) {
    throw new Error("เลื่อนได้สูงสุด 3 ครั้งติดต่อกัน กรุณาเลือก 'รดแล้ว' หรือ 'ข้ามรอบนี้'");
  }

  const snoozeResult = calculateSnoozeDueDate(task.dueDate, task.snoozeCount);

  await db
    .update(careTasks)
    .set({
      dueDate: snoozeResult.nextDueDate,
      snoozeCount: snoozeResult.newSnoozeCount,
      status: "pending",
    })
    .where(eq(careTasks.id, task.id));

  return {
    success: true,
    action: "snooze",
    newDueDate: snoozeResult.nextDueDate,
    snoozeCount: snoozeResult.newSnoozeCount,
  };
}

export interface SkipTaskInput {
  taskId: string;
  userPlantId: string;
}

export async function skipTask(input: SkipTaskInput) {
  const db = await getDb();

  const [task] = await db
    .select()
    .from(careTasks)
    .where(and(eq(careTasks.id, input.taskId), eq(careTasks.userPlantId, input.userPlantId)))
    .limit(1);

  if (!task) {
    throw new Error("Task not found");
  }

  const [plant] = await db
    .select()
    .from(userPlants)
    .where(eq(userPlants.id, input.userPlantId))
    .limit(1);

  if (!plant) {
    throw new Error("Plant not found");
  }

  await db
    .update(careTasks)
    .set({ status: "skipped" })
    .where(eq(careTasks.id, task.id));

  // Calculate next due date from scheduled due date
  let intervalDays = 3;
  if (task.type === "water") {
    if (plant.customWaterDays) {
      intervalDays = plant.customWaterDays;
    } else if (plant.speciesId) {
      const [tmpl] = await db
        .select()
        .from(careTemplates)
        .where(eq(careTemplates.speciesId, plant.speciesId))
        .limit(1);
      if (tmpl) {
        intervalDays = calculateCareInterval({
          template: tmpl,
          potSizeInch: Number(plant.potSizeInch),
          potMaterial: plant.potMaterial as PotMaterial,
          placement: plant.placement as Placement,
        });
      }
    }
  }

  const nextDueDateStr = generateNextTaskDue(task.dueDate, intervalDays);

  await db
    .insert(careTasks)
    .values({
      userPlantId: plant.id,
      type: task.type,
      dueDate: nextDueDateStr,
      status: "pending",
      createdAt: new Date(),
    })
    .onConflictDoNothing();

  return {
    success: true,
    action: "skip",
    nextDueDate: nextDueDateStr,
  };
}

export interface TaskActionInput {
  userPlantId: string;
  taskId: string;
  action: "done" | "complete" | "snooze" | "skip";
  note?: string;
  photoUrl?: string;
}

export async function recordTaskAction(input: TaskActionInput) {
  if (input.action === "done" || input.action === "complete") {
    return completeTask({
      taskId: input.taskId,
      userPlantId: input.userPlantId,
      note: input.note,
      photoUrl: input.photoUrl,
    });
  }

  if (input.action === "snooze") {
    return snoozeTask({
      taskId: input.taskId,
      userPlantId: input.userPlantId,
    });
  }

  if (input.action === "skip") {
    return skipTask({
      taskId: input.taskId,
      userPlantId: input.userPlantId,
    });
  }

  throw new Error(`Invalid task action: ${input.action}`);
}

export async function mergeGuestPlants(guestToken: string, userId: string) {
  if (!guestToken || !userId) return { plantCount: 0, favoriteCount: 0 };
  const db = await getDb();

  // Merge plants
  const plantRes = await db
    .update(userPlants)
    .set({ userId, guestToken: null, updatedAt: new Date() })
    .where(eq(userPlants.guestToken, guestToken))
    .returning();

  // Merge favorites
  const favRes = await db
    .update(favorites)
    .set({ userId, guestToken: null })
    .where(eq(favorites.guestToken, guestToken))
    .returning();

  return {
    plantCount: plantRes.length,
    favoriteCount: favRes.length,
  };
}

export const mergeGuestData = mergeGuestPlants;
