import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/svelte";
import { tick } from "svelte";
import PixelCanvas from "../../../src/lib/components/PixelCanvas.svelte";
import { editor } from "../../../src/lib/stores/editor.svelte.js";
import { Canvas } from "../../../src/lib/models/Canvas.js";
import { GRID_COLOR, GRID_ALPHA } from "../../../src/lib/canvas/draw.js";

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

beforeEach(() => {
  editor.model = new Canvas(16, 16);
  editor.currentColor = "#ff0000";
  editor.version = 0;
  editor.showGrid = true;
  editor.zoom = 1;
  editor.panX = 0;
  editor.panY = 0;
  editor.spaceHeld = false;
  editor.referenceVisible = false;
  editor.referenceOpacity = 0.5;
  editor.referenceVersion = 0;
  editor._referenceImage = null;
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function installCanvas() {
  const operations = [];
  const alphas = [];
  const ctx = {
    _alpha: 1,
    get globalAlpha() {
      return this._alpha;
    },
    set globalAlpha(v) {
      this._alpha = v;
      alphas.push(v);
    },
    fillStyle: null,
    setTransform: vi.fn((...a) => operations.push(["setTransform", a])),
    clearRect: vi.fn((...a) => operations.push(["clearRect", a])),
    fillRect: vi.fn((...a) => operations.push(["fillRect", a])),
    drawImage: vi.fn(),
  };
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue(RECT);
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(ctx);
  return { ctx, operations, alphas };
}

function getCanvas(container) {
  return container.querySelector("canvas");
}

describe("PixelCanvas (F08 grid on canvas at device resolution)", () => {
  it("draws complete grid lines on every border", async () => {
    const { operations } = installCanvas();
    const { container } = render(PixelCanvas);
    await tick();

    const c = getCanvas(container);
    expect(c.width).toBe(320);
    expect(c.height).toBe(320);

    const grid = operations.filter(([op]) => op === "fillRect");
    // 17 vertical (full border) + 17 rows x 16 horizontal segments = 289
    expect(grid).toHaveLength(289);
    expect(grid[0]).toEqual(["fillRect", [0, 0, 1, 320]]);
    expect(grid).toEqual(
      expect.arrayContaining([
        ["fillRect", [320, 0, 1, 320]],
        ["fillRect", [1, 320, 19, 1]],
        ["fillRect", [1, 0, 19, 1]],
      ]),
    );
  });

  it("draws the guide with the subtle GRID_ALPHA opacity and restores alpha", async () => {
    const { operations, alphas } = installCanvas();
    render(PixelCanvas);
    await tick();

    expect(alphas).toEqual(expect.arrayContaining([GRID_ALPHA, 1]));
    expect(operations.some(([op]) => op === "fillRect")).toBe(true);
  });

  it("does not draw the grid when showGrid is false", async () => {
    editor.showGrid = false;
    const { operations } = installCanvas();
    render(PixelCanvas);
    await tick();

    expect(operations.some(([op]) => op === "fillRect")).toBe(false);
    expect(editor.showGrid).toBe(false);
  });

  it("the background keeps the base white color", () => {
    const { container } = render(PixelCanvas);
    expect(getCanvas(container).style.backgroundColor).toBe("rgb(255, 255, 255)");
  });
});

describe("PixelCanvas (F10 zoom/pan in the draw)", () => {
  it("draws the guide with Math.round(dpr) thickness so it is visible on mobile", async () => {
    window.devicePixelRatio = 2;
    const { operations } = installCanvas();
    render(PixelCanvas);
    await tick();

    const grid = operations.filter(([op]) => op === "fillRect");
    expect(grid).toEqual(expect.arrayContaining([["fillRect", [0, 0, 2, 640]]]));
    window.devicePixelRatio = 1;
  });

  it("aligns the grid with different cell sizes per axis (non-square matrices)", async () => {
    editor.model = new Canvas(16, 32);
    const { operations } = installCanvas();
    render(PixelCanvas);
    await tick();

    const grid = operations.filter(([op]) => op === "fillRect");
    expect(grid[0]).toEqual(["fillRect", [0, 0, 1, 320]]);
    expect(grid).toEqual(expect.arrayContaining([["fillRect", [1, 10, 19, 1]]]));
  });

  it("repaints a drawn pixel after render (version)", async () => {
    const { operations } = installCanvas();
    const { container } = render(PixelCanvas);
    await tick();

    editor.paintPixel(0, 0);
    await tick();

    expect(operations).toEqual(expect.arrayContaining([["fillRect", [0, 0, 20, 20]]]));
  });

  it("renders at device resolution and applies zoom/pan in the draw", async () => {
    editor.model.setPixel(0, 0, "#ff0000");
    const { operations } = installCanvas();
    const { container } = render(PixelCanvas);
    await tick();

    expect(operations).toEqual(expect.arrayContaining([["fillRect", [0, 0, 20, 20]]]));

    editor.zoom = 2;
    editor.panX = 10;
    editor.panY = -5;
    await tick();

    // content 640, left=(320-640)/2+10=-150, top=(320-640)/2-5=-165, cell 40px
    expect(operations).toEqual(expect.arrayContaining([["fillRect", [-150, -165, 40, 40]]]));
    expect(getCanvas(container).style.transform).toBe("");
  });

  it("Ctrl + drag moves the view without painting (US2)", async () => {
    const { container } = render(PixelCanvas);
    const c = getCanvas(container);
    await fireEvent.pointerDown(c, { pointerId: 1, clientX: 10, clientY: 10, ctrlKey: true });
    await fireEvent.pointerMove(c, { pointerId: 1, clientX: 40, clientY: 30, ctrlKey: true });
    await fireEvent.pointerUp(c, { pointerId: 1, ctrlKey: true });
    await tick();
    expect(editor.panX).toBe(30);
    expect(editor.panY).toBe(20);
    const anyPainted = editor.model.snapshot().some((v, i) => v !== 0 && i % 4 === 3);
    expect(anyPainted).toBe(false);
  });

  it("pinching with two fingers changes the zoom continuously (US3)", async () => {
    const { container } = render(PixelCanvas);
    const c = getCanvas(container);
    await fireEvent.pointerDown(c, { pointerId: 1, clientX: 100, clientY: 100 });
    await fireEvent.pointerDown(c, { pointerId: 2, clientX: 200, clientY: 100 });
    await fireEvent.pointerMove(c, { pointerId: 2, clientX: 300, clientY: 100 });
    await tick();
    expect(editor.zoom).toBeCloseTo(2, 5);
    await fireEvent.pointerUp(c, { pointerId: 1 });
    await fireEvent.pointerUp(c, { pointerId: 2 });
  });

  it("a two-finger touch pinch does not paint a pixel", async () => {
    installCanvas();
    const { container } = render(PixelCanvas);
    const c = getCanvas(container);
    await fireEvent.pointerDown(c, { pointerId: 1, clientX: 100, clientY: 100, pointerType: "touch" });
    await fireEvent.pointerDown(c, { pointerId: 2, clientX: 200, clientY: 100, pointerType: "touch" });
    await fireEvent.pointerMove(c, { pointerId: 2, clientX: 300, clientY: 100, pointerType: "touch" });
    await fireEvent.pointerUp(c, { pointerId: 1 });
    await fireEvent.pointerUp(c, { pointerId: 2 });
    const anyPainted = editor.model.snapshot().some((v, i) => v !== 0 && i % 4 === 3);
    expect(anyPainted).toBe(false);
  });

  it("a touch tap paints a single pixel", async () => {
    installCanvas();
    const { container } = render(PixelCanvas);
    const c = getCanvas(container);
    await fireEvent.pointerDown(c, { pointerId: 1, clientX: 160, clientY: 160, pointerType: "touch" });
    await fireEvent.pointerUp(c, { pointerId: 1 });
    expect(editor.model.getPixel(8, 8).a).toBeGreaterThan(0);
  });

  it("a touch drag paints the dragged cells", async () => {
    installCanvas();
    const { container } = render(PixelCanvas);
    const c = getCanvas(container);
    await fireEvent.pointerDown(c, { pointerId: 1, clientX: 160, clientY: 160, pointerType: "touch" });
    await fireEvent.pointerMove(c, { pointerId: 1, clientX: 180, clientY: 160, pointerType: "touch" });
    await fireEvent.pointerUp(c, { pointerId: 1 });
    expect(editor.model.getPixel(8, 8).a).toBeGreaterThan(0);
    expect(editor.model.getPixel(9, 8).a).toBeGreaterThan(0);
  });

  it("panning with two fingers moves the canvas (US2)", async () => {
    editor.zoom = 2;
    const { container } = render(PixelCanvas);
    const c = getCanvas(container);
    await fireEvent.pointerDown(c, { pointerId: 1, clientX: 100, clientY: 100, pointerType: "touch" });
    await fireEvent.pointerDown(c, { pointerId: 2, clientX: 200, clientY: 100, pointerType: "touch" });
    await fireEvent.pointerMove(c, { pointerId: 1, clientX: 150, clientY: 100, pointerType: "touch" });
    await fireEvent.pointerMove(c, { pointerId: 2, clientX: 250, clientY: 100, pointerType: "touch" });
    await tick();
    expect(editor.panX).toBe(50);
    expect(editor.panY).toBe(0);
    await fireEvent.pointerUp(c, { pointerId: 1 });
    await fireEvent.pointerUp(c, { pointerId: 2 });
  });

  it("a touch held still paints after the grace period", async () => {
    vi.useFakeTimers();
    installCanvas();
    const { container } = render(PixelCanvas);
    const c = getCanvas(container);
    await fireEvent.pointerDown(c, { pointerId: 1, clientX: 160, clientY: 160, pointerType: "touch" });
    expect(editor.model.getPixel(8, 8).a).toBe(0);
    vi.advanceTimersByTime(150);
    await tick();
    expect(editor.model.getPixel(8, 8).a).toBeGreaterThan(0);
    await fireEvent.pointerUp(c, { pointerId: 1 });
    vi.useRealTimers();
  });

  it("painting with zoom paints the correct cell (mapping inverts zoom)", async () => {
    editor.zoom = 2;
    installCanvas();
    const { container } = render(PixelCanvas);
    const c = getCanvas(container);
    await fireEvent.pointerDown(c, { pointerId: 1, clientX: 240, clientY: 320 });
    await fireEvent.pointerUp(c, { pointerId: 1 });
    // content 640, left=(320-640)/2=-160; (240/320→12 with the old mapping)
    expect(editor.model.getPixel(10, 12).a).toBeGreaterThan(0);
    expect(editor.model.getPixel(12, 12).a).toBe(0);
  });

  it("painting with zoom + pan paints the correct cell (mapping inverts pan)", async () => {
    editor.zoom = 2;
    editor.panX = 10;
    editor.panY = -5;
    installCanvas();
    const { container } = render(PixelCanvas);
    const c = getCanvas(container);
    // left=(320-640)/2+10=-150, top=(320-640)/2-5=-165, cell 40px
    await fireEvent.pointerDown(c, { pointerId: 1, clientX: -30, clientY: -5 });
    await fireEvent.pointerUp(c, { pointerId: 1 });
    expect(editor.model.getPixel(3, 4).a).toBeGreaterThan(0);
    expect(editor.model.getPixel(0, 0).a).toBe(0);
  });

  it("shows a brief hint on how to move when zooming and hides it after 3s", async () => {
    vi.useFakeTimers();
    installCanvas();
    const { container } = render(PixelCanvas);
    await tick();
    expect(container.querySelector("[data-pan-hint]").getAttribute("aria-hidden")).toBe("true");

    editor.zoom = 2;
    await tick();
    const hint = container.querySelector("[data-pan-hint]");
    expect(hint.getAttribute("aria-hidden")).toBe("false");
    expect(hint.textContent).toContain("Move");

    vi.advanceTimersByTime(3001);
    await tick();
    expect(hint.getAttribute("aria-hidden")).toBe("true");
    vi.useRealTimers();
  });
});

describe("PixelCanvas (F19 space pan #50)", () => {
  beforeEach(() => {
    editor.model = new Canvas(16, 16);
    editor.currentColor = "#ff0000";
    editor.tool = "brush";
    editor.spaceHeld = false;
    editor.version = 0;
    editor.zoom = 1;
    editor.panX = 0;
    editor.panY = 0;
  });

  it("Space + drag pans the view without painting (#50)", async () => {
    const { container } = render(PixelCanvas);
    const c = getCanvas(container);
    editor.spaceHeld = true;
    await fireEvent.pointerDown(c, { pointerId: 1, clientX: 10, clientY: 10 });
    await fireEvent.pointerMove(c, { pointerId: 1, clientX: 40, clientY: 30 });
    await fireEvent.pointerUp(c, { pointerId: 1 });
    await tick();
    expect(editor.panX).toBe(30);
    expect(editor.panY).toBe(20);
    const anyPainted = editor.model.snapshot().some((v, i) => v !== 0 && i % 4 === 3);
    expect(anyPainted).toBe(false);
  });

  it("Space + click without drag paints nothing (#50)", async () => {
    const { container } = render(PixelCanvas);
    const c = getCanvas(container);
    editor.spaceHeld = true;
    await fireEvent.pointerDown(c, { pointerId: 1, clientX: 160, clientY: 160 });
    await fireEvent.pointerUp(c, { pointerId: 1 });
    expect(editor.panX).toBe(0);
    expect(editor.model.getPixel(8, 8).a).toBe(0);
  });

  it("painting works again after Space is released (#50)", async () => {
    installCanvas();
    const { container } = render(PixelCanvas);
    const c = getCanvas(container);
    editor.spaceHeld = true;
    await fireEvent.pointerDown(c, { pointerId: 1, clientX: 10, clientY: 10 });
    await fireEvent.pointerUp(c, { pointerId: 1 });
    editor.spaceHeld = false;
    await fireEvent.pointerDown(c, { pointerId: 1, clientX: 160, clientY: 160 });
    await fireEvent.pointerUp(c, { pointerId: 1 });
    expect(editor.model.getPixel(8, 8).a).toBeGreaterThan(0);
  });

  it("shows the grab cursor while Space is held (#50)", async () => {
    const { container } = render(PixelCanvas);
    const c = getCanvas(container);
    expect(c.className).toContain("cursor-default");
    editor.spaceHeld = true;
    await tick();
    expect(c.className).toContain("cursor-grab");
  });
});

describe("PixelCanvas (F03 eyedropper extension #40)", () => {
  beforeEach(() => {
    editor.model = new Canvas(16, 16);
    editor.currentColor = "#ff0000";
    editor.tool = "brush";
    editor.lastDrawingTool = "brush";
    editor.version = 0;
    editor.zoom = 1;
    editor.panX = 0;
    editor.panY = 0;
  });

  it("clicking a painted pixel with the eyedropper sets the current color and returns to brush", async () => {
    installCanvas();
    editor.model.setPixel(8, 8, "#147df5");
    const { container } = render(PixelCanvas);
    const c = getCanvas(container);
    editor.selectTool("eyedropper");
    await fireEvent.pointerDown(c, { pointerId: 1, clientX: 160, clientY: 160 });
    await fireEvent.pointerUp(c, { pointerId: 1 });
    expect(editor.currentColor).toBe("#147DF5");
    expect(editor.tool).toBe("brush");
  });

  it("the eyedropper does not paint pixels", async () => {
    installCanvas();
    editor.model.setPixel(8, 8, "#147df5");
    const { container } = render(PixelCanvas);
    const c = getCanvas(container);
    editor.selectTool("eyedropper");
    await fireEvent.pointerDown(c, { pointerId: 1, clientX: 160, clientY: 160 });
    await fireEvent.pointerUp(c, { pointerId: 1 });
    // Only the original sampled pixel is painted; the click did not add new paint.
    expect(editor.model.getPixel(8, 8).b).toBe(245);
    expect(editor.model.getPixel(8, 8).a).toBe(255);
    const paintedCount = editor.model.snapshot().filter((_, i) => i % 4 === 3 && _ > 0).length;
    expect(paintedCount).toBe(1);
  });

  it("a touch tap with the eyedropper samples the pixel", async () => {
    installCanvas();
    editor.model.setPixel(8, 8, "#0aefff");
    const { container } = render(PixelCanvas);
    const c = getCanvas(container);
    editor.selectTool("eyedropper");
    await fireEvent.pointerDown(c, { pointerId: 1, clientX: 160, clientY: 160, pointerType: "touch" });
    await fireEvent.pointerUp(c, { pointerId: 1 });
    expect(editor.currentColor).toBe("#0AEFFF");
    expect(editor.tool).toBe("brush");
  });

  it("sampling a transparent pixel with the eyedropper switches to the eraser", async () => {
    installCanvas();
    const { container } = render(PixelCanvas);
    const c = getCanvas(container);
    editor.selectTool("line");
    editor.selectTool("eyedropper");
    await fireEvent.pointerDown(c, { pointerId: 1, clientX: 160, clientY: 160 });
    await fireEvent.pointerUp(c, { pointerId: 1 });
    expect(editor.tool).toBe("eraser");
    expect(editor.lastDrawingTool).toBe("line");
  });
});

describe("PixelCanvas (F17 shape tools #42)", () => {
  beforeEach(() => {
    editor.model = new Canvas(16, 16);
    editor.currentColor = "#ff0000";
    editor.shapeMode = "outline";
    editor.version = 0;
    editor.zoom = 1;
    editor.panX = 0;
    editor.panY = 0;
  });

  it("dragging with the rectangle tool paints a rectangle", async () => {
    installCanvas();
    const { container } = render(PixelCanvas);
    const c = getCanvas(container);
    editor.selectTool("rectangle");
    await fireEvent.pointerDown(c, { pointerId: 1, clientX: 80, clientY: 80 });
    await fireEvent.pointerMove(c, { pointerId: 1, clientX: 140, clientY: 120 });
    await fireEvent.pointerUp(c, { pointerId: 1 });
    expect(editor.model.getPixel(4, 4).r).toBe(255);
    expect(editor.model.getPixel(7, 6).r).toBe(255);
  });

  it("dragging with the circle tool paints a circle", async () => {
    installCanvas();
    const { container } = render(PixelCanvas);
    const c = getCanvas(container);
    editor.selectTool("circle");
    await fireEvent.pointerDown(c, { pointerId: 1, clientX: 80, clientY: 80 });
    await fireEvent.pointerMove(c, { pointerId: 1, clientX: 140, clientY: 140 });
    await fireEvent.pointerUp(c, { pointerId: 1 });
    expect(editor.model.getPixel(5, 4).r).toBe(255);
  });

  it("a single click with a shape tool paints one pixel", async () => {
    installCanvas();
    const { container } = render(PixelCanvas);
    const c = getCanvas(container);
    editor.selectTool("rectangle");
    await fireEvent.pointerDown(c, { pointerId: 1, clientX: 160, clientY: 160 });
    await fireEvent.pointerUp(c, { pointerId: 1 });
    const painted = editor.model.snapshot().filter((v, i) => i % 4 === 3 && v > 0).length;
    expect(painted).toBe(1);
    expect(editor.model.getPixel(8, 8).r).toBe(255);
  });

  it("fill mode paints the shape interior", async () => {
    installCanvas();
    const { container } = render(PixelCanvas);
    const c = getCanvas(container);
    editor.selectTool("rectangle");
    editor.shapeMode = "fill";
    await fireEvent.pointerDown(c, { pointerId: 1, clientX: 80, clientY: 80 });
    await fireEvent.pointerMove(c, { pointerId: 1, clientX: 140, clientY: 120 });
    await fireEvent.pointerUp(c, { pointerId: 1 });
    expect(editor.model.getPixel(5, 5).r).toBe(255);
  });
});

describe("PixelCanvas (F19 reference overlay #43)", () => {
  const fakeImage = () => ({ width: 32, height: 32 });

  it("draws the reference stretched over the full content rect before pixels and grid", async () => {
    const { ctx, alphas } = installCanvas();
    editor.setReferenceImage(fakeImage());
    render(PixelCanvas);
    await tick();

    expect(ctx.drawImage).toHaveBeenCalledWith(fakeImage(), 0, 0, 320, 320);
    // The reference is drawn first: after the draw's own reset (1), its opacity
    // is the very next alpha set, before the grid's GRID_ALPHA and any pixel.
    expect(alphas.slice(0, 2)).toEqual([1, 0.5]);
    expect(alphas).toContain(GRID_ALPHA);
  });

  it("does not draw the reference when the layer is hidden", async () => {
    const { ctx } = installCanvas();
    editor.setReferenceImage(fakeImage());
    editor.toggleReference();
    render(PixelCanvas);
    await tick();

    expect(ctx.drawImage).not.toHaveBeenCalled();
    expect(editor.hasReferenceImage).toBe(true);
  });

  it("does not draw anything without a loaded image", async () => {
    const { ctx } = installCanvas();
    editor.referenceVisible = true;
    render(PixelCanvas);
    await tick();

    expect(ctx.drawImage).not.toHaveBeenCalled();
  });

  it("applies the opacity slider value to the reference alpha", async () => {
    const { ctx, alphas } = installCanvas();
    editor.setReferenceImage(fakeImage());
    editor.setReferenceOpacity(0.25);
    render(PixelCanvas);
    await tick();

    expect(ctx.drawImage).toHaveBeenCalledTimes(1);
    expect(alphas[1]).toBe(0.25);
  });

  it("redraws when the opacity changes (real time)", async () => {
    const { ctx, alphas } = installCanvas();
    editor.setReferenceImage(fakeImage());
    render(PixelCanvas);
    await tick();
    const firstDraws = ctx.drawImage.mock.calls.length;
    const alphasAfterFirstDraw = alphas.length;

    editor.setReferenceOpacity(0.1);
    await tick();
    expect(ctx.drawImage.mock.calls.length).toBe(firstDraws + 1);
    expect(alphas.slice(alphasAfterFirstDraw)).toEqual([1, 0.1, 1, GRID_ALPHA, 1]);
  });

  it("toggling the layer off stops drawing it; toggling on redraws it", async () => {
    const { ctx } = installCanvas();
    editor.setReferenceImage(fakeImage());
    render(PixelCanvas);
    await tick();
    const withReference = ctx.drawImage.mock.calls.length;

    editor.toggleReference();
    await tick();
    expect(ctx.drawImage.mock.calls.length).toBe(withReference);

    editor.toggleReference();
    await tick();
    expect(ctx.drawImage.mock.calls.length).toBe(withReference + 1);
  });

  it("removing the image stops drawing it", async () => {
    const { ctx } = installCanvas();
    editor.setReferenceImage(fakeImage());
    render(PixelCanvas);
    await tick();
    const drawnBefore = ctx.drawImage.mock.calls.length;

    editor.removeReferenceImage();
    await tick();
    expect(editor.hasReferenceImage).toBe(false);
    expect(ctx.drawImage.mock.calls.length).toBe(drawnBefore);
  });

  it("loaded pixels keep painting above the reference", async () => {
    installCanvas();
    editor.setReferenceImage(fakeImage());
    const { container } = render(PixelCanvas);
    await tick();

    editor.paintPixel(3, 3);
    await tick();
    expect(editor.model.getPixel(3, 3).r).toBe(255);
    expect(container.querySelector("canvas")).toBeTruthy();
  });
});
