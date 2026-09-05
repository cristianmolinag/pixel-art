import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Canvas } from "../../../src/lib/models/Canvas.js";
import { Drawing, suggestedName } from "../../../src/lib/models/Drawing.js";

beforeEach(() => {
  HTMLCanvasElement.prototype.getContext = vi.fn(() => ({ drawImage: vi.fn() }));
  HTMLCanvasElement.prototype.toDataURL = vi.fn(() => "data:image/png;base64,AAAA");
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Drawing (F05/FR-002)", () => {
  it("fromModel serializes name, dimensions, pixels and timestamps", () => {
    const model = new Canvas(16, 16);
    model.setPixel(2, 3, "#ff0000");
    const record = Drawing.fromModel(model, "Prueba");

    expect(record.name).toBe("Prueba");
    expect(record.cols).toBe(16);
    expect(record.rows).toBe(16);
    expect(record.createdAt).toBeTypeOf("number");
    expect(record.updatedAt).toBeTypeOf("number");
    expect(Array.isArray(record.pixels)).toBe(true);
    expect(record.pixels.length).toBe(16 * 16 * 4);

    const o = (3 * 16 + 2) * 4;
    expect(record.pixels[o]).toBe(255);
    expect(record.pixels[o + 1]).toBe(0);
    expect(record.pixels[o + 2]).toBe(0);
    expect(record.pixels[o + 3]).toBe(255);
  });

  it("fromModel generates a thumbnail as dataURL", () => {
    const model = new Canvas(16, 16);
    model.setPixel(0, 0, "#0000ff");
    const record = Drawing.fromModel(model, "Prueba");
    expect(record.thumbnail).toBe("data:image/png;base64,AAAA");
  });

  it("toCanvas restores pixels and dimensions onto a fresh canvas (FR-004)", () => {
    const model = new Canvas(16, 16);
    model.setPixel(1, 1, "#00ff00");
    const record = Drawing.fromModel(model, "Prueba");

    const restaurado = Drawing.toCanvas(record);
    expect(restaurado.cols).toBe(16);
    expect(restaurado.rows).toBe(16);
    const px = restaurado.getPixel(1, 1);
    expect(px.r).toBe(0);
    expect(px.g).toBe(255);
    expect(px.b).toBe(0);
  });

  it("model → record → canvas roundtrip preserves the pixels", () => {
    const model = new Canvas(16, 16);
    model.setPixel(0, 0, "#ff0000");
    model.setPixel(15, 15, "#0000ff");
    const record = Drawing.fromModel(model, "Prueba");
    const restaurado = Drawing.toCanvas(record);
    expect(restaurado.snapshot()).toEqual(model.snapshot());
  });

  it("suggestedName returns a base name with the current date", () => {
    expect(suggestedName().startsWith("Drawing ")).toBe(true);
  });
});