# Feature 008: Toggle de cuadrícula en el lienzo

**Estado:** 📋 Pendiente
**Spec escrita:** 2026-09-04
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

### Pendientes (si no están resueltas al implementar)

- ¿El estado del toggle persiste entre sesiones (localStorage) o solo durante la sesión?
- Icono a usar (se propone `Grid2x2`/`Grid3x3` de lucide) y posición en el toolbar (ver F07).
- ¿Aplicar también a la previsualización de la galería o solo al lienzo de edición?

## Tests

- `tests/unit/canvas/draw.test.js`: `drawCanvas` con `grid: false` no llama a `stroke` del grid
  (ya existe cobertura parcial del orden fondo → píxeles → grid).
- `tests/unit/stores/editor.test.js` y `tests/unit/components/Toolbar.test.js`: toggle de estado,
  `aria-pressed`, redibujo.

## Relacionado con

- Anterior: F01 Canvas (#11). #8 Mejoras mobile y UX; F07 Layout (#15) define el toolbar.