import { describe, it, expect } from "vitest";

describe("setup de pruebas", () => {
  it("jsdom está disponible como entorno", () => {
    expect(typeof document).toBe("object");
  });

  it("OffscreenCanvas está mockeado en el setup", () => {
    const canvas = new OffscreenCanvas(8, 8);
    expect(canvas.width).toBe(8);
    expect(canvas.height).toBe(8);
    expect(typeof canvas.getContext).toBe("function");
    expect(canvas.getContext()).toBe(canvas.ctx);
  });
});
