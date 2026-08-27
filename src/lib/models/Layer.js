export class Layer {
  constructor(name = "Layer") {
    this.name = name;
    this.visible = true;
    this.locked = false;
    this.opacity = 1.0;
    this.imageData = null;
  }
}
