import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/svelte";
import Toolbar from "../../../src/lib/components/Toolbar.svelte";
import { editor } from "../../../src/lib/stores/editor.svelte.js";
import { galeria } from "../../../src/lib/stores/galeria.svelte.js";
import { Canvas } from "../../../src/lib/models/Canvas.js";

function botonPorLabel(container, label) {
  return Array.from(container.querySelectorAll("button")).find(
    (b) => b.getAttribute("aria-label") === label
  );
}

beforeEach(() => {
  editor.herramienta = "pincel";
  editor.colorActual = "#ff0000";
  editor.model = new Canvas(16, 16);
  editor.undoStack = [];
  editor.redoStack = [];
  editor.mostrarCuadricula = true;
  galeria.visible = false;
  galeria.enfocarGuardar = false;
  galeria.dibujos = [];
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("Toolbar (F03)", () => {
  it("ofrece Pincel, Borrador, Línea y Relleno con iconos (FR-001)", () => {
    const { container } = render(Toolbar);
    const botones = Array.from(container.querySelectorAll("button")).map((b) =>
      b.getAttribute("aria-label")
    );
    expect(botones).toEqual([
      "Pincel",
      "Borrador",
      "Línea",
      "Relleno",
      "Ocultar cuadrícula",
      "Cambiar matriz del lienzo",
      "Alejar (zoom)",
      "Acercar (zoom)",
      "Restablecer zoom al 100%",
      "Deshacer",
      "Rehacer",
    ]);
    expect(container.querySelectorAll("svg").length).toBeGreaterThanOrEqual(11);
  });

  it("seleccionar una herramienta la activa y queda marcada (US1/FR-002)", async () => {
    const { container } = render(Toolbar);
    const botonRelleno = botonPorLabel(container, "Relleno");
    await fireEvent.click(botonRelleno);
    expect(editor.herramienta).toBe("relleno");
    expect(botonRelleno.getAttribute("aria-pressed")).toBe("true");
  });
});

describe("Toolbar — undo/redo (F04/FR-001)", () => {
  it("ofrece botones Deshacer y Rehacer, deshabilitados sin historial (FR-005)", () => {
    const { container } = render(Toolbar);
    expect(botonPorLabel(container, "Deshacer").disabled).toBe(true);
    expect(botonPorLabel(container, "Rehacer").disabled).toBe(true);
  });

  it("se habilitan solo cuando hay historial correspondiente", () => {
    editor.abrirAccion();
    editor.pintarPixel(1, 1);
    editor.cerrarAccion();
    const { container } = render(Toolbar);
    expect(botonPorLabel(container, "Deshacer").disabled).toBe(false);
    expect(botonPorLabel(container, "Rehacer").disabled).toBe(true);
  });

  it("click en Deshacer revierte la última acción (US1/FR-002)", async () => {
    editor.abrirAccion();
    editor.pintarPixel(3, 3);
    editor.cerrarAccion();
    const { container } = render(Toolbar);
    await fireEvent.click(botonPorLabel(container, "Deshacer"));
    expect(editor.model.getPixel(3, 3).a).toBe(0);
    expect(editor.canUndo).toBe(false);
    expect(editor.canRedo).toBe(true);
  });

  it("click en Rehacer restaura la acción deshecha (US2/FR-003)", async () => {
    editor.abrirAccion();
    editor.pintarPixel(3, 3);
    editor.cerrarAccion();
    editor.deshacer();
    const { container } = render(Toolbar);
    expect(botonPorLabel(container, "Rehacer").disabled).toBe(false);
    await fireEvent.click(botonPorLabel(container, "Rehacer"));
    expect(editor.model.getPixel(3, 3).r).toBe(255);
    expect(editor.canRedo).toBe(false);
  });
});

describe("Toolbar — toggle de cuadrícula (F08)", () => {
  it("muestra el toggle marcado por defecto (cuadrícula visible)", () => {
    const { container } = render(Toolbar);
    const boton = botonPorLabel(container, "Ocultar cuadrícula");
    expect(boton).toBeTruthy();
    expect(boton.getAttribute("aria-pressed")).toBe("true");
  });

  it("alterna el estado y cambia el aria-label al ocultar (US1)", async () => {
    const { container } = render(Toolbar);
    await fireEvent.click(botonPorLabel(container, "Ocultar cuadrícula"));
    expect(editor.mostrarCuadricula).toBe(false);
    expect(botonPorLabel(container, "Mostrar cuadrícula").getAttribute("aria-pressed")).toBe("false");
    expect(botonPorLabel(container, "Ocultar cuadrícula")).toBeUndefined();
  });

  it("volver a pulsar muestra de nuevo la cuadrícula", async () => {
    editor.mostrarCuadricula = false;
    const { container } = render(Toolbar);
    await fireEvent.click(botonPorLabel(container, "Mostrar cuadrícula"));
    expect(editor.mostrarCuadricula).toBe(true);
  });
});

describe("Toolbar — zoom (F10)", () => {
  beforeEach(() => {
    editor.zoom = 1;
  });

  it("el indicador muestra 100% por defecto", () => {
    const { container } = render(Toolbar);
    expect(container.textContent).toContain("100%");
  });

  it("+ acerca el zoom y − lo aleja en pasos de 0.5 (US1)", async () => {
    const { container } = render(Toolbar);
    await fireEvent.click(botonPorLabel(container, "Acercar (zoom)"));
    expect(editor.zoom).toBe(1.5);
    await fireEvent.click(botonPorLabel(container, "Alejar (zoom)"));
    expect(editor.zoom).toBe(1);
  });

  it("100% restablece el zoom al tamaño base (US1)", async () => {
    const { container } = render(Toolbar);
    editor.acercar();
    editor.acercar();
    expect(editor.zoom).toBe(2);
    await fireEvent.click(botonPorLabel(container, "Restablecer zoom al 100%"));
    expect(editor.zoom).toBe(1);
  });
});