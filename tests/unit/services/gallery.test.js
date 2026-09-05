import { describe, it, expect, beforeEach } from "vitest";
import { saveDrawing, listDrawings, deleteDrawing } from "../../../src/lib/services/gallery.js";
import { resetGalleryDB } from "../../helpers.js";

beforeEach(async () => {
  await resetGalleryDB();
});

describe("gallery service (F05/FR-009)", () => {
  it("saveDrawing stores a drawing and assigns an auto-generated id", async () => {
    const id = await saveDrawing({ name: "A", pixels: [0], createdAt: 1 });
    expect(id).toBeTypeOf("number");
    const lista = await listDrawings();
    expect(lista).toHaveLength(1);
    expect(lista[0].name).toBe("A");
    expect(lista[0].id).toBe(id);
  });

  it("saveDrawing updates an existing drawing with the same id", async () => {
    const id = await saveDrawing({ name: "A", pixels: [0], createdAt: 1 });
    await saveDrawing({ id, name: "A v2", pixels: [1], createdAt: 2 });
    const lista = await listDrawings();
    expect(lista).toHaveLength(1);
    expect(lista[0].name).toBe("A v2");
    expect(lista[0].createdAt).toBe(2);
  });

  it("listDrawings sorts from newest to oldest by createdAt", async () => {
    await saveDrawing({ name: "viejo", createdAt: 100 });
    await saveDrawing({ name: "reciente", createdAt: 300 });
    await saveDrawing({ name: "medio", createdAt: 200 });

    const lista = await listDrawings();
    expect(lista.map((d) => d.name)).toEqual(["reciente", "medio", "viejo"]);
  });

  it("deleteDrawing removes the record (FR-006)", async () => {
    const id1 = await saveDrawing({ name: "A", createdAt: 1 });
    const id2 = await saveDrawing({ name: "B", createdAt: 2 });

    await deleteDrawing(id2);
    const lista = await listDrawings();
    expect(lista).toHaveLength(1);
    expect(lista[0].id).toBe(id1);
  });

  it("drawings survive across operations (real IndexedDB persistence)", async () => {
    await saveDrawing({ name: "persistente", pixels: [9, 9, 9], createdAt: 42 });
    const directo = await listDrawings();
    expect(directo).toHaveLength(1);
    expect(directo[0].pixels).toEqual([9, 9, 9]);
    expect(directo[0].createdAt).toBe(42);
  });
});