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

export function lineaPuntos(x0, y0, x1, y1) {
  const puntos = [];
  const dx = Math.abs(x1 - x0);
  const dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  for (;;) {
    puntos.push([x0, y0]);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x0 += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y0 += sy;
    }
  }
  return puntos;
}

function mismaPosicion(puntos, x, y) {
  return puntos.some(([px, py]) => px === x && py === y);
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

  snapshot() {
    const image = this.ctx.getImageData(0, 0, this.cols, this.rows);
    return new Uint8ClampedArray(image.data);
  }

  restore(snapshot) {
    const image = this.ctx.createImageData(this.cols, this.rows);
    image.data.set(snapshot);
    this.ctx.putImageData(image, 0, 0);
  }

  iguales(snapshot) {
    const actual = this.ctx.getImageData(0, 0, this.cols, this.rows).data;
    if (actual.length !== snapshot.length) return false;
    for (let i = 0; i < actual.length; i++) {
      if (actual[i] !== snapshot[i]) return false;
    }
    return true;
  }

  setPixel(x, y, color) {
    if (x < 0 || y < 0 || x >= this.cols || y >= this.rows) return false;
    const { r, g, b, a } = hexToRgba(color);
    this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a / 255})`;
    this.ctx.fillRect(x, y, 1, 1);
    return true;
  }

  borrarPixel(x, y) {
    if (x < 0 || y < 0 || x >= this.cols || y >= this.rows) return false;
    this.ctx.clearRect(x, y, 1, 1);
    return true;
  }

  drawLine(x0, y0, x1, y1, color) {
    let cambio = false;
    for (const [x, y] of lineaPuntos(x0, y0, x1, y1)) {
      if (x < 0 || y < 0 || x >= this.cols || y >= this.rows) continue;
      this.setPixel(x, y, color);
      cambio = true;
    }
    return cambio;
  }

  floodFill(x, y, color) {
    if (x < 0 || y < 0 || x >= this.cols || y >= this.rows) return 0;
    const objetivo = this.getPixel(x, y);
    if (!objetivo) return 0;
    const { r, g, b, a } = hexToRgba(color);
    if (
      objetivo.r === r &&
      objetivo.g === g &&
      objetivo.b === b &&
      objetivo.a === a
    )
      return 0;

    let pintados = 0;
    const pendientes = [[x, y]];
    const visitados = [];
    while (pendientes.length > 0) {
      const [cx, cy] = pendientes.pop();
      if (cx < 0 || cy < 0 || cx >= this.cols || cy >= this.rows) continue;
      if (mismaPosicion(visitados, cx, cy)) continue;
      const px = this.getPixel(cx, cy);
      if (!px) continue;
      if (px.r !== objetivo.r || px.g !== objetivo.g || px.b !== objetivo.b || px.a !== objetivo.a)
        continue;
      visitados.push([cx, cy]);
      this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a / 255})`;
      this.ctx.fillRect(cx, cy, 1, 1);
      pintados += 1;
      pendientes.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
    }
    return pintados;
  }
}