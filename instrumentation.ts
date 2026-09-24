/**
 * Pin the server process to Thailand time.
 *
 * The care scheduler derives "today" with formatDate(new Date()) (CLAUDE.md §4), which uses the
 * process's local timezone. Vercel functions run in UTC and reserve the TZ env var, so between
 * 00:00 and 07:00 in Bangkok the server would compute yesterday's date: next-due dates land a day
 * early, garden status badges are off by one, and SSR/CSR render different "today" values.
 * Node re-reads process.env.TZ at runtime, so setting it here fixes every server-side Date.
 * AWS Lambda (under Vercel) presets TZ=":UTC", so UTC values are overridden too; any other
 * explicit TZ is respected.
 */
export function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const tz = process.env.TZ;
  if (!tz || /^:?(UTC|Etc\/UTC|GMT|Etc\/GMT)$/i.test(tz)) {
    process.env.TZ = "Asia/Bangkok";
  }
}
