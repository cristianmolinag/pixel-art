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
}
