/**
 * Reference image decoding for the tracing overlay (F19).
 *
 * Decodes a user-selected image file into something drawable with
 * `ctx.drawImage` (ImageBitmap when available, HTMLImageElement otherwise).
 */

/**
 * Decode an image file into a drawable image source.
 *
 * @param {File|Blob} file
 * @returns {Promise<ImageBitmap|HTMLImageElement>}
 */
export async function decodeImageFile(file) {
  if (typeof createImageBitmap === "function") {
    return createImageBitmap(file);
  }
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.decoding = "async";
    await new Promise((resolve, reject) => {
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Could not decode the reference image"));
      image.src = url;
    });
    return image;
  } finally {
    URL.revokeObjectURL(url);
  }
}
