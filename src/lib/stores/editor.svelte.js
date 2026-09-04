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
  version = $state(0);

  pintarPixel(x, y) {
    if (!this.model.setPixel(x, y, this.colorActual)) return;
    this.version += 1;
  }
}

export const editor = new EditorStore();