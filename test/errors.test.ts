import { describe, it, expect } from "vitest";
import { HttpError, toErrorResponse } from "../lib/http/errors";

describe("Unified HTTP Errors", () => {
  it("creates HttpError with status code, code, and message", () => {
    const err = new HttpError(404, "NOT_FOUND", "ไม่พบต้นไม้ที่ระบุ", { id: "123" });
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe("NOT_FOUND");
    expect(err.message).toBe("ไม่พบต้นไม้ที่ระบุ");
    expect(err.details).toEqual({ id: "123" });
  });

  it("toErrorResponse formats HttpError into standard JSON response", async () => {
    const err = new HttpError(400, "VALIDATION_ERROR", "ข้อมูลไม่ถูกต้อง", [{ field: "nickname" }]);
    const res = toErrorResponse(err);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json).toEqual({
      error: {
        code: "VALIDATION_ERROR",
        message: "ข้อมูลไม่ถูกต้อง",
        details: [{ field: "nickname" }],
      },
    });
  });

  it("toErrorResponse formats HttpError without details cleanly", async () => {
    const err = new HttpError(401, "UNAUTHORIZED", "กรุณาเข้าสู่ระบบ");
    const res = toErrorResponse(err);
    expect(res.status).toBe(401);

    const json = await res.json();
    expect(json).toEqual({
      error: {
        code: "UNAUTHORIZED",
        message: "กรุณาเข้าสู่ระบบ",
      },
    });
    expect(json.error).not.toHaveProperty("details");
  });

  it("toErrorResponse sanitizes unknown internal errors to 500 without leaking raw details", async () => {
    const rawSqlError = new Error("syntax error at or near 'SELECT * FROM secrets'");
    const res = toErrorResponse(rawSqlError);
    expect(res.status).toBe(500);

    const json = await res.json();
    expect(json.error.code).toBe("INTERNAL_ERROR");
    expect(json.error.message).toContain("เกิดข้อผิดพลาด");
    expect(JSON.stringify(json)).not.toContain("secrets");
  });

  it("toErrorResponse handles non-Error unknown values safely", async () => {
    const res = toErrorResponse("random failure string");
    expect(res.status).toBe(500);

    const json = await res.json();
    expect(json.error.code).toBe("INTERNAL_ERROR");
    expect(json.error.message).toContain("เกิดข้อผิดพลาด");
  });
});
