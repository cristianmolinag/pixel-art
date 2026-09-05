import { describe, it, expect } from "vitest";

describe("test setup", () => {
  it("jsdom is available as the environment", () => {
    expect(typeof document).toBe("object");
  });

  it("OffscreenCanvas is mocked in the setup", () => {
    const canvas = new OffscreenCanvas(8, 8);
    expect(canvas.width).toBe(8);
    expect(canvas.height).toBe(8);
    expect(typeof canvas.getContext).toBe("function");
    expect(canvas.getContext()).toBe(canvas.ctx);
  });
});
