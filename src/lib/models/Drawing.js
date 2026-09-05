import { Canvas } from "./Canvas.js";

export function generateThumbnail(model) {
  if (typeof document === "undefined") return "";
  const canvas = document.createElement("canvas");
  canvas.width = model.cols;
  canvas.height = model.rows;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  ctx.drawImage(model.offscreen, 0, 0);
  return canvas.toDataURL("image/png");
}

export function suggestedName() {
  const now = new Date();
  const date = now.toLocaleDateString("en-US");
  const time = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  return `Drawing ${date} ${time}`;
}

export const Drawing = {
  fromModel(model, name) {
    const now = Date.now();
    return {
      name,
      cols: model.cols,
      rows: model.rows,
      pixels: Array.from(model.snapshot()),
      thumbnail: generateThumbnail(model),
      createdAt: now,
      updatedAt: now,
    };
  },

  toCanvas(record) {
    const canvas = new Canvas(record.cols || 16, record.rows || 16);
    canvas.restore(Uint8ClampedArray.from(record.pixels));
    return canvas;
  },
};