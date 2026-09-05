import { describe, it, expect, beforeEach } from "vitest";
import { editor, PALETA } from "../../../src/lib/stores/editor.svelte.js";
import { Canvas } from "../../../src/lib/models/Canvas.js";

describe("editor store (F02/FR-008)", () => {
  it("exposes a fixed color palette (FR-001/FR-007)", () => {
    expect(Array.isArray(PALETA)).toBe(true);
    expect(PALETA.length).toBeGreaterThanOrEqual(8);
  });

  it("paintPixel paints with the current color (FR-003)", () => {
    editor.currentColor = "#123456";
    editor.paintPixel(4, 4);
    expect(editor.model.getPixel(4, 4)).toEqual({ r: 18, g: 52, b: 86, a: 255 });
  });

  it("paintPixel increments version to repaint", () => {
    const before = editor.version;
    editor.paintPixel(5, 5);
    expect(editor.version).toBe(before + 1);
  });

  it("changing currentColor makes it ready to paint", () => {
    editor.currentColor = "#00ff00";
    editor.paintPixel(7, 7);
    expect(editor.model.getPixel(7, 7).g).toBe(255);
  });
});

describe("editor store (F03/FR-008)", () => {
  beforeEach(() => {
    editor.model = new Canvas(16, 16);
    editor.currentColor = "#ff0000";
    editor.version = 0;
  });

  it("starts with the brush tool by default", () => {
    expect(editor.tool).toBe("brush");
  });

  it("selectTool changes the active tool", () => {
    editor.selectTool("eraser");
    expect(editor.tool).toBe("eraser");
    editor.selectTool("line");
    expect(editor.tool).toBe("line");
  });

  it("erasePixel clears the cell and increments version", () => {
    editor.paintPixel(4, 4);
    const before = editor.version;
    editor.erasePixel(4, 4);
    expect(editor.model.getPixel(4, 4).a).toBe(0);
    expect(editor.version).toBe(before + 1);
  });

  it("erasePixel out of range does not increment version", () => {
    const before = editor.version;
    editor.erasePixel(16, 16);
    expect(editor.version).toBe(before);
  });

  it("drawLine draws a line between two points", () => {
    editor.currentColor = "#0000ff";
    editor.drawLine(1, 1, 5, 1);
    for (let x = 1; x <= 5; x++) {
      expect(editor.model.getPixel(x, 1).b).toBe(255);
    }
  });

  it("drawLine increments version", () => {
    const before = editor.version;
    editor.drawLine(1, 1, 5, 1);
    expect(editor.version).toBe(before + 1);
  });

  it("floodFill paints the connected region", () => {
    editor.model.setPixel(3, 0, "#00ff00");
    editor.floodFill(0, 0);
    for (let x = 0; x < 3; x++) {
      expect(editor.model.getPixel(x, 0).r).toBe(255);
    }
    expect(editor.model.getPixel(3, 0).g).toBe(255);
  });

  it("floodFill does not increment version when nothing changed", () => {
    editor.model.setPixel(0, 0, "#ff0000");
    const before = editor.version;
    editor.floodFill(0, 0);
    expect(editor.version).toBe(before);
  });
});

describe("editor store (F04/FR-007)", () => {
  beforeEach(() => {
    editor.model = new Canvas(16, 16);
    editor.currentColor = "#ff0000";
    editor.version = 0;
    editor.undoStack = [];
    editor.redoStack = [];
  });

  it("a gesture with changes creates an undo step on close (FR-002/FR-004)", () => {
    editor.beginAction();
    editor.paintPixel(2, 2);
    editor.paintPixel(3, 2);
    editor.endAction();
    expect(editor.undoStack.length).toBe(1);
    expect(editor.canUndo).toBe(true);
  });

  it("a gesture without changes does not create empty steps (US3/FR-002)", () => {
    editor.beginAction();
    editor.paintPixel(2, 2);
    editor.endAction();
    editor.beginAction();
    editor.paintPixel(2, 2);
    editor.endAction();
    expect(editor.undoStack.length).toBe(1);
  });

  it("an out-of-range gesture does not create an undo step", () => {
    editor.beginAction();
    editor.paintPixel(16, 16);
    editor.endAction();
    expect(editor.undoStack.length).toBe(0);
  });

  it("undo reverts the last action and enables redo (FR-002/FR-003)", () => {
    editor.beginAction();
    editor.paintPixel(2, 2);
    editor.endAction();
    editor.undo();
    expect(editor.model.getPixel(2, 2).a).toBe(0);
    expect(editor.redoStack.length).toBe(1);
    expect(editor.canRedo).toBe(true);
    editor.redo();
    expect(editor.model.getPixel(2, 2).r).toBe(255);
    expect(editor.canRedo).toBe(false);
  });

  it("undo and redo increment version to repaint", () => {
    editor.beginAction();
    editor.paintPixel(2, 2);
    editor.endAction();
    const beforeUndo = editor.version;
    editor.undo();
    expect(editor.version).toBe(beforeUndo + 1);
    editor.redo();
    expect(editor.version).toBe(beforeUndo + 2);
  });

  it("the undo stack keeps the order of the actions", () => {
    editor.beginAction();
    editor.paintPixel(1, 1);
    editor.endAction();
    editor.beginAction();
    editor.paintPixel(2, 2);
    editor.endAction();
    editor.undo();
    expect(editor.model.getPixel(2, 2).a).toBe(0);
    expect(editor.model.getPixel(1, 1).r).toBe(255);
    editor.undo();
    expect(editor.model.getPixel(1, 1).a).toBe(0);
  });

  it("a new action after undo clears the redo stack (FR-006)", () => {
    editor.beginAction();
    editor.paintPixel(2, 2);
    editor.endAction();
    editor.undo();
    expect(editor.canRedo).toBe(true);
    editor.beginAction();
    editor.paintPixel(5, 5);
    editor.endAction();
    expect(editor.redoStack.length).toBe(0);
    expect(editor.canRedo).toBe(false);
  });

  it("undo and redo without history do nothing (FR-005)", () => {
    expect(editor.canUndo).toBe(false);
    expect(editor.canRedo).toBe(false);
    const before = editor.version;
    editor.undo();
    editor.redo();
    expect(editor.version).toBe(before);
  });
});

describe("editor store (F06 recent colors)", () => {
  beforeEach(() => {
    localStorage.clear();
    editor.model = new Canvas(16, 16);
    editor.currentColor = "#ff0000";
    editor.version = 0;
    editor.recentColors = [];
  });

  it("trackColorUsage adds the color first and normalizes", () => {
    editor.trackColorUsage("#00ff00");
    expect(editor.recentColors).toEqual(["#00FF00"]);
    expect(localStorage.getItem("pixel-art-studio:recent-colors")).toBe(
      JSON.stringify(["#00FF00"])
    );
  });

  it("trackColorUsage moves to the front without duplicating (LRU)", () => {
    editor.trackColorUsage("#111111");
    editor.trackColorUsage("#222222");
    editor.trackColorUsage("#111111");
    expect(editor.recentColors).toEqual(["#111111", "#222222"]);
  });

  it("trackColorUsage caps at 6 recents", () => {
    for (let i = 1; i <= 8; i++) {
      const hex = `#0${i}0${i}0${i}`;
      editor.trackColorUsage(hex);
    }
    expect(editor.recentColors.length).toBe(6);
    expect(editor.recentColors[0]).toBe("#080808");
  });

  it("trackColorUsage ignores invalid colors", () => {
    editor.trackColorUsage("rojo");
    expect(editor.recentColors).toEqual([]);
  });

  it("paintPixel records the used color (F06)", () => {
    editor.currentColor = "#147df5";
    editor.paintPixel(2, 2);
    expect(editor.recentColors).toContain("#147DF5");
  });

  it("drawLine and floodFill record the used color (F06)", () => {
    editor.currentColor = "#ffd300";
    editor.drawLine(0, 0, 4, 0);
    expect(editor.recentColors).toContain("#FFD300");

    editor.currentColor = "#580aff";
    editor.floodFill(8, 8);
    expect(editor.recentColors).toContain("#580AFF");
  });

  it("actions without changes do not record a color (F06)", () => {
    editor.currentColor = "#147df5";
    editor.paintPixel(16, 16);
    editor.drawLine(-1, -1, -2, -2);
    editor.floodFill(16, 16);
    expect(editor.recentColors).toEqual([]);
  });

  it("selectColor sets currentColor and normalizes", () => {
    editor.selectColor("#abc");
    expect(editor.currentColor).toBe("#AABBCC");
  });

  it("selectColor does not reorder the recents", () => {
    editor.trackColorUsage("#111111");
    editor.trackColorUsage("#222222");
    editor.selectColor("#111111");
    expect(editor.currentColor).toBe("#111111");
    expect(editor.recentColors).toEqual(["#222222", "#111111"]);
  });

  it("selectColor with a new color does not add it to recents (only painting)", () => {
    editor.selectColor("#123456");
    expect(editor.recentColors).toEqual([]);
  });
});

describe("editor store (F08 grid)", () => {
  beforeEach(() => {
    localStorage.clear();
    editor.showGrid = true;
  });

  it("shows the grid by default", () => {
    expect(editor.showGrid).toBe(true);
  });

  it("toggleGrid hides and shows again", () => {
    editor.toggleGrid();
    expect(editor.showGrid).toBe(false);
    editor.toggleGrid();
    expect(editor.showGrid).toBe(true);
  });

  it("toggleGrid persists the preference in localStorage", () => {
    editor.toggleGrid();
    expect(localStorage.getItem("pixel-art-studio:show-grid")).toBe("false");
    editor.toggleGrid();
    expect(localStorage.getItem("pixel-art-studio:show-grid")).toBe("true");
  });
});

describe("editor store (F09 matrix)", () => {
  beforeEach(() => {
    localStorage.clear();
    editor.model = new Canvas(16, 16);
    editor.version = 0;
    editor.undoStack = [];
    editor.redoStack = [];
  });

  it("setMatrix changes the canvas dimensions", () => {
    expect(editor.setMatrix(32, 48)).toBe(true);
    expect(editor.model.cols).toBe(32);
    expect(editor.model.rows).toBe(48);
  });

  it("changing the matrix clears the canvas (design decision)", () => {
    editor.paintPixel(1, 1);
    editor.setMatrix(32, 32);
    expect(editor.model.getPixel(1, 1).a).toBe(0);
  });

  it("rejects out-of-range or non-numeric dimensions", () => {
    expect(editor.setMatrix(0, 16)).toBe(false);
    expect(editor.setMatrix(16, 500)).toBe(false);
    expect(editor.setMatrix("a", 16)).toBe(false);
    expect(editor.setMatrix(undefined, 16)).toBe(false);
    expect(editor.setMatrix(3, 16)).toBe(false);
    expect(editor.model.cols).toBe(16);
  });

  it("keeps history: undo skips snapshots from another dimension", () => {
    editor.beginAction();
    editor.paintPixel(1, 1);
    editor.endAction();
    editor.setMatrix(32, 32);
    editor.undo();
    expect(editor.model.getPixel(1, 1).a).toBe(0);
    expect(editor.undoStack.length).toBe(0);
  });
});

describe("editor store (F10 zoom)", () => {
  beforeEach(() => {
    editor.zoom = 1;
    editor.panX = 0;
    editor.panY = 0;
  });

  it("zoomIn increases the zoom in 0.5 steps", () => {
    editor.zoom = 1;
    editor.zoomIn();
    expect(editor.zoom).toBe(1.5);
    editor.zoomIn();
    expect(editor.zoom).toBe(2);
  });

  it("zoomIn never exceeds the 4x maximum", () => {
    editor.zoom = 4;
    editor.zoomIn();
    expect(editor.zoom).toBe(4);
  });

  it("zoomOut decreases the zoom in 0.5 steps without going below 1x (100%)", () => {
    editor.zoom = 1.5;
    editor.zoomOut();
    expect(editor.zoom).toBe(1);
    editor.zoomOut();
    expect(editor.zoom).toBe(1);
  });

  it("setZoom (pinch) clamps the zoom to the 1-4 range", () => {
    editor.setZoom(2.3);
    expect(editor.zoom).toBe(2.3);
    editor.setZoom(8);
    expect(editor.zoom).toBe(4);
    editor.setZoom(0.1);
    expect(editor.zoom).toBe(1);
  });

  it("resetZoom returns to 1x and centers (clears pan)", () => {
    editor.zoom = 3.5;
    editor.panBy(40, -25);
    editor.resetZoom();
    expect(editor.zoom).toBe(1);
    expect(editor.panX).toBe(0);
    expect(editor.panY).toBe(0);
  });

  it("panBy adds the offset and respects limits", () => {
    editor.panBy(30, 20, 50, 50);
    expect(editor.panX).toBe(30);
    expect(editor.panY).toBe(20);
    editor.panBy(40, 40, 50, 50);
    expect(editor.panX).toBe(50);
    expect(editor.panY).toBe(50);
    editor.panBy(-200, -200, 50, 50);
    expect(editor.panX).toBe(-50);
    expect(editor.panY).toBe(-50);
  });
});
