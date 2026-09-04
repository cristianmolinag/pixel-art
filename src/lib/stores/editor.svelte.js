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

  seleccionarHerramienta(herramienta) {
    this.herramienta = herramienta;
  }

  pintarPixel(x, y) {
    if (!this.model.setPixel(x, y, this.colorActual)) return;
    this.version += 1;
  }

  borrarPixel(x, y) {
    if (!this.model.borrarPixel(x, y)) return;
    this.version += 1;
  }

  dibujarLinea(x0, y0, x1, y1) {
    if (!this.model.drawLine(x0, y0, x1, y1, this.colorActual)) return;
    this.version += 1;
  }

  rellenar(x, y) {
    const pintados = this.model.floodFill(x, y, this.colorActual);
    if (pintados <= 0) return;
    this.version += 1;
  }
}

export const editor = new EditorStore();