import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/svelte";
import PixelCanvas from "../../../src/lib/components/PixelCanvas.svelte";
import { editor } from "../../../src/lib/stores/editor.svelte.js";
import { Canvas } from "../../../src/lib/models/Canvas.js";

beforeEach(() => {
  editor.model = new Canvas(16, 16);
  editor.colorActual = "#ff0000";
  editor.version = 0;
  editor.mostrarCuadricula = true;
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