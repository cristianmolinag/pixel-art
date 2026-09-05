import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/svelte";
import { tick } from "svelte";
import PixelCanvas from "../../../src/lib/components/PixelCanvas.svelte";
import { editor } from "../../../src/lib/stores/editor.svelte.js";
import { Canvas } from "../../../src/lib/models/Canvas.js";

beforeEach(() => {
  editor.model = new Canvas(16, 16);
  editor.colorActual = "#ff0000";
  editor.version = 0;
  editor.mostrarCuadricula = true;
  editor.zoom = 1;
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function canvas(container) {
  return container.querySelector("canvas");
}

describe("PixelCanvas (F08 cuadrícula como fondo CSS)", () => {
  it("muestra la cuadrícula como fondo del canvas cuando mostrarCuadricula es true", () => {
    const { container } = render(PixelCanvas);
    expect(canvas(container).style.backgroundImage).toContain("linear-gradient");
    expect(canvas(container).style.backgroundImage).not.toBe("none");
  });

  it("oculta la cuadrícula del fondo cuando mostrarCuadricula es false", () => {
    editor.mostrarCuadricula = false;
    const { container } = render(PixelCanvas);
    expect(canvas(container).style.backgroundImage).toBe("none");
  });

  it("el fondo mantiene el color blanco base", () => {
    const { container } = render(PixelCanvas);
    expect(canvas(container).style.backgroundColor).toBe("rgb(255, 255, 255)");
  });

  it("el tamaño de la cuadrícula es proporcional a la matriz (16x16 -> 6.25%)", () => {
    const { container } = render(PixelCanvas);
    expect(canvas(container).style.backgroundSize).toBe("6.25% 6.25%");
  });
});

describe("PixelCanvas (F10 zoom)", () => {
  beforeEach(() => {
    editor.zoom = 1;
    editor.panX = 0;
    editor.panY = 0;
  });

  it("aplica el zoom y el pan por CSS sin alterar la resolución del canvas", async () => {
    const { container } = render(PixelCanvas);
    const c = canvas(container);
    expect(c.width).toBe(16);
    expect(c.height).toBe(16);
    editor.zoom = 2;
    editor.panX = 10;
    editor.panY = -5;
    await tick();
    expect(c.style.transform).toBe("translate(10px, -5px) scale(2)");
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