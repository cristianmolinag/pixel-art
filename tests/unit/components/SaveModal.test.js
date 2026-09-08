import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, fireEvent, waitFor } from "@testing-library/svelte";
import SaveModal from "../../../src/lib/components/SaveModal.svelte";
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

beforeEach(async () => {
  await resetGalleryDB();
  editor.model = new Canvas(16, 16);
  editor.currentColor = "#ff0000";
  editor.version = 0;
  editor.dirty = false;
  editor.undoStack = [];
  editor.redoStack = [];
  gallery.drawings = [];
  gallery.error = "";
  gallery.saving = false;
  gallery.currentDrawingId = null;
  gallery.currentDrawingName = null;
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("SaveModal (F05/FR-001)", () => {
  it("does not render the modal when closed", () => {
    const { container } = render(SaveModal, { props: { open: false, onClose: vi.fn() } });
    expect(container.querySelector('[role="dialog"]')).toBeNull();
  });

  it("shows a Save button when no drawing is loaded", () => {
    const { container } = render(SaveModal, { props: { open: true, onClose: vi.fn() } });
    expect(buttonByText(container, "Save")).not.toBeNull();
    expect(buttonByLabel(container, "Update")).toBeUndefined();
  });

  it("shows Update and Save as new when a drawing is loaded", () => {
    gallery.currentDrawingName = "Kitten";
    const { container } = render(SaveModal, { props: { open: true, onClose: vi.fn() } });
    expect(buttonByLabel(container, "Update Kitten")).not.toBeNull();
    expect(buttonByText(container, "Save as new")).not.toBeNull();
  });

  it("saving with a name creates the drawing and closes the modal", async () => {
    const onClose = vi.fn();
    const { container } = render(SaveModal, { props: { open: true, onClose } });
    const input = container.querySelector("input");
    await fireEvent.input(input, { target: { value: "My drawing" } });
    await fireEvent.click(buttonByText(container, "Save"));

    await waitFor(() => expect(gallery.drawings).toHaveLength(1));
    expect(gallery.drawings[0].name).toBe("My drawing");
    expect(gallery.error).toBe("");
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it("reports that the name is required when trying to save empty", async () => {
    const { container } = render(SaveModal, { props: { open: true, onClose: vi.fn() } });
    const input = container.querySelector("input");
    await fireEvent.input(input, { target: { value: "" } });
    await fireEvent.click(buttonByText(container, "Save"));

    await waitFor(() => expect(gallery.error).toBe("Name is required."));
    expect(container.textContent).toContain("Name is required.");
  });

  it("clicking Update updates the current drawing and closes the modal", async () => {
    editor.model.setPixel(0, 0, "#ff0000");
    await gallery.save("Kitten");
    editor.model.setPixel(1, 1, "#00ff00");

    const onClose = vi.fn();
    const { container } = render(SaveModal, { props: { open: true, onClose } });
    await fireEvent.click(buttonByLabel(container, "Update Kitten"));

    await waitFor(() => expect(gallery.drawings).toHaveLength(1));
    expect(gallery.drawings[0].name).toBe("Kitten");
    expect(editor.dirty).toBe(false);
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it("Save as new creates a separate drawing and makes it current", async () => {
    editor.model.setPixel(0, 0, "#ff0000");
    await gallery.save("Kitten");
    const firstId = gallery.currentDrawingId;
    editor.model.setPixel(1, 1, "#00ff00");

    const { container } = render(SaveModal, { props: { open: true, onClose: vi.fn() } });
    const input = container.querySelector("input");
    await fireEvent.input(input, { target: { value: "Kitten 2" } });
    await fireEvent.click(buttonByText(container, "Save as new"));

    await waitFor(() => expect(gallery.drawings).toHaveLength(2));
    expect(gallery.currentDrawingName).toBe("Kitten 2");
    expect(gallery.currentDrawingId).not.toBe(firstId);
  });
});
