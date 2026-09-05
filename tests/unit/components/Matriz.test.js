import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/svelte";
import Matriz from "../../../src/lib/components/Matriz.svelte";
import { editor } from "../../../src/lib/stores/editor.svelte.js";
import { Canvas } from "../../../src/lib/models/Canvas.js";

beforeEach(() => {
  editor.model = new Canvas(16, 16);
  editor.version = 0;
  editor.undoStack = [];
  editor.redoStack = [];
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function botonPorLabel(container, label) {
  return Array.from(container.querySelectorAll("button")).find(
    (b) => b.getAttribute("aria-label") === label
  );
}

function abrirPopover(container) {
  return fireEvent.click(botonPorLabel(container, "Cambiar matriz del lienzo"));
}

describe("Matriz (F09)", () => {
  it("abre un popover con los presets 16 a 64 y la opción custom", async () => {
    const { container } = render(Matriz);
    expect(botonPorLabel(container, "Matriz 32×32")).toBeUndefined();
    await abrirPopover(container);
    expect(botonPorLabel(container, "Matriz 16×16")).toBeTruthy();
    expect(botonPorLabel(container, "Matriz 32×32")).toBeTruthy();
    expect(botonPorLabel(container, "Matriz 48×48")).toBeTruthy();
    expect(botonPorLabel(container, "Matriz 64×64")).toBeTruthy();
    expect(botonPorLabel(container, "Aplicar tamaño personalizado")).toBeTruthy();
  });

  it("elegir un preset muestra el modal de confirmación y al aceptar limpia y cambia (FR-001/US1)", async () => {
    editor.pintarPixel(1, 1);
    const { container } = render(Matriz);
    await abrirPopover(container);
    await fireEvent.click(botonPorLabel(container, "Matriz 32×32"));

    expect(editor.model.cols).toBe(16);
    expect(container.textContent).toContain("¿Cambiar la matriz a 32×32? El lienzo actual se limpiará.");

    await fireEvent.click(botonPorLabel(container, "Aplicar y limpiar"));

    expect(editor.model.cols).toBe(32);
    expect(editor.model.rows).toBe(32);
    expect(editor.model.getPixel(1, 1).a).toBe(0);
    expect(botonPorLabel(container, "Matriz 32×32")).toBeUndefined();
    expect(botonPorLabel(container, "Aplicar y limpiar")).toBeUndefined();
  });

  it("no cambia la matriz si se cancela la confirmación (US1)", async () => {
    const { container } = render(Matriz);
    await abrirPopover(container);
    await fireEvent.click(botonPorLabel(container, "Matriz 32×32"));
    await fireEvent.click(botonPorLabel(container, "Cancelar"));

    expect(editor.model.cols).toBe(16);
    expect(botonPorLabel(container, "Aplicar y limpiar")).toBeUndefined();
    expect(botonPorLabel(container, "Aplicar tamaño personalizado")).toBeTruthy();
  });

  it("aplica un tamaño personalizado válido tras confirmar (US2)", async () => {
    const { container } = render(Matriz);
    await abrirPopover(container);
    const ancho = container.querySelector("input[aria-label='Ancho de la matriz']");
    const alto = container.querySelector("input[aria-label='Alto de la matriz']");
    await fireEvent.input(ancho, { target: { value: "20" } });
    await fireEvent.input(alto, { target: { value: "12" } });
    await fireEvent.click(botonPorLabel(container, "Aplicar tamaño personalizado"));

    expect(container.textContent).toContain("¿Cambiar la matriz a 20×12? El lienzo actual se limpiará.");

    await fireEvent.click(botonPorLabel(container, "Aplicar y limpiar"));

    expect(editor.model.cols).toBe(20);
    expect(editor.model.rows).toBe(12);
  });

  it("muestra error y no confirma un tamaño inválido (US2)", async () => {
    const { container } = render(Matriz);
    await abrirPopover(container);
    const ancho = container.querySelector("input[aria-label='Ancho de la matriz']");
    const alto = container.querySelector("input[aria-label='Alto de la matriz']");
    await fireEvent.input(ancho, { target: { value: "500" } });
    await fireEvent.input(alto, { target: { value: "10" } });
    await fireEvent.click(botonPorLabel(container, "Aplicar tamaño personalizado"));

    expect(editor.model.cols).toBe(16);
    expect(container.textContent).toContain("Usa entre 4 y 128");
    expect(botonPorLabel(container, "Aplicar y limpiar")).toBeUndefined();
  });

  it("Escape cierra la confirmación antes que el modal", async () => {
    const { container } = render(Matriz);
    await abrirPopover(container);
    await fireEvent.click(botonPorLabel(container, "Matriz 32×32"));
    await fireEvent.keyDown(window, { key: "Escape" });
    expect(botonPorLabel(container, "Aplicar y limpiar")).toBeUndefined();
    expect(botonPorLabel(container, "Matriz 32×32")).toBeTruthy();
  });

  it("Escape cierra el popover", async () => {
    const { container } = render(Matriz);
    await abrirPopover(container);
    await fireEvent.keyDown(window, { key: "Escape" });
    expect(botonPorLabel(container, "Matriz 32×32")).toBeUndefined();
  });
});