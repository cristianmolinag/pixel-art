import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/svelte";
import { tick } from "svelte";
import PixelCanvas from "../../../src/lib/components/PixelCanvas.svelte";
import { editor } from "../../../src/lib/stores/editor.svelte.js";
import { Canvas } from "../../../src/lib/models/Canvas.js";
import { GRID_COLOR, GRID_ALPHA } from "../../../src/lib/canvas/draw.js";

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
  const alphas = [];
  const ctx = {
    _alpha: 1,
    get globalAlpha() {
      return this._alpha;
    },
    set globalAlpha(v) {
      this._alpha = v;
      alphas.push(v);
    },
    fillStyle: null,
    setTransform: vi.fn((...a) => operaciones.push(["setTransform", a])),
    clearRect: vi.fn((...a) => operaciones.push(["clearRect", a])),
    fillRect: vi.fn((...a) => operaciones.push(["fillRect", a])),
    drawImage: vi.fn(),
  };
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue(RECT);
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(ctx);
  return { ctx, operaciones, alphas };
}

function canvas(container) {
  return container.querySelector("canvas");
}

describe("PixelCanvas (F08 cuadrícula en canvas a resolución de dispositivo)", () => {
  it("dibuja las líneas de la cuadrícula completas en todas las fronteras", async () => {
    const { operaciones } = instalarCanvas();
    const { container } = render(PixelCanvas);
    await tick();

    const c = canvas(container);
    expect(c.width).toBe(320);
    expect(c.height).toBe(320);

    const grid = operaciones.filter(([op]) => op === "fillRect");
    // 17 verticales (borde completo) + 17 filas x 16 segmentos horizontales = 289
    expect(grid).toHaveLength(289);
    expect(grid[0]).toEqual(["fillRect", [0, 0, 1, 320]]);
    expect(grid).toEqual(
      expect.arrayContaining([
        ["fillRect", [320, 0, 1, 320]],
        ["fillRect", [1, 320, 19, 1]],
        ["fillRect", [1, 0, 19, 1]],
      ]),
    );
  });

  it("dibuja la guía con la opacidad sutil GRID_ALPHA y restaura el alfa", async () => {
    const { operaciones, alphas } = instalarCanvas();
    render(PixelCanvas);
    await tick();

    expect(alphas).toEqual(expect.arrayContaining([GRID_ALPHA, 1]));
    expect(operaciones.some(([op]) => op === "fillRect")).toBe(true);
  });

  it("no dibuja la cuadrícula cuando mostrarCuadricula es false", async () => {
    editor.mostrarCuadricula = false;
    const { operaciones } = instalarCanvas();
    render(PixelCanvas);
    await tick();

    expect(operaciones.some(([op]) => op === "fillRect")).toBe(false);
    expect(editor.mostrarCuadricula).toBe(false);
  });

  it("el fondo mantiene el color blanco base", () => {
    const { container } = render(PixelCanvas);
    expect(canvas(container).style.backgroundColor).toBe("rgb(255, 255, 255)");
  });
});

describe("PixelCanvas (F10 zoom/pan en el draw)", () => {
  it("dibuja la guía con grosor Math.round(dpr) para que sea visible en móvil", async () => {
    window.devicePixelRatio = 2;
    const { operaciones } = instalarCanvas();
    render(PixelCanvas);
    await tick();

    const grid = operaciones.filter(([op]) => op === "fillRect");
    expect(grid).toEqual(expect.arrayContaining([["fillRect", [0, 0, 2, 640]]]));
    window.devicePixelRatio = 1;
  });

  it("alinea la cuadrícula con celdas de distinto tamaño por eje (matrices no cuadradas)", async () => {
    editor.model = new Canvas(16, 32);
    const { operaciones } = instalarCanvas();
    render(PixelCanvas);
    await tick();

    const grid = operaciones.filter(([op]) => op === "fillRect");
    expect(grid[0]).toEqual(["fillRect", [0, 0, 1, 320]]);
    expect(grid).toEqual(expect.arrayContaining([["fillRect", [1, 10, 19, 1]]]));
  });

  it("vuelve a pintar un píxel dibujado después del render (versión)", async () => {
    const { operaciones } = instalarCanvas();
    const { container } = render(PixelCanvas);
    await tick();

    editor.pintarPixel(0, 0);
    await tick();

    expect(operaciones).toEqual(expect.arrayContaining([["fillRect", [0, 0, 20, 20]]]));
  });

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

  it("pintar con zoom pinta la celda correcta (la celda se mapea invirtiendo zoom)", async () => {
    editor.zoom = 2;
    instalarCanvas();
    const { container } = render(PixelCanvas);
    const c = canvas(container);
    await fireEvent.pointerDown(c, { pointerId: 1, clientX: 240, clientY: 320 });
    await fireEvent.pointerUp(c, { pointerId: 1 });
    // contenido 640, izq=(320-640)/2=-160; (240/320→12 con el mapeo viejo)
    expect(editor.model.getPixel(10, 12).a).toBeGreaterThan(0);
    expect(editor.model.getPixel(12, 12).a).toBe(0);
  });

  it("pintar con zoom + pan pinta la celda correcta (se invierte el desplazamiento)", async () => {
    editor.zoom = 2;
    editor.panX = 10;
    editor.panY = -5;
    instalarCanvas();
    const { container } = render(PixelCanvas);
    const c = canvas(container);
    // izq=(320-640)/2+10=-150, arriba=(320-640)/2-5=-165, celda 40px
    await fireEvent.pointerDown(c, { pointerId: 1, clientX: -30, clientY: -5 });
    await fireEvent.pointerUp(c, { pointerId: 1 });
    expect(editor.model.getPixel(3, 4).a).toBeGreaterThan(0);
    expect(editor.model.getPixel(0, 0).a).toBe(0);
  });

  it("muestra una ayuda breve de cómo moverse al entrar en zoom y la oculta a los 3s", async () => {
    vi.useFakeTimers();
    instalarCanvas();
    const { container } = render(PixelCanvas);
    await tick();
    expect(container.querySelector("[data-ayuda-pan]").getAttribute("aria-hidden")).toBe("true");

    editor.zoom = 2;
    await tick();
    const ayuda = container.querySelector("[data-ayuda-pan]");
    expect(ayuda.getAttribute("aria-hidden")).toBe("false");
    expect(ayuda.textContent).toContain("Mueve");

    vi.advanceTimersByTime(3001);
    await tick();
    expect(ayuda.getAttribute("aria-hidden")).toBe("true");
    vi.useRealTimers();
  });
});