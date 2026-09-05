import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, fireEvent, waitFor } from "@testing-library/svelte";
import Gallery from "../../../src/lib/components/Gallery.svelte";
import { gallery } from "../../../src/lib/stores/gallery.svelte.js";
import { editor } from "../../../src/lib/stores/editor.svelte.js";
import { Canvas } from "../../../src/lib/models/Canvas.js";
import { resetGalleryDB } from "../../helpers.js";

function buttonByLabel(container, label) {
  return Array.from(container.querySelectorAll("button")).find(
    (b) => b.getAttribute("aria-label") === label
  );
}

function buttonByText(container, text) {
  return Array.from(container.querySelectorAll("button")).find(
    (b) => b.textContent.trim() === text
  );
}

const sampleDrawing = {
  id: 1,
  name: "Kitten",
  cols: 16,
  rows: 16,
  pixels: new Array(16 * 16 * 4).fill(0),
  thumbnail: "data:image/png;base64,AAAA",
  createdAt: 1700000000000,
  updatedAt: 1700000000000,
};

beforeEach(async () => {
  await resetGalleryDB();
  editor.model = new Canvas(16, 16);
  editor.currentColor = "#ff0000";
  editor.version = 0;
  editor.undoStack = [];
  editor.redoStack = [];
  gallery.visible = false;
  gallery.focusSave = false;
  gallery.drawings = [];
  gallery.error = "";
  gallery.saving = false;
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("Gallery (F05/FR-003)", () => {
  it("does not render the modal when closed", () => {
    const { container } = render(Gallery);
    expect(container.querySelector('[role="dialog"]')).toBeNull();
  });

  it("shows the empty state when there are no drawings (US2)", () => {
    gallery.visible = true;
    const { container } = render(Gallery);
    expect(container.querySelector('[role="dialog"]')).not.toBeNull();
    expect(container.textContent).toContain("You haven't saved any drawings yet.");
  });

  it("lists drawings with a load/delete card and the name (US2/FR-003)", () => {
    gallery.visible = true;
    gallery.drawings = [sampleDrawing];
    const { container } = render(Gallery);
    expect(buttonByLabel(container, "Load Kitten")).not.toBeNull();
    expect(buttonByLabel(container, "Delete Kitten")).not.toBeNull();
    expect(container.textContent).toContain("Kitten");
  });

  it("shows the drawing thumbnail when present", () => {
    gallery.visible = true;
    gallery.drawings = [sampleDrawing];
    const { container } = render(Gallery);
    const img = container.querySelector("img");
    expect(img).not.toBeNull();
    expect(img.src).toBe(sampleDrawing.thumbnail);
  });

  it("saving with a name creates the drawing and adds it to the list (US1/FR-002)", async () => {
    gallery.visible = true;
    const { container } = render(Gallery);
    const input = container.querySelector("input");
    await fireEvent.input(input, { target: { value: "My drawing" } });
    await fireEvent.click(buttonByText(container, "Save"));

    await waitFor(() => expect(gallery.drawings).toHaveLength(1));
    expect(gallery.drawings[0].name).toBe("My drawing");
    expect(gallery.error).toBe("");
  });

  it("reports that the name is required when trying to save empty (FR-007)", async () => {
    gallery.visible = true;
    const { container } = render(Gallery);
    const input = container.querySelector("input");
    await fireEvent.input(input, { target: { value: "" } });
    await fireEvent.click(buttonByText(container, "Save"));

    await waitFor(() => expect(gallery.error).toBe("Name is required."));
    expect(container.textContent).toContain("Name is required.");
  });

  it("loading from a card restores the drawing in the editor and closes the modal (US3/FR-004)", async () => {
    editor.model.setPixel(7, 7, "#00ff00");
    await gallery.save("Kitten");
    gallery.visible = true;
    gallery.drawings = [sampleDrawing];

    const { container } = render(Gallery);
    await fireEvent.click(buttonByLabel(container, "Load Kitten"));

    expect(editor.model.cols).toBe(16);
    expect(editor.model.rows).toBe(16);
    expect(gallery.visible).toBe(false);
  });

  it("delete with confirmation removes the drawing from the list (US5/FR-006)", async () => {
    gallery.visible = true;
    gallery.drawings = [sampleDrawing];

    const { container } = render(Gallery);
    await fireEvent.click(buttonByLabel(container, "Delete Kitten"));
    expect(buttonByLabel(container, "Confirm deletion")).not.toBeNull();
    await fireEvent.click(buttonByLabel(container, "Confirm deletion"));

    await waitFor(() => expect(gallery.drawings).toHaveLength(0));
    expect(gallery.visible).toBe(true);
  });

  it("cancelling the deletion keeps the drawing and closes the modal (US5)", async () => {
    gallery.visible = true;
    gallery.drawings = [sampleDrawing];

    const { container } = render(Gallery);
    await fireEvent.click(buttonByLabel(container, "Delete Kitten"));
    expect(container.textContent).toContain('Delete "Kitten"');
    await fireEvent.click(buttonByLabel(container, "Cancel"));

    expect(gallery.drawings).toHaveLength(1);
    expect(buttonByLabel(container, "Confirm deletion")).toBeUndefined();
  });

  it("the close button hides the modal (US2)", async () => {
    gallery.visible = true;
    gallery.drawings = [sampleDrawing];
    const { container } = render(Gallery);
    await fireEvent.click(buttonByLabel(container, "Close gallery"));
    expect(gallery.visible).toBe(false);
  });
});