import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/svelte";
import { tick } from "svelte";
import ReferencePill from "../../../src/lib/components/ReferencePill.svelte";
import { editor } from "../../../src/lib/stores/editor.svelte.js";
import { toasts } from "../../../src/lib/stores/toasts.svelte.js";

function inputByLabel(container, label) {
  return container.querySelector(`[aria-label="${label}"]`);
}

function buttonByLabel(container, label) {
  return Array.from(container.querySelectorAll("button")).find(
    (b) => b.getAttribute("aria-label") === label,
  );
}

beforeEach(() => {
  editor.referenceVisible = false;
  editor.referenceOpacity = 0.5;
  editor.referenceVersion = 0;
  editor._referenceImage = null;
  editor.hasReferenceImage = false;
  toasts.items = [];
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("ReferencePill (F19 #43)", () => {
  it("does not render while the reference layer is hidden", () => {
    const { container } = render(ReferencePill);
    expect(container.querySelector(".reference-pill")).toBeNull();
  });

  it("renders opacity slider and load button when the layer is enabled", () => {
    editor.referenceVisible = true;
    const { container } = render(ReferencePill);
    expect(inputByLabel(container, "Reference opacity")).toBeTruthy();
    expect(buttonByLabel(container, "Load reference image")).toBeTruthy();
    expect(buttonByLabel(container, "Remove reference image")).toBeUndefined();
  });

  it("shows the replace and remove actions once an image is loaded", () => {
    editor.referenceVisible = true;
    editor.setReferenceImage({ width: 16, height: 16 });
    const { container } = render(ReferencePill);
    expect(buttonByLabel(container, "Replace reference image")).toBeTruthy();
    expect(buttonByLabel(container, "Remove reference image")).toBeTruthy();
  });

  it("the slider updates the reference opacity in real time", async () => {
    editor.referenceVisible = true;
    const { container } = render(ReferencePill);
    const slider = inputByLabel(container, "Reference opacity");
    await fireEvent.input(slider, { target: { value: "25" } });
    expect(editor.referenceOpacity).toBe(0.25);
    await fireEvent.input(slider, { target: { value: "100" } });
    expect(editor.referenceOpacity).toBe(1);
  });

  it("shows the current opacity percentage", () => {
    editor.referenceVisible = true;
    editor.setReferenceOpacity(0.4);
    const { container } = render(ReferencePill);
    expect(container.textContent).toContain("40%");
  });

  it("the load button opens the hidden file input", async () => {
    editor.referenceVisible = true;
    const clickSpy = vi.spyOn(HTMLInputElement.prototype, "click").mockImplementation(() => {});
    const { container } = render(ReferencePill);
    await fireEvent.click(buttonByLabel(container, "Load reference image"));
    expect(clickSpy).toHaveBeenCalled();
  });

  it("removing the image clears it but keeps the layer enabled", async () => {
    editor.referenceVisible = true;
    editor.setReferenceImage({ width: 16, height: 16 });
    const { container } = render(ReferencePill);
    await fireEvent.click(buttonByLabel(container, "Remove reference image"));
    expect(editor.hasReferenceImage).toBe(false);
    expect(editor.referenceVisible).toBe(true);
  });

  it("selecting a file decodes it and sets it as the reference image", async () => {
    editor.referenceVisible = true;
    const fakeBitmap = { width: 64, height: 64 };
    vi.stubGlobal("createImageBitmap", vi.fn(async () => fakeBitmap));
    const { container } = render(ReferencePill);
    const input = container.querySelector('input[type="file"]');
    const file = new File(["pixels"], "reference.png", { type: "image/png" });
    Object.defineProperty(input, "files", { value: [file], configurable: true });
    await fireEvent.change(input);
    await tick();
    expect(editor.hasReferenceImage).toBe(true);
    expect(editor._referenceImage).toBe(fakeBitmap);
    expect(editor.referenceVisible).toBe(true);
  });

  it("a decode failure shows a toast and keeps the previous image", async () => {
    editor.referenceVisible = true;
    editor.setReferenceImage({ width: 16, height: 16 });
    vi.stubGlobal(
      "createImageBitmap",
      vi.fn(async () => {
        throw new Error("boom");
      }),
    );
    const { container } = render(ReferencePill);
    const input = container.querySelector('input[type="file"]');
    const file = new File(["pixels"], "reference.png", { type: "image/png" });
    Object.defineProperty(input, "files", { value: [file], configurable: true });
    await fireEvent.change(input);
    await tick();
    expect(editor._referenceImage).toEqual({ width: 16, height: 16 });
    expect(toasts.items.length).toBe(1);
    expect(toasts.items[0].message).toMatch(/reference image/i);
  });
});
