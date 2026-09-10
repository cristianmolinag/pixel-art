import { describe, it, expect, vi, afterEach } from "vitest";
import { decodeImageFile } from "../../../src/lib/services/referenceImage.js";

const file = new File(["pixels"], "reference.png", { type: "image/png" });

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("referenceImage service (F19 #43)", () => {
  it("decodes with createImageBitmap when available", async () => {
    const fakeBitmap = { width: 64, height: 64, close: () => {} };
    const decode = vi.fn(async () => fakeBitmap);
    vi.stubGlobal("createImageBitmap", decode);

    const result = await decodeImageFile(file);

    expect(decode).toHaveBeenCalledWith(file);
    expect(result).toBe(fakeBitmap);
  });

  it("falls back to an HTMLImageElement when createImageBitmap is unavailable", async () => {
    vi.stubGlobal("createImageBitmap", undefined);
    class FakeImage {
      set src(_value) {
        queueMicrotask(() => this.onload?.());
      }
    }
    vi.stubGlobal("Image", FakeImage);
    const createObjectURL = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock");
    const revokeObjectURL = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});

    const result = await decodeImageFile(file);

    expect(result).toBeInstanceOf(FakeImage);
    expect(createObjectURL).toHaveBeenCalledWith(file);
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:mock");
  });

  it("rejects when the fallback image fails to load", async () => {
    vi.stubGlobal("createImageBitmap", undefined);
    class FakeImage {
      set src(_value) {
        queueMicrotask(() => this.onerror?.(new Event("error")));
      }
    }
    vi.stubGlobal("Image", FakeImage);
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});

    await expect(decodeImageFile(file)).rejects.toThrow(/reference image/i);
  });
});
