import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/svelte";
import Toolbar from "../../../src/lib/components/Toolbar.svelte";
import { editor } from "../../../src/lib/stores/editor.svelte.js";
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
});

afterEach(() => {
  cleanup();
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
      "Deshacer",
      "Rehacer",
    ]);
    expect(container.querySelectorAll("svg").length).toBeGreaterThanOrEqual(6);
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