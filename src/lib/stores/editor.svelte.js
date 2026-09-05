import { Canvas } from "../models/Canvas.js";
import {
  cargarRecientes,
  guardarRecientes,
  normalizarHex,
  LIMITE_RECIENTES,
} from "../services/colores.js";

const CLAVE_CUADRICULA = "pixel-art-studio:mostrar-cuadricula";

function cargarMostrarCuadricula() {
  try {
    return localStorage.getItem(CLAVE_CUADRICULA) !== "false";
  } catch {
    return true;
  }
}

function guardarMostrarCuadricula(valor) {
  try {
    localStorage.setItem(CLAVE_CUADRICULA, String(valor));
  } catch {
    // sin storage (SSR/pruebas) se ignora
  }
}

export const MATRICES = [16, 32, 48, 64];
export const MIN_MATRIZ = 4;
export const MAX_MATRIZ = 128;

export const PALETA = [
  "#000000",
  "#ffffff",
  "#ff0000",
  "#ff8700",
  "#ffd300",
  "#deff0a",
  "#a1ff0a",
  "#0aff99",
  "#0aefff",
  "#147df5",
  "#580aff",
  "#be0aff",
  "#ff13c3",
  "#ff006a",
  "#606060",
  "#9e9e9e",
];

class EditorStore {
  model = $state(new Canvas(16, 16));
  colorActual = $state("#000000");
  herramienta = $state("pincel");
  version = $state(0);
  coloresRecientes = $state(cargarRecientes());
  mostrarCuadricula = $state(cargarMostrarCuadricula());

  seleccionarColor(color) {
    const norm = normalizarHex(color);
    if (!norm) return;
    this.colorActual = norm;
  }

  registrarColorUsado(color) {
    const norm = normalizarHex(color);
    if (!norm) return;
    const lista = this.coloresRecientes.filter((c) => c !== norm);
    lista.unshift(norm);
    this.coloresRecientes = lista.slice(0, LIMITE_RECIENTES);
    guardarRecientes(this.coloresRecientes);
  }

  undoStack = $state([]);
  redoStack = $state([]);
  canUndo = $derived(this.undoStack.length > 0);
  canRedo = $derived(this.redoStack.length > 0);

  _cambiosEnAccion = 0;
  _snapshotAccion = null;

  abrirAccion() {
    this._snapshotAccion = this.model.snapshot();
    this._cambiosEnAccion = 0;
  }

  cerrarAccion() {
    if (this._cambiosEnAccion > 0 && this._snapshotAccion && !this.model.iguales(this._snapshotAccion)) {
      this.undoStack.push(this._snapshotAccion);
      this.redoStack.length = 0;
    }
    this._snapshotAccion = null;
    this._cambiosEnAccion = 0;
  }

  deshacer() {
    while (this.undoStack.length > 0) {
      const snapshot = this.undoStack.pop();
      if (snapshot.length !== this.model.cols * this.model.rows * 4) continue;
      this.redoStack.push(this.model.snapshot());
      this.model.restore(snapshot);
      this.version += 1;
      return;
    }
  }

  rehacer() {
    while (this.redoStack.length > 0) {
      const snapshot = this.redoStack.pop();
      if (snapshot.length !== this.model.cols * this.model.rows * 4) continue;
      this.undoStack.push(this.model.snapshot());
      this.model.restore(snapshot);
      this.version += 1;
      return;
    }
  }

  seleccionarHerramienta(herramienta) {
    this.herramienta = herramienta;
  }

  alternarCuadricula() {
    this.mostrarCuadricula = !this.mostrarCuadricula;
    guardarMostrarCuadricula(this.mostrarCuadricula);
  }

  establecerMatriz(cols, rows) {
    const c = Math.floor(Number(cols));
    const r = Math.floor(Number(rows));
    if (!Number.isFinite(c) || !Number.isFinite(r)) return false;
    if (c < MIN_MATRIZ || c > MAX_MATRIZ || r < MIN_MATRIZ || r > MAX_MATRIZ) return false;
    this.model = new Canvas(c, r);
    this.version += 1;
    return true;
  }

  pintarPixel(x, y) {
    if (!this.model.setPixel(x, y, this.colorActual)) return;
    this.registrarColorUsado(this.colorActual);
    this._cambiosEnAccion += 1;
    this.version += 1;
  }

  borrarPixel(x, y) {
    if (!this.model.borrarPixel(x, y)) return;
    this._cambiosEnAccion += 1;
    this.version += 1;
  }

  dibujarLinea(x0, y0, x1, y1) {
    if (!this.model.drawLine(x0, y0, x1, y1, this.colorActual)) return;
    this.registrarColorUsado(this.colorActual);
    this._cambiosEnAccion += 1;
    this.version += 1;
  }

  rellenar(x, y) {
    const pintados = this.model.floodFill(x, y, this.colorActual);
    if (pintados <= 0) return;
    this.registrarColorUsado(this.colorActual);
    this._cambiosEnAccion += 1;
    this.version += 1;
  }
}

export const editor = new EditorStore();