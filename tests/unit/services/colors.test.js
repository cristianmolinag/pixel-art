import { describe, it, expect, beforeEach } from "vitest";
import {
  RECENT_LIMIT,
  loadRecentColors,
  saveRecentColors,
  normalizeHex,
  hexToRgb,
  hexToHsv,
  hsvToHex,
} from "../../../src/lib/services/colors.js";

const STORAGE_KEY = "pixel-art-studio:recent-colors";

beforeEach(() => {
  localStorage.clear();
});

describe("colors service (F06)", () => {
  it("normalizeHex accepts #rrggbb and #rgb and normalizes to 6-digit uppercase", () => {
    expect(normalizeHex("#FF0000")).toBe("#FF0000");
    expect(normalizeHex("ff0000")).toBe("#FF0000");
    expect(normalizeHex("#abc")).toBe("#AABBCC");
    expect(normalizeHex("  #1a2b3c  ")).toBe("#1A2B3C");
  });

  it("normalizeHex rejects invalid values", () => {
    expect(normalizeHex("")).toBe(null);
    expect(normalizeHex("#12")).toBe(null);
    expect(normalizeHex("#gggggg")).toBe(null);
    expect(normalizeHex("rojo")).toBe(null);
    expect(normalizeHex(123)).toBe(null);
  });

  it("loadRecentColors returns the normalized persisted list", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(["#FF0000", "#abc", "#FF0000", "#zzz"]));
    expect(loadRecentColors()).toEqual(["#FF0000", "#AABBCC"]);
  });

  it("loadRecentColors respects the limit", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(["#111111", "#222222", "#333333"]));
    expect(loadRecentColors(2)).toEqual(["#111111", "#222222"]);
  });

  it("loadRecentColors with corrupt data returns an empty list", () => {
    localStorage.setItem(STORAGE_KEY, "{no json");
    expect(loadRecentColors()).toEqual([]);
    localStorage.removeItem(STORAGE_KEY);
    expect(loadRecentColors()).toEqual([]);
  });

  it("saveRecentColors persists the list", () => {
    saveRecentColors(["#FF0000", "#00FF00"]);
    expect(localStorage.getItem(STORAGE_KEY)).toBe(JSON.stringify(["#FF0000", "#00FF00"]));
  });

  it("exposes the configured recent colors limit", () => {
    expect(RECENT_LIMIT).toBe(6);
  });
});

describe("colors service (HSV↔hex, F06)", () => {
  it("hexToRgb converts #rrggbb to channels", () => {
    expect(hexToRgb("#ff0000")).toEqual({ r: 255, g: 0, b: 0 });
    expect(hexToRgb("#abc")).toEqual({ r: 170, g: 187, b: 204 });
  });

  it("hexToRgb rejects invalid values", () => {
    expect(hexToRgb("rojo")).toBe(null);
    expect(hexToRgb("#12")).toBe(null);
  });

  it("hexToHsv of primary colors", () => {
    expect(hexToHsv("#ff0000")).toEqual({ h: 0, s: 1, v: 1 });
    expect(hexToHsv("#00ff00")).toEqual({ h: 120, s: 1, v: 1 });
    expect(hexToHsv("#0000ff")).toEqual({ h: 240, s: 1, v: 1 });
  });

  it("hexToHsv of white/black/neutrals", () => {
    expect(hexToHsv("#ffffff")).toEqual({ h: 0, s: 0, v: 1 });
    expect(hexToHsv("#000000")).toEqual({ h: 0, s: 0, v: 0 });
    expect(hexToHsv("#808080")).toEqual({ h: 0, s: 0, v: 128 / 255 });
  });

  it("hsvToHex converts to #RRGGBB", () => {
    expect(hsvToHex(0, 1, 1)).toBe("#FF0000");
    expect(hsvToHex(120, 1, 1)).toBe("#00FF00");
    expect(hsvToHex(240, 1, 1)).toBe("#0000FF");
    expect(hsvToHex(120, 0.5, 0.5)).toBe("#408040");
  });

  it("hsvToHex normalizes out-of-range hues", () => {
    expect(hsvToHex(-120, 1, 1)).toBe("#0000FF");
    expect(hsvToHex(480, 1, 1)).toBe("#00FF00");
  });

  it("hex → hsv → hex is a stable roundtrip", () => {
    expect(hsvToHex(...Object.values(hexToHsv("#147df5")))).toBe("#147DF5");
  });
});
