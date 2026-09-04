export class Frame {
  constructor() {
    this.duration = 100;
  }

  clone() {
    const frame = new Frame();
    frame.duration = this.duration;
    return frame;
  }
}
