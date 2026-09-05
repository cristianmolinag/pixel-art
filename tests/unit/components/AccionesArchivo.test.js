import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/svelte";
import AccionesArchivo from "../../../src/lib/components/AccionesArchivo.svelte";
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
  galeria.visible = false;
  galeria.enfocarGuardar = false;
  galeria.dibujos = [];
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("AccionesArchivo (F05/FR-001/FR-003)", () => {
  it("ofrece las acciones Nuevo, Guardar y Galería", () => {
    const { container } = render(AccionesArchivo);
    expect(botonPorLabel(container, "Nuevo dibujo")).toBeTruthy();
    expect(botonPorLabel(container, "Guardar")).toBeTruthy();
    expect(botonPorLabel(container, "Galería")).toBeTruthy();
  });

  it("Galería abre el modal", async () => {
    const { container } = render(AccionesArchivo);
    await fireEvent.click(botonPorLabel(container, "Galería"));
    expect(galeria.visible).toBe(true);
  });

  it("Guardar abre el modal enfocando el campo de nombre", async () => {
    const { container } = render(AccionesArchivo);
    await fireEvent.click(botonPorLabel(container, "Guardar"));
    expect(galeria.visible).toBe(true);
    expect(galeria.enfocarGuardar).toBe(true);
  });

  it("Nuevo dibujo abre un modal de confirmación y, al aceptar, limpia el lienzo (US4/FR-005)", async () => {
    editor.pintarPixel(1, 1);

    const { container } = render(AccionesArchivo);
    await fireEvent.click(botonPorLabel(container, "Nuevo dibujo"));

    expect(botonPorLabel(container, "Empezar nuevo")).toBeTruthy();
    await fireEvent.click(botonPorLabel(container, "Empezar nuevo"));

    expect(editor.model.getPixel(1, 1).a).toBe(0);
    expect(botonPorLabel(container, "Empezar nuevo")).toBeUndefined();
  });

  it("Nuevo dibujo no cambia el lienzo si se cancela (US4/FR-005)", async () => {
    editor.pintarPixel(1, 1);

    const { container } = render(AccionesArchivo);
    await fireEvent.click(botonPorLabel(container, "Nuevo dibujo"));

    await fireEvent.click(botonPorLabel(container, "Cancelar"));

    expect(editor.model.getPixel(1, 1).r).toBe(255);
  });
});