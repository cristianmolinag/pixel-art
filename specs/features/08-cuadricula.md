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
- La cuadrícula es **fondo CSS del canvas** en `PixelCanvas.svelte` (`background-color` blanco +
  dos `linear-gradient` de 1px con `background-size` = `100/cols % 100/rows %`). Al estar
  **detrás de los píxeles**, las líneas sirven solo de **guía** en celdas vacías y los píxeles
  pintados quedan **sin borde** (decidido con el usuario). El canvas se limpia (`clearRect`) y
  vuelca los píxeles en cada redibujo para no dejar "fantasmas". Las líneas del antiguo enfoque
  (`lineWidth 0.1` en canvas de 16×16) quedaban sub-píxel e invisibles al escalar.
- El estado vive en el store de editor (`mostrarCuadricula` + `alternarCuadricula`).
- El tamaño de la cuadrícula se escala con la matriz del lienzo (preparado para F09).

## Tests

- `tests/unit/canvas/draw.test.js`: `drawCanvas` limpia y vuelca píxeles; no dibuja cuadrícula.
- `tests/unit/components/PixelCanvas.test.js`: la cuadrícula (fondo CSS) presente/ausente según el
  estado y `background-size` proporcional a la matriz.
- `tests/unit/stores/editor.test.js`: estado por defecto, alternar, persistencia en localStorage.
- `tests/unit/components/Toolbar.test.js`: toggle con `aria-pressed`, cambio de `aria-label` e icono.

## Relacionado con

- Anterior: F01 Canvas (#11). #8 Mejoras mobile y UX; F07 Layout (#15) define el toolbar.