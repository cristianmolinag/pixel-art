import { Canvas } from "../models/Canvas.js";
import {
  loadRecentColors,
  saveRecentColors,
  normalizeHex,
  RECENT_LIMIT,
} from "../services/colors.js";

const GRID_STORAGE_KEY = "pixel-art-studio:show-grid";

function loadGridVisibility() {
  try {
    return localStorage.getItem(GRID_STORAGE_KEY) !== "false";
  } catch {
    return true;
  }
}

function saveGridVisibility(valor) {
  try {
    localStorage.setItem(GRID_STORAGE_KEY, String(valor));
  } catch {
    // sin storage (SSR/pruebas) se ignora
  }
}

export const MATRIX_PRESETS = [16, 32, 48, 64];
export const MIN_MATRIX_SIZE = 4;
export const MAX_MATRIX_SIZE = 128;

export const MIN_ZOOM = 1;
export const MAX_ZOOM = 4;
export const ZOOM_STEP = 0.5;

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
  "#ffc0cb",
  "#c0c0c0",
  "#808080",
  "#404040",
  "#800000",
  "#8b4513",
  "#a0522d",
  "#d2691e",
  "#ff8c00",
  "#b22222",
  "#dc143c",
  "#ff1493",
  "#4b0082",
  "#8a2be2",
  "#00ced1",
  "#2e8b57",
];

class EditorStore {
  model = $state(new Canvas(16, 16));
  currentColor = $state("#000000");
  tool = $state("brush");
  version = $state(0);
  recentColors = $state(loadRecentColors());
  showGrid = $state(loadGridVisibility());
  zoom = $state(1);
  panX = $state(0);
  panY = $state(0);

  selectColor(color) {
    const norm = normalizeHex(color);
    if (!norm) return;
    this.currentColor = norm;
  }

  trackColorUsage(color) {
    const norm = normalizeHex(color);
    if (!norm) return;
    const lista = this.recentColors.filter((c) => c !== norm);
    lista.unshift(norm);
    this.recentColors = lista.slice(0, RECENT_LIMIT);
    saveRecentColors(this.recentColors);
  }

  undoStack = $state([]);
  redoStack = $state([]);
  canUndo = $derived(this.undoStack.length > 0);
  canRedo = $derived(this.redoStack.length > 0);

  _actionChanges = 0;
  _actionSnapshot = null;

  beginAction() {
    this._actionSnapshot = this.model.snapshot();
    this._actionChanges = 0;
  }

  endAction() {
    if (this._actionChanges > 0 && this._actionSnapshot && !this.model.equals(this._actionSnapshot)) {
      this.undoStack.push(this._actionSnapshot);
      this.redoStack.length = 0;
    }
    this._actionSnapshot = null;
    this._actionChanges = 0;
  }

  undo() {
    while (this.undoStack.length > 0) {
      const snapshot = this.undoStack.pop();
      if (snapshot.length !== this.model.cols * this.model.rows * 4) continue;
      this.redoStack.push(this.model.snapshot());
      this.model.restore(snapshot);
      this.version += 1;
      return;
    }
  }

  redo() {
    while (this.redoStack.length > 0) {
      const snapshot = this.redoStack.pop();
      if (snapshot.length !== this.model.cols * this.model.rows * 4) continue;
      this.undoStack.push(this.model.snapshot());
      this.model.restore(snapshot);
      this.version += 1;
      return;
    }
  }

  selectTool(tool) {
    this.tool = tool;
  }

  toggleGrid() {
    this.showGrid = !this.showGrid;
    saveGridVisibility(this.showGrid);
  }

  roundZoom(valor) {
    return Math.round(valor / ZOOM_STEP) * ZOOM_STEP;
  }

  zoomIn() {
    this.zoom = Math.min(MAX_ZOOM, this.roundZoom(this.zoom + ZOOM_STEP));
  }

  zoomOut() {
    this.zoom = Math.max(MIN_ZOOM, this.roundZoom(this.zoom - ZOOM_STEP));
  }

  setZoom(valor) {
    this.zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, valor));
  }

  resetZoom() {
    this.zoom = 1;
    this.panX = 0;
    this.panY = 0;
  }

  panBy(dx, dy, maxX = Infinity, maxY = Infinity) {
    this.panX = Math.min(maxX, Math.max(-maxX, this.panX + dx));
    this.panY = Math.min(maxY, Math.max(-maxY, this.panY + dy));
  }

  setMatrix(cols, rows) {
    const c = Math.floor(Number(cols));
    const r = Math.floor(Number(rows));
    if (!Number.isFinite(c) || !Number.isFinite(r)) return false;
    if (c < MIN_MATRIX_SIZE || c > MAX_MATRIX_SIZE || r < MIN_MATRIX_SIZE || r > MAX_MATRIX_SIZE) return false;
    this.model = new Canvas(c, r);
    this.version += 1;
    return true;
  }

  paintPixel(x, y) {
    if (!this.model.setPixel(x, y, this.currentColor)) return;
    this.trackColorUsage(this.currentColor);
    this._actionChanges += 1;
    this.version += 1;
  }

  erasePixel(x, y) {
    if (!this.model.erasePixel(x, y)) return;
    this._actionChanges += 1;
    this.version += 1;
  }

  drawLine(x0, y0, x1, y1) {
    if (!this.model.drawLine(x0, y0, x1, y1, this.currentColor)) return;
    this.trackColorUsage(this.currentColor);
    this._actionChanges += 1;
    this.version += 1;
  }

  floodFill(x, y) {
    const painted = this.model.floodFill(x, y, this.currentColor);
    if (painted <= 0) return;
    this.trackColorUsage(this.currentColor);
    this._actionChanges += 1;
    this.version += 1;
  }
}

export const editor = new EditorStore();
