import { Canvas } from "../models/Canvas.js";
import { Drawing } from "../models/Drawing.js";
import { saveDrawing, listDrawings, deleteDrawing } from "../services/gallery.js";
import { editor } from "./editor.svelte.js";

class GalleryStore {
  drawings = $state([]);
  visible = $state(false);
  focusSave = $state(false);
  saving = $state(false);
  error = $state("");

  open({ focusSave = false } = {}) {
    this.focusSave = focusSave;
    this.visible = true;
    this.list();
  }

  close() {
    this.visible = false;
    this.error = "";
  }

  async list() {
    try {
      this.drawings = await listDrawings();
      this.error = "";
    } catch {
      this.error = "Could not load the gallery.";
    }
  }

  async save(name) {
    const trimmed = (name ?? "").trim();
    if (!trimmed) {
      this.error = "Name is required.";
      return false;
    }
    this.saving = true;
    try {
      await saveDrawing(Drawing.fromModel(editor.model, trimmed));
      await this.list();
      this.error = "";
      return true;
    } catch {
      this.error = "Could not save the drawing.";
      return false;
    } finally {
      this.saving = false;
    }
  }

  load(drawing) {
    editor.model = Drawing.toCanvas(drawing);
    editor.undoStack = [];
    editor.redoStack = [];
    editor.version += 1;
    this.close();
  }

  newDrawing() {
    editor.model = new Canvas(editor.model.cols, editor.model.rows);
    editor.undoStack = [];
    editor.redoStack = [];
    editor.version += 1;
  }

  async delete(id) {
    try {
      await deleteDrawing(id);
      await this.list();
      this.error = "";
    } catch {
      this.error = "Could not delete the drawing.";
    }
  }
}

export const gallery = new GalleryStore();