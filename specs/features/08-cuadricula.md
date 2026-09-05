# Feature 008: Toggle de cuadrícula en el lienzo

**Estado:** ✅ Implementada
**Spec escrita:** 2026-09-04
**Tests:** `tests/unit/canvas/draw.test.js`, `tests/unit/stores/editor.test.js`,
`tests/unit/components/Toolbar.test.js`
**Objetivo:** `specs/project/objective.md`
**Issue asociado:** [#16](https://github.com/cristianmolinag/pixel-art/issues/16)
**Depende de:** F01 Canvas (#11, implementada)

> Esta spec es el **ancla** de la feature. Define **qué** debe hacer (sin decir cómo).
> Las decisiones técnicas van en la sección "Decisiones" al final, separadas del "qué".

## Historia de usuario (resumen)

> Como **usuario**, quiero **mostrar u ocultar la cuadrícula del lienzo** para **ver el dibujo
> limpio o distinguir las celdas** según lo que esté haciendo.

## Problema actual

La cuadrícula se muestra **siempre** desde F01 (FR-002), dibujada como líneas sobre el canvas en
`src/lib/canvas/draw.js` (`drawCanvas` ya acepta `{ grid = false }`, pero no hay UI que lo
controle). En lienzos grandes se ve ruidosa y no hay forma de ocultarla al ver el resultado.

## User stories (priorizadas)

Cada user story es un **slice independiente** que entrega valor y puede probarse sola.

### User Story 1 — Alternar la cuadrícula (Priority: P1)

Como usuario, quiero un botón en el toolbar que muestre/oculte la cuadrícula al instante.

**Por qué esta prioridad:** es el reemplazo directo del comportamiento fijo actual (cambio único
de estado + render).

**Test independiente:** el toggle cambia el estado y redibuja sin tocar los píxeles ni el historial.

**Acceptance Scenarios (Given/When/Then):**

1. **Given** el lienzo visible con cuadrícula, **When** toco el toggle, **Then** la cuadrícula se
   oculta y el dibujo queda intacto.
2. **Given** la cuadrícula oculta, **When** toco el toggle de nuevo, **Then** la cuadrícula vuelve
   a mostrarse.
3. **Given** el toggle, **When** lo inspecciono, **Then** expone `aria-pressed` y un `aria-label`
   descriptivo (Mostrar/Ocultar cuadrícula).
4. **Given** el draw para test, **When** llamo `drawCanvas` con `grid: false`, **Then** no se
   trazan líneas de cuadrícula.

## No-objetivos

- No cambiar las dimensiones del lienzo (F09).
- No zoom (F10).

## Decisiones

### Resueltas (decidido con el usuario)

- **Persistencia**: el estado del toggle persiste en localStorage
  (clave `pixel-art-studio:mostrar-cuadricula`, ausente → `true`); arranca mostrando la cuadrícula.
- **Alcance**: el toggle aplica **solo al lienzo de edición**; las miniaturas de la galería no cambian.
- **Ubicación**: botón **junto a las herramientas** en el toolbar (icono `Grid3x3` de lucide, con
  `aria-pressed`). F07 (layout) reorganizará grupos más adelante sin cambiar esta lógica.
- El canvas de `PixelCanvas.svelte` se renderiza a **resolución de dispositivo** (ancho/alto =
  rectángulo × DPR, ctx en identidad). Cada celda del modelo se dibuja en el rect
  `[round(frontera_i × dpr), round(frontera_{i+1} × dpr))` calculado con `frontera = (base −
  base·zoom)/2 + pan`; el zoom/pan se aplican **en el draw** (sin `transform` CSS). La cuadrícula se
  dibuja en el **mismo canvas**, después de los píxeles, con el **mismo redondeo** (`aX`/`aY`) y
  líneas de **1px de dispositivo** — por eso queda siempre alineada y nunca se pierde en mobile con
  zoom/pan. Solo se trazan los tramos adyacentes a **celdas vacías** (alfa de la snapshot del
  modelo), de modo que las líneas sirven de guía en celdas vacías y los píxeles pintados quedan
  **sin borde** (decidido con el usuario). El color lo comparte `GRID_COLOR` (`#cccccc`) en
  `src/lib/canvas/draw.js`. Se repinta al alternar `mostrarCuadricula`, al cambiar zoom/pan y al
  redimensionar el contenedor (ResizeObserver). Fundamentos de los intentos previos:
  `lineWidth 0.1` en canvas de 16×16 quedaba sub-píxel e invisible al escalar; dibujar líneas a 1px
  interno las volvía bloques completos al escalar por CSS; un overlay con líneas redondeadas se
  desalineaba con el contenido escalado por `transform` (el GPU rasteriza con otra regla).
- El estado vive en el store de editor (`mostrarCuadricula` + `alternarCuadricula`).
- El tamaño de la cuadrícula se escala con la matriz del lienzo (preparado para F09).

## Tests

- `tests/unit/canvas/draw.test.js`: `drawCanvas` limpia y vuelca píxeles; no traza líneas (la
  cuadrícula la dibuja `PixelCanvas`); exporta `GRID_COLOR`.
- `tests/unit/components/PixelCanvas.test.js`: a resolución de dispositivo (320×320, dpr 1) dibuja
  segmentos de 1px device por frontera en celdas vacías presente/ausente según el estado.
- `tests/unit/stores/editor.test.js`: estado por defecto, alternar, persistencia en localStorage.
- `tests/unit/components/Toolbar.test.js`: toggle con `aria-pressed`, cambio de `aria-label` e icono.

## Relacionado con

- Anterior: F01 Canvas (#11). #8 Mejoras mobile y UX; F07 Layout (#15) define el toolbar.