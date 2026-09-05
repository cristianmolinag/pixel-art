import { describe, it, expect, vi } from "vitest";
import { drawPixels, drawCanvas } from "../../../src/lib/canvas/draw.js";
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

  it("no dibuja la cuadrícula sobre el canvas (grid es fondo CSS en F08)", () => {
    const ctx = makeCtx();
    const model = new Canvas(16, 16);
    drawCanvas(ctx, model);
    expect(ctx.stroke).not.toHaveBeenCalled();
    expect(ctx.beginPath).not.toHaveBeenCalled();
  });
});
