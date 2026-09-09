import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/svelte";
import ShapeModePill from "../../../src/lib/components/ShapeModePill.svelte";
import { editor } from "../../../src/lib/stores/editor.svelte.js";

function buttonByLabel(container, label) {
  return Array.from(container.querySelectorAll("button")).find(
    (b) => b.getAttribute("aria-label") === label
  );
}

beforeEach(() => {
  editor.tool = "brush";
  editor.shapeMode = "outline";
});

afterEach(() => {
  cleanup();
});

describe("ShapeModePill (F17/F18)", () => {
  it("renders nothing for non-shape tools", () => {
    const { container } = render(ShapeModePill);
    expect(container.querySelector(".shape-pill")).toBeNull();
  });

  it("renders Outline and Fill when a shape tool is active", () => {
    editor.tool = "rectangle";
    const { container } = render(ShapeModePill);
    expect(buttonByLabel(container, "Outline mode")).toBeTruthy();
    expect(buttonByLabel(container, "Fill mode")).toBeTruthy();
  });

  it("marks the active mode as pressed", () => {
    editor.tool = "circle";
    editor.shapeMode = "outline";
    const { container } = render(ShapeModePill);
    expect(buttonByLabel(container, "Outline mode").getAttribute("aria-pressed")).toBe("true");
    expect(buttonByLabel(container, "Fill mode").getAttribute("aria-pressed")).toBe("false");
  });

  it("toggles shape mode to fill and marks it pressed", async () => {
    editor.tool = "circle";
    const { container } = render(ShapeModePill);
    const fillButton = buttonByLabel(container, "Fill mode");
    await fireEvent.click(fillButton);
    expect(editor.shapeMode).toBe("fill");
    expect(fillButton.getAttribute("aria-pressed")).toBe("true");
  });

  it("switches back to outline and marks it pressed", async () => {
    editor.tool = "rectangle";
    editor.shapeMode = "fill";
    const { container } = render(ShapeModePill);
    const outlineButton = buttonByLabel(container, "Outline mode");
    await fireEvent.click(outlineButton);
    expect(editor.shapeMode).toBe("outline");
    expect(outlineButton.getAttribute("aria-pressed")).toBe("true");
  });
});
