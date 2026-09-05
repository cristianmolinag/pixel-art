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
  it("blits the model OffscreenCanvas to the context (single blit)", () => {
    const ctx = makeCtx();
    const model = new Canvas(2, 2);
    model.setPixel(0, 0, "#ff0000");
    drawPixels(ctx, model);
    expect(ctx.drawImage).toHaveBeenCalledWith(model.offscreen, 0, 0);
  });
});

describe("drawCanvas", () => {
  it("clears the canvas and writes the pixels in order", () => {
    const ctx = makeCtx();
    const model = new Canvas(2, 2);
    model.setPixel(0, 0, "#ff0000");
    drawCanvas(ctx, model);

    expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 2, 2);
    const clear = ctx.clearRect.mock.invocationCallOrder[0];
    const blit = ctx.drawImage.mock.invocationCallOrder[0];
    expect(clear).toBeLessThan(blit);
  });

  it("does not draw grid lines (the grid lives in the PixelCanvas overlay)", () => {
    const ctx = makeCtx();
    const model = new Canvas(16, 16);
    drawCanvas(ctx, model);
    expect(ctx.fillRect).not.toHaveBeenCalled();
    expect(ctx.stroke).not.toHaveBeenCalled();
    expect(ctx.beginPath).not.toHaveBeenCalled();
  });

  it("exports the grid color and opacity shared with the overlay", () => {
    expect(GRID_COLOR).toBe("#cccccc");
    expect(GRID_ALPHA).toBe(0.5);
  });
});