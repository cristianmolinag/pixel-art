import { describe, it, expect, beforeEach } from "vitest";
import { gallery } from "../../../src/lib/stores/gallery.svelte.js";
import { editor } from "../../../src/lib/stores/editor.svelte.js";
import { Canvas } from "../../../src/lib/models/Canvas.js";
import { resetGalleryDB } from "../../helpers.js";

beforeEach(async () => {
  await resetGalleryDB();
  editor.model = new Canvas(16, 16);
  editor.currentColor = "#ff0000";
  editor.version = 0;
  editor.undoStack = [];
  editor.redoStack = [];
  gallery.visible = false;
  gallery.focusSave = false;
  gallery.drawings = [];
  gallery.error = "";
  gallery.saving = false;
});

describe("gallery store (F05/FR-008)", () => {
  it("save persists the editor drawing and refreshes the list (FR-002)", async () => {
    editor.paintPixel(2, 2);
    const ok = await gallery.save("Mi drawing");
    expect(ok).toBe(true);
    expect(gallery.drawings).toHaveLength(1);
    expect(gallery.drawings[0].name).toBe("Mi drawing");
    expect(gallery.error).toBe("");
  });

  it("save trims the name and returns an error without saving when missing (FR-007)", async () => {
    const okVacio = await gallery.save("   ");
    expect(okVacio).toBe(false);
    expect(gallery.error).toBe("Name is required.");
    expect(gallery.drawings).toHaveLength(0);
  });

  it("save normalizes a name with surrounding spaces (FR-002)", async () => {
    await gallery.save("  Gato feliz  ");
    expect(gallery.drawings[0].name).toBe("Gato feliz");
  });

  it("load restores pixels and dimensions in the editor and closes the modal (FR-004)", async () => {
    editor.paintPixel(3, 3);
    await gallery.save("X");
    const drawing = gallery.drawings[0];

    editor.model = new Canvas(16, 16);
    gallery.visible = true;
    gallery.load(drawing);

    expect(editor.model.getPixel(3, 3).r).toBe(255);
    expect(gallery.visible).toBe(false);
  });

  it("load resets the undo/redo history", async () => {
    editor.paintPixel(1, 1);
    await gallery.save("X");
    const drawing = gallery.drawings[0];

    editor.beginAction();
    editor.paintPixel(5, 5);
    editor.endAction();
    expect(editor.undoStack.length).toBe(1);

    gallery.load(drawing);
    expect(editor.undoStack.length).toBe(0);
    expect(editor.redoStack.length).toBe(0);
  });

  it("newDrawing leaves the canvas white and resets the history (FR-005)", () => {
    editor.paintPixel(0, 0);
    editor.beginAction();
    editor.paintPixel(1, 1);
    editor.endAction();

    gallery.newDrawing();

    expect(editor.model.getPixel(0, 0).a).toBe(0);
    expect(editor.model.getPixel(1, 1).a).toBe(0);
    expect(editor.undoStack.length).toBe(0);
    expect(editor.redoStack.length).toBe(0);
  });

  it("delete removes the drawing and refreshes the list (FR-006)", async () => {
    await gallery.save("A");
    await gallery.save("B");
    expect(gallery.drawings).toHaveLength(2);
    const idsAntes = new Set(gallery.drawings.map((d) => d.id));
    const aEliminar = gallery.drawings[0].id;

    await gallery.delete(aEliminar);

    expect(gallery.drawings).toHaveLength(1);
    expect(gallery.drawings[0].id).not.toBe(aEliminar);
    expect(idsAntes.has(gallery.drawings[0].id)).toBe(true);
    expect(gallery.error).toBe("");
  });

  it("open shows the modal and loads the list; close hides it (FR-003)", async () => {
    await gallery.save("A");
    expect(gallery.visible).toBe(false);

    gallery.open();
    expect(gallery.visible).toBe(true);
    expect(gallery.focusSave).toBe(false);
    expect(gallery.drawings).toHaveLength(1);

    gallery.open({ focusSave: true });
    expect(gallery.focusSave).toBe(true);

    gallery.close();
    expect(gallery.visible).toBe(false);
  });
});