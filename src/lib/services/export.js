/**
 * PNG export service.
 *
 * Renders the canvas model into a scaled PNG blob using an offscreen canvas
 * with nearest-neighbor scaling so exported pixel art stays sharp.
 */

export const EXPORT_SCALES = [1, 2, 4, 8];
export const DEFAULT_EXPORT_SCALE = 4;

/**
 * Export the given canvas model as a PNG blob at the requested scale.
 *
 * @param {Canvas} model
 * @param {number} [scale=DEFAULT_EXPORT_SCALE]
 * @returns {Promise<Blob>}
 */
export async function exportPng(model, scale = DEFAULT_EXPORT_SCALE) {
  const s = Math.max(1, Math.floor(Number(scale)));
  const width = model.cols * s;
  const height = model.rows * s;

  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not get 2D context for export");
  }

  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(model.offscreen, 0, 0, width, height);

  return canvas.convertToBlob({ type: "image/png" });
}

/**
 * Suggest a filename for the exported PNG based on the current date and scale.
 *
 * @param {number} [scale=DEFAULT_EXPORT_SCALE]
 * @returns {string}
 */
export function suggestedExportName(scale = DEFAULT_EXPORT_SCALE) {
  const now = new Date();
  const date = now.toLocaleDateString("en-US");
  const time = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  return `pixel-art-${date}-${time}-${scale}x.png`.replace(/[\/\\?%*:|"<>\s]/g, "-");
}

/**
 * Trigger a download of the given blob with the provided filename.
 * Falls back to a regular object URL download when the Web Share API is not
 * available or the user cancels it.
 *
 * @param {Blob} blob
 * @param {string} filename
 * @returns {Promise<void>}
 */
export async function downloadBlob(blob, filename) {
  if (typeof navigator !== "undefined" && navigator.canShare && navigator.share) {
    const file = new File([blob], filename, { type: blob.type });
    const shareData = { files: [file], title: filename };
    if (navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        if (err && err.name === "AbortError") {
          return;
        }
        // Fall through to anchor download on any other error.
      }
    }
  }

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
