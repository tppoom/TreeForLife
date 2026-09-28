export type AppMode = "production" | "demo";

/**
 * Returns the current application runtime mode based on NEXT_PUBLIC_APP_MODE.
 * Defaults to 'production' if not explicitly set to 'demo'.
 */
export function getAppMode(): AppMode {
  return process.env.NEXT_PUBLIC_APP_MODE === "demo" ? "demo" : "production";
}

export function isDemoMode(): boolean {
  return getAppMode() === "demo";
}

export function isProductionMode(): boolean {
  return getAppMode() === "production";
}
