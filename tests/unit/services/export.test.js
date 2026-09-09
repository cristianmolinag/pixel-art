import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  exportPng,
  suggestedExportName,
  downloadBlob,
  EXPORT_SCALES,
  DEFAULT_EXPORT_SCALE,
} from "../../../src/lib/services/export.js";
import { Canvas } from "../../../src/lib/models/Canvas.js";

describe("export service", () => {
  describe("EXPORT_SCALES and DEFAULT_EXPORT_SCALE", () => {
    it("exposes the expected scale values", () => {
      expect(EXPORT_SCALES).toEqual([1, 2, 4, 8]);
      expect(DEFAULT_EXPORT_SCALE).toBe(4);
    });
  });

  describe("exportPng", () => {
    it("exports a PNG blob", async () => {
      const model = new Canvas(16, 16);
      model.setPixel(0, 0, "#ff0000");
      model.setPixel(15, 15, "#00ff00");

      const blob = await exportPng(model, 1);

      expect(blob.type).toBe("image/png");
    });

    it("scales a 16x16 canvas to 64x64 at 4x", async () => {
      const model = new Canvas(16, 16);
      const instances = [];
      const OriginalOffscreenCanvas = globalThis.OffscreenCanvas;
      vi.stubGlobal(
        "OffscreenCanvas",
        class extends OriginalOffscreenCanvas {
          constructor(width, height) {
            super(width, height);
            instances.push(this);
          }
        }
      );

      await exportPng(model, 4);

      const exportCanvas = instances[instances.length - 1];
      expect(exportCanvas.width).toBe(64);
      expect(exportCanvas.height).toBe(64);
      expect(exportCanvas.ctx.drawImage).toHaveBeenCalledTimes(1);
      expect(exportCanvas.ctx.drawImage).toHaveBeenCalledWith(model.offscreen, 0, 0, 64, 64);

      vi.unstubAllGlobals();
    });

    it("disables image smoothing for nearest-neighbor scaling", async () => {
      const model = new Canvas(8, 8);
      const instances = [];
      const OriginalOffscreenCanvas = globalThis.OffscreenCanvas;
      vi.stubGlobal(
        "OffscreenCanvas",
        class extends OriginalOffscreenCanvas {
          constructor(width, height) {
            super(width, height);
            instances.push(this);
          }
        }
      );

      await exportPng(model, 2);

      const exportCanvas = instances[instances.length - 1];
      expect(exportCanvas.ctx.imageSmoothingEnabled).toBe(false);

      vi.unstubAllGlobals();
    });

    it("defaults to 4x scale", async () => {
      const model = new Canvas(16, 16);
      const instances = [];
      const OriginalOffscreenCanvas = globalThis.OffscreenCanvas;
      vi.stubGlobal(
        "OffscreenCanvas",
        class extends OriginalOffscreenCanvas {
          constructor(width, height) {
            super(width, height);
            instances.push(this);
          }
        }
      );

      await exportPng(model);

      const exportCanvas = instances[instances.length - 1];
      expect(exportCanvas.width).toBe(64);
      expect(exportCanvas.height).toBe(64);

      vi.unstubAllGlobals();
    });

    it("preserves transparent pixels", async () => {
      const model = new Canvas(2, 2);
      model.setPixel(0, 0, "#ff0000");
      // Leave the rest transparent.

      const blob = await exportPng(model, 1);

      expect(blob.type).toBe("image/png");
    });
  });

  describe("suggestedExportName", () => {
    it("includes the scale and uses safe characters", () => {
      const name = suggestedExportName(4);
      expect(name).toMatch(/^pixel-art-.+-4x\.png$/);
      expect(name).not.toMatch(/[\/\\?%*:|"<>\s]/);
    });
  });

  describe("downloadBlob", () => {
    const originalNavigator = globalThis.navigator;

    beforeEach(() => {
      vi.stubGlobal(
        "navigator",
        Object.create(Object.getPrototypeOf(originalNavigator))
      );
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it("falls back to an anchor download when sharing is unavailable", async () => {
      const blob = new Blob(["png"], { type: "image/png" });
      const originalCreateElement = document.createElement.bind(document);
      const createElementSpy = vi.spyOn(document, "createElement").mockImplementation((tag) => {
        const el = originalCreateElement(tag);
        el.click = vi.fn();
        return el;
      });
      const revokeObjectURLSpy = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});

      const result = await downloadBlob(blob, "test.png");

      expect(result).toEqual({ shared: false, aborted: false });
      expect(createElementSpy).toHaveBeenCalledWith("a");
      expect(revokeObjectURLSpy).toHaveBeenCalled();

      createElementSpy.mockRestore();
      revokeObjectURLSpy.mockRestore();
    });

    it("uses Web Share API when available and supported", async () => {
      const share = vi.fn().mockResolvedValue(undefined);
      const canShare = vi.fn().mockReturnValue(true);
      vi.stubGlobal(
        "navigator",
        Object.setPrototypeOf({ canShare, share }, Object.getPrototypeOf(originalNavigator))
      );

      const blob = new Blob(["png"], { type: "image/png" });
      const result = await downloadBlob(blob, "test.png");

      expect(result).toEqual({ shared: true, aborted: false });
      expect(canShare).toHaveBeenCalled();
      expect(share).toHaveBeenCalled();
    });

    it("returns aborted when the share sheet is cancelled", async () => {
      const share = vi.fn().mockRejectedValue(new DOMException("Abort", "AbortError"));
      const canShare = vi.fn().mockReturnValue(true);
      vi.stubGlobal(
        "navigator",
        Object.setPrototypeOf({ canShare, share }, Object.getPrototypeOf(originalNavigator))
      );

      const blob = new Blob(["png"], { type: "image/png" });
      const originalCreateElement = document.createElement.bind(document);
      const createElementSpy = vi.spyOn(document, "createElement").mockImplementation((tag) => {
        const el = originalCreateElement(tag);
        el.click = vi.fn();
        return el;
      });

      const result = await downloadBlob(blob, "test.png");

      expect(result).toEqual({ shared: false, aborted: true });
      expect(share).toHaveBeenCalled();
      expect(createElementSpy).not.toHaveBeenCalled();

      createElementSpy.mockRestore();
    });
  });
});
