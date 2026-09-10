import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/svelte";
import { tick } from "svelte";
import App from "../../src/App.svelte";
import { editor } from "../../src/lib/stores/editor.svelte.js";
import { gallery } from "../../src/lib/stores/gallery.svelte.js";
import { Canvas } from "../../src/lib/models/Canvas.js";

const RECT = {
  width: 320,
  height: 320,
  left: 0,
  top: 0,
  right: 320,
  bottom: 320,
  x: 0,
  y: 0,
  toJSON: () => ({}),
};

function installCanvas() {
  const ctx = {
    setTransform: vi.fn(),
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    fillStyle: null,
    globalAlpha: 1,
  };
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue(RECT);
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(ctx);
  return ctx;
}

beforeEach(() => {
  installCanvas();
  editor.model = new Canvas(16, 16);
  editor.currentColor = "#000000";
  editor.tool = "brush";
  editor.undoStack = [];
  editor.redoStack = [];
  editor.showGrid = true;
  editor.zoom = 1;
  editor.panX = 0;
  editor.panY = 0;
  editor.spaceHeld = false;
  editor.pendingSave = false;
  editor.pendingExport = false;
  gallery.visible = false;
  gallery.drawings = [];
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("App keyboard shortcuts (F19 #50)", () => {
  it("tool keys activate tools through the single global handler", async () => {
    render(App);
    await tick();
    await fireEvent.keyDown(window, { key: "e" });
    expect(editor.tool).toBe("eraser");
    await fireEvent.keyDown(window, { key: "R" });
    expect(editor.tool).toBe("rectangle");
    await fireEvent.keyDown(window, { key: "i" });
    expect(editor.tool).toBe("eyedropper");
  });

  it("pressing G toggles the grid exactly once (single registration, FR-008)", async () => {
    render(App);
    await tick();
    editor.showGrid = true;
    await fireEvent.keyDown(window, { key: "g" });
    expect(editor.showGrid).toBe(false);
    await fireEvent.keyDown(window, { key: "g" });
    expect(editor.showGrid).toBe(true);
  });

  it("+ and - zoom by ZOOM_STEP and 0 resets (FR-003)", async () => {
    render(App);
    await tick();
    await fireEvent.keyDown(window, { key: "+" });
    expect(editor.zoom).toBe(1.5);
    await fireEvent.keyDown(window, { key: "=" });
    expect(editor.zoom).toBe(2);
    await fireEvent.keyDown(window, { key: "-" });
    expect(editor.zoom).toBe(1.5);
    await fireEvent.keyDown(window, { key: "_" });
    expect(editor.zoom).toBe(1);
    editor.panX = 12;
    editor.panY = -7;
    await fireEvent.keyDown(window, { key: "0" });
    expect(editor.zoom).toBe(1);
    expect(editor.panX).toBe(0);
    expect(editor.panY).toBe(0);
  });

  it("Ctrl+Z undoes and Ctrl+Shift+Z/Ctrl+Y redo (FR-004)", async () => {
    render(App);
    await tick();
    editor.beginAction();
    editor.paintPixel(3, 3);
    editor.endAction();
    await fireEvent.keyDown(window, { key: "z", ctrlKey: true });
    expect(editor.model.getPixel(3, 3).a).toBe(0);
    expect(editor.canRedo).toBe(true);
    await fireEvent.keyDown(window, { key: "z", ctrlKey: true, shiftKey: true });
    expect(editor.model.getPixel(3, 3).a).toBe(255);
    await fireEvent.keyDown(window, { key: "z", ctrlKey: true });
    expect(editor.model.getPixel(3, 3).a).toBe(0);
    await fireEvent.keyDown(window, { key: "y", ctrlKey: true });
    expect(editor.model.getPixel(3, 3).a).toBe(255);
    expect(editor.canRedo).toBe(false);
  });

  it("Ctrl+S opens the save modal via the pending flag (#50)", async () => {
    const { container } = render(App);
    await tick();
    await fireEvent.keyDown(window, { key: "s", ctrlKey: true });
    expect(container.querySelector('[aria-label="Save drawing"]')).not.toBeNull();
    expect(editor.pendingSave).toBe(false);
  });

  it("Ctrl+E opens the export modal via the pending flag (#50)", async () => {
    const { container } = render(App);
    await tick();
    await fireEvent.keyDown(window, { key: "e", ctrlKey: true });
    expect(container.querySelector('[aria-label="Export drawing"]')).not.toBeNull();
    expect(editor.pendingExport).toBe(false);
  });

  it("Space arms pan mode and keyup disarms it (FR-006)", async () => {
    render(App);
    await tick();
    await fireEvent.keyDown(window, { key: " " });
    expect(editor.spaceHeld).toBe(true);
    await fireEvent.keyUp(window, { key: " " });
    expect(editor.spaceHeld).toBe(false);
  });

  it("typing in an input ignores every shortcut (FR-007)", async () => {
    render(App);
    await tick();
    const input = document.createElement("input");
    document.body.appendChild(input);
    input.focus();
    await fireEvent.keyDown(input, { key: "b" });
    await fireEvent.keyDown(input, { key: "g" });
    await fireEvent.keyDown(input, { key: "0" });
    expect(editor.tool).toBe("brush");
    expect(editor.showGrid).toBe(true);
    expect(editor.zoom).toBe(1);
    input.remove();
  });

  it("unclaimed browser combos such as Ctrl+0 do nothing (FR-009)", async () => {
    render(App);
    await tick();
    editor.zoom = 2;
    await fireEvent.keyDown(window, { key: "0", ctrlKey: true });
    expect(editor.zoom).toBe(2);
    await fireEvent.keyDown(window, { key: "s", altKey: true });
    expect(editor.pendingSave).toBe(false);
  });
});
