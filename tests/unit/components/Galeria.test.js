import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, fireEvent, waitFor } from "@testing-library/svelte";
import Galeria from "../../../src/lib/components/Galeria.svelte";
import { galeria } from "../../../src/lib/stores/galeria.svelte.js";
import { editor } from "../../../src/lib/stores/editor.svelte.js";
import { Canvas } from "../../../src/lib/models/Canvas.js";
import { reiniciarGaleriaDB } from "../../helpers.js";

function botonPorLabel(container, label) {
  return Array.from(container.querySelectorAll("button")).find(
    (b) => b.getAttribute("aria-label") === label
  );
}

function botonPorTexto(container, texto) {
  return Array.from(container.querySelectorAll("button")).find(
    (b) => b.textContent.trim() === texto
  );
}

const dibujoEjemplo = {
  id: 1,
  nombre: "Gatito",
  cols: 16,
  rows: 16,
  pixeles: new Array(16 * 16 * 4).fill(0),
  thumbnail: "data:image/png;base64,AAAA",
  createdAt: 1700000000000,
  updatedAt: 1700000000000,
};

beforeEach(async () => {
  await reiniciarGaleriaDB();
  editor.model = new Canvas(16, 16);
  editor.colorActual = "#ff0000";
  editor.version = 0;
  editor.undoStack = [];
  editor.redoStack = [];
  galeria.visible = false;
  galeria.enfocarGuardar = false;
  galeria.dibujos = [];
  galeria.error = "";
  galeria.guardando = false;
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("Galeria (F05/FR-003)", () => {
  it("no renderiza el modal cuando está cerrado", () => {
    const { container } = render(Galeria);
    expect(container.querySelector('[role="dialog"]')).toBeNull();
  });

  it("muestra el estado vacío cuando no hay dibujos (US2)", () => {
    galeria.visible = true;
    const { container } = render(Galeria);
    expect(container.querySelector('[role="dialog"]')).not.toBeNull();
    expect(container.textContent).toContain("Aún no has guardado dibujos.");
  });

  it("lista los dibujos con tarjeta de cargar, eliminar y nombre (US2/FR-003)", () => {
    galeria.visible = true;
    galeria.dibujos = [dibujoEjemplo];
    const { container } = render(Galeria);
    expect(botonPorLabel(container, "Cargar Gatito")).not.toBeNull();
    expect(botonPorLabel(container, "Eliminar Gatito")).not.toBeNull();
    expect(container.textContent).toContain("Gatito");
  });

  it("muestra el thumbnail del dibujo cuando existe", () => {
    galeria.visible = true;
    galeria.dibujos = [dibujoEjemplo];
    const { container } = render(Galeria);
    const img = container.querySelector("img");
    expect(img).not.toBeNull();
    expect(img.src).toBe(dibujoEjemplo.thumbnail);
  });

  it("guardando con nombre crea el dibujo y lo agrega a la lista (US1/FR-002)", async () => {
    galeria.visible = true;
    const { container } = render(Galeria);
    const input = container.querySelector("input");
    await fireEvent.input(input, { target: { value: "Mi dibujo" } });
    await fireEvent.click(botonPorTexto(container, "Guardar"));

    await waitFor(() => expect(galeria.dibujos).toHaveLength(1));
    expect(galeria.dibujos[0].nombre).toBe("Mi dibujo");
    expect(galeria.error).toBe("");
  });

  it("indica que el nombre es obligatorio si se intenta guardar vacío (FR-007)", async () => {
    galeria.visible = true;
    const { container } = render(Galeria);
    const input = container.querySelector("input");
    await fireEvent.input(input, { target: { value: "" } });
    await fireEvent.click(botonPorTexto(container, "Guardar"));

    await waitFor(() => expect(galeria.error).toBe("El nombre es obligatorio."));
    expect(container.textContent).toContain("El nombre es obligatorio.");
  });

  it("cargar desde una tarjeta restaura el dibujo en el editor y cierra el modal (US3/FR-004)", async () => {
    editor.model.setPixel(7, 7, "#00ff00");
    await galeria.guardar("Gatito");
    galeria.visible = true;
    galeria.dibujos = [dibujoEjemplo];

    const { container } = render(Galeria);
    await fireEvent.click(botonPorLabel(container, "Cargar Gatito"));

    expect(editor.model.cols).toBe(16);
    expect(editor.model.rows).toBe(16);
    expect(galeria.visible).toBe(false);
  });

  it("eliminar con confirmación quita el dibujo de la lista (US5/FR-006)", async () => {
    galeria.visible = true;
    galeria.dibujos = [dibujoEjemplo];

    const { container } = render(Galeria);
    await fireEvent.click(botonPorLabel(container, "Eliminar Gatito"));
    expect(botonPorLabel(container, "Confirmar eliminación")).not.toBeNull();
    await fireEvent.click(botonPorLabel(container, "Confirmar eliminación"));

    await waitFor(() => expect(galeria.dibujos).toHaveLength(0));
    expect(galeria.visible).toBe(true);
  });

  it("cancelar la eliminación conserva el dibujo y cierra el modal (US5)", async () => {
    galeria.visible = true;
    galeria.dibujos = [dibujoEjemplo];

    const { container } = render(Galeria);
    await fireEvent.click(botonPorLabel(container, "Eliminar Gatito"));
    expect(container.textContent).toContain('¿Eliminar "Gatito"');
    await fireEvent.click(botonPorLabel(container, "Cancelar"));

    expect(galeria.dibujos).toHaveLength(1);
    expect(botonPorLabel(container, "Confirmar eliminación")).toBeUndefined();
  });

  it("el botón cerrar oculta el modal (US2)", async () => {
    galeria.visible = true;
    galeria.dibujos = [dibujoEjemplo];
    const { container } = render(Galeria);
    await fireEvent.click(botonPorLabel(container, "Cerrar galería"));
    expect(galeria.visible).toBe(false);
  });
});