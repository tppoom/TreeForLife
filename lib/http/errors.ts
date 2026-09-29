export type StandardErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR";

export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: StandardErrorCode | string,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export function toErrorResponse(error: unknown): Response {
  if (error instanceof HttpError) {
    return Response.json(
      {
        error: {
          code: error.code,
          message: error.message,
          ...(error.details !== undefined ? { details: error.details } : {}),
        },
      },
      { status: error.statusCode }
    );
  }

  // Never leak raw DB error messages or stack traces in production
  console.error("[Internal Server Error]:", error);
  return Response.json(
    {
      error: {
        code: "INTERNAL_ERROR",
        message: "เกิดข้อผิดพลาดภายในระบบ กรุณาลองใหม่อีกครั้ง",
      },
    },
    { status: 500 }
  );
}
