import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/svelte";
import Toolbar from "../../../src/lib/components/Toolbar.svelte";
import { editor } from "../../../src/lib/stores/editor.svelte.js";

beforeEach(() => {
  editor.herramienta = "pincel";
});

afterEach(() => {
  cleanup();
});

describe("Toolbar (F03)", () => {
  it("ofrece Pincel, Borrador, Línea y Relleno (FR-001)", () => {
    const { container } = render(Toolbar);
    const botones = Array.from(container.querySelectorAll("button")).map((b) =>
      b.textContent.trim()
    );
    expect(botones).toEqual(["Pincel", "Borrador", "Línea", "Relleno"]);
  });

  it("seleccionar una herramienta la activa y queda marcada (US1/FR-002)", async () => {
    const { container } = render(Toolbar);
    const botonRelleno = Array.from(container.querySelectorAll("button")).find(
      (b) => b.textContent.trim() === "Relleno"
    );
    await fireEvent.click(botonRelleno);
    expect(editor.herramienta).toBe("relleno");
    expect(botonRelleno.getAttribute("aria-pressed")).toBe("true");
  });
});