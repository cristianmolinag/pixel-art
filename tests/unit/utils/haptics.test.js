import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { vibrate } from "../../../src/lib/utils/haptics.js";

describe("haptics utility (F16)", () => {
  const originalNavigator = globalThis.navigator;

  beforeEach(() => {
    vi.stubGlobal(
      "navigator",
      Object.create(Object.getPrototypeOf(originalNavigator))
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("calls navigator.vibrate with the default duration when supported", () => {
    const vibrateSpy = vi.fn();
    Object.defineProperty(globalThis.navigator, "vibrate", {
      value: vibrateSpy,
      configurable: true,
    });

    vibrate();

    expect(vibrateSpy).toHaveBeenCalledWith(15);
  });

  it("calls navigator.vibrate with a custom duration", () => {
    const vibrateSpy = vi.fn();
    Object.defineProperty(globalThis.navigator, "vibrate", {
      value: vibrateSpy,
      configurable: true,
    });

    vibrate(30);

    expect(vibrateSpy).toHaveBeenCalledWith(30);
  });

  it("does nothing when navigator.vibrate is missing", () => {
    expect(() => vibrate(15)).not.toThrow();
  });

  it("does nothing when navigator is undefined", () => {
    vi.stubGlobal("navigator", undefined);
    expect(() => vibrate(15)).not.toThrow();
  });
});
