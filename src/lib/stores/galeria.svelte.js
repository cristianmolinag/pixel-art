import { Canvas } from "../models/Canvas.js";
import { Dibujo } from "../models/Dibujo.js";
import { guardarDibujo, listarDibujos, eliminarDibujo } from "../services/galeria.js";
import { editor } from "./editor.svelte.js";

class GaleriaStore {
  dibujos = $state([]);
  visible = $state(false);
  enfocarGuardar = $state(false);
  guardando = $state(false);
  error = $state("");

  abrir({ enfocarGuardar = false } = {}) {
    this.enfocarGuardar = enfocarGuardar;
    this.visible = true;
    this.listar();
  }

  cerrar() {
    this.visible = false;
    this.error = "";
  }

  async listar() {
    try {
      this.dibujos = await listarDibujos();
      this.error = "";
    } catch {
      this.error = "No se pudo cargar la galería.";
    }
  }

  async guardar(nombre) {
    const limpio = (nombre ?? "").trim();
    if (!limpio) {
      this.error = "El nombre es obligatorio.";
      return false;
    }
    this.guardando = true;
    try {
      await guardarDibujo(Dibujo.desdeModelo(editor.model, limpio));
      await this.listar();
      this.error = "";
      return true;
    } catch {
      this.error = "No se pudo guardar el dibujo.";
      return false;
    } finally {
      this.guardando = false;
    }
  }

  cargar(dibujo) {
    editor.model = Dibujo.aCanvas(dibujo);
    editor.undoStack = [];
    editor.redoStack = [];
    editor.version += 1;
    this.cerrar();
  }

  nuevo() {
    editor.model = new Canvas(editor.model.cols, editor.model.rows);
    editor.undoStack = [];
    editor.redoStack = [];
    editor.version += 1;
  }

  async eliminar(id) {
    try {
      await eliminarDibujo(id);
      await this.listar();
      this.error = "";
    } catch {
      this.error = "No se pudo eliminar el dibujo.";
    }
  }
}

export const galeria = new GaleriaStore();