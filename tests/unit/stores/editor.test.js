import { describe, it, expect, beforeEach } from "vitest";
import { editor, PALETA } from "../../../src/lib/stores/editor.svelte.js";
import { Canvas } from "../../../src/lib/models/Canvas.js";

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

describe("editor store (F03/FR-008)", () => {
  beforeEach(() => {
    editor.model = new Canvas(16, 16);
    editor.colorActual = "#ff0000";
    editor.version = 0;
  });

  it("empieza con la herramienta pincel por defecto", () => {
    expect(editor.herramienta).toBe("pincel");
  });

  it("seleccionarHerramienta cambia la herramienta activa", () => {
    editor.seleccionarHerramienta("borrador");
    expect(editor.herramienta).toBe("borrador");
    editor.seleccionarHerramienta("linea");
    expect(editor.herramienta).toBe("linea");
  });

  it("borrarPixel limpia la celda e incrementa version", () => {
    editor.pintarPixel(4, 4);
    const before = editor.version;
    editor.borrarPixel(4, 4);
    expect(editor.model.getPixel(4, 4).a).toBe(0);
    expect(editor.version).toBe(before + 1);
  });

  it("borrarPixel fuera de rango no incrementa version", () => {
    const before = editor.version;
    editor.borrarPixel(16, 16);
    expect(editor.version).toBe(before);
  });

  it("dibujarLinea pinta una recta entre dos puntos", () => {
    editor.colorActual = "#0000ff";
    editor.dibujarLinea(1, 1, 5, 1);
    for (let x = 1; x <= 5; x++) {
      expect(editor.model.getPixel(x, 1).b).toBe(255);
    }
  });

  it("dibujarLinea incrementa version", () => {
    const before = editor.version;
    editor.dibujarLinea(1, 1, 5, 1);
    expect(editor.version).toBe(before + 1);
  });

  it("rellenar pinta la región conectada", () => {
    editor.model.setPixel(3, 0, "#00ff00");
    editor.rellenar(0, 0);
    for (let x = 0; x < 3; x++) {
      expect(editor.model.getPixel(x, 0).r).toBe(255);
    }
    expect(editor.model.getPixel(3, 0).g).toBe(255);
  });

  it("rellenar no incrementa version si no hay cambio", () => {
    editor.model.setPixel(0, 0, "#ff0000");
    const before = editor.version;
    editor.rellenar(0, 0);
    expect(editor.version).toBe(before);
  });
});