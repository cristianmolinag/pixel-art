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
  editor.zoom = 1;
  editor.mirrorX = false;
  editor.mirrorY = false;
  editor.shapeMode = "outline";
  gallery.visible = false;
  gallery.focusSave = false;
  gallery.drawings = [];
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("Toolbar tools group (F03/F17/F18)", () => {
  it("renders exactly the seven drawing tools in order (FR-007)", () => {
    const { container } = render(Toolbar, { props: { mode: "tools" } });
    const buttons = Array.from(container.querySelectorAll("button")).map((b) =>
      b.getAttribute("aria-label")
    );
    expect(buttons).toEqual([
      "Brush",
      "Eraser",
      "Line",
      "Rectangle",
      "Circle",
      "Fill",
      "Eyedropper",
    ]);
    expect(container.querySelectorAll("svg").length).toBe(7);
  });

  it("does not render control buttons in the tools group (FR-007)", () => {
    const { container } = render(Toolbar, { props: { mode: "tools" } });
    expect(buttonByLabel(container, "Undo")).toBeUndefined();
    expect(buttonByLabel(container, "Redo")).toBeUndefined();
    expect(buttonByLabel(container, "Hide grid")).toBeUndefined();
    expect(buttonByLabel(container, "Zoom in")).toBeUndefined();
  });

  it("selecting a tool activates it and marks it (US1/FR-002)", async () => {
    const { container } = render(Toolbar, { props: { mode: "tools" } });
    const fillButton = buttonByLabel(container, "Fill");
    await fireEvent.click(fillButton);
    expect(editor.tool).toBe("fill");
    expect(fillButton.getAttribute("aria-pressed")).toBe("true");
  });

  it("selecting the eyedropper activates it and marks it (#40)", async () => {
    const { container } = render(Toolbar, { props: { mode: "tools" } });
    const eyedropperButton = buttonByLabel(container, "Eyedropper");
    await fireEvent.click(eyedropperButton);
    expect(editor.tool).toBe("eyedropper");
    expect(eyedropperButton.getAttribute("aria-pressed")).toBe("true");
  });

  it("selecting the rectangle tool activates it (F17)", async () => {
    const { container } = render(Toolbar, { props: { mode: "tools" } });
    const button = buttonByLabel(container, "Rectangle");
    await fireEvent.click(button);
    expect(editor.tool).toBe("rectangle");
    expect(button.getAttribute("aria-pressed")).toBe("true");
  });

  it("pressing I selects the eyedropper (#40)", async () => {
    render(Toolbar, { props: { mode: "tools" } });
    editor.tool = "brush";
    await fireEvent.keyDown(window, { key: "i" });
    expect(editor.tool).toBe("eyedropper");
  });

  it("pressing I inside an input does not select the eyedropper (#40)", async () => {
    const { container } = render(Toolbar, { props: { mode: "tools" } });
    const input = document.createElement("input");
    container.appendChild(input);
    input.focus();
    editor.tool = "brush";
    await fireEvent.keyDown(input, { key: "i" });
    expect(editor.tool).toBe("brush");
  });
});

describe("Toolbar controls group (F04/F08/F10/F15/F18)", () => {
  it("renders controls and no drawing tools (FR-007)", () => {
    const { container } = render(Toolbar, { props: { mode: "controls" } });
    expect(buttonByLabel(container, "Brush")).toBeUndefined();
    expect(buttonByLabel(container, "Rectangle")).toBeUndefined();
    expect(buttonByLabel(container, "Undo")).toBeTruthy();
    expect(buttonByLabel(container, "Redo")).toBeTruthy();
    expect(buttonByLabel(container, "Horizontal mirror")).toBeTruthy();
    expect(buttonByLabel(container, "Vertical mirror")).toBeTruthy();
    expect(buttonByLabel(container, "Hide grid")).toBeTruthy();
    expect(buttonByLabel(container, "Change canvas matrix")).toBeTruthy();
  });
});

describe("Toolbar — undo/redo (F04/FR-001)", () => {
  it("offers Undo and Redo buttons, disabled without history (FR-005)", () => {
    const { container } = render(Toolbar, { props: { mode: "controls" } });
    expect(buttonByLabel(container, "Undo").disabled).toBe(true);
    expect(buttonByLabel(container, "Redo").disabled).toBe(true);
  });

  it("enables them only when there is matching history", () => {
    editor.beginAction();
    editor.paintPixel(1, 1);
    editor.endAction();
    const { container } = render(Toolbar, { props: { mode: "controls" } });
    expect(buttonByLabel(container, "Undo").disabled).toBe(false);
    expect(buttonByLabel(container, "Redo").disabled).toBe(true);
  });

  it("clicking Undo reverts the last action (US1/FR-002)", async () => {
    editor.beginAction();
    editor.paintPixel(3, 3);
    editor.endAction();
    const { container } = render(Toolbar, { props: { mode: "controls" } });
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
    const { container } = render(Toolbar, { props: { mode: "controls" } });
    expect(buttonByLabel(container, "Redo").disabled).toBe(false);
    await fireEvent.click(buttonByLabel(container, "Redo"));
    expect(editor.model.getPixel(3, 3).r).toBe(255);
    expect(editor.canRedo).toBe(false);
  });
});

describe("Toolbar — grid toggle (F08)", () => {
  it("shows the toggle active by default (grid visible)", () => {
    const { container } = render(Toolbar, { props: { mode: "controls" } });
    const button = buttonByLabel(container, "Hide grid");
    expect(button).toBeTruthy();
    expect(button.getAttribute("aria-pressed")).toBe("true");
  });

  it("toggles the state and changes the aria-label when hiding (US1)", async () => {
    const { container } = render(Toolbar, { props: { mode: "controls" } });
    await fireEvent.click(buttonByLabel(container, "Hide grid"));
    expect(editor.showGrid).toBe(false);
    expect(buttonByLabel(container, "Show grid").getAttribute("aria-pressed")).toBe("false");
    expect(buttonByLabel(container, "Hide grid")).toBeUndefined();
  });

  it("pressing again shows the grid", async () => {
    editor.showGrid = false;
    const { container } = render(Toolbar, { props: { mode: "controls" } });
    await fireEvent.click(buttonByLabel(container, "Show grid"));
    expect(editor.showGrid).toBe(true);
  });
});

describe("Toolbar — zoom (F10)", () => {
  it("the indicator shows 100% by default", () => {
    const { container } = render(Toolbar, { props: { mode: "controls" } });
    expect(container.textContent).toContain("100%");
  });

  it("+ zooms in and − zooms out in 0.5 steps (US1)", async () => {
    const { container } = render(Toolbar, { props: { mode: "controls" } });
    await fireEvent.click(buttonByLabel(container, "Zoom in"));
    expect(editor.zoom).toBe(1.5);
    await fireEvent.click(buttonByLabel(container, "Zoom out"));
    expect(editor.zoom).toBe(1);
  });

  it("100% resets the zoom to the base size (US1)", async () => {
    const { container } = render(Toolbar, { props: { mode: "controls" } });
    editor.zoomIn();
    editor.zoomIn();
    expect(editor.zoom).toBe(2);
    await fireEvent.click(buttonByLabel(container, "Reset zoom to 100%"));
    expect(editor.zoom).toBe(1);
  });

  it("the zoom panel controls do not close the panel when used (mobile UX)", async () => {
    const { container } = render(Toolbar, { props: { mode: "controls" } });
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

  it("clicking outside the zoom toggle and panel closes the panel (F18)", async () => {
    const { container } = render(Toolbar, { props: { mode: "controls" } });
    await fireEvent.click(buttonByLabel(container, "Zoom"));
    expect(container.querySelector("[data-zoom-panel]")).toBeTruthy();
    await fireEvent.click(document.body);
    expect(container.querySelector("[data-zoom-panel]")).toBeNull();
  });

  it("pressing Escape closes the zoom panel (F18)", async () => {
    const { container } = render(Toolbar, { props: { mode: "controls" } });
    await fireEvent.click(buttonByLabel(container, "Zoom"));
    expect(container.querySelector("[data-zoom-panel]")).toBeTruthy();
    await fireEvent.keyDown(window, { key: "Escape" });
    expect(container.querySelector("[data-zoom-panel]")).toBeNull();
  });

  it("− disabled at minimum zoom (F10 limits)", () => {
    editor.zoom = 1;
    const { container } = render(Toolbar, { props: { mode: "controls" } });
    expect(buttonByLabel(container, "Zoom out").disabled).toBe(true);
    expect(buttonByLabel(container, "Zoom in").disabled).toBe(false);
  });

  it("+ disabled at maximum zoom (F10 limits)", () => {
    editor.zoom = 4;
    const { container } = render(Toolbar, { props: { mode: "controls" } });
    expect(buttonByLabel(container, "Zoom out").disabled).toBe(false);
    expect(buttonByLabel(container, "Zoom in").disabled).toBe(true);
  });
});

describe("Toolbar — mirror symmetry (F15)", () => {
  it("shows horizontal and vertical mirror toggles", () => {
    const { container } = render(Toolbar, { props: { mode: "controls" } });
    expect(buttonByLabel(container, "Horizontal mirror")).toBeTruthy();
    expect(buttonByLabel(container, "Vertical mirror")).toBeTruthy();
  });

  it("toggles horizontal mirror and marks it pressed", async () => {
    const { container } = render(Toolbar, { props: { mode: "controls" } });
    const button = buttonByLabel(container, "Horizontal mirror");
    expect(button.getAttribute("aria-pressed")).toBe("false");
    await fireEvent.click(button);
    expect(editor.mirrorX).toBe(true);
    expect(button.getAttribute("aria-pressed")).toBe("true");
  });

  it("toggles vertical mirror and marks it pressed", async () => {
    const { container } = render(Toolbar, { props: { mode: "controls" } });
    const button = buttonByLabel(container, "Vertical mirror");
    expect(button.getAttribute("aria-pressed")).toBe("false");
    await fireEvent.click(button);
    expect(editor.mirrorY).toBe(true);
    expect(button.getAttribute("aria-pressed")).toBe("true");
  });
});
