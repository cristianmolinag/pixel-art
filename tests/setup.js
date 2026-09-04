import { vi } from "vitest";

class MockOffscreenCanvas {
  constructor(width = 32, height = 32) {
    this.width = width;
    this.height = height;
    this.ctx = {
      drawImage: vi.fn(),
      clearRect: vi.fn(),
      putImageData: vi.fn(),
      globalAlpha: 1,
      getImageData: vi.fn(() => ({
        data: new Uint8ClampedArray(width * height * 4),
      })),
    };
  }

  getContext() {
    return this.ctx;
  }
}

globalThis.OffscreenCanvas = MockOffscreenCanvas;
