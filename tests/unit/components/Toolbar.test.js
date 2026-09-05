import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/svelte";
import Toolbar from "../../../src/lib/components/Toolbar.svelte";
import { editor } from "../../../src/lib/stores/editor.svelte.js";
import { gallery } from "../../../src/lib/stores/gallery.svelte.js";
import { Canvas } from "../../../src/lib/models/Canvas.js";

function buttonByLabel(container, label) {
  return Array.from(container.querySelectorAll("button")).find(
    (b) => b.getAttribute("aria-label") === label
  );
}

beforeEach(() => {
  editor.tool = "brush";
  editor.currentColor = "#ff0000";
  editor.model = new Canvas(16, 16);
  editor.undoStack = [];
  editor.redoStack = [];
  editor.showGrid = true;
  gallery.visible = false;
  gallery.focusSave = false;
  gallery.drawings = [];
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("Toolbar (F03)", () => {
  it("shows Brush, Eraser, Line and Fill with icons (FR-001)", () => {
    const { container } = render(Toolbar);
    const buttons = Array.from(container.querySelectorAll("button")).map((b) =>
      b.getAttribute("aria-label")
    );
    expect(buttons).toEqual([
      "Brush",
      "Eraser",
      "Line",
      "Fill",
      "Hide grid",
      "Change canvas matrix",
      "Zoom out",
      "Zoom in",
      "Reset zoom to 100%",
      "Undo",
      "Redo",
      "Zoom",
    ]);
    expect(container.querySelectorAll("svg").length).toBeGreaterThanOrEqual(12);
  });

  it("selecting a tool activates it and marks it (US1/FR-002)", async () => {
    const { container } = render(Toolbar);
    const fillButton = buttonByLabel(container, "Fill");
    await fireEvent.click(fillButton);
    expect(editor.tool).toBe("fill");
    expect(fillButton.getAttribute("aria-pressed")).toBe("true");
  });
});

describe("Toolbar — undo/redo (F04/FR-001)", () => {
  it("offers Undo and Redo buttons, disabled without history (FR-005)", () => {
    const { container } = render(Toolbar);
    expect(buttonByLabel(container, "Undo").disabled).toBe(true);
    expect(buttonByLabel(container, "Redo").disabled).toBe(true);
  });

  it("enables them only when there is matching history", () => {
    editor.beginAction();
    editor.paintPixel(1, 1);
    editor.endAction();
    const { container } = render(Toolbar);
    expect(buttonByLabel(container, "Undo").disabled).toBe(false);
    expect(buttonByLabel(container, "Redo").disabled).toBe(true);
  });

  it("clicking Undo reverts the last action (US1/FR-002)", async () => {
    editor.beginAction();
    editor.paintPixel(3, 3);
    editor.endAction();
    const { container } = render(Toolbar);
    await fireEvent.click(buttonByLabel(container, "Undo"));
    expect(editor.model.getPixel(3, 3).a).toBe(0);
    expect(editor.canUndo).toBe(false);
    expect(editor.canRedo).toBe(true);
  });

  it("clicking Redo restores the undone action (US2/FR-003)", async () => {
    editor.beginAction();
    editor.paintPixel(3, 3);
    editor.endAction();
    editor.undo();
    const { container } = render(Toolbar);
    expect(buttonByLabel(container, "Redo").disabled).toBe(false);
    await fireEvent.click(buttonByLabel(container, "Redo"));
    expect(editor.model.getPixel(3, 3).r).toBe(255);
    expect(editor.canRedo).toBe(false);
  });
});

describe("Toolbar — grid toggle (F08)", () => {
  it("shows the toggle active by default (grid visible)", () => {
    const { container } = render(Toolbar);
    const button = buttonByLabel(container, "Hide grid");
    expect(button).toBeTruthy();
    expect(button.getAttribute("aria-pressed")).toBe("true");
  });

  it("toggles the state and changes the aria-label when hiding (US1)", async () => {
    const { container } = render(Toolbar);
    await fireEvent.click(buttonByLabel(container, "Hide grid"));
    expect(editor.showGrid).toBe(false);
    expect(buttonByLabel(container, "Show grid").getAttribute("aria-pressed")).toBe("false");
    expect(buttonByLabel(container, "Hide grid")).toBeUndefined();
  });

  it("pressing again shows the grid", async () => {
    editor.showGrid = false;
    const { container } = render(Toolbar);
    await fireEvent.click(buttonByLabel(container, "Show grid"));
    expect(editor.showGrid).toBe(true);
  });
});

describe("Toolbar — zoom (F10)", () => {
  beforeEach(() => {
    editor.zoom = 1;
  });

  it("the indicator shows 100% by default", () => {
    const { container } = render(Toolbar);
    expect(container.textContent).toContain("100%");
  });

  it("+ zooms in and − zooms out in 0.5 steps (US1)", async () => {
    const { container } = render(Toolbar);
    await fireEvent.click(buttonByLabel(container, "Zoom in"));
    expect(editor.zoom).toBe(1.5);
    await fireEvent.click(buttonByLabel(container, "Zoom out"));
    expect(editor.zoom).toBe(1);
  });

  it("100% resets the zoom to the base size (US1)", async () => {
    const { container } = render(Toolbar);
    editor.zoomIn();
    editor.zoomIn();
    expect(editor.zoom).toBe(2);
    await fireEvent.click(buttonByLabel(container, "Reset zoom to 100%"));
    expect(editor.zoom).toBe(1);
  });

  it("the zoom panel controls do not close the panel when used (mobile UX)", async () => {
    const { container } = render(Toolbar);
    const panel = () => container.querySelector("[data-zoom-panel]");
    await fireEvent.click(buttonByLabel(container, "Zoom"));
    expect(panel()).toBeTruthy();
    const inPanel = (label) =>
      panel().querySelector(`[aria-label="${label}"]`);
    await fireEvent.click(inPanel("Zoom in"));
    expect(editor.zoom).toBe(1.5);
    expect(panel()).toBeTruthy();
    await fireEvent.click(inPanel("Zoom out"));
    expect(editor.zoom).toBe(1);
    expect(panel()).toBeTruthy();
    await fireEvent.click(inPanel("Reset zoom to 100%"));
    expect(editor.zoom).toBe(1);
    expect(panel()).toBeTruthy();
  });

  it("− disabled at minimum zoom (F10 limits)", () => {
  editor.zoom = 1;
  const { container } = render(Toolbar);
  expect(buttonByLabel(container, "Zoom out").disabled).toBe(true);
  expect(buttonByLabel(container, "Zoom in").disabled).toBe(false);
});

it("+ disabled at maximum zoom (F10 limits)", () => {
  editor.zoom = 4;
  const { container } = render(Toolbar);
  expect(buttonByLabel(container, "Zoom out").disabled).toBe(false);
  expect(buttonByLabel(container, "Zoom in").disabled).toBe(true);
});

  it("selecting another tool closes the zoom panel", async () => {
    const { container } = render(Toolbar);
    await fireEvent.click(buttonByLabel(container, "Zoom"));
    expect(container.querySelector("[data-zoom-panel]")).toBeTruthy();
    await fireEvent.click(buttonByLabel(container, "Eraser"));
    expect(container.querySelector("[data-zoom-panel]")).toBeNull();
  });
});