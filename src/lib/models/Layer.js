export class Layer {
  constructor(name = "Layer", gridCols = 32, gridRows = 32) {
    this.name = name;
    this.visible = true;
    this.locked = false;
    this.opacity = 1.0;
    this.offscreen = new OffscreenCanvas(gridCols, gridRows);
    this.ctx = this.offscreen.getContext("2d");
  }

  clone(gridCols, gridRows) {
    const copy = new Layer(this.name, gridCols, gridRows);
    copy.visible = this.visible;
    copy.locked = this.locked;
    copy.opacity = this.opacity;
    copy.ctx.drawImage(this.offscreen, 0, 0);
    return copy;
  }

  clear() {
    this.ctx.clearRect(0, 0, this.offscreen.width, this.offscreen.height);
  }

  resize(gridCols, gridRows) {
    const prev = this.ctx.getImageData(0, 0, this.offscreen.width, this.offscreen.height);
    this.offscreen = new OffscreenCanvas(gridCols, gridRows);
    this.ctx = this.offscreen.getContext("2d");
    this.ctx.putImageData(prev, 0, 0);
  }
}
