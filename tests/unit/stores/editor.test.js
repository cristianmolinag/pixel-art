import { describe, it, expect, beforeEach } from "vitest";
import { editor, PALETA } from "../../../src/lib/stores/editor.svelte.js";
import { Canvas } from "../../../src/lib/models/Canvas.js";

describe("editor store (F02/FR-008)", () => {
  it("expone una paleta fija de colores (FR-001/FR-007)", () => {
    expect(Array.isArray(PALETA)).toBe(true);
    expect(PALETA.length).toBeGreaterThanOrEqual(8);
  });

  it("pintarPixel pinta con el color actual (FR-003)", () => {
    editor.colorActual = "#123456";
    editor.pintarPixel(4, 4);
    expect(editor.model.getPixel(4, 4)).toEqual({ r: 18, g: 52, b: 86, a: 255 });
  });

  it("pintarPixel incrementa version para redibujar", () => {
    const before = editor.version;
    editor.pintarPixel(5, 5);
    expect(editor.version).toBe(before + 1);
  });

  it("cambiar colorActual lo deja listo para pintar", () => {
    editor.colorActual = "#00ff00";
    editor.pintarPixel(7, 7);
    expect(editor.model.getPixel(7, 7).g).toBe(255);
  });
});

describe("editor store (F03/FR-008)", () => {
  beforeEach(() => {
    editor.model = new Canvas(16, 16);
    editor.colorActual = "#ff0000";
    editor.version = 0;
  });

  it("empieza con la herramienta pincel por defecto", () => {
    expect(editor.herramienta).toBe("pincel");
  });

  it("seleccionarHerramienta cambia la herramienta activa", () => {
    editor.seleccionarHerramienta("borrador");
    expect(editor.herramienta).toBe("borrador");
    editor.seleccionarHerramienta("linea");
    expect(editor.herramienta).toBe("linea");
  });

  it("borrarPixel limpia la celda e incrementa version", () => {
    editor.pintarPixel(4, 4);
    const before = editor.version;
    editor.borrarPixel(4, 4);
    expect(editor.model.getPixel(4, 4).a).toBe(0);
    expect(editor.version).toBe(before + 1);
  });

  it("borrarPixel fuera de rango no incrementa version", () => {
    const before = editor.version;
    editor.borrarPixel(16, 16);
    expect(editor.version).toBe(before);
  });

  it("dibujarLinea pinta una recta entre dos puntos", () => {
    editor.colorActual = "#0000ff";
    editor.dibujarLinea(1, 1, 5, 1);
    for (let x = 1; x <= 5; x++) {
      expect(editor.model.getPixel(x, 1).b).toBe(255);
    }
  });

  it("dibujarLinea incrementa version", () => {
    const before = editor.version;
    editor.dibujarLinea(1, 1, 5, 1);
    expect(editor.version).toBe(before + 1);
  });

  it("rellenar pinta la región conectada", () => {
    editor.model.setPixel(3, 0, "#00ff00");
    editor.rellenar(0, 0);
    for (let x = 0; x < 3; x++) {
      expect(editor.model.getPixel(x, 0).r).toBe(255);
    }
    expect(editor.model.getPixel(3, 0).g).toBe(255);
  });

  it("rellenar no incrementa version si no hay cambio", () => {
    editor.model.setPixel(0, 0, "#ff0000");
    const before = editor.version;
    editor.rellenar(0, 0);
    expect(editor.version).toBe(before);
  });
});

describe("editor store (F04/FR-007)", () => {
  beforeEach(() => {
    editor.model = new Canvas(16, 16);
    editor.colorActual = "#ff0000";
    editor.version = 0;
    editor.undoStack = [];
    editor.redoStack = [];
  });

  it("un gesto con cambios crea un paso de undo al cerrar (FR-002/FR-004)", () => {
    editor.abrirAccion();
    editor.pintarPixel(2, 2);
    editor.pintarPixel(3, 2);
    editor.cerrarAccion();
    expect(editor.undoStack.length).toBe(1);
    expect(editor.canUndo).toBe(true);
  });

  it("un gesto sin cambios no crea pasos vacíos (US3/FR-002)", () => {
    editor.abrirAccion();
    editor.pintarPixel(2, 2);
    editor.cerrarAccion();
    editor.abrirAccion();
    editor.pintarPixel(2, 2);
    editor.cerrarAccion();
    expect(editor.undoStack.length).toBe(1);
  });

  it("un gesto fuera de rango no crea paso de undo", () => {
    editor.abrirAccion();
    editor.pintarPixel(16, 16);
    editor.cerrarAccion();
    expect(editor.undoStack.length).toBe(0);
  });

  it("deshacer revierte la última acción y permite rehacer (FR-002/FR-003)", () => {
    editor.abrirAccion();
    editor.pintarPixel(2, 2);
    editor.cerrarAccion();
    editor.deshacer();
    expect(editor.model.getPixel(2, 2).a).toBe(0);
    expect(editor.redoStack.length).toBe(1);
    expect(editor.canRedo).toBe(true);
    editor.rehacer();
    expect(editor.model.getPixel(2, 2).r).toBe(255);
    expect(editor.canRedo).toBe(false);
  });

  it("deshacer y rehacer incrementan version para redibujar", () => {
    editor.abrirAccion();
    editor.pintarPixel(2, 2);
    editor.cerrarAccion();
    const beforeUndo = editor.version;
    editor.deshacer();
    expect(editor.version).toBe(beforeUndo + 1);
    editor.rehacer();
    expect(editor.version).toBe(beforeUndo + 2);
  });

  it("la pila de undo conserva el orden de las acciones", () => {
    editor.abrirAccion();
    editor.pintarPixel(1, 1);
    editor.cerrarAccion();
    editor.abrirAccion();
    editor.pintarPixel(2, 2);
    editor.cerrarAccion();
    editor.deshacer();
    expect(editor.model.getPixel(2, 2).a).toBe(0);
    expect(editor.model.getPixel(1, 1).r).toBe(255);
    editor.deshacer();
    expect(editor.model.getPixel(1, 1).a).toBe(0);
  });

  it("una acción nueva tras deshacer limpia la pila de rehacer (FR-006)", () => {
    editor.abrirAccion();
    editor.pintarPixel(2, 2);
    editor.cerrarAccion();
    editor.deshacer();
    expect(editor.canRedo).toBe(true);
    editor.abrirAccion();
    editor.pintarPixel(5, 5);
    editor.cerrarAccion();
    expect(editor.redoStack.length).toBe(0);
    expect(editor.canRedo).toBe(false);
  });

  it("deshacer sin historial y rehacer sin historial no hacen nada (FR-005)", () => {
    expect(editor.canUndo).toBe(false);
    expect(editor.canRedo).toBe(false);
    const before = editor.version;
    editor.deshacer();
    editor.rehacer();
    expect(editor.version).toBe(before);
  });
});

describe("editor store (F06 colores recientes)", () => {
  beforeEach(() => {
    localStorage.clear();
    editor.model = new Canvas(16, 16);
    editor.colorActual = "#ff0000";
    editor.version = 0;
    editor.coloresRecientes = [];
  });

  it("registrarColorUsado agrega el color primero y normaliza", () => {
    editor.registrarColorUsado("#00ff00");
    expect(editor.coloresRecientes).toEqual(["#00FF00"]);
    expect(localStorage.getItem("pixel-art-studio:colores-recientes")).toBe(
      JSON.stringify(["#00FF00"])
    );
  });

  it("registrarColorUsado mueve al frente sin duplicar (LRU)", () => {
    editor.registrarColorUsado("#111111");
    editor.registrarColorUsado("#222222");
    editor.registrarColorUsado("#111111");
    expect(editor.coloresRecientes).toEqual(["#111111", "#222222"]);
  });

  it("registrarColorUsado limita a 6 recientes", () => {
    for (let i = 1; i <= 8; i++) {
      const hex = `#0${i}0${i}0${i}`;
      editor.registrarColorUsado(hex);
    }
    expect(editor.coloresRecientes.length).toBe(6);
    expect(editor.coloresRecientes[0]).toBe("#080808");
  });

  it("registrarColorUsado ignora colores inválidos", () => {
    editor.registrarColorUsado("rojo");
    expect(editor.coloresRecientes).toEqual([]);
  });

  it("pintarPixel registra el color usado (F06)", () => {
    editor.colorActual = "#147df5";
    editor.pintarPixel(2, 2);
    expect(editor.coloresRecientes).toContain("#147DF5");
  });

  it("dibujarLinea y rellenar registran el color usado (F06)", () => {
    editor.colorActual = "#ffd300";
    editor.dibujarLinea(0, 0, 4, 0);
    expect(editor.coloresRecientes).toContain("#FFD300");

    editor.colorActual = "#580aff";
    editor.rellenar(8, 8);
    expect(editor.coloresRecientes).toContain("#580AFF");
  });

  it("acciones sin cambio no registran color (F06)", () => {
    editor.colorActual = "#147df5";
    editor.pintarPixel(16, 16);
    editor.dibujarLinea(-1, -1, -2, -2);
    editor.rellenar(16, 16);
    expect(editor.coloresRecientes).toEqual([]);
  });

  it("seleccionarColor setea colorActual y normaliza", () => {
    editor.seleccionarColor("#abc");
    expect(editor.colorActual).toBe("#AABBCC");
  });

  it("seleccionarColor no reordena los recientes", () => {
    editor.registrarColorUsado("#111111");
    editor.registrarColorUsado("#222222");
    editor.seleccionarColor("#111111");
    expect(editor.colorActual).toBe("#111111");
    expect(editor.coloresRecientes).toEqual(["#222222", "#111111"]);
  });

  it("seleccionarColor con color nuevo no lo agrega a recientes (solo pintando)", () => {
    editor.seleccionarColor("#123456");
    expect(editor.coloresRecientes).toEqual([]);
  });
});

describe("editor store (F08 cuadrícula)", () => {
  beforeEach(() => {
    localStorage.clear();
    editor.mostrarCuadricula = true;
  });

  it("muestra la cuadrícula por defecto", () => {
    expect(editor.mostrarCuadricula).toBe(true);
  });

  it("alternarCuadricula oculta y vuelve a mostrar", () => {
    editor.alternarCuadricula();
    expect(editor.mostrarCuadricula).toBe(false);
    editor.alternarCuadricula();
    expect(editor.mostrarCuadricula).toBe(true);
  });

  it("alternarCuadricula persiste la preferencia en localStorage", () => {
    editor.alternarCuadricula();
    expect(localStorage.getItem("pixel-art-studio:mostrar-cuadricula")).toBe("false");
    editor.alternarCuadricula();
    expect(localStorage.getItem("pixel-art-studio:mostrar-cuadricula")).toBe("true");
  });
});

describe("editor store (F09 matriz)", () => {
  beforeEach(() => {
    localStorage.clear();
    editor.model = new Canvas(16, 16);
    editor.version = 0;
    editor.undoStack = [];
    editor.redoStack = [];
  });

  it("establecerMatriz cambia las dimensiones del lienzo", () => {
    expect(editor.establecerMatriz(32, 48)).toBe(true);
    expect(editor.model.cols).toBe(32);
    expect(editor.model.rows).toBe(48);
  });

  it("cambiar de matriz limpia el lienzo (decisión de diseño)", () => {
    editor.pintarPixel(1, 1);
    editor.establecerMatriz(32, 32);
    expect(editor.model.getPixel(1, 1).a).toBe(0);
  });

  it("rechaza dimensiones fuera de rango o no numéricas", () => {
    expect(editor.establecerMatriz(0, 16)).toBe(false);
    expect(editor.establecerMatriz(16, 500)).toBe(false);
    expect(editor.establecerMatriz("a", 16)).toBe(false);
    expect(editor.establecerMatriz(undefined, 16)).toBe(false);
    expect(editor.establecerMatriz(3, 16)).toBe(false);
    expect(editor.model.cols).toBe(16);
  });

  it("conserva el historial: deshacer omite snapshots de otra dimensión", () => {
    editor.abrirAccion();
    editor.pintarPixel(1, 1);
    editor.cerrarAccion();
    editor.establecerMatriz(32, 32);
    editor.deshacer();
    expect(editor.model.getPixel(1, 1).a).toBe(0);
    expect(editor.undoStack.length).toBe(0);
  });
});

describe("editor store (F10 zoom)", () => {
  beforeEach(() => {
    editor.zoom = 1;
    editor.panX = 0;
    editor.panY = 0;
  });

  it("acercar sube el zoom en pasos de 0.5", () => {
    editor.zoom = 1;
    editor.acercar();
    expect(editor.zoom).toBe(1.5);
    editor.acercar();
    expect(editor.zoom).toBe(2);
  });

  it("acercar nunca supera el máximo 4×", () => {
    editor.zoom = 4;
    editor.acercar();
    expect(editor.zoom).toBe(4);
  });

  it("alejar baja el zoom en pasos de 0.5 sin pasar del mínimo 1× (100%)", () => {
    editor.zoom = 1.5;
    editor.alejar();
    expect(editor.zoom).toBe(1);
    editor.alejar();
    expect(editor.zoom).toBe(1);
  });

  it("establecerZoom (pellizco) fija el zoom dentro del rango 1–4", () => {
    editor.establecerZoom(2.3);
    expect(editor.zoom).toBe(2.3);
    editor.establecerZoom(8);
    expect(editor.zoom).toBe(4);
    editor.establecerZoom(0.1);
    expect(editor.zoom).toBe(1);
  });

  it("reiniciarZoom vuelve a 1× y centra (limpia el pan)", () => {
    editor.zoom = 3.5;
    editor.desplazarPan(40, -25);
    editor.reiniciarZoom();
    expect(editor.zoom).toBe(1);
    expect(editor.panX).toBe(0);
    expect(editor.panY).toBe(0);
  });

  it("desplazarPan suma desplazamiento y respeta límites", () => {
    editor.desplazarPan(30, 20, 50, 50);
    expect(editor.panX).toBe(30);
    expect(editor.panY).toBe(20);
    editor.desplazarPan(40, 40, 50, 50);
    expect(editor.panX).toBe(50);
    expect(editor.panY).toBe(50);
    editor.desplazarPan(-200, -200, 50, 50);
    expect(editor.panX).toBe(-50);
    expect(editor.panY).toBe(-50);
  });
});