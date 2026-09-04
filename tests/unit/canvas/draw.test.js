import { describe, it, expect, vi } from "vitest";
import {
  drawBackground,
  drawGrid,
  drawPixels,
  drawCanvas,
} from "../../../src/lib/canvas/draw.js";
import { Canvas } from "../../../src/lib/models/Canvas.js";

function makeCtx() {
  return {
    fillStyle: null,
    strokeStyle: null,
    lineWidth: null,
    fillRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
  };
}

describe("drawBackground", () => {
  it("pinta un rectángulo del tamaño del grid con el color de fondo", () => {
    const ctx = makeCtx();
    drawBackground(ctx, 16, 16, "#ffffff");
    expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, 16, 16);
    expect(ctx.fillStyle).toBe("#ffffff");
  });
});

describe("drawGrid (FR-002)", () => {
  it("dibuja líneas verticales y horizontales para delimitar las celdas", () => {
    const ctx = makeCtx();
    drawGrid(ctx, 16, 16);
    expect(ctx.moveTo).toHaveBeenCalledTimes(32);
    expect(ctx.lineTo).toHaveBeenCalledTimes(32);
    expect(ctx.stroke).toHaveBeenCalled();
  });
});

describe("drawPixels", () => {
  it("pinta cada píxel con contenido del modelo", () => {
    const ctx = makeCtx();
    const model = new Canvas(2, 2);
    model.ctx.getImageData.mockReturnValue({
      data: new Uint8ClampedArray([255, 0, 0, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
    });
    drawPixels(ctx, model);
    expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, 1, 1);
  });
});

describe("drawCanvas", () => {
  it("pinta fondo, píxeles y cuadrícula en orden", () => {
    const ctx = makeCtx();
    const model = new Canvas(16, 16);
    drawCanvas(ctx, model);
    expect(ctx.fillRect).toHaveBeenCalled();
    expect(ctx.stroke).toHaveBeenCalled();
  });
});
