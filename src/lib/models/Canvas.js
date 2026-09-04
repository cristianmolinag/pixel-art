export function hexToRgba(hex) {
  let h = hex.replace("#", "");
  if (h.length === 3) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return { r, g, b, a: 255 };
}

export class Canvas {
  constructor(cols = 16, rows = 16) {
    this.cols = cols;
    this.rows = rows;
    this.offscreen = new OffscreenCanvas(cols, rows);
    this.ctx = this.offscreen.getContext("2d");
  }

  getPixel(x, y) {
    if (x < 0 || y < 0 || x >= this.cols || y >= this.rows) return null;
    const imageData = this.ctx.getImageData(x, y, 1, 1);
    const [r, g, b, a] = imageData.data;
    return { r, g, b, a };
  }

  setPixel(x, y, color) {
    if (x < 0 || y < 0 || x >= this.cols || y >= this.rows) return false;
    const { r, g, b, a } = hexToRgba(color);
    this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a / 255})`;
    this.ctx.fillRect(x, y, 1, 1);
    return true;
  }
}