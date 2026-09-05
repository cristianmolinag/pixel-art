import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Canvas } from "../../../src/lib/models/Canvas.js";
import { Dibujo, nombreSugerido } from "../../../src/lib/models/Dibujo.js";

beforeEach(() => {
  HTMLCanvasElement.prototype.getContext = vi.fn(() => ({ drawImage: vi.fn() }));
  HTMLCanvasElement.prototype.toDataURL = vi.fn(() => "data:image/png;base64,AAAA");
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Dibujo (F05/FR-002)", () => {
  it("desdeModelo serializa nombre, dimensiones, píxeles y timestamps", () => {
    const model = new Canvas(16, 16);
    model.setPixel(2, 3, "#ff0000");
    const record = Dibujo.desdeModelo(model, "Prueba");

    expect(record.nombre).toBe("Prueba");
    expect(record.cols).toBe(16);
    expect(record.rows).toBe(16);
    expect(record.createdAt).toBeTypeOf("number");
    expect(record.updatedAt).toBeTypeOf("number");
    expect(Array.isArray(record.pixeles)).toBe(true);
    expect(record.pixeles.length).toBe(16 * 16 * 4);

    const o = (3 * 16 + 2) * 4;
    expect(record.pixeles[o]).toBe(255);
    expect(record.pixeles[o + 1]).toBe(0);
    expect(record.pixeles[o + 2]).toBe(0);
    expect(record.pixeles[o + 3]).toBe(255);
  });

  it("desdeModelo genera un thumbnail como dataURL", () => {
    const model = new Canvas(16, 16);
    model.setPixel(0, 0, "#0000ff");
    const record = Dibujo.desdeModelo(model, "Prueba");
    expect(record.thumbnail).toBe("data:image/png;base64,AAAA");
  });

  it("aCanvas restaura píxeles y dimensiones en un lienzo nuevo (FR-004)", () => {
    const model = new Canvas(16, 16);
    model.setPixel(1, 1, "#00ff00");
    const record = Dibujo.desdeModelo(model, "Prueba");

    const restaurado = Dibujo.aCanvas(record);
    expect(restaurado.cols).toBe(16);
    expect(restaurado.rows).toBe(16);
    const px = restaurado.getPixel(1, 1);
    expect(px.r).toBe(0);
    expect(px.g).toBe(255);
    expect(px.b).toBe(0);
  });

  it("roundtrip modelo → registro → lienzo conserva los píxeles", () => {
    const model = new Canvas(16, 16);
    model.setPixel(0, 0, "#ff0000");
    model.setPixel(15, 15, "#0000ff");
    const record = Dibujo.desdeModelo(model, "Prueba");
    const restaurado = Dibujo.aCanvas(record);
    expect(restaurado.snapshot()).toEqual(model.snapshot());
  });

  it("nombreSugerido devuelve un nombre base con la fecha actual", () => {
    expect(nombreSugerido().startsWith("Dibujo ")).toBe(true);
  });
});