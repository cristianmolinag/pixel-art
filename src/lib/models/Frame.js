import { Layer } from "./Layer.js";

export class Frame {
  constructor() {
    this.layers = [new Layer("Layer 1")];
    this.duration = 100;
  }

  clone() {
    const frame = new Frame();
    frame.duration = this.duration;
    frame.layers = this.layers.map((l) => {
      const copy = new Layer(l.name);
      copy.visible = l.visible;
      copy.locked = l.locked;
      copy.opacity = l.opacity;
      copy.imageData = l.imageData;
      return copy;
    });
    return frame;
  }
}
