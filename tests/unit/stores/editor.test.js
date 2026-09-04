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

describe("editor store (F04/FR-007)", () => {
  beforeEach(() => {
    editor.model = new Canvas(16, 16);
    editor.colorActual = "#ff0000";
    editor.version = 0;
    editor.undoStack = [];
    editor.redoStack = [];
  });

  it("un gesto con cambios crea un paso de undo al cerrar (FR-002/FR-004)", () => {
    editor.abrirAccion();
    editor.pintarPixel(2, 2);
    editor.pintarPixel(3, 2);
    editor.cerrarAccion();
    expect(editor.undoStack.length).toBe(1);
    expect(editor.canUndo).toBe(true);
  });

  it("un gesto sin cambios no crea pasos vacíos (US3/FR-002)", () => {
    editor.abrirAccion();
    editor.pintarPixel(2, 2);
    editor.cerrarAccion();
    editor.abrirAccion();
    editor.pintarPixel(2, 2);
    editor.cerrarAccion();
    expect(editor.undoStack.length).toBe(1);
  });

  it("un gesto fuera de rango no crea paso de undo", () => {
    editor.abrirAccion();
    editor.pintarPixel(16, 16);
    editor.cerrarAccion();
    expect(editor.undoStack.length).toBe(0);
  });

  it("deshacer revierte la última acción y permite rehacer (FR-002/FR-003)", () => {
    editor.abrirAccion();
    editor.pintarPixel(2, 2);
    editor.cerrarAccion();
    editor.deshacer();
    expect(editor.model.getPixel(2, 2).a).toBe(0);
    expect(editor.redoStack.length).toBe(1);
    expect(editor.canRedo).toBe(true);
    editor.rehacer();
    expect(editor.model.getPixel(2, 2).r).toBe(255);
    expect(editor.canRedo).toBe(false);
  });

  it("deshacer y rehacer incrementan version para redibujar", () => {
    editor.abrirAccion();
    editor.pintarPixel(2, 2);
    editor.cerrarAccion();
    const beforeUndo = editor.version;
    editor.deshacer();
    expect(editor.version).toBe(beforeUndo + 1);
    editor.rehacer();
    expect(editor.version).toBe(beforeUndo + 2);
  });

  it("la pila de undo conserva el orden de las acciones", () => {
    editor.abrirAccion();
    editor.pintarPixel(1, 1);
    editor.cerrarAccion();
    editor.abrirAccion();
    editor.pintarPixel(2, 2);
    editor.cerrarAccion();
    editor.deshacer();
    expect(editor.model.getPixel(2, 2).a).toBe(0);
    expect(editor.model.getPixel(1, 1).r).toBe(255);
    editor.deshacer();
    expect(editor.model.getPixel(1, 1).a).toBe(0);
  });

  it("una acción nueva tras deshacer limpia la pila de rehacer (FR-006)", () => {
    editor.abrirAccion();
    editor.pintarPixel(2, 2);
    editor.cerrarAccion();
    editor.deshacer();
    expect(editor.canRedo).toBe(true);
    editor.abrirAccion();
    editor.pintarPixel(5, 5);
    editor.cerrarAccion();
    expect(editor.redoStack.length).toBe(0);
    expect(editor.canRedo).toBe(false);
  });

  it("deshacer sin historial y rehacer sin historial no hacen nada (FR-005)", () => {
    expect(editor.canUndo).toBe(false);
    expect(editor.canRedo).toBe(false);
    const before = editor.version;
    editor.deshacer();
    editor.rehacer();
    expect(editor.version).toBe(before);
  });
});