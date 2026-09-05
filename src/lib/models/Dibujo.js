import { Canvas } from "./Canvas.js";

export function generarThumbnail(model) {
  if (typeof document === "undefined") return "";
  const canvas = document.createElement("canvas");
  canvas.width = model.cols;
  canvas.height = model.rows;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  ctx.drawImage(model.offscreen, 0, 0);
  return canvas.toDataURL("image/png");
}

export function nombreSugerido() {
  const ahora = new Date();
  const fecha = ahora.toLocaleDateString("es-ES");
  const hora = ahora.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
  return `Dibujo ${fecha} ${hora}`;
}

export const Dibujo = {
  desdeModelo(model, nombre) {
    const ahora = Date.now();
    return {
      nombre,
      cols: model.cols,
      rows: model.rows,
      pixeles: Array.from(model.snapshot()),
      thumbnail: generarThumbnail(model),
      createdAt: ahora,
      updatedAt: ahora,
    };
  },

  aCanvas(record) {
    const canvas = new Canvas(record.cols || 16, record.rows || 16);
    canvas.restore(Uint8ClampedArray.from(record.pixeles));
    return canvas;
  },
};