export function drawBackground(ctx, cols, rows, color = "#ffffff") {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, cols, rows);
}

export function drawGrid(ctx, cols, rows, { gridColor = "#cccccc" } = {}) {
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
  ctx.drawImage(model.offscreen, 0, 0);
}

export function drawCanvas(ctx, model, { grid = true } = {}) {
  const cols = model.cols;
  const rows = model.rows;
  drawBackground(ctx, cols, rows);
  drawPixels(ctx, model);
  if (grid) drawGrid(ctx, cols, rows);
}
