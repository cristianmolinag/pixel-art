import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/svelte";
import FileActions from "../../../src/lib/components/FileActions.svelte";
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
  gallery.visible = false;
  gallery.focusSave = false;
  gallery.drawings = [];
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("FileActions (F05/FR-001/FR-003)", () => {
  it("offers the New, Save and Gallery actions", () => {
    const { container } = render(FileActions);
    expect(buttonByLabel(container, "New drawing")).toBeTruthy();
    expect(buttonByLabel(container, "Save")).toBeTruthy();
    expect(buttonByLabel(container, "Gallery")).toBeTruthy();
  });

  it("Gallery opens the modal", async () => {
    const { container } = render(FileActions);
    await fireEvent.click(buttonByLabel(container, "Gallery"));
    expect(gallery.visible).toBe(true);
  });

  it("Save opens the modal focusing the name field", async () => {
    const { container } = render(FileActions);
    await fireEvent.click(buttonByLabel(container, "Save"));
    expect(gallery.visible).toBe(true);
    expect(gallery.focusSave).toBe(true);
  });

  it("New drawing opens a confirmation modal and, when accepted, clears the canvas (US4/FR-005)", async () => {
    editor.paintPixel(1, 1);

    const { container } = render(FileActions);
    await fireEvent.click(buttonByLabel(container, "New drawing"));

    expect(buttonByLabel(container, "Start new drawing")).toBeTruthy();
    await fireEvent.click(buttonByLabel(container, "Start new drawing"));

    expect(editor.model.getPixel(1, 1).a).toBe(0);
    expect(buttonByLabel(container, "Start new drawing")).toBeUndefined();
  });

  it("New drawing does not change the canvas if cancelled (US4/FR-005)", async () => {
    editor.paintPixel(1, 1);

    const { container } = render(FileActions);
    await fireEvent.click(buttonByLabel(container, "New drawing"));

    await fireEvent.click(buttonByLabel(container, "Cancel"));

    expect(editor.model.getPixel(1, 1).r).toBe(255);
  });
});