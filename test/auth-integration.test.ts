import { describe, it, expect, beforeAll } from "vitest";
import { getDb } from "@/lib/db";
import { users, userPlants, species, favorites, inquiries } from "@/db/schema";
import { signSession, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { getActor } from "@/lib/auth/actor";
import { mergeGuestData } from "@/lib/services/gardenService";
import { eq } from "drizzle-orm";

describe("F02: LINE Login, Server Sessions & Guest Merge", () => {
  let testUserId: string;
  let testSpeciesId: string;

  beforeAll(async () => {
    const db = await getDb();
    // Ensure at least one species exists
    const [sp] = await db.select({ id: species.id }).from(species).limit(1);
    testSpeciesId = sp?.id || "00000000-0000-0000-0000-000000000001";

    // Insert a test user
    const [u] = await db
      .insert(users)
      .values({
        displayName: "Somchai Gardener",
        lineUserId: `line_test_${Date.now()}`,
        role: "customer",
        sessionVersion: 1,
      })
      .returning();
    testUserId = u.id;
  });

  it("authenticates user from signed session cookie", async () => {
    const token = await signSession({
      sub: testUserId,
      role: "customer",
      sv: 1,
    });

    const req = new Request("https://example.com/api/garden", {
      headers: {
        cookie: `${SESSION_COOKIE_NAME}=${token}`,
      },
    });

    const actor = await getActor(req);
    expect(actor.kind).toBe("user");
    if (actor.kind === "user") {
      expect(actor.userId).toBe(testUserId);
      expect(actor.role).toBe("customer");
    }
  });

  it("invalidates session when user sessionVersion increments in DB", async () => {
    const db = await getDb();
    // Increment session version in DB
    await db
      .update(users)
      .set({ sessionVersion: 2 })
      .where(eq(users.id, testUserId));

    // Token signed with old sv: 1
    const oldToken = await signSession({
      sub: testUserId,
      role: "customer",
      sv: 1,
    });

    const req = new Request("https://example.com/api/garden", {
      headers: {
        cookie: `${SESSION_COOKIE_NAME}=${oldToken}`,
      },
    });

    const actor = await getActor(req);
    // Should fall back to anonymous because sv 1 != sv 2 in DB
    expect(actor.kind).toBe("anonymous");
  });

  it("merges guest plants, favorites, and inquiries into user account", async () => {
    const db = await getDb();
    const guestToken = `guest_test_merge_${Date.now()}`;

    // Create a plant under guest
    const [plant] = await db
      .insert(userPlants)
      .values({
        guestToken,
        speciesId: testSpeciesId,
        nickname: "ต้นไม้ของเกสต์",
        acquiredAt: "2026-09-01",
        potSizeInch: "8",
        potMaterial: "plastic",
        placement: "indoor_window",
      })
      .returning();

    // Create a favorite under guest
    await db.insert(favorites).values({
      guestToken,
      speciesId: testSpeciesId,
    });

    // Create an inquiry under guest
    await db.insert(inquiries).values({
      guestToken,
      sourcePage: "/today",
      refCode: `TFL-TEST-${Date.now().toString().slice(-4)}`,
      intent: "care_help",
      payload: {},
    });

    // Merge into testUserId
    const mergeResult = await mergeGuestData(guestToken, testUserId);
    expect(mergeResult.plantCount).toBeGreaterThanOrEqual(1);

    // Verify plant now belongs to user
    const [updatedPlant] = await db
      .select({ userId: userPlants.userId, guestToken: userPlants.guestToken })
      .from(userPlants)
      .where(eq(userPlants.id, plant.id));

    expect(updatedPlant.userId).toBe(testUserId);

    // Verify favorite now belongs to user
    const userFavs = await db
      .select()
      .from(favorites)
      .where(eq(favorites.userId, testUserId));
    expect(userFavs.some((f) => f.speciesId === testSpeciesId)).toBe(true);
  });
});
