import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/svelte";
import { tick } from "svelte";
import PixelCanvas from "../../../src/lib/components/PixelCanvas.svelte";
import { editor } from "../../../src/lib/stores/editor.svelte.js";
import { Canvas } from "../../../src/lib/models/Canvas.js";
import { GRID_COLOR } from "../../../src/lib/canvas/draw.js";

const RECT = {
  width: 320,
  height: 320,
  left: 0,
  top: 0,
  right: 320,
  bottom: 320,
  x: 0,
  y: 0,
  toJSON: () => ({}),
};

beforeEach(() => {
  editor.model = new Canvas(16, 16);
  editor.colorActual = "#ff0000";
  editor.version = 0;
  editor.mostrarCuadricula = true;
  editor.zoom = 1;
  editor.panX = 0;
  editor.panY = 0;
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function instalarCanvas() {
  const operaciones = [];
  const ctx = {
    fillStyle: null,
    globalAlpha: 1,
    setTransform: vi.fn((...a) => operaciones.push(["setTransform", a])),
    clearRect: vi.fn((...a) => operaciones.push(["clearRect", a])),
    fillRect: vi.fn((...a) => operaciones.push(["fillRect", a])),
    drawImage: vi.fn(),
  };
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue(RECT);
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(ctx);
  return { ctx, operaciones };
}

function canvas(container) {
  return container.querySelector("canvas");
}

describe("PixelCanvas (F08 cuadrícula en canvas a resolución de dispositivo)", () => {
  it("dibuja una línea de 1px device por frontera de celda en celdas vacías", async () => {
    const { operaciones } = instalarCanvas();
    const { container } = render(PixelCanvas);
    await tick();

    const c = canvas(container);
    expect(c.width).toBe(320);
    expect(c.height).toBe(320);

    const grid = operaciones.filter(([op]) => op === "fillRect");
    // 320px / 16 = 20px por celda (dpr 1): 17x16 verticales + 17x16 horizontales
    expect(grid).toHaveLength(544);
    expect(grid[0]).toEqual(["fillRect", [0, 0, 1, 20]]);
    expect(grid).toEqual(
      expect.arrayContaining([
        ["fillRect", [320, 0, 1, 20]],
        ["fillRect", [0, 320, 20, 1]],
      ]),
    );
  });

  it("no dibuja la cuadrícula cuando mostrarCuadricula es false", async () => {
    editor.mostrarCuadricula = false;
    const { operaciones } = instalarCanvas();
    render(PixelCanvas);
    await tick();

    expect(operaciones.some(([op]) => op === "fillRect")).toBe(false);
  });

  it("el fondo mantiene el color blanco base", () => {
    const { container } = render(PixelCanvas);
    expect(canvas(container).style.backgroundColor).toBe("rgb(255, 255, 255)");
  });
});

describe("PixelCanvas (F10 zoom/pan en el draw)", () => {
  it("renderiza a resolución de dispositivo y aplica zoom/pan en el draw", async () => {
    editor.model.setPixel(0, 0, "#ff0000");
    const { operaciones } = instalarCanvas();
    const { container } = render(PixelCanvas);
    await tick();

    expect(operaciones).toEqual(expect.arrayContaining([["fillRect", [0, 0, 20, 20]]]));

    editor.zoom = 2;
    editor.panX = 10;
    editor.panY = -5;
    await tick();

    // contenido 640, izq=(320-640)/2+10=-150, arriba=(320-640)/2-5=-165, celda 40px
    expect(operaciones).toEqual(expect.arrayContaining([["fillRect", [-150, -165, 40, 40]]]));
    expect(canvas(container).style.transform).toBe("");
  });

  it("Ctrl + arrastrar mueve la vista sin pintar (US2)", async () => {
    const { container } = render(PixelCanvas);
    const c = canvas(container);
    await fireEvent.pointerDown(c, { pointerId: 1, clientX: 10, clientY: 10, ctrlKey: true });
    await fireEvent.pointerMove(c, { pointerId: 1, clientX: 40, clientY: 30, ctrlKey: true });
    await fireEvent.pointerUp(c, { pointerId: 1, ctrlKey: true });
    await tick();
    expect(editor.panX).toBe(30);
    expect(editor.panY).toBe(20);
    const anyPintado = editor.model.snapshot().some((v, i) => v !== 0 && i % 4 === 3);
    expect(anyPintado).toBe(false);
  });

  it("pellizcar con dos dedos cambia el zoom de forma continua (US3)", async () => {
    const { container } = render(PixelCanvas);
    const c = canvas(container);
    await fireEvent.pointerDown(c, { pointerId: 1, clientX: 100, clientY: 100 });
    await fireEvent.pointerDown(c, { pointerId: 2, clientX: 200, clientY: 100 });
    await fireEvent.pointerMove(c, { pointerId: 2, clientX: 300, clientY: 100 });
    await tick();
    expect(editor.zoom).toBeCloseTo(2, 5);
    await fireEvent.pointerUp(c, { pointerId: 1 });
    await fireEvent.pointerUp(c, { pointerId: 2 });
  });
});