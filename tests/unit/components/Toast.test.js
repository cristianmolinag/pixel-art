import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/svelte";
import { tick } from "svelte";
import Toast from "../../../src/lib/components/Toast.svelte";
import { toasts } from "../../../src/lib/stores/toasts.svelte.js";

describe("Toast (F16)", () => {
  beforeEach(() => {
    toasts.items = [];
  });

  afterEach(() => {
    cleanup();
    toasts.items = [];
  });

  it("does not render when there are no toasts", () => {
    const { container } = render(Toast);
    expect(container.querySelector('[role="region"]')).toBeNull();
  });

  it("renders toast messages", async () => {
    toasts.show("Saved");
    const { container } = render(Toast);
    await tick();

    const region = container.querySelector('[role="region"]');
    expect(region).not.toBeNull();
    expect(region.getAttribute("aria-live")).toBe("polite");
    expect(region.textContent).toContain("Saved");
  });

  it("dismisses a toast when its close button is clicked", async () => {
    const id = toasts.show("Saved");
    const { container } = render(Toast);
    await tick();

    const closeButton = Array.from(container.querySelectorAll("button")).find(
      (b) => b.getAttribute("aria-label") === "Dismiss notification"
    );
    expect(closeButton).not.toBeUndefined();

    await fireEvent.click(closeButton);
    await tick();

    expect(toasts.items.find((t) => t.id === id)).toBeUndefined();
  });
});
