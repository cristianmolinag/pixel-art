export function drawPixels(ctx, model) {
  ctx.drawImage(model.offscreen, 0, 0);
}

export function drawCanvas(ctx, model) {
  ctx.clearRect(0, 0, model.cols, model.rows);
  drawPixels(ctx, model);
}
