import { Layer } from "../models/Layer.js";
import { Frame } from "../models/Frame.js";

export const GRID_PRESETS = [
  { label: "8x8", cols: 8, rows: 8 },
  { label: "16x16", cols: 16, rows: 16 },
  { label: "32x32", cols: 32, rows: 32 },
  { label: "48x48", cols: 48, rows: 48 },
  { label: "64x64", cols: 64, rows: 64 },
  { label: "128x128", cols: 128, rows: 128 },
];

export const RATIO_PRESETS = [
  { label: "1:1", cols: 32, rows: 32 },
  { label: "16:9 HD", cols: 32, rows: 18 },
  { label: "9:16", cols: 18, rows: 32 },
  { label: "4:3", cols: 32, rows: 24 },
  { label: "3:2", cols: 36, rows: 24 },
];

export const PAPER_PRESETS = [
  { label: "A4 vert", exportW: 2480, exportH: 3508, aspect: 210 / 297 },
  { label: "A4 horiz", exportW: 3508, exportH: 2480, aspect: 297 / 210 },
  { label: "Oficio vert", exportW: 2550, exportH: 3300, aspect: 215.9 / 279.4 },
  { label: "Oficio horiz", exportW: 3300, exportH: 2550, aspect: 279.4 / 215.9 },
  { label: "A3 vert", exportW: 3508, exportH: 4961, aspect: 297 / 420 },
  { label: "A3 horiz", exportW: 4961, exportH: 3508, aspect: 420 / 297 },
];

class EditorState {
  gridCols = $state(32);
  gridRows = $state(32);
  exportWidth = $state(0);
  exportHeight = $state(0);

  activeTool = $state("pen");
  activeColor = $state("#000000");

  layers = $state([new Layer("Layer 1", 32, 32)]);
  activeLayerIndex = $state(0);

  frames = $state([new Frame()]);
  activeFrameIndex = $state(0);

  isDrawing = $state(false);
  showGrid = $state(true);
  eraseMode = $state(false);

  canvasVersion = $state(0);
  pendingImageData = $state(null);
  pendingClear = $state(false);
  pendingExport = $state(false);
  pendingComposite = $state(false);

  activeLayer = $derived(this.layers[this.activeLayerIndex]);
  activeFrame = $derived(this.frames[this.activeFrameIndex]);
  layerCount = $derived(this.layers.length);
  frameCount = $derived(this.frames.length);

  setTool(tool) {
    this.activeTool = tool;
    this.eraseMode = tool === "eraser";
  }

  setColor(color) {
    this.activeColor = color;
  }

  setCanvasSize(cols, rows) {
    this.gridCols = cols;
    this.gridRows = rows;
  }

  setPaperExport(w, h) {
    this.exportWidth = w;
    this.exportHeight = h;
  }

  composite(displayCtx, displayCanvas) {
    if (!displayCtx || !displayCanvas) return;
    displayCtx.clearRect(0, 0, displayCanvas.width, displayCanvas.height);
    for (const layer of this.layers) {
      if (!layer.visible) continue;
      displayCtx.globalAlpha = layer.opacity;
      displayCtx.drawImage(layer.offscreen, 0, 0);
    }
    displayCtx.globalAlpha = 1.0;
  }

  requestComposite() {
    this.pendingComposite = true;
    this.canvasVersion++;
  }

  initLayers(cols, rows) {
    this.gridCols = cols;
    this.gridRows = rows;
    this.layers = [new Layer("Layer 1", cols, rows)];
    this.activeLayerIndex = 0;
  }

  resizeAllLayers(cols, rows) {
    this.gridCols = cols;
    this.gridRows = rows;
    for (const layer of this.layers) {
      layer.resize(cols, rows);
    }
  }

  addLayer(name) {
    const layer = new Layer(name ?? `Layer ${this.layers.length + 1}`, this.gridCols, this.gridRows);
    this.layers = [...this.layers, layer];
    this.activeLayerIndex = this.layers.length - 1;
  }

  removeLayer(index) {
    if (this.layers.length <= 1) return;
    this.layers = this.layers.filter((_, i) => i !== index);
    this.activeLayerIndex = Math.min(
      this.activeLayerIndex,
      this.layers.length - 1,
    );
  }

  setActiveLayer(index) {
    this.activeLayerIndex = index;
  }

  toggleLayerVisibility(index) {
    const layer = this.layers[index];
    if (layer) {
      layer.visible = !layer.visible;
    }
  }

  clearActiveLayer() {
    const layer = this.activeLayer;
    if (layer && !layer.locked) {
      layer.clear();
    }
  }

  addFrame() {
    const frame = new Frame();
    this.frames = [...this.frames, frame];
    this.activeFrameIndex = this.frames.length - 1;
  }

  removeFrame(index) {
    if (this.frames.length <= 1) return;
    this.frames = this.frames.filter((_, i) => i !== index);
    this.activeFrameIndex = Math.min(
      this.activeFrameIndex,
      this.frames.length - 1,
    );
  }

  setActiveFrame(index) {
    this.activeFrameIndex = index;
  }

  duplicateFrame(index) {
    const clone = this.frames[index].clone();
    const newFrames = [...this.frames];
    newFrames.splice(index + 1, 0, clone);
    this.frames = newFrames;
    this.activeFrameIndex = index + 1;
  }
}

export const editor = new EditorState();
