import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/svelte";
import PixelCanvas from "../../../src/lib/components/PixelCanvas.svelte";
import { editor } from "../../../src/lib/stores/editor.svelte.js";
import { Canvas } from "../../../src/lib/models/Canvas.js";

beforeEach(() => {
  editor.model = new Canvas(16, 16);
  editor.colorActual = "#ff0000";
  editor.herramienta = "pincel";
  editor.version = 0;
  globalThis.HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
    fillStyle: null,
    strokeStyle: null,
    lineWidth: null,
    fillRect: vi.fn(),
    drawImage: vi.fn(),
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

describe("PixelCanvas — herramientas (F03)", () => {
  it("borrador borra la celda tocada y al arrastrar (US2/FR-004)", async () => {
    const { container } = render(PixelCanvas);
    const canvas = container.querySelector("canvas");
    canvas.getBoundingClientRect = vi.fn(() => canvasRectMock());
    editor.seleccionarHerramienta("borrador");
    editor.model.setPixel(1, 1, "#ff0000");
    editor.model.setPixel(2, 1, "#ff0000");

    await fireEvent.pointerDown(canvas, { clientX: 15, clientY: 15 });
    await fireEvent.pointerMove(canvas, { clientX: 25, clientY: 15 });
    await fireEvent.pointerUp(canvas);

    expect(editor.model.getPixel(1, 1).a).toBe(0);
    expect(editor.model.getPixel(2, 1).a).toBe(0);
  });

  it("línea no contamina el store mientras arrastra y se pinta al soltar (US3/FR-005/FR-006)", async () => {
    const { container } = render(PixelCanvas);
    const canvas = container.querySelector("canvas");
    canvas.getBoundingClientRect = vi.fn(() => canvasRectMock());
    editor.seleccionarHerramienta("linea");

    await fireEvent.pointerDown(canvas, { clientX: 5, clientY: 5 });
    await fireEvent.pointerMove(canvas, { clientX: 85, clientY: 5 });

    expect(editor.model.getPixel(4, 0).a).toBe(0);

    await fireEvent.pointerUp(canvas);

    expect(editor.model.getPixel(0, 0).r).toBe(255);
    expect(editor.model.getPixel(4, 0).r).toBe(255);
    expect(editor.model.getPixel(8, 0).r).toBe(255);
  });

  it("línea de un punto (tap) pinta solo esa celda (US3)", async () => {
    const { container } = render(PixelCanvas);
    const canvas = container.querySelector("canvas");
    canvas.getBoundingClientRect = vi.fn(() => canvasRectMock());
    editor.seleccionarHerramienta("linea");

    await fireEvent.pointerDown(canvas, { clientX: 15, clientY: 15 });
    await fireEvent.pointerUp(canvas);

    expect(editor.model.getPixel(1, 1).r).toBe(255);
    expect(editor.model.getPixel(2, 1).a).toBe(0);
  });

  it("relleno pinta la región conectada del mismo color (US4/FR-007)", async () => {
    const { container } = render(PixelCanvas);
    const canvas = container.querySelector("canvas");
    canvas.getBoundingClientRect = vi.fn(() => canvasRectMock());
    editor.seleccionarHerramienta("relleno");
    editor.colorActual = "#0000ff";
    editor.model.setPixel(4, 1, "#00ff00");

    await fireEvent.pointerDown(canvas, { clientX: 5, clientY: 5 });
    await fireEvent.pointerUp(canvas);

    expect(editor.model.getPixel(0, 0).b).toBe(255);
    expect(editor.model.getPixel(3, 1).b).toBe(255);
    expect(editor.model.getPixel(4, 1).g).toBe(255);
  });
});