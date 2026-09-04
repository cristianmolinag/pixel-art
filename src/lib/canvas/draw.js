export function drawBackground(ctx, cols, rows, color = "#ffffff") {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, cols, rows);
}

export function drawGrid(ctx, cols, rows, { gridColor = "#cccccc", pixelBackground = "#ffffff" } = {}) {
  drawBackground(ctx, cols, rows, pixelBackground);
  ctx.beginPath();
  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 0.1;
  for (let gx = 0.5; gx <= cols; gx++) {
    ctx.moveTo(gx - 0.5, -0.5);
    ctx.lineTo(gx - 0.5, rows - 0.5);
  }
  for (let gy = 0.5; gy <= rows; gy++) {
    ctx.moveTo(-0.5, gy - 0.5);
    ctx.lineTo(cols - 0.5, gy - 0.5);
  }
  ctx.stroke();
}

export function drawPixels(ctx, model) {
  for (let y = 0; y < model.rows; y++) {
    for (let x = 0; x < model.cols; x++) {
      const px = model.getPixel(x, y);
      if (px && px.a > 0) {
        ctx.fillStyle = `rgba(${px.r}, ${px.g}, ${px.b}, ${px.a / 255})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }
}

export function drawCanvas(ctx, model, { grid = true } = {}) {
  const cols = model.cols;
  const rows = model.rows;
  drawBackground(ctx, cols, rows);
  drawPixels(ctx, model);
  if (grid) drawGrid(ctx, cols, rows);
}
