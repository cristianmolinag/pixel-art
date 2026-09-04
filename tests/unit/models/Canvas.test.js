import { describe, it, expect } from "vitest";
import { Canvas, hexToRgba, lineaPuntos } from "../../../src/lib/models/Canvas.js";

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

describe("Canvas.borrarPixel (F03/FR-004)", () => {
  it("deja la celda pintada sin píxel (transparente)", () => {
    const canvas = new Canvas(16, 16);
    canvas.setPixel(2, 3, "#ff0000");
    canvas.borrarPixel(2, 3);
    expect(canvas.getPixel(2, 3)).toEqual({ r: 0, g: 0, b: 0, a: 0 });
  });

  it("borrar una celda vacía no altera el resto", () => {
    const canvas = new Canvas(16, 16);
    canvas.setPixel(2, 3, "#ff0000");
    canvas.borrarPixel(5, 5);
    expect(canvas.getPixel(2, 3)).toEqual({ r: 255, g: 0, b: 0, a: 255 });
  });

  it("no borra fuera de los límites", () => {
    const canvas = new Canvas(16, 16);
    expect(canvas.borrarPixel(-1, 0)).toBe(false);
    expect(canvas.borrarPixel(16, 0)).toBe(false);
  });
});

describe("Canvas.drawLine (F03/FR-005)", () => {
  it("pinta una recta horizontal continua", () => {
    const canvas = new Canvas(16, 16);
    canvas.drawLine(1, 1, 5, 1, "#ff0000");
    for (let x = 1; x <= 5; x++) {
      expect(canvas.getPixel(x, 1).r).toBe(255);
    }
    expect(canvas.getPixel(0, 1).a).toBe(0);
    expect(canvas.getPixel(6, 1).a).toBe(0);
  });

  it("pinta una recta vertical continua", () => {
    const canvas = new Canvas(16, 16);
    canvas.drawLine(3, 2, 3, 7, "#00ff00");
    for (let y = 2; y <= 7; y++) {
      expect(canvas.getPixel(3, y).g).toBe(255);
    }
  });

  it("pinta una diagonal continua sin huecos", () => {
    const canvas = new Canvas(16, 16);
    canvas.drawLine(0, 0, 4, 4, "#0000ff");
    for (let i = 0; i <= 4; i++) {
      expect(canvas.getPixel(i, i).b).toBe(255);
    }
  });

  it("devuelve true si pintó al menos un píxel", () => {
    const canvas = new Canvas(16, 16);
    expect(canvas.drawLine(2, 2, 6, 2, "#ff0000")).toBe(true);
  });
});

describe("Canvas.floodFill (F03/FR-007)", () => {
  it("rellena la región conectada del mismo color", () => {
    const canvas = new Canvas(16, 16);
    canvas.setPixel(2, 2, "#0000ff");
    canvas.setPixel(2, 3, "#0000ff");
    canvas.setPixel(3, 2, "#0000ff");
    const pintados = canvas.floodFill(2, 2, "#ff0000");
    expect(pintados).toBe(3);
    expect(canvas.getPixel(2, 2).r).toBe(255);
    expect(canvas.getPixel(2, 3).r).toBe(255);
    expect(canvas.getPixel(3, 2).r).toBe(255);
  });

  it("no traspasa bordes de distinto color", () => {
    const canvas = new Canvas(16, 16);
    canvas.setPixel(2, 2, "#ff0000");
    canvas.setPixel(3, 2, "#0000ff");
    canvas.floodFill(2, 2, "#00ff00");
    expect(canvas.getPixel(3, 2).b).toBe(255);
    expect(canvas.getPixel(3, 2).g).toBe(0);
  });

  it("no cambia nada si el color es el mismo de la región", () => {
    const canvas = new Canvas(16, 16);
    canvas.setPixel(2, 2, "#ff0000");
    expect(canvas.floodFill(2, 2, "#ff0000")).toBe(0);
    expect(canvas.getPixel(2, 2).r).toBe(255);
  });

  it("devuelve 0 fuera de los límites", () => {
    const canvas = new Canvas(16, 16);
    expect(canvas.floodFill(-1, 0, "#ff0000")).toBe(0);
    expect(canvas.floodFill(16, 0, "#ff0000")).toBe(0);
  });
});

describe("lineaPuntos (F03)", () => {
  it("genera una secuencia continua entre dos puntos", () => {
    const puntos = lineaPuntos(0, 0, 3, 0);
    expect(puntos).toEqual([
      [0, 0],
      [1, 0],
      [2, 0],
      [3, 0],
    ]);
  });
});
