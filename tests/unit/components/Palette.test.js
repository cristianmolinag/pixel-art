import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/svelte";
import Palette from "../../../src/lib/components/Palette.svelte";
import { editor } from "../../../src/lib/stores/editor.svelte.js";

const HUE_PROPS = { left: 0, width: 160, height: 16, top: 0, right: 160, bottom: 16, x: 0, y: 0 };

function mockGradient(bar) {
  vi.spyOn(bar, "getBoundingClientRect").mockReturnValue({ ...HUE_PROPS, toJSON: () => ({}) });
}

function dragHue(bar, hue) {
  fireEvent.pointerDown(bar, { clientX: (hue / 360) * HUE_PROPS.width, pointerId: 1 });
}

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  editor.currentColor = "#000000";
  editor.recentColors = [];
});

describe("Palette (F02)", () => {
  it("shows fixed palette swatches (FR-001)", () => {
    const { container } = render(Palette);
    const swatches = container.querySelectorAll("button[aria-label^='Color ']");
    expect(swatches.length).toBeGreaterThanOrEqual(8);
  });

  it("marks the selected color with the check only (FR-002)", () => {
    editor.currentColor = "#ff0000";
    const { container } = render(Palette);
    const red = container.querySelector("button[aria-label='Color #ff0000']");
    const cls = red.className;
    expect(cls).not.toContain("scale-110");
    expect(cls).not.toContain("shadow-md");
    expect(red.querySelector("svg")).toBeTruthy();
  });

  it("marks the palette swatch with the check even when the color is normalized (FR-002)", () => {
    editor.selectColor("#ff0000");
    expect(editor.currentColor).toBe("#FF0000");
    const { container } = render(Palette);
    const red = container.querySelector("button[aria-label='Color #ff0000']");
    expect(red.className).not.toContain("scale-110");
    expect(red.className).not.toContain("shadow-md");
    expect(red.querySelector("svg")).toBeTruthy();
  });

  it("clicking a swatch changes the current color (FR-002)", async () => {
    editor.currentColor = "#000000";
    const { container } = render(Palette);
    const green = container.querySelector("button[aria-label='Color #0aff99']");
    await fireEvent.click(green);
    expect(editor.currentColor).toBe("#0AFF99");
  });
});

describe("Palette (F06 color picker)", () => {
  const openPicker = async (container) => {
    await fireEvent.click(container.querySelector("button[aria-label='Choose custom color']"));
  };

  it("the hex field lives inside the picker, not in the palette", () => {
    const { container } = render(Palette);
    expect(container.querySelector("input[aria-label='Color hex code']")).toBe(null);
  });

  it("shows the hex field with the current color when opening the picker", async () => {
    editor.currentColor = "#00ff00";
    const { container } = render(Palette);
    await openPicker(container);
    const hex = container.querySelector("input[aria-label='Color hex code']");
    expect(hex.value).toBe("#00ff00");
  });

  it("a valid hex on Enter updates the current color and normalizes", async () => {
    const { container } = render(Palette);
    await openPicker(container);
    const hex = container.querySelector("input[aria-label='Color hex code']");
    await fireEvent.input(hex, { target: { value: "#abc" } });
    await fireEvent.keyDown(hex, { key: "Enter" });
    expect(editor.currentColor).toBe("#AABBCC");
  });

  it("a valid hex without # is normalized and applied", async () => {
    const { container } = render(Palette);
    await openPicker(container);
    const hex = container.querySelector("input[aria-label='Color hex code']");
    await fireEvent.input(hex, { target: { value: "1a2b3c" } });
    await fireEvent.blur(hex);
    expect(editor.currentColor).toBe("#1A2B3C");
  });

  it("an invalid hex does not change the current color and reverts the field", async () => {
    editor.currentColor = "#123456";
    const { container } = render(Palette);
    await openPicker(container);
    const hex = container.querySelector("input[aria-label='Color hex code']");
    await fireEvent.input(hex, { target: { value: "zzz" } });
    await fireEvent.blur(hex);
    expect(editor.currentColor).toBe("#123456");
    expect(hex.value).toBe("#123456");
  });

  it("shows recent colors as swatches", () => {
    editor.recentColors = ["#FF0000", "#00FF00"];
    const { container } = render(Palette);
    const recents = container.querySelectorAll("button[aria-label^='Recent color ']");
    expect(recents.length).toBe(2);
  });

  it("clicking a recent selects it without reordering the list", async () => {
    editor.recentColors = ["#FF0000", "#00FF00"];
    const { container } = render(Palette);
    const recent = container.querySelector("button[aria-label='Recent color #00FF00']");
    await fireEvent.click(recent);
    expect(editor.currentColor).toBe("#00FF00");
    expect(editor.recentColors).toEqual(["#FF0000", "#00FF00"]);
  });

  it("marks the selected recent with the check only, like the palette", () => {
    editor.recentColors = ["#FF0000", "#00FF00"];
    editor.currentColor = "#00FF00";
    const { container } = render(Palette);
    const selected = container.querySelector("button[aria-label='Recent color #00FF00']");
    const notSelected = container.querySelector("button[aria-label='Recent color #FF0000']");
    expect(selected.className).not.toContain("shadow-md");
    expect(selected.className).not.toContain("scale-110");
    expect(selected.querySelector("svg")).toBeTruthy();
    expect(notSelected.className).not.toContain("shadow-md");
    expect(notSelected.className).not.toContain("scale-110");
    expect(notSelected.querySelector("svg")).toBeFalsy();
  });

  it("does not show the recent row when there are none", () => {
    const { container } = render(Palette);
    expect(container.querySelectorAll("button[aria-label^='Recent color ']").length).toBe(0);
  });
});

describe("Palette scroll interactions", () => {
  function getPalette(container) {
    return container.querySelector('[role="region"][aria-label="Color palette"]');
  }

  function pointerMoveWindow(opts) {
    const event = new PointerEvent("pointermove", { bubbles: true, ...opts });
    window.dispatchEvent(event);
  }

  function pointerUpWindow(opts) {
    const event = new PointerEvent("pointerup", { bubbles: true, ...opts });
    window.dispatchEvent(event);
  }

  it("mouse wheel over the palette scrolls horizontally", async () => {
    const { container } = render(Palette);
    const palette = getPalette(container);
    palette.scrollLeft = 0;
    await fireEvent.wheel(palette, { deltaY: 50 });
    expect(palette.scrollLeft).toBe(50);
  });

  it("dragging the palette scrolls horizontally", async () => {
    const { container } = render(Palette);
    const palette = getPalette(container);
    palette.scrollLeft = 100;
    await fireEvent.pointerDown(palette, {
      clientX: 100,
      pointerId: 1,
      pointerType: "mouse",
      button: 0,
    });
    pointerMoveWindow({ clientX: 80, pointerId: 1 });
    pointerUpWindow({ pointerId: 1 });
    expect(palette.scrollLeft).toBe(120);
  });

  it("a swatch click is ignored after a drag", async () => {
    editor.currentColor = "#000000";
    const { container } = render(Palette);
    const palette = getPalette(container);
    const green = container.querySelector("button[aria-label='Color #0aff99']");
    await fireEvent.pointerDown(palette, {
      clientX: 100,
      pointerId: 2,
      pointerType: "mouse",
      button: 0,
    });
    pointerMoveWindow({ clientX: 80, pointerId: 2 });
    pointerUpWindow({ pointerId: 2 });
    await fireEvent.click(green);
    expect(editor.currentColor).toBe("#000000");
  });

  it("a swatch click without dragging still selects the color", async () => {
    editor.currentColor = "#000000";
    const { container } = render(Palette);
    const green = container.querySelector("button[aria-label='Color #0aff99']");
    await fireEvent.click(green);
    expect(editor.currentColor).toBe("#0AFF99");
  });
});

describe("Palette (F06 picker custom in-app)", () => {
  it("clicking the custom color button opens the picker", async () => {
    const { container } = render(Palette);
    expect(container.querySelector('[aria-label="Color hue"]')).toBe(null);
    await fireEvent.click(container.querySelector("button[aria-label='Choose custom color']"));
    expect(container.querySelector('[aria-label="Color hue"]')).not.toBe(null);
    expect(container.querySelector("canvas")).not.toBe(null);
  });

  it("the hue bar is an accessible slider", async () => {
    editor.currentColor = "#ff0000";
    const { container } = render(Palette);
    await fireEvent.click(container.querySelector("button[aria-label='Choose custom color']"));
    const bar = container.querySelector('[aria-label="Color hue"]');
    expect(bar.getAttribute("role")).toBe("slider");
    expect(bar.getAttribute("aria-valuemin")).toBe("0");
    expect(bar.getAttribute("aria-valuemax")).toBe("360");
    expect(bar.getAttribute("aria-valuenow")).toBe("0");
  });

  it("dragging the hue updates the current color", async () => {
    editor.currentColor = "#ff0000";
    const { container } = render(Palette);
    await fireEvent.click(container.querySelector("button[aria-label='Choose custom color']"));
    const bar = container.querySelector('[aria-label="Color hue"]');
    mockGradient(bar);
    dragHue(bar, 120);
    expect(editor.currentColor).toBe("#00FF00");
    expect(bar.getAttribute("aria-valuenow")).toBe("120");
  });

  it("dragging the hue puts the hex in the text field", async () => {
    editor.currentColor = "#ff0000";
    const { container } = render(Palette);
    await fireEvent.click(container.querySelector("button[aria-label='Choose custom color']"));
    const bar = container.querySelector('[aria-label="Color hue"]');
    mockGradient(bar);
    dragHue(bar, 240);
    const hex = container.querySelector("input[aria-label='Color hex code']");
    expect(hex.value).toBe("#0000FF");
  });

  it("keyboard arrows adjust the hue", async () => {
    const { container } = render(Palette);
    await fireEvent.click(container.querySelector("button[aria-label='Choose custom color']"));
    const bar = container.querySelector('[aria-label="Color hue"]');
    await fireEvent.keyDown(bar, { key: "ArrowRight" });
    expect(bar.getAttribute("aria-valuenow")).toBe("1");
    await fireEvent.keyDown(bar, { key: "Home" });
    expect(bar.getAttribute("aria-valuenow")).toBe("0");
  });

  it("opening with an achromatic color allows choosing a hue", async () => {
    editor.currentColor = "#000000";
    const { container } = render(Palette);
    await fireEvent.click(container.querySelector("button[aria-label='Choose custom color']"));
    const bar = container.querySelector('[aria-label="Color hue"]');
    mockGradient(bar);
    dragHue(bar, 120);
    expect(editor.currentColor).toBe("#00FF00");
    expect(bar.getAttribute("aria-valuenow")).toBe("120");
  });

  it("the bar thumb positions on the chosen hue", async () => {
    editor.currentColor = "#ff0000";
    const { container } = render(Palette);
    await fireEvent.click(container.querySelector("button[aria-label='Choose custom color']"));
    const bar = container.querySelector('[aria-label="Color hue"]');
    mockGradient(bar);
    dragHue(bar, 180);
    const thumb = bar.querySelector("div");
    expect(thumb.style.left).toBe("50%");
  });

  it("the mouse wheel adjusts the hue", async () => {
    editor.currentColor = "#ff0000";
    const { container } = render(Palette);
    await fireEvent.click(container.querySelector("button[aria-label='Choose custom color']"));
    const bar = container.querySelector('[aria-label="Color hue"]');
    await fireEvent.wheel(bar, { deltaY: 120 });
    expect(bar.getAttribute("aria-valuenow")).toBe("359");
    await fireEvent.wheel(bar, { deltaY: -120 });
    expect(bar.getAttribute("aria-valuenow")).toBe("0");
  });

  it("clicking the backdrop closes the picker", async () => {
    const { container } = render(Palette);
    await fireEvent.click(container.querySelector("button[aria-label='Choose custom color']"));
    expect(container.querySelector("canvas")).not.toBe(null);
    await fireEvent.click(container.querySelector("div.fixed"));
    expect(container.querySelector("canvas")).toBe(null);
  });
});