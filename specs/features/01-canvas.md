# Feature 001: Canvas

**Estado:** ✅ Implementada
**Spec escrita:** 2026-09-04
**Objetivo:** `specs/project/objective.md`
**Issue asociado:** [#11](https://github.com/cristianmolinag/pixel-art/issues/11)

> Esta spec es el **ancla** de la feature. Define **qué** debe hacer (sin decir cómo).
> Las decisiones técnicas van en la sección "Decisiones" al final — se mantienen
> separadas para que el "qué" no se rompa si cambia la tecnología.

## Historia de usuario (resumen)

> Como **usuario**, quiero **un lienzo de píxeles cuadriculado** para **tener un área
> de dibujo visible** sobre la que pintar en features siguientes.

## User stories (priorizadas)

Cada user story es un **slice independiente** que por sí solo entrega valor y puede
probarse de forma aislada.

### User Story 1 — Ver el lienzo (Priority: P1)

Como usuario, quiero ver un lienzo de píxeles cuadriculado de 16×16 celdas.

**Por qué esta prioridad:** es la base mínima: sin área de dibujo visible no hay nada más.

**Test independiente:** puede probarse viendo el grid renderizado, sin necesidad de
ninguna otra pieza del editor.

**Acceptance Scenarios (Given/When/Then):**

1. **Given** que abro el editor, **When** se carga la vista, **Then** veo un grid
   cuadrado de 16 columnas y 16 filas.
2. **Given** el grid visible, **When** observo una celda, **Then** distingo cada celda
   por las líneas de la cuadrícula.
3. **Given** el grid visible, **When** cuento las celdas en un borde, **Then** hay
   exactamente 16 celdas por lado.

---
### User Story 2 — Lienzo responsivo mobile-first (Priority: P2)

Como usuario, quiero que el lienzo se vea bien tanto en móvil como en desktop.

**Por qué esta prioridad:** el mobile-first es un principio del proyecto, pero el grid
funcional (US1) tiene prioridad sobre responder bien en todas las pantallas.

**Test independiente:** puede probarse cambiando el ancho de la ventana y verificando
que el lienzo sigue siendo cuadrado y no desborda.

**Acceptance Scenarios (Given/When/Then):**

1. **Given** una pantalla angosta (celular), **When** se muestra el lienzo, **Then**
   ocupa el ancho disponible (con un `p-4` de margen) y mantiene proporción cuadrada
   (`aspect-ratio: 1/1`).
2. **Given** una pantalla ancha (desktop), **When** se muestra el lienzo, **Then** su
   tamaño está limitado a **512px** máximo (no se estira infinitamente).
3. **Given** un lienzo escalado, **When** se amplía el display, **Then** los píxeles se
   ven nítidos y con bordes marcados (`image-rendering: pixelated`).
4. **Given** que el usuario toca/arrastra sobre el lienzo, **When** lo hace desde móvil,
   **Then** la página no hace scroll ni zoom accidental (`touch-action` controlada).

---

## Requisitos funcionales

- **FR-001**: El sistema DEBE renderizar un lienzo de 16×16 celdas.
- **FR-002**: El sistema DEBE mostrar una cuadrícula visible entre celdas.
- **FR-003**: El lienzo DEBE verse cuadrado en cualquier pantalla.
- **FR-004**: El sistema DEBE limitar el tamaño del lienzo a **512px** en pantallas grandes.
- **FR-005**: El display DEBE escalar los píxeles con `image-rendering: pixelated`.
- **FR-006**: El lienzo NO DEBE provocar scroll/zoom accidental en móvil.

## Success Criteria

- **SC-001**: Un usuario puede cargar el editor en un celular y ver el grid 16×16
  completo dentro de la pantalla, sin scroll horizontal.
- **SC-002**: Un usuario puede cargar el editor en desktop y ver el grid sin que
  este se estire más allá de un tamaño máximo razonable.
- **SC-003**: Los escenarios Given/When/Then de US1 y US2 se verifican con tests.

## Assumptions

- Se usará el modelo de dominio `Canvas` (`src/lib/models/Canvas.js`) ya existente.
- El stack es Svelte 5 + Vite + Tailwind CSS v4 (no cambiar en esta feature).
- Cada celda = 1 píxel real del canvas HTML; el display escala con CSS.
- Componente Svelte nuevo dedicado al canvas (p. ej. `PixelCanvas.svelte`).

---

## Decisiones (cómo — tecnología)

*Sección separada del "qué" para que la spec no dependa de la implementación.*

- **Canvas nativo** (API 2D, `fillRect`) en lugar de grid de divs: escala con grids
  grandes y es la API real del proyecto.
- Cada celda del canvas = **1 píxel real**; el display se escala con CSS usando
  `image-rendering: pixelated`.
- El modelo `Canvas` es una clase pura (fáciles de testear con el mock de
  `OffscreenCanvas` en `tests/setup.js`).
- Cuadrícula como **overlay CSS** sobre el canvas (desde F08), para líneas nítidas a
  cualquier escala; antes eran líneas `stroke` de `lineWidth 0.1` que quedaban invisibles.

> **Decisión tomada**: el tamaño de celda visible / zoom de edición **queda fuera de
> esta feature** y se resolverá en la feature 02 (colores / pintar). Aquí el display
> simplemente escala el grid 16×16 con CSS.

## Relacionado con

- Siguiente: feature 02 (colores / pintar píxeles).
