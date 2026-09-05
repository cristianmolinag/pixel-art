import { describe, it, expect, beforeEach } from "vitest";
import {
  LIMITE_RECIENTES,
  cargarRecientes,
  guardarRecientes,
  normalizarHex,
  hexToRgb,
  hexToHsv,
  hsvToHex,
} from "../../../src/lib/services/colores.js";

const STORAGE_KEY = "pixel-art-studio:colores-recientes";

beforeEach(() => {
  localStorage.clear();
});

describe("colores service (F06)", () => {
  it("normalizarHex acepta #rrggbb y #rgb y normaliza a mayúsculas de 6 dígitos", () => {
    expect(normalizarHex("#FF0000")).toBe("#FF0000");
    expect(normalizarHex("ff0000")).toBe("#FF0000");
    expect(normalizarHex("#abc")).toBe("#AABBCC");
    expect(normalizarHex("  #1a2b3c  ")).toBe("#1A2B3C");
  });

  it("normalizarHex rechaza valores inválidos", () => {
    expect(normalizarHex("")).toBe(null);
    expect(normalizarHex("#12")).toBe(null);
    expect(normalizarHex("#gggggg")).toBe(null);
    expect(normalizarHex("rojo")).toBe(null);
    expect(normalizarHex(123)).toBe(null);
  });

  it("cargarRecientes devuelve la lista persistida normalizada", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(["#FF0000", "#abc", "#FF0000", "#zzz"]));
    expect(cargarRecientes()).toEqual(["#FF0000", "#AABBCC"]);
  });

  it("cargarRecientes respeta el límite", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(["#111111", "#222222", "#333333"]));
    expect(cargarRecientes(2)).toEqual(["#111111", "#222222"]);
  });

  it("cargarRecientes de datos corruptos devuelve lista vacía", () => {
    localStorage.setItem(STORAGE_KEY, "{no json");
    expect(cargarRecientes()).toEqual([]);
    localStorage.removeItem(STORAGE_KEY);
    expect(cargarRecientes()).toEqual([]);
  });

  it("guardarRecientes persiste la lista", () => {
    guardarRecientes(["#FF0000", "#00FF00"]);
    expect(localStorage.getItem(STORAGE_KEY)).toBe(JSON.stringify(["#FF0000", "#00FF00"]));
  });

  it("expone el límite de recientes configurado", () => {
    expect(LIMITE_RECIENTES).toBe(6);
  });
});

describe("colores service (HSV↔hex, F06)", () => {
  it("hexToRgb convierte #rrggbb a canales", () => {
    expect(hexToRgb("#ff0000")).toEqual({ r: 255, g: 0, b: 0 });
    expect(hexToRgb("#abc")).toEqual({ r: 170, g: 187, b: 204 });
  });

  it("hexToRgb rechaza valores inválidos", () => {
    expect(hexToRgb("rojo")).toBe(null);
    expect(hexToRgb("#12")).toBe(null);
  });

  it("hexToHsv de colores primarios", () => {
    expect(hexToHsv("#ff0000")).toEqual({ h: 0, s: 1, v: 1 });
    expect(hexToHsv("#00ff00")).toEqual({ h: 120, s: 1, v: 1 });
    expect(hexToHsv("#0000ff")).toEqual({ h: 240, s: 1, v: 1 });
  });

  it("hexToHsv de blanco/negro/neutros", () => {
    expect(hexToHsv("#ffffff")).toEqual({ h: 0, s: 0, v: 1 });
    expect(hexToHsv("#000000")).toEqual({ h: 0, s: 0, v: 0 });
    expect(hexToHsv("#808080")).toEqual({ h: 0, s: 0, v: 128 / 255 });
  });

  it("hsvToHex convierte a #RRGGBB", () => {
    expect(hsvToHex(0, 1, 1)).toBe("#FF0000");
    expect(hsvToHex(120, 1, 1)).toBe("#00FF00");
    expect(hsvToHex(240, 1, 1)).toBe("#0000FF");
    expect(hsvToHex(120, 0.5, 0.5)).toBe("#408040");
  });

  it("hsvToHex normaliza matices fuera de rango", () => {
    expect(hsvToHex(-120, 1, 1)).toBe("#0000FF");
    expect(hsvToHex(480, 1, 1)).toBe("#00FF00");
  });

  it("hex → hsv → hex es ida y vuelta estable", () => {
    expect(hsvToHex(...Object.values(hexToHsv("#147df5")))).toBe("#147DF5");
  });
});