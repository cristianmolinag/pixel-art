import { describe, it, expect, beforeEach } from "vitest";
import { guardarDibujo, listarDibujos, eliminarDibujo } from "../../../src/lib/services/galeria.js";
import { reiniciarGaleriaDB } from "../../helpers.js";

beforeEach(async () => {
  await reiniciarGaleriaDB();
});

describe("servicio galeria (F05/FR-009)", () => {
  it("guardarDibujo almacena un dibujo y le asigna un id autogenerado", async () => {
    const id = await guardarDibujo({ nombre: "A", pixeles: [0], createdAt: 1 });
    expect(id).toBeTypeOf("number");
    const lista = await listarDibujos();
    expect(lista).toHaveLength(1);
    expect(lista[0].nombre).toBe("A");
    expect(lista[0].id).toBe(id);
  });

  it("guardarDibujo actualiza un dibujo existente con el mismo id", async () => {
    const id = await guardarDibujo({ nombre: "A", pixeles: [0], createdAt: 1 });
    await guardarDibujo({ id, nombre: "A v2", pixeles: [1], createdAt: 2 });
    const lista = await listarDibujos();
    expect(lista).toHaveLength(1);
    expect(lista[0].nombre).toBe("A v2");
    expect(lista[0].createdAt).toBe(2);
  });

  it("listarDibujos ordena del más reciente al más antiguo por createdAt", async () => {
    await guardarDibujo({ nombre: "viejo", createdAt: 100 });
    await guardarDibujo({ nombre: "reciente", createdAt: 300 });
    await guardarDibujo({ nombre: "medio", createdAt: 200 });

    const lista = await listarDibujos();
    expect(lista.map((d) => d.nombre)).toEqual(["reciente", "medio", "viejo"]);
  });

  it("eliminarDibujo quita el registro (FR-006)", async () => {
    const id1 = await guardarDibujo({ nombre: "A", createdAt: 1 });
    const id2 = await guardarDibujo({ nombre: "B", createdAt: 2 });

    await eliminarDibujo(id2);
    const lista = await listarDibujos();
    expect(lista).toHaveLength(1);
    expect(lista[0].id).toBe(id1);
  });

  it("los dibujos sobreviven entre operaciones (persistencia real IndexedDB)", async () => {
    await guardarDibujo({ nombre: "persistente", pixeles: [9, 9, 9], createdAt: 42 });
    const directo = await listarDibujos();
    expect(directo).toHaveLength(1);
    expect(directo[0].pixeles).toEqual([9, 9, 9]);
    expect(directo[0].createdAt).toBe(42);
  });
});