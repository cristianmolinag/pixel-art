import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { toasts } from "../../../src/lib/stores/toasts.svelte.js";

describe("toasts store (F16)", () => {
  beforeEach(() => {
    toasts.items = [];
  });

  afterEach(() => {
    vi.useRealTimers();
    toasts.items = [];
  });

  it("starts empty", () => {
    expect(toasts.items).toEqual([]);
  });

  it("show adds a toast with a message", () => {
    const id = toasts.show("Hello");

    expect(toasts.items).toHaveLength(1);
    expect(toasts.items[0].id).toBe(id);
    expect(toasts.items[0].message).toBe("Hello");
  });

  it("dismiss removes a toast by id", () => {
    const id = toasts.show("Hello");
    toasts.dismiss(id);

    expect(toasts.items).toEqual([]);
  });

  it("auto-dismisses a toast after the default duration", () => {
    vi.useFakeTimers();
    toasts.show("Auto");

    expect(toasts.items).toHaveLength(1);
    vi.advanceTimersByTime(2500);
    expect(toasts.items).toHaveLength(0);
  });

  it("respects a custom duration", () => {
    vi.useFakeTimers();
    toasts.show("Custom", { duration: 1000 });

    vi.advanceTimersByTime(999);
    expect(toasts.items).toHaveLength(1);
    vi.advanceTimersByTime(1);
    expect(toasts.items).toHaveLength(0);
  });

  it("keeps at most three toasts", () => {
    toasts.show("One");
    toasts.show("Two");
    toasts.show("Three");
    toasts.show("Four");

    expect(toasts.items).toHaveLength(3);
    expect(toasts.items.map((t) => t.message)).toEqual(["Two", "Three", "Four"]);
  });
});
