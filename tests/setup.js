import { vi } from "vitest";

class MockOffscreenCanvas {
  constructor(width = 32, height = 32) {
    this.width = width;
    this.height = height;
    this.data = new Uint8ClampedArray(width * height * 4);
    this.ctx = {
      fillStyle: "#000000",
      strokeStyle: "#000000",
      lineWidth: 1,
      globalAlpha: 1,
      drawImage: vi.fn(),
      clearRect: vi.fn(),
      putImageData: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      fillRect: (x, y, w, h) => {
        const { r, g, b, a } = parseColor(this.ctx.fillStyle);
        for (let j = y; j < y + h; j++) {
          for (let i = x; i < x + w; i++) {
            setPixel(this.data, this.width, i, j, r, g, b, a * this.ctx.globalAlpha);
          }
        }
      },
      getImageData: (x, y, w, h) => {
        const out = new Uint8ClampedArray(w * h * 4);
        for (let j = 0; j < h; j++) {
          for (let i = 0; i < w; i++) {
            const src = pixelOffset(this.width, x + i, y + j);
            const dst = (j * w + i) * 4;
            for (let k = 0; k < 4; k++) out[dst + k] = this.data[src + k];
          }
        }
        return { data: out };
      },
    };
  }

  getContext() {
    return this.ctx;
  }
}

function pixelOffset(width, x, y) {
  return (y * width + x) * 4;
}

function setPixel(data, width, x, y, r, g, b, a) {
  const o = pixelOffset(width, x, y);
  data[o] = r;
  data[o + 1] = g;
  data[o + 2] = b;
  data[o + 3] = Math.round(a);
}

function parseColor(color) {
  if (typeof color !== "string") return { r: 0, g: 0, b: 0, a: 255 };
  if (color.startsWith("#")) {
    const hex = color.slice(1);
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
      a: 255,
    };
  }
  const m = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (m) {
    return {
      r: Number(m[1]),
      g: Number(m[2]),
      b: Number(m[3]),
      a: m[4] === undefined ? 255 : Math.round(Number(m[4]) * 255),
    };
  }
  return { r: 0, g: 0, b: 0, a: 0 };
}

globalThis.OffscreenCanvas = MockOffscreenCanvas;