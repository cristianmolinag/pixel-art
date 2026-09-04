# Feature 002: Colores y pintar píxeles

**Estado:** ✅ Implementada
**Spec escrita:** 2026-09-04
**Tests:** `tests/unit/models/Canvas.test.js`, `tests/unit/stores/editor.test.js`,
`tests/unit/components/PixelCanvas.test.js`, `tests/unit/components/Palette.test.js`
**Objetivo:** `specs/project/objective.md`
**Issue asociado:** [#12](https://github.com/cristianmolinag/pixel-art/issues/12)
**Depende de:** F01 Canvas (#11, implementada)

> Esta spec es el **ancla** de la feature. Define **qué** debe hacer (sin decir cómo).
> Las decisiones técnicas van en la sección "Decisiones" al final, separadas del "qué".

## Historia de usuario (resumen)

> Como **usuario**, quiero **elegir un color y pintar sobre el lienzo** para **empezar
> a dibujar** pixel art.

## User stories (priorizadas)

Cada user story es un **slice independiente** que entrega valor y puede probarse sola.

### User Story 1 — Elegir un color (Priority: P1)

Como usuario, quiero poder elegir un color de una paleta para seleccionar con qué pintar.

**Por qué esta prioridad:** sin poder elegir color no se puede pintar nada concreto.

**Test independiente:** puede probarse viendo la paleta y cambiando la selección de color.

**Acceptance Scenarios (Given/When/Then):**

1. **Given** que abro el editor, **When** se muestra la vista, **Then** veo una paleta
   de colores accesible.
2. **Given** la paleta visible, **When** toco/clickeo un color de la paleta, **Then**
   ese color queda seleccionado y se marca visualmente.

---
### User Story 2 — Pintar un píxel (Priority: P1)

Como usuario, quiero tocar una celda del lienzo para pintarla del color seleccionado.

**Por qué esta prioridad:** es la acción de dibujo mínima que entrega valor real.

**Test independiente:** puede probarse pintando una celda y viendo que cambia de color.

**Acceptance Scenarios (Given/When/Then):**

1. **Given** un color seleccionado y el lienzo visible, **When** toco una celda vacía,
   **Then** esa celda se pinta del color seleccionado.
2. **Given** una celda ya pintada, **When** la toco con otro color seleccionado,
   **Then** la celda cambia al nuevo color.
3. **Given** que pinto varias celdas, **When** miro el lienzo, **Then** todas quedan
   pintadas (persisten, no se borran solas).

---
### User Story 3 — Pintar arrastrando (Priority: P2)

Como usuario, quiero arrastrar el dedo/mouse sobre el lienzo para pintar de corrido.

**Por qué esta prioridad:** es más fluido para dibujar, pero la base es pintar por toque (US2).

**Test independiente:** puede probarse arrastrando sobre varias celdas y verificando que todas se pintan.

**Acceptance Scenarios (Given/When/Then):**

1. **Given** un color seleccionado, **When** arrastro sobre varias celdas sin soltar,
   **Then** todas las celdas por las que paso se pintan del color seleccionado.
2. **Given** que suelto el dedo/mouse, **When** sigo tocando el lienzo, **Then** ya no
   pinta nada (la acción acabó).
3. **Given** que arrastro en móvil, **When** el dedo se mueve sobre el lienzo, **Then**
   no hay scroll ni zoom accidental de la página.

---

## Requisitos funcionales

- **FR-001**: El sistema DEBE ofrecer una paleta de colores seleccionables.
- **FR-002**: El sistema DEBE marcar visualmente el color actualmente seleccionado.
- **FR-003**: El sistema DEBE pintar la celda tocada/clickeada con el color seleccionado.
- **FR-004**: Las celdas pintadas DEBEN persistir en el lienzo mientras se edita.
- **FR-005**: El sistema DEBE funcionar con entrada táctil en móvil (sin scroll/zoom accidental).
- **FR-006**: El sistema DEBE pintar las celdas por las que el usuario arrastra (US3).
- **FR-007**: El sistema DEBE ofrecer una paleta fija de colores **y** un selector de
  color libre (`input type=color`).
- **FR-008**: El color seleccionado y el estado del lienzo viven en el **store central**
  `editor.svelte.js` (runes), por la arquitectura uni-direccional del proyecto.

> **Decisión tomada**: el alcance del pincel es **1 celda por toque**; el tamaño de
> pincel se reserva para otra feature (no se implementa en F02).

## Success Criteria

- **SC-001**: Un usuario puede elegir un color en la paleta y la selección se marca visualmente.
- **SC-002**: Un usuario puede pintar una celda y esta cambia al color seleccionado al instante.
- **SC-003**: Las celdas pintadas siguen visibles tras redibujar/continuar editando.
- **SC-004**: Se puede pintar arrastrando en móvil sin que la página haga scroll/zoom.

## Assumptions

- Se reutiliza el modelo `Canvas` (`src/lib/models/Canvas.js`) y la lógica de dibujo
  (`src/lib/canvas/draw.js`) de F01.
- El lienzo sigue siendo 16×16 fijo; el tamaño de pincel se decide en otra feature.
- **UI en español** (principio del proyecto).
- El borrador / relleno / línea no pertenecen a esta feature (los cubre F03 → #5).

---

## Decisiones (cómo — tecnología)

*Sección separada del "qué" para que la spec no dependa de la implementación.*

- **Store central** (`src/lib/stores/editor.svelte.js`) con runes: `colorActual`,
  `model` (el lienzo), y método `pintarPixel(x, y)`.
- **Paleta fija** de ~16 colores como componente Svelte (`Palette.svelte`) + un
  `input type=color` para color libre.
- **PixelCanvas** agrega manejo de eventos `pointerdown` / `pointermove` / `pointerup`
  para pintar por toque y arrastre; convierte coordenadas de pantalla a celda del grid.
- El modelo `Canvas` gana el método `setPixel(x, y, color)` para escribir píxeles
  (hoy solo tiene `getPixel`).
- `draw.js` ya redibuja píxeles con `model.getPixel`; `setPixel` persiste en el
  OffscreenCanvas y se vuelve a dibujar al canvas del DOM.