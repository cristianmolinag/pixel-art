import { Canvas } from "../models/Canvas.js";

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
    if (this.undoStack.length === 0) return;
    this.redoStack.push(this.model.snapshot());
    this.model.restore(this.undoStack.pop());
    this.version += 1;
  }

  rehacer() {
    if (this.redoStack.length === 0) return;
    this.undoStack.push(this.model.snapshot());
    this.model.restore(this.redoStack.pop());
    this.version += 1;
  }

  seleccionarHerramienta(herramienta) {
    this.herramienta = herramienta;
  }

  pintarPixel(x, y) {
    if (!this.model.setPixel(x, y, this.colorActual)) return;
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
    this._cambiosEnAccion += 1;
    this.version += 1;
  }

  rellenar(x, y) {
    const pintados = this.model.floodFill(x, y, this.colorActual);
    if (pintados <= 0) return;
    this._cambiosEnAccion += 1;
    this.version += 1;
  }
}

export const editor = new EditorStore();