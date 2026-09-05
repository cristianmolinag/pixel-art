import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/svelte";
import Palette from "../../../src/lib/components/Palette.svelte";
import { editor } from "../../../src/lib/stores/editor.svelte.js";

const HUE_PROPS = { left: 0, width: 160, height: 16, top: 0, right: 160, bottom: 16, x: 0, y: 0 };

function simularGradiente(barra) {
  vi.spyOn(barra, "getBoundingClientRect").mockReturnValue({ ...HUE_PROPS, toJSON: () => ({}) });
}

function arrastrarMatiz(barra, hue) {
  fireEvent.pointerDown(barra, { clientX: (hue / 360) * HUE_PROPS.width, pointerId: 1 });
}

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  editor.colorActual = "#000000";
  editor.coloresRecientes = [];
});

describe("Palette (F02)", () => {
  it("muestra swatches de la paleta fija (FR-001)", () => {
    const { container } = render(Palette);
    const swatches = container.querySelectorAll("button[aria-label^='Color ']");
    expect(swatches.length).toBeGreaterThanOrEqual(8);
  });

  it("marca visualmente el color seleccionado (FR-002)", () => {
    editor.colorActual = "#ff0000";
    const { container } = render(Palette);
    const rojo = container.querySelector("button[aria-label='Color #ff0000']");
    const clas = rojo.className;
    expect(clas).toContain("scale-110");
    expect(clas).toContain("border-white");
  });

  it("agranda el swatch de la paleta aunque el color esté normalizado (FR-002)", () => {
    editor.seleccionarColor("#ff0000");
    expect(editor.colorActual).toBe("#FF0000");
    const { container } = render(Palette);
    const rojo = container.querySelector("button[aria-label='Color #ff0000']");
    expect(rojo.className).toContain("scale-110");
    expect(rojo.className).toContain("border-white");
  });

  it("al clickear un swatch cambia el color actual (FR-002)", async () => {
    editor.colorActual = "#000000";
    const { container } = render(Palette);
    const verde = container.querySelector("button[aria-label='Color #0aff99']");
    await fireEvent.click(verde);
    expect(editor.colorActual).toBe("#0AFF99");
  });
});

describe("Palette (F06 color picker)", () => {
  const abrirPicker = async (container) => {
    await fireEvent.click(container.querySelector("button[aria-label='Elegir color personalizado']"));
  };

  it("el campo hex vive dentro del picker, no en la paleta", () => {
    const { container } = render(Palette);
    expect(container.querySelector("input[aria-label='Código hex del color']")).toBe(null);
  });

  it("muestra el campo hex con el color actual al abrir el picker", async () => {
    editor.colorActual = "#00ff00";
    const { container } = render(Palette);
    await abrirPicker(container);
    const hex = container.querySelector("input[aria-label='Código hex del color']");
    expect(hex.value).toBe("#00ff00");
  });

  it("el hex válido en Enter actualiza el color actual y normaliza", async () => {
    const { container } = render(Palette);
    await abrirPicker(container);
    const hex = container.querySelector("input[aria-label='Código hex del color']");
    await fireEvent.input(hex, { target: { value: "#abc" } });
    await fireEvent.keyDown(hex, { key: "Enter" });
    expect(editor.colorActual).toBe("#AABBCC");
  });

  it("un hex válido sin # se normaliza y se aplica", async () => {
    const { container } = render(Palette);
    await abrirPicker(container);
    const hex = container.querySelector("input[aria-label='Código hex del color']");
    await fireEvent.input(hex, { target: { value: "1a2b3c" } });
    await fireEvent.blur(hex);
    expect(editor.colorActual).toBe("#1A2B3C");
  });

  it("un hex inválido no cambia el color actual y revierte el campo", async () => {
    editor.colorActual = "#123456";
    const { container } = render(Palette);
    await abrirPicker(container);
    const hex = container.querySelector("input[aria-label='Código hex del color']");
    await fireEvent.input(hex, { target: { value: "zzz" } });
    await fireEvent.blur(hex);
    expect(editor.colorActual).toBe("#123456");
    expect(hex.value).toBe("#123456");
  });

  it("muestra los colores recientes como swatches", () => {
    editor.coloresRecientes = ["#FF0000", "#00FF00"];
    const { container } = render(Palette);
    const recientes = container.querySelectorAll("button[aria-label^='Reciente ']");
    expect(recientes.length).toBe(2);
  });

  it("cliquear un reciente lo selecciona sin reordenar la lista", async () => {
    editor.coloresRecientes = ["#FF0000", "#00FF00"];
    const { container } = render(Palette);
    const reciente = container.querySelector("button[aria-label='Reciente #00FF00']");
    await fireEvent.click(reciente);
    expect(editor.colorActual).toBe("#00FF00");
    expect(editor.coloresRecientes).toEqual(["#FF0000", "#00FF00"]);
  });

  it("marca el reciente seleccionado con borde blanco como la paleta", () => {
    editor.coloresRecientes = ["#FF0000", "#00FF00"];
    editor.colorActual = "#00FF00";
    const { container } = render(Palette);
    const seleccionado = container.querySelector("button[aria-label='Reciente #00FF00']");
    const noSeleccionado = container.querySelector("button[aria-label='Reciente #FF0000']");
    expect(seleccionado.className).toContain("border-2");
    expect(seleccionado.className).toContain("border-white");
    expect(seleccionado.className).toContain("shadow-md");
    expect(noSeleccionado.className).not.toContain("border-2");
    expect(noSeleccionado.className).not.toContain("shadow-md");
    expect(noSeleccionado.className).toContain("border-white/30");
  });

  it("no muestra la fila de recientes si no hay ninguno", () => {
    const { container } = render(Palette);
    expect(container.querySelectorAll("button[aria-label^='Reciente ']").length).toBe(0);
  });
});

describe("Palette (F06 picker custom in-app)", () => {
  it("clic en el botón de color personalizado abre el picker", async () => {
    const { container } = render(Palette);
    expect(container.querySelector('[aria-label="Matiz del color"]')).toBe(null);
    await fireEvent.click(container.querySelector("button[aria-label='Elegir color personalizado']"));
    expect(container.querySelector('[aria-label="Matiz del color"]')).not.toBe(null);
    expect(container.querySelector("canvas")).not.toBe(null);
  });

  it("la barra de matiz es un slider accesible", async () => {
    editor.colorActual = "#ff0000";
    const { container } = render(Palette);
    await fireEvent.click(container.querySelector("button[aria-label='Elegir color personalizado']"));
    const barra = container.querySelector('[aria-label="Matiz del color"]');
    expect(barra.getAttribute("role")).toBe("slider");
    expect(barra.getAttribute("aria-valuemin")).toBe("0");
    expect(barra.getAttribute("aria-valuemax")).toBe("360");
    expect(barra.getAttribute("aria-valuenow")).toBe("0");
  });

  it("arrastrar el matiz actualiza el color actual", async () => {
    editor.colorActual = "#ff0000";
    const { container } = render(Palette);
    await fireEvent.click(container.querySelector("button[aria-label='Elegir color personalizado']"));
    const barra = container.querySelector('[aria-label="Matiz del color"]');
    simularGradiente(barra);
    arrastrarMatiz(barra, 120);
    expect(editor.colorActual).toBe("#00FF00");
    expect(barra.getAttribute("aria-valuenow")).toBe("120");
  });

  it("arrastrar el matiz pone el hex en el campo de texto", async () => {
    editor.colorActual = "#ff0000";
    const { container } = render(Palette);
    await fireEvent.click(container.querySelector("button[aria-label='Elegir color personalizado']"));
    const barra = container.querySelector('[aria-label="Matiz del color"]');
    simularGradiente(barra);
    arrastrarMatiz(barra, 240);
    const hex = container.querySelector("input[aria-label='Código hex del color']");
    expect(hex.value).toBe("#0000FF");
  });

  it("las flechas del teclado ajustan el matiz", async () => {
    const { container } = render(Palette);
    await fireEvent.click(container.querySelector("button[aria-label='Elegir color personalizado']"));
    const barra = container.querySelector('[aria-label="Matiz del color"]');
    await fireEvent.keyDown(barra, { key: "ArrowRight" });
    expect(barra.getAttribute("aria-valuenow")).toBe("1");
    await fireEvent.keyDown(barra, { key: "Home" });
    expect(barra.getAttribute("aria-valuenow")).toBe("0");
  });

  it("abrir con un color acromático permite elegir matiz", async () => {
    editor.colorActual = "#000000";
    const { container } = render(Palette);
    await fireEvent.click(container.querySelector("button[aria-label='Elegir color personalizado']"));
    const barra = container.querySelector('[aria-label="Matiz del color"]');
    simularGradiente(barra);
    arrastrarMatiz(barra, 120);
    expect(editor.colorActual).toBe("#00FF00");
    expect(barra.getAttribute("aria-valuenow")).toBe("120");
  });

  it("el thumb de la barra se posiciona en el matiz elegido", async () => {
    editor.colorActual = "#ff0000";
    const { container } = render(Palette);
    await fireEvent.click(container.querySelector("button[aria-label='Elegir color personalizado']"));
    const barra = container.querySelector('[aria-label="Matiz del color"]');
    simularGradiente(barra);
    arrastrarMatiz(barra, 180);
    const thumb = barra.querySelector("div");
    expect(thumb.style.left).toBe("50%");
  });

  it("la rueda del mouse ajusta el matiz", async () => {
    editor.colorActual = "#ff0000";
    const { container } = render(Palette);
    await fireEvent.click(container.querySelector("button[aria-label='Elegir color personalizado']"));
    const barra = container.querySelector('[aria-label="Matiz del color"]');
    await fireEvent.wheel(barra, { deltaY: 120 });
    expect(barra.getAttribute("aria-valuenow")).toBe("359");
    await fireEvent.wheel(barra, { deltaY: -120 });
    expect(barra.getAttribute("aria-valuenow")).toBe("0");
  });

  it("clic en el backdrop cierra el picker", async () => {
    const { container } = render(Palette);
    await fireEvent.click(container.querySelector("button[aria-label='Elegir color personalizado']"));
    expect(container.querySelector("canvas")).not.toBe(null);
    await fireEvent.click(container.querySelector("div.fixed"));
    expect(container.querySelector("canvas")).toBe(null);
  });
});