import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/svelte";
import PixelCanvas from "../../../src/lib/components/PixelCanvas.svelte";
import { editor } from "../../../src/lib/stores/editor.svelte.js";
import { Canvas } from "../../../src/lib/models/Canvas.js";

beforeEach(() => {
  editor.model = new Canvas(16, 16);
  editor.colorActual = "#ff0000";
  editor.version = 0;
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

function canvasRectMock() {
  return {
    left: 0,
    top: 0,
    right: 160,
    bottom: 160,
    width: 160,
    height: 160,
  };
}

describe("PixelCanvas", () => {
  it("renderiza un <canvas> de 16x16 (US1/FR-001)", () => {
    const { container } = render(PixelCanvas);
    const canvas = container.querySelector("canvas");
    expect(canvas).not.toBeNull();
    expect(canvas.width).toBe(16);
    expect(canvas.height).toBe(16);
  });

  it("pinta un píxel al tocar una celda (US2/FR-003)", async () => {
    const { container } = render(PixelCanvas);
    const canvas = container.querySelector("canvas");
    canvas.getBoundingClientRect = vi.fn(() => canvasRectMock());

    // tocar en (15,15) px del rect 160x160 -> celda (1,1)
    await fireEvent.pointerDown(canvas, { clientX: 15, clientY: 15 });

    const px = editor.model.getPixel(1, 1);
    expect(px.r).toBe(255);
    expect(px.g).toBe(0);
    expect(px.b).toBe(0);
    expect(px.a).toBe(255);
  });

  it("pinta varias celdas al arrastrar (US3/FR-006)", async () => {
    const { container } = render(PixelCanvas);
    const canvas = container.querySelector("canvas");
    canvas.getBoundingClientRect = vi.fn(() => canvasRectMock());

    await fireEvent.pointerDown(canvas, { clientX: 5, clientY: 5 });
    await fireEvent.pointerMove(canvas, { clientX: 15, clientY: 5 });
    await fireEvent.pointerMove(canvas, { clientX: 25, clientY: 5 });

    // celdas (0,0), (1,0), (2,0) pintadas
    expect(editor.model.getPixel(0, 0).r).toBe(255);
    expect(editor.model.getPixel(1, 0).r).toBe(255);
    expect(editor.model.getPixel(2, 0).r).toBe(255);
  });

  it("deja de pintar al soltar el puntero (US3/FR-006)", async () => {
    const { container } = render(PixelCanvas);
    const canvas = container.querySelector("canvas");
    canvas.getBoundingClientRect = vi.fn(() => canvasRectMock());

    await fireEvent.pointerDown(canvas, { clientX: 5, clientY: 5 });
    await fireEvent.pointerUp(canvas);
    await fireEvent.pointerMove(canvas, { clientX: 25, clientY: 5 });

    expect(editor.model.getPixel(0, 0).r).toBe(255);
    expect(editor.model.getPixel(2, 0).r).not.toBe(255);
  });
});