import { describe, it, expect } from "vitest";
import { editor, PALETA } from "../../../src/lib/stores/editor.svelte.js";

describe("editor store (F02/FR-008)", () => {
  it("expone una paleta fija de colores (FR-001/FR-007)", () => {
    expect(Array.isArray(PALETA)).toBe(true);
    expect(PALETA.length).toBeGreaterThanOrEqual(8);
  });

  it("pintarPixel pinta con el color actual (FR-003)", () => {
    editor.colorActual = "#123456";
    editor.pintarPixel(4, 4);
    expect(editor.model.getPixel(4, 4)).toEqual({ r: 18, g: 52, b: 86, a: 255 });
  });

  it("pintarPixel incrementa version para redibujar", () => {
    const before = editor.version;
    editor.pintarPixel(5, 5);
    expect(editor.version).toBe(before + 1);
  });

  it("cambiar colorActual lo deja listo para pintar", () => {
    editor.colorActual = "#00ff00";
    editor.pintarPixel(7, 7);
    expect(editor.model.getPixel(7, 7).g).toBe(255);
  });
});