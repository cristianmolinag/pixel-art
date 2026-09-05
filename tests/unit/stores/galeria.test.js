import { describe, it, expect, beforeEach } from "vitest";
import { galeria } from "../../../src/lib/stores/galeria.svelte.js";
import { editor } from "../../../src/lib/stores/editor.svelte.js";
import { Canvas } from "../../../src/lib/models/Canvas.js";
import { reiniciarGaleriaDB } from "../../helpers.js";

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

describe("galeria store (F05/FR-008)", () => {
  it("guardar persiste el dibujo del editor y refresca la lista (FR-002)", async () => {
    editor.pintarPixel(2, 2);
    const ok = await galeria.guardar("Mi dibujo");
    expect(ok).toBe(true);
    expect(galeria.dibujos).toHaveLength(1);
    expect(galeria.dibujos[0].nombre).toBe("Mi dibujo");
    expect(galeria.error).toBe("");
  });

  it("guardar limpia los espacios del nombre y devuelve errores sin guardar si falta (FR-007)", async () => {
    const okVacio = await galeria.guardar("   ");
    expect(okVacio).toBe(false);
    expect(galeria.error).toBe("El nombre es obligatorio.");
    expect(galeria.dibujos).toHaveLength(0);
  });

  it("guardar con nombre con espacios lo normaliza (FR-002)", async () => {
    await galeria.guardar("  Gato feliz  ");
    expect(galeria.dibujos[0].nombre).toBe("Gato feliz");
  });

  it("cargar restaura píxeles y dimensiones en el editor y cierra el modal (FR-004)", async () => {
    editor.pintarPixel(3, 3);
    await galeria.guardar("X");
    const dibujo = galeria.dibujos[0];

    editor.model = new Canvas(16, 16);
    galeria.visible = true;
    galeria.cargar(dibujo);

    expect(editor.model.getPixel(3, 3).r).toBe(255);
    expect(galeria.visible).toBe(false);
  });

  it("cargar reinicia el historial de undo/redo", async () => {
    editor.pintarPixel(1, 1);
    await galeria.guardar("X");
    const dibujo = galeria.dibujos[0];

    editor.abrirAccion();
    editor.pintarPixel(5, 5);
    editor.cerrarAccion();
    expect(editor.undoStack.length).toBe(1);

    galeria.cargar(dibujo);
    expect(editor.undoStack.length).toBe(0);
    expect(editor.redoStack.length).toBe(0);
  });

  it("nuevo deja el lienzo en blanco y reinicia el historial (FR-005)", () => {
    editor.pintarPixel(0, 0);
    editor.abrirAccion();
    editor.pintarPixel(1, 1);
    editor.cerrarAccion();

    galeria.nuevo();

    expect(editor.model.getPixel(0, 0).a).toBe(0);
    expect(editor.model.getPixel(1, 1).a).toBe(0);
    expect(editor.undoStack.length).toBe(0);
    expect(editor.redoStack.length).toBe(0);
  });

  it("eliminar borra el dibujo y refresca la lista (FR-006)", async () => {
    await galeria.guardar("A");
    await galeria.guardar("B");
    expect(galeria.dibujos).toHaveLength(2);
    const idsAntes = new Set(galeria.dibujos.map((d) => d.id));
    const aEliminar = galeria.dibujos[0].id;

    await galeria.eliminar(aEliminar);

    expect(galeria.dibujos).toHaveLength(1);
    expect(galeria.dibujos[0].id).not.toBe(aEliminar);
    expect(idsAntes.has(galeria.dibujos[0].id)).toBe(true);
    expect(galeria.error).toBe("");
  });

  it("abrir muestra el modal y carga la lista; cerrar lo oculta (FR-003)", async () => {
    await galeria.guardar("A");
    expect(galeria.visible).toBe(false);

    galeria.abrir();
    expect(galeria.visible).toBe(true);
    expect(galeria.enfocarGuardar).toBe(false);
    expect(galeria.dibujos).toHaveLength(1);

    galeria.abrir({ enfocarGuardar: true });
    expect(galeria.enfocarGuardar).toBe(true);

    galeria.cerrar();
    expect(galeria.visible).toBe(false);
  });
});