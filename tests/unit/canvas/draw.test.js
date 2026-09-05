import { describe, it, expect, vi } from "vitest";
import { drawPixels, drawCanvas, GRID_COLOR, GRID_ALPHA } from "../../../src/lib/canvas/draw.js";
import { Canvas } from "../../../src/lib/models/Canvas.js";

function makeCtx() {
  return {
    fillStyle: null,
    strokeStyle: null,
    lineWidth: null,
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    drawImage: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
  };
}

describe("drawPixels", () => {
  it("vuelca el OffscreenCanvas del modelo al contexto (un solo blit)", () => {
    const ctx = makeCtx();
    const model = new Canvas(2, 2);
    model.setPixel(0, 0, "#ff0000");
    drawPixels(ctx, model);
    expect(ctx.drawImage).toHaveBeenCalledWith(model.offscreen, 0, 0);
  });
});

describe("drawCanvas", () => {
  it("limpia el lienzo y vuelca los píxeles en orden", () => {
    const ctx = makeCtx();
    const model = new Canvas(2, 2);
    model.setPixel(0, 0, "#ff0000");
    drawCanvas(ctx, model);

    expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 2, 2);
    const clear = ctx.clearRect.mock.invocationCallOrder[0];
    const blit = ctx.drawImage.mock.invocationCallOrder[0];
    expect(clear).toBeLessThan(blit);
  });

  it("no traza líneas (la cuadrícula vive en el overlay de PixelCanvas)", () => {
    const ctx = makeCtx();
    const model = new Canvas(16, 16);
    drawCanvas(ctx, model);
    expect(ctx.fillRect).not.toHaveBeenCalled();
    expect(ctx.stroke).not.toHaveBeenCalled();
    expect(ctx.beginPath).not.toHaveBeenCalled();
  });

  it("exporta el color y la opacidad de cuadrícula compartidos con el overlay", () => {
    expect(GRID_COLOR).toBe("#cccccc");
    expect(GRID_ALPHA).toBe(0.5);
  });
});