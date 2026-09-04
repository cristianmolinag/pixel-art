import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/svelte";
import Palette from "../../../src/lib/components/Palette.svelte";
import { editor } from "../../../src/lib/stores/editor.svelte.js";

afterEach(() => {
  cleanup();
});

describe("Palette (F02)", () => {
  it("muestra swatches de la paleta fija (FR-001)", () => {
    const { container } = render(Palette);
    const swatches = container.querySelectorAll("button[aria-label^='Color ']");
    expect(swatches.length).toBeGreaterThanOrEqual(8);
  });

  it("marca visualmente el color seleccionado (FR-002)", () => {
    editor.colorActual = "#ff0000";
    const { container } = render(Palette);
    const rojo = container.querySelector("button[aria-label='Color #ff0000']");
    const clas = rojo.className;
    expect(clas).toContain("scale-110");
    expect(clas).toContain("border-white");
  });

  it("al clickear un swatch cambia el color actual (FR-002)", async () => {
    editor.colorActual = "#000000";
    const { container } = render(Palette);
    const verde = container.querySelector("button[aria-label='Color #0aff99']");
    await fireEvent.click(verde);
    expect(editor.colorActual).toBe("#0aff99");
  });
});