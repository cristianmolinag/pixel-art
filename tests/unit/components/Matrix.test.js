import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/svelte";
import Matrix from "../../../src/lib/components/Matrix.svelte";
import { editor } from "../../../src/lib/stores/editor.svelte.js";
import { Canvas } from "../../../src/lib/models/Canvas.js";

beforeEach(() => {
  editor.model = new Canvas(16, 16);
  editor.version = 0;
  editor.undoStack = [];
  editor.redoStack = [];
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function buttonByLabel(container, label) {
  return Array.from(container.querySelectorAll("button")).find(
    (b) => b.getAttribute("aria-label") === label
  );
}

function openPopover(container) {
  return fireEvent.click(buttonByLabel(container, "Change canvas matrix"));
}

describe("Matrix (F09)", () => {
  it("opens a popover with the 16-to-64 presets and a custom option", async () => {
    const { container } = render(Matrix);
    expect(buttonByLabel(container, "Matrix 32×32")).toBeUndefined();
    await openPopover(container);
    expect(buttonByLabel(container, "Matrix 16×16")).toBeTruthy();
    expect(buttonByLabel(container, "Matrix 32×32")).toBeTruthy();
    expect(buttonByLabel(container, "Matrix 48×48")).toBeTruthy();
    expect(buttonByLabel(container, "Matrix 64×64")).toBeTruthy();
    expect(buttonByLabel(container, "Apply custom matrix size")).toBeTruthy();
  });

  it("choosing a preset shows the confirmation modal and accepting clears and changes (FR-001/US1)", async () => {
    editor.paintPixel(1, 1);
    const { container } = render(Matrix);
    await openPopover(container);
    await fireEvent.click(buttonByLabel(container, "Matrix 32×32"));

    expect(editor.model.cols).toBe(16);
    expect(container.textContent).toContain("Change the matrix to 32×32? The current canvas will be cleared.");

    await fireEvent.click(buttonByLabel(container, "Apply and clear"));

    expect(editor.model.cols).toBe(32);
    expect(editor.model.rows).toBe(32);
    expect(editor.model.getPixel(1, 1).a).toBe(0);
    expect(buttonByLabel(container, "Matrix 32×32")).toBeUndefined();
    expect(buttonByLabel(container, "Apply and clear")).toBeUndefined();
  });

  it("does not change the matrix if the confirmation is cancelled (US1)", async () => {
    const { container } = render(Matrix);
    await openPopover(container);
    await fireEvent.click(buttonByLabel(container, "Matrix 32×32"));
    await fireEvent.click(buttonByLabel(container, "Cancel"));

    expect(editor.model.cols).toBe(16);
    expect(buttonByLabel(container, "Apply and clear")).toBeUndefined();
    expect(buttonByLabel(container, "Apply custom matrix size")).toBeTruthy();
  });

  it("applies a valid custom size after confirming (US2)", async () => {
    const { container } = render(Matrix);
    await openPopover(container);
    const width = container.querySelector("input[aria-label='Matrix width']");
    const height = container.querySelector("input[aria-label='Matrix height']");
    await fireEvent.input(width, { target: { value: "20" } });
    await fireEvent.input(height, { target: { value: "12" } });
    await fireEvent.click(buttonByLabel(container, "Apply custom matrix size"));

    expect(container.textContent).toContain("Change the matrix to 20×12? The current canvas will be cleared.");

    await fireEvent.click(buttonByLabel(container, "Apply and clear"));

    expect(editor.model.cols).toBe(20);
    expect(editor.model.rows).toBe(12);
  });

  it("shows an error and does not confirm an invalid size (US2)", async () => {
    const { container } = render(Matrix);
    await openPopover(container);
    const width = container.querySelector("input[aria-label='Matrix width']");
    const height = container.querySelector("input[aria-label='Matrix height']");
    await fireEvent.input(width, { target: { value: "500" } });
    await fireEvent.input(height, { target: { value: "10" } });
    await fireEvent.click(buttonByLabel(container, "Apply custom matrix size"));

    expect(editor.model.cols).toBe(16);
    expect(container.textContent).toContain("Use between 4 and 128");
    expect(buttonByLabel(container, "Apply and clear")).toBeUndefined();
  });

  it("Escape closes the confirmation before the modal", async () => {
    const { container } = render(Matrix);
    await openPopover(container);
    await fireEvent.click(buttonByLabel(container, "Matrix 32×32"));
    await fireEvent.keyDown(window, { key: "Escape" });
    expect(buttonByLabel(container, "Apply and clear")).toBeUndefined();
    expect(buttonByLabel(container, "Matrix 32×32")).toBeTruthy();
  });

  it("Escape closes the popover", async () => {
    const { container } = render(Matrix);
    await openPopover(container);
    await fireEvent.keyDown(window, { key: "Escape" });
    expect(buttonByLabel(container, "Matrix 32×32")).toBeUndefined();
  });
});