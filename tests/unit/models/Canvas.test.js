import { describe, it, expect } from "vitest";
import { Canvas, hexToRgba, linePoints } from "../../../src/lib/models/Canvas.js";

describe("Canvas", () => {
  it("creates a default 16x16 grid (FR-001)", () => {
    const canvas = new Canvas();
    expect(canvas.cols).toBe(16);
    expect(canvas.rows).toBe(16);
  });

  it("accepts custom dimensions", () => {
    const canvas = new Canvas(8, 4);
    expect(canvas.cols).toBe(8);
    expect(canvas.rows).toBe(4);
  });

  it("getPixel returns null outside the bounds", () => {
    const canvas = new Canvas(16, 16);
    expect(canvas.getPixel(-1, 0)).toBeNull();
    expect(canvas.getPixel(0, 16)).toBeNull();
    expect(canvas.getPixel(16, 0)).toBeNull();
    expect(canvas.getPixel(0, -1)).toBeNull();
  });

  it("getPixel returns an RGBA object inside the bounds", () => {
    const canvas = new Canvas(16, 16);
    const px = canvas.getPixel(5, 5);
    expect(px).toEqual({ r: 0, g: 0, b: 0, a: 0 });
  });
});

describe("Canvas.setPixel (F02/FR-003)", () => {
  it("paints a cell with the given color (persists, FR-004)", () => {
    const canvas = new Canvas(16, 16);
    canvas.setPixel(2, 3, "#ff0000");
    expect(canvas.getPixel(2, 3)).toEqual({ r: 255, g: 0, b: 0, a: 255 });
  });

  it("allows repainting a cell with another color", () => {
    const canvas = new Canvas(16, 16);
    canvas.setPixel(2, 3, "#0000ff");
    canvas.setPixel(2, 3, "#00ff00");
    expect(canvas.getPixel(2, 3)).toEqual({ r: 0, g: 255, b: 0, a: 255 });
  });

  it("does not paint outside the bounds", () => {
    const canvas = new Canvas(16, 16);
    expect(canvas.setPixel(-1, 0, "#ff0000")).toBe(false);
    expect(canvas.setPixel(16, 0, "#ff0000")).toBe(false);
    expect(canvas.getPixel(15, 0).a).toBe(0);
  });
});

describe("hexToRgba (F02)", () => {
  it("converts a 6-digit hex to RGBA", () => {
    expect(hexToRgba("#ff8800")).toEqual({ r: 255, g: 136, b: 0, a: 255 });
  });

  it("converts an expanded 3-digit hex", () => {
    expect(hexToRgba("#f80")).toEqual({ r: 255, g: 136, b: 0, a: 255 });
  });
});

describe("Canvas.erasePixel (F03/FR-004)", () => {
  it("leaves the painted cell without a pixel (transparent)", () => {
    const canvas = new Canvas(16, 16);
    canvas.setPixel(2, 3, "#ff0000");
    canvas.erasePixel(2, 3);
    expect(canvas.getPixel(2, 3)).toEqual({ r: 0, g: 0, b: 0, a: 0 });
  });

  it("erasing an empty cell does not alter the rest", () => {
    const canvas = new Canvas(16, 16);
    canvas.setPixel(2, 3, "#ff0000");
    canvas.erasePixel(5, 5);
    expect(canvas.getPixel(2, 3)).toEqual({ r: 255, g: 0, b: 0, a: 255 });
  });

  it("does not erase outside the bounds", () => {
    const canvas = new Canvas(16, 16);
    expect(canvas.erasePixel(-1, 0)).toBe(false);
    expect(canvas.erasePixel(16, 0)).toBe(false);
  });
});

describe("Canvas.drawLine (F03/FR-005)", () => {
  it("draws a continuous horizontal line", () => {
    const canvas = new Canvas(16, 16);
    canvas.drawLine(1, 1, 5, 1, "#ff0000");
    for (let x = 1; x <= 5; x++) {
      expect(canvas.getPixel(x, 1).r).toBe(255);
    }
    expect(canvas.getPixel(0, 1).a).toBe(0);
    expect(canvas.getPixel(6, 1).a).toBe(0);
  });

  it("draws a continuous vertical line", () => {
    const canvas = new Canvas(16, 16);
    canvas.drawLine(3, 2, 3, 7, "#00ff00");
    for (let y = 2; y <= 7; y++) {
      expect(canvas.getPixel(3, y).g).toBe(255);
    }
  });

  it("draws a continuous diagonal with no gaps", () => {
    const canvas = new Canvas(16, 16);
    canvas.drawLine(0, 0, 4, 4, "#0000ff");
    for (let i = 0; i <= 4; i++) {
      expect(canvas.getPixel(i, i).b).toBe(255);
    }
  });

  it("returns true when it painted at least one pixel", () => {
    const canvas = new Canvas(16, 16);
    expect(canvas.drawLine(2, 2, 6, 2, "#ff0000")).toBe(true);
  });
});

describe("Canvas.floodFill (F03/FR-007)", () => {
  it("fills the connected region of the same color", () => {
    const canvas = new Canvas(16, 16);
    canvas.setPixel(2, 2, "#0000ff");
    canvas.setPixel(2, 3, "#0000ff");
    canvas.setPixel(3, 2, "#0000ff");
    const painted = canvas.floodFill(2, 2, "#ff0000");
    expect(painted).toBe(3);
    expect(canvas.getPixel(2, 2).r).toBe(255);
    expect(canvas.getPixel(2, 3).r).toBe(255);
    expect(canvas.getPixel(3, 2).r).toBe(255);
  });

  it("does not cross borders of a different color", () => {
    const canvas = new Canvas(16, 16);
    canvas.setPixel(2, 2, "#ff0000");
    canvas.setPixel(3, 2, "#0000ff");
    canvas.floodFill(2, 2, "#00ff00");
    expect(canvas.getPixel(3, 2).b).toBe(255);
    expect(canvas.getPixel(3, 2).g).toBe(0);
  });

  it("changes nothing when the color matches the region", () => {
    const canvas = new Canvas(16, 16);
    canvas.setPixel(2, 2, "#ff0000");
    expect(canvas.floodFill(2, 2, "#ff0000")).toBe(0);
    expect(canvas.getPixel(2, 2).r).toBe(255);
  });

  it("returns 0 outside the bounds", () => {
    const canvas = new Canvas(16, 16);
    expect(canvas.floodFill(-1, 0, "#ff0000")).toBe(0);
    expect(canvas.floodFill(16, 0, "#ff0000")).toBe(0);
  });
});

describe("linePoints (F03)", () => {
  it("generates a continuous sequence between two points", () => {
    const puntos = linePoints(0, 0, 3, 0);
    expect(puntos).toEqual([
      [0, 0],
      [1, 0],
      [2, 0],
      [3, 0],
    ]);
  });
});

describe("Canvas.snapshot/restore (F04/FR-002)", () => {
  it("snapshot returns an isolated copy of the pixels", () => {
    const canvas = new Canvas(16, 16);
    canvas.setPixel(2, 3, "#ff0000");
    const snap = canvas.snapshot();
    canvas.setPixel(2, 3, "#00ff00");
    expect(canvas.getPixel(2, 3).g).toBe(255);
    expect(snap).not.toBe(canvas.ctx.getImageData(0, 0, 16, 16).data);
  });

  it("restore restores the pixels to a snapshot state", () => {
    const canvas = new Canvas(16, 16);
    canvas.setPixel(2, 3, "#ff0000");
    canvas.setPixel(5, 7, "#0000ff");
    const snap = canvas.snapshot();
    canvas.erasePixel(2, 3);
    canvas.restore(snap);
    expect(canvas.getPixel(2, 3)).toEqual({ r: 255, g: 0, b: 0, a: 255 });
    expect(canvas.getPixel(5, 7)).toEqual({ r: 0, g: 0, b: 255, a: 255 });
  });

  it("restore also restores cells that became transparent", () => {
    const canvas = new Canvas(16, 16);
    const snapVacio = canvas.snapshot();
    canvas.setPixel(4, 4, "#ff0000");
    canvas.restore(snapVacio);
    expect(canvas.getPixel(4, 4)).toEqual({ r: 0, g: 0, b: 0, a: 0 });
  });

  it("equals detects whether the current state matches a snapshot", () => {
    const canvas = new Canvas(16, 16);
    const snap = canvas.snapshot();
    expect(canvas.equals(snap)).toBe(true);
    canvas.setPixel(0, 0, "#ff0000");
    expect(canvas.equals(snap)).toBe(false);
  });
});
