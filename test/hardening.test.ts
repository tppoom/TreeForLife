import { describe, it, expect, beforeAll } from "vitest";
import { getDb } from "../lib/db";
import { GET as getPlants, POST as postPlant } from "../app/api/garden/plants/route";
import { GET as getPlant, PATCH as patchPlant } from "../app/api/garden/plants/[id]/route";
import { POST as archivePlant } from "../app/api/garden/plants/[id]/archive/route";
import { POST as postInquiry } from "../app/api/inquiries/route";

describe("API Security & Ownership Hardening", () => {
  let guestTokenA: string;
  let guestTokenB: string;
  let plantAId: string;
  let testSpeciesId: string;

  beforeAll(async () => {
    const db = await getDb();
    guestTokenA = `guest-alice-${Date.now()}`;
    guestTokenB = `guest-bob-${Date.now()}`;

    // Get any existing species id
    const res = await db.query.species.findFirst();
    if (!res) throw new Error("Seed species required for test");
    testSpeciesId = res.id;

    // Create plant for guest A
    const createReq = new Request("https://example.com/api/garden/plants", {
      method: "POST",
      headers: { "x-guest-token": guestTokenA, "content-type": "application/json" },
      body: JSON.stringify({
        speciesId: testSpeciesId,
        nickname: "Alice Tree",
        potMaterial: "terracotta",
        potSizeInch: 8,
        placement: "indoor_window",
      }),
    });
    const createRes = await postPlant(createReq);
    expect(createRes.status).toBe(201);
    const createJson = await createRes.json();
    plantAId = createJson.data.id;
  });

  it("Guest B cannot view Guest A's plant (returns 404 NOT_FOUND)", async () => {
    const req = new Request(`https://example.com/api/garden/plants/${plantAId}`, {
      headers: { "x-guest-token": guestTokenB },
    });
    const res = await getPlant(req, { params: Promise.resolve({ id: plantAId }) });
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error.code).toBe("NOT_FOUND");
  });

  it("Guest B cannot update Guest A's plant (returns 404 NOT_FOUND)", async () => {
    const req = new Request(`https://example.com/api/garden/plants/${plantAId}`, {
      method: "PATCH",
      headers: { "x-guest-token": guestTokenB, "content-type": "application/json" },
      body: JSON.stringify({ nickname: "Hacked by Bob" }),
    });
    const res = await patchPlant(req, { params: Promise.resolve({ id: plantAId }) });
    expect(res.status).toBe(404);
  });

  it("Guest B cannot archive Guest A's plant (returns 404 NOT_FOUND)", async () => {
    const req = new Request(`https://example.com/api/garden/plants/${plantAId}/archive`, {
      method: "POST",
      headers: { "x-guest-token": guestTokenB },
    });
    const res = await archivePlant(req, { params: Promise.resolve({ id: plantAId }) });
    expect(res.status).toBe(404);
  });

  it("Rejects invalid payload with 400 VALIDATION_ERROR", async () => {
    const req = new Request("https://example.com/api/garden/plants", {
      method: "POST",
      headers: { "x-guest-token": guestTokenA, "content-type": "application/json" },
      body: JSON.stringify({
        speciesId: testSpeciesId,
        nickname: "", // invalid empty nickname
        potMaterial: "gold",
        potSizeInch: -1,
        placement: "nowhere",
      }),
    });
    const res = await postPlant(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error.code).toBe("VALIDATION_ERROR");
  });
});
