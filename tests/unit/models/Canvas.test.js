import { describe, it, expect } from "vitest";
import { Canvas } from "../../../src/lib/models/Canvas.js";

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
