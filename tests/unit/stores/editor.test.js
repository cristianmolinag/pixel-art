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

describe("editor store (F03 eyedropper extension #40)", () => {
  beforeEach(() => {
    editor.model = new Canvas(16, 16);
    editor.currentColor = "#ff0000";
    editor.tool = "brush";
    editor.lastDrawingTool = "brush";
    editor.version = 0;
  });

  it("selectTool sets eyedropper without changing the last drawing tool", () => {
    editor.selectTool("line");
    expect(editor.lastDrawingTool).toBe("line");
    editor.selectTool("eyedropper");
    expect(editor.tool).toBe("eyedropper");
    expect(editor.lastDrawingTool).toBe("line");
  });

  it("selectTool updates the last drawing tool for brush, eraser, line, and fill", () => {
    editor.selectTool("eraser");
    expect(editor.lastDrawingTool).toBe("eraser");
    editor.selectTool("fill");
    expect(editor.lastDrawingTool).toBe("fill");
    editor.selectTool("brush");
    expect(editor.lastDrawingTool).toBe("brush");
  });

  it("pickColor samples a painted pixel and returns to the last drawing tool", () => {
    editor.model.setPixel(2, 2, "#147df5");
    editor.selectTool("line");
    editor.selectTool("eyedropper");
    editor.pickColor(2, 2);
    expect(editor.currentColor).toBe("#147DF5");
    expect(editor.tool).toBe("line");
  });

  it("pickColor on a transparent pixel switches to the eraser gracefully", () => {
    editor.selectTool("line");
    editor.selectTool("eyedropper");
    editor.pickColor(2, 2);
    expect(editor.tool).toBe("eraser");
    expect(editor.lastDrawingTool).toBe("line");
  });

  it("pickColor out of range does nothing", () => {
    editor.selectTool("eyedropper");
    const beforeColor = editor.currentColor;
    editor.pickColor(50, 50);
    expect(editor.currentColor).toBe(beforeColor);
    expect(editor.tool).toBe("eyedropper");
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

describe("editor store (F15 mirror symmetry #41)", () => {
  beforeEach(() => {
    editor.model = new Canvas(16, 16);
    editor.currentColor = "#ff0000";
    editor.tool = "brush";
    editor.mirrorX = false;
    editor.mirrorY = false;
    editor.version = 0;
  });

  it("starts with both mirror toggles disabled", () => {
    expect(editor.mirrorX).toBe(false);
    expect(editor.mirrorY).toBe(false);
  });

  it("toggleMirrorX and toggleMirrorY flip their state", () => {
    editor.toggleMirrorX();
    expect(editor.mirrorX).toBe(true);
    editor.toggleMirrorX();
    expect(editor.mirrorX).toBe(false);

    editor.toggleMirrorY();
    expect(editor.mirrorY).toBe(true);
    editor.toggleMirrorY();
    expect(editor.mirrorY).toBe(false);
  });

  it("mirroredCells returns only the original cell when both toggles are off", () => {
    expect(editor.mirroredCells(2, 3)).toEqual([{ x: 2, y: 3 }]);
  });

  it("paintPixel with horizontal mirror paints the reflected cell", () => {
    editor.mirrorX = true;
    editor.paintPixel(2, 3);
    expect(editor.model.getPixel(2, 3).r).toBe(255);
    expect(editor.model.getPixel(13, 3).r).toBe(255);
  });

  it("paintPixel with vertical mirror paints the reflected cell", () => {
    editor.mirrorY = true;
    editor.paintPixel(2, 3);
    expect(editor.model.getPixel(2, 3).r).toBe(255);
    expect(editor.model.getPixel(2, 12).r).toBe(255);
  });

  it("paintPixel with both mirrors paints up to four cells", () => {
    editor.mirrorX = true;
    editor.mirrorY = true;
    editor.paintPixel(2, 3);
    expect(editor.model.getPixel(2, 3).r).toBe(255);
    expect(editor.model.getPixel(13, 3).r).toBe(255);
    expect(editor.model.getPixel(2, 12).r).toBe(255);
    expect(editor.model.getPixel(13, 12).r).toBe(255);
  });

  it("mirroredCells avoids duplicates when the original cell lies on the center line", () => {
    editor.model = new Canvas(17, 17);
    editor.mirrorX = true;
    editor.mirrorY = true;
    expect(editor.mirroredCells(8, 8)).toEqual([{ x: 8, y: 8 }]);
  });

  it("erasePixel with both mirrors clears all reflected cells", () => {
    editor.model.setPixel(2, 3, "#00ff00");
    editor.model.setPixel(13, 3, "#00ff00");
    editor.model.setPixel(2, 12, "#00ff00");
    editor.model.setPixel(13, 12, "#00ff00");
    editor.mirrorX = true;
    editor.mirrorY = true;
    editor.erasePixel(2, 3);
    expect(editor.model.getPixel(2, 3).a).toBe(0);
    expect(editor.model.getPixel(13, 3).a).toBe(0);
    expect(editor.model.getPixel(2, 12).a).toBe(0);
    expect(editor.model.getPixel(13, 12).a).toBe(0);
  });

  it("drawLine with horizontal mirror draws the reflected line", () => {
    editor.mirrorX = true;
    editor.drawLine(1, 4, 5, 4);
    for (let x = 1; x <= 5; x++) {
      expect(editor.model.getPixel(x, 4).r).toBe(255);
    }
    for (let x = 10; x <= 14; x++) {
      expect(editor.model.getPixel(x, 4).r).toBe(255);
    }
  });

  it("drawLine with both mirrors draws four reflected lines", () => {
    editor.mirrorX = true;
    editor.mirrorY = true;
    editor.drawLine(1, 4, 5, 4);
    for (let x = 1; x <= 5; x++) {
      expect(editor.model.getPixel(x, 4).r).toBe(255);
      expect(editor.model.getPixel(x, 11).r).toBe(255);
    }
    for (let x = 10; x <= 14; x++) {
      expect(editor.model.getPixel(x, 4).r).toBe(255);
      expect(editor.model.getPixel(x, 11).r).toBe(255);
    }
  });

  it("drawing without mirrors behaves as before", () => {
    editor.paintPixel(2, 3);
    expect(editor.model.getPixel(2, 3).r).toBe(255);
    expect(editor.model.getPixel(13, 3).a).toBe(0);

    editor.drawLine(1, 4, 5, 4);
    expect(editor.model.getPixel(10, 4).a).toBe(0);
  });
});

describe("editor store (F17 shape tools #42)", () => {
  beforeEach(() => {
    editor.model = new Canvas(16, 16);
    editor.currentColor = "#ff0000";
    editor.tool = "rectangle";
    editor.shapeMode = "outline";
    editor.mirrorX = false;
    editor.mirrorY = false;
    editor.version = 0;
    editor.undoStack = [];
    editor.redoStack = [];
  });

  it("starts with outline shape mode by default", () => {
    expect(editor.shapeMode).toBe("outline");
  });

  it("setShapeMode changes the shape mode", () => {
    editor.setShapeMode("fill");
    expect(editor.shapeMode).toBe("fill");
    editor.setShapeMode("invalid");
    expect(editor.shapeMode).toBe("fill");
  });

  it("selectTool updates the last drawing tool for rectangle and circle", () => {
    editor.selectTool("rectangle");
    expect(editor.lastDrawingTool).toBe("rectangle");
    editor.selectTool("circle");
    expect(editor.lastDrawingTool).toBe("circle");
  });

  it("drawRect draws an outlined rectangle", () => {
    editor.drawRect(1, 1, 4, 3);
    expect(editor.model.getPixel(1, 1).r).toBe(255);
    expect(editor.model.getPixel(4, 3).r).toBe(255);
    expect(editor.model.getPixel(2, 2).a).toBe(0);
  });

  it("drawRect draws a filled rectangle", () => {
    editor.shapeMode = "fill";
    editor.drawRect(1, 1, 4, 3);
    expect(editor.model.getPixel(2, 2).r).toBe(255);
  });

  it("drawRect paints a single pixel when both corners match", () => {
    editor.drawRect(2, 2, 2, 2);
    expect(editor.model.getPixel(2, 2).r).toBe(255);
    const painted = editor.model.snapshot().filter((_, i) => i % 4 === 3 && _ > 0).length;
    expect(painted).toBe(1);
  });

  it("drawCircle draws an outlined circle", () => {
    editor.tool = "circle";
    editor.drawCircle(2, 2, 6, 6);
    expect(editor.model.getPixel(4, 6).r).toBe(255);
    expect(editor.model.getPixel(4, 4).a).toBe(0);
  });

  it("drawCircle draws a filled circle", () => {
    editor.tool = "circle";
    editor.shapeMode = "fill";
    editor.drawCircle(2, 2, 6, 6);
    expect(editor.model.getPixel(4, 4).r).toBe(255);
  });

  it("drawCircle paints a single pixel when both corners match", () => {
    editor.tool = "circle";
    editor.drawCircle(3, 3, 3, 3);
    expect(editor.model.getPixel(3, 3).r).toBe(255);
    const painted = editor.model.snapshot().filter((_, i) => i % 4 === 3 && _ > 0).length;
    expect(painted).toBe(1);
  });

  it("drawRect and drawCircle record the used color", () => {
    editor.currentColor = "#147df5";
    editor.drawRect(0, 0, 2, 2);
    expect(editor.recentColors).toContain("#147DF5");

    editor.recentColors = [];
    editor.drawCircle(5, 5, 7, 7);
    expect(editor.recentColors).toContain("#147DF5");
  });

  it("mirroredShapeBounds returns the original bounds when mirrors are off", () => {
    expect(editor.mirroredShapeBounds(1, 1, 4, 3)).toEqual([
      { x0: 1, y0: 1, x1: 4, y1: 3 },
    ]);
  });

  it("drawRect with horizontal mirror draws the reflected rectangle", () => {
    editor.mirrorX = true;
    editor.drawRect(1, 1, 3, 3);
    expect(editor.model.getPixel(1, 1).r).toBe(255);
    expect(editor.model.getPixel(12, 1).r).toBe(255);
    expect(editor.model.getPixel(14, 3).r).toBe(255);
  });

  it("drawCircle with both mirrors draws four reflected circles", () => {
    editor.tool = "circle";
    editor.mirrorX = true;
    editor.mirrorY = true;
    editor.drawCircle(1, 1, 3, 3);
    expect(editor.model.getPixel(2, 3).r).toBe(255);
    expect(editor.model.getPixel(13, 3).r).toBe(255);
    expect(editor.model.getPixel(2, 12).r).toBe(255);
    expect(editor.model.getPixel(13, 12).r).toBe(255);
  });

  it("the entire shape is undone as one step", () => {
    editor.beginAction();
    editor.drawRect(1, 1, 4, 4);
    editor.endAction();
    expect(editor.undoStack.length).toBe(1);
    editor.undo();
    expect(editor.model.getPixel(1, 1).a).toBe(0);
    expect(editor.model.getPixel(4, 4).a).toBe(0);
  });
});
