import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/svelte";
import { tick } from "svelte";
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
  editor.pendingSave = false;
  editor.pendingExport = false;
  gallery.visible = false;
  gallery.drawings = [];
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("FileActions (F05/FR-001/FR-003)", () => {
  it("offers the New, Save, Export and Gallery actions", () => {
    const { container } = render(FileActions);
    expect(buttonByLabel(container, "New drawing")).toBeTruthy();
    expect(buttonByLabel(container, "Save")).toBeTruthy();
    expect(buttonByLabel(container, "Export")).toBeTruthy();
    expect(buttonByLabel(container, "Gallery")).toBeTruthy();
  });

  it("Export opens the export modal", async () => {
    const { container } = render(FileActions);
    await fireEvent.click(buttonByLabel(container, "Export"));
    expect(container.querySelector('[aria-label="Export drawing"]')).not.toBeNull();
  });

  it("Export modal shows all scale options and defaults to 4x", async () => {
    const { container } = render(FileActions);
    await fireEvent.click(buttonByLabel(container, "Export"));

    expect(buttonByLabel(container, "Export at 1x")).toBeTruthy();
    expect(buttonByLabel(container, "Export at 2x")).toBeTruthy();
    expect(buttonByLabel(container, "Export at 4x")).toBeTruthy();
    expect(buttonByLabel(container, "Export at 8x")).toBeTruthy();
    expect(buttonByLabel(container, "Export at 4x").getAttribute("aria-pressed")).toBe("true");
  });

  it("Export modal previews scaled dimensions", async () => {
    const { container } = render(FileActions);
    await fireEvent.click(buttonByLabel(container, "Export"));

    expect(container.textContent).toContain("16×16 → 64×64");
  });

  it("Gallery opens the modal", async () => {
    const { container } = render(FileActions);
    await fireEvent.click(buttonByLabel(container, "Gallery"));
    expect(gallery.visible).toBe(true);
  });

  it("Save opens the save modal", async () => {
    const { container } = render(FileActions);
    await fireEvent.click(buttonByLabel(container, "Save"));
    expect(gallery.visible).toBe(false);
    expect(container.querySelector('[aria-label="Save drawing"]')).not.toBeNull();
  });

  it("surfaces shortcut hints in Save and Export titles (F19)", () => {
    const { container } = render(FileActions);
    expect(buttonByLabel(container, "Save").getAttribute("title")).toBe("Save (Ctrl+S)");
    expect(buttonByLabel(container, "Export").getAttribute("title")).toBe("Export (Ctrl+E)");
  });

  it("the pendingSave flag opens the save modal and is consumed (#50)", async () => {
    const { container } = render(FileActions);
    editor.pendingSave = true;
    await tick();
    expect(container.querySelector('[aria-label="Save drawing"]')).not.toBeNull();
    expect(editor.pendingSave).toBe(false);
  });

  it("the pendingExport flag opens the export modal and is consumed (#50)", async () => {
    const { container } = render(FileActions);
    editor.pendingExport = true;
    await tick();
    expect(container.querySelector('[aria-label="Export drawing"]')).not.toBeNull();
    expect(editor.pendingExport).toBe(false);
  });

  it("the pending flags do not open modals when already consumed (false)", async () => {
    const { container } = render(FileActions);
    await tick();
    expect(container.querySelector('[aria-label="Save drawing"]')).toBeNull();
    expect(container.querySelector('[aria-label="Export drawing"]')).toBeNull();
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