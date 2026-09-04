import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/svelte";
import PixelCanvas from "../../../src/lib/components/PixelCanvas.svelte";
import { Canvas } from "../../../src/lib/models/Canvas.js";

beforeEach(() => {
  globalThis.HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
    fillStyle: null,
    strokeStyle: null,
    lineWidth: null,
    fillRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
  }));
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("PixelCanvas", () => {
  it("renderiza un <canvas> de 16x16 (US1/FR-001)", () => {
    const { container } = render(PixelCanvas, {
      props: { model: new Canvas(16, 16) },
    });

    const canvas = container.querySelector("canvas");
    expect(canvas).not.toBeNull();
    expect(canvas.width).toBe(16);
    expect(canvas.height).toBe(16);
  });
});
