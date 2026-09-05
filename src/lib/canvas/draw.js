export const GRID_COLOR = "#cccccc";
export const GRID_ALPHA = 0.5;

export function drawPixels(ctx, model) {
  ctx.drawImage(model.offscreen, 0, 0);
}

export function drawCanvas(ctx, model) {
  ctx.clearRect(0, 0, model.cols, model.rows);
  drawPixels(ctx, model);
}