import { describe, it, expect, afterEach } from "vitest";
import { getAppMode, isDemoMode, isProductionMode } from "../lib/config/app-mode";

describe("app-mode helper", () => {
  const originalEnv = process.env.NEXT_PUBLIC_APP_MODE;

  afterEach(() => {
    process.env.NEXT_PUBLIC_APP_MODE = originalEnv;
  });

  it("defaults to 'production' when NEXT_PUBLIC_APP_MODE is undefined or empty", () => {
    delete process.env.NEXT_PUBLIC_APP_MODE;
    expect(getAppMode()).toBe("production");
    expect(isProductionMode()).toBe(true);
    expect(isDemoMode()).toBe(false);

    process.env.NEXT_PUBLIC_APP_MODE = "";
    expect(getAppMode()).toBe("production");
    expect(isProductionMode()).toBe(true);
    expect(isDemoMode()).toBe(false);
  });

  it("returns 'demo' when NEXT_PUBLIC_APP_MODE is set to 'demo'", () => {
    process.env.NEXT_PUBLIC_APP_MODE = "demo";
    expect(getAppMode()).toBe("demo");
    expect(isDemoMode()).toBe(true);
    expect(isProductionMode()).toBe(false);
  });

  it("treats unknown values as 'production'", () => {
    process.env.NEXT_PUBLIC_APP_MODE = "staging";
    expect(getAppMode()).toBe("production");
    expect(isProductionMode()).toBe(true);
    expect(isDemoMode()).toBe(false);
  });
});
