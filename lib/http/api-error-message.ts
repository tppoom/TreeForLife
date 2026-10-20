/**
 * Extracts a human-readable message from an API error body.
 *
 * Routes answer failures as `{ error: { code, message } }` (lib/http/errors.ts), while a few
 * legacy handlers still send `{ error: "..." }`. Passing `data.error` straight to `new Error()`
 * would surface "[object Object]" in toasts.
 */
export function apiErrorMessage(data: unknown, fallback: string): string {
  if (data && typeof data === "object" && "error" in data) {
    const err = (data as { error: unknown }).error;
    if (typeof err === "string" && err) return err;
    if (err && typeof err === "object" && "message" in err) {
      const message = (err as { message: unknown }).message;
      if (typeof message === "string" && message) return message;
    }
  }
  return fallback;
}
