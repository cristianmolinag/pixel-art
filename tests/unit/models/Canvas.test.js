import { describe, it, expect } from "vitest";
import { Canvas, hexToRgba } from "../../../src/lib/models/Canvas.js";

describe("Canvas", () => {
  it("crea un grid por defecto de 16x16 (FR-001)", () => {
    const canvas = new Canvas();
    expect(canvas.cols).toBe(16);
    expect(canvas.rows).toBe(16);
  });

  it("acepta dimensiones personalizadas", () => {
    const canvas = new Canvas(8, 4);
    expect(canvas.cols).toBe(8);
    expect(canvas.rows).toBe(4);
  });

  it("getPixel devuelve null fuera de los límites", () => {
    const canvas = new Canvas(16, 16);
    expect(canvas.getPixel(-1, 0)).toBeNull();
    expect(canvas.getPixel(0, 16)).toBeNull();
    expect(canvas.getPixel(16, 0)).toBeNull();
    expect(canvas.getPixel(0, -1)).toBeNull();
  });

  it("getPixel devuelve un objeto RGBA dentro de los límites", () => {
    const canvas = new Canvas(16, 16);
    const px = canvas.getPixel(5, 5);
    expect(px).toEqual({ r: 0, g: 0, b: 0, a: 0 });
  });
});

describe("Canvas.setPixel (F02/FR-003)", () => {
  it("pinta una celda con el color pasado (persiste, FR-004)", () => {
    const canvas = new Canvas(16, 16);
    canvas.setPixel(2, 3, "#ff0000");
    expect(canvas.getPixel(2, 3)).toEqual({ r: 255, g: 0, b: 0, a: 255 });
  });

  it("permite repintar una celda con otro color", () => {
    const canvas = new Canvas(16, 16);
    canvas.setPixel(2, 3, "#0000ff");
    canvas.setPixel(2, 3, "#00ff00");
    expect(canvas.getPixel(2, 3)).toEqual({ r: 0, g: 255, b: 0, a: 255 });
  });

  it("no pinta fuera de los límites", () => {
    const canvas = new Canvas(16, 16);
    expect(canvas.setPixel(-1, 0, "#ff0000")).toBe(false);
    expect(canvas.setPixel(16, 0, "#ff0000")).toBe(false);
    expect(canvas.getPixel(15, 0).a).toBe(0);
  });
});

describe("hexToRgba (F02)", () => {
  it("convierte un hex 6 dígitos a RGBA", () => {
    expect(hexToRgba("#ff8800")).toEqual({ r: 255, g: 136, b: 0, a: 255 });
  });

  it("convierte un hex 3 dígitos expandido", () => {
    expect(hexToRgba("#f80")).toEqual({ r: 255, g: 136, b: 0, a: 255 });
  });
});
