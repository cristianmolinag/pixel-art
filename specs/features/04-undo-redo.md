# Feature 004: Undo/Redo (deshacer/rehacer)

**Estado:** ✅ Implementada
**Spec escrita:** 2026-09-04
**Tests:** `tests/unit/models/Canvas.test.js`, `tests/unit/stores/editor.test.js`,
`tests/unit/components/PixelCanvas.test.js`, `tests/unit/components/Toolbar.test.js`
**Objetivo:** `specs/project/objective.md`
**Issue asociado:** [#13](https://github.com/cristianmolinag/pixel-art/issues/13)
**Depende de:** F03 Herramientas (#5, implementada)

> Esta spec es el **ancla** de la feature. Define **qué** debe hacer (sin decir cómo).
> Las decisiones técnicas van en la sección "Decisiones" al final, separadas del "qué".

## Historia de usuario (resumen)

> Como **usuario**, quiero **deshacer y rehacer acciones de dibujo** para **corregir
> errores sin tener que borrar píxel por píxel**.

## User stories (priorizadas)

Cada user story es un **slice independiente** que entrega valor y puede probarse sola.

### User Story 1 — Deshacer la última acción (Priority: P1)

Como usuario, quiero deshacer la última acción de dibujo.

**Por qué esta prioridad:** es el corazón de la feature: sin deshacer no hay corrección de errores.

**Test independiente:** puede probarse dibujando y tocando "Deshacer" hasta ver el lienzo anterior.

**Acceptance Scenarios (Given/When/Then):**

1. **Given** que pinté algunos píxeles, **When** toco "Deshacer", **Then** el lienzo vuelve
   al estado anterior a esa acción.
2. **Given** que no he dibujado nada, **When** miro el botón "Deshacer", **Then** está
   deshabilitado y no hay nada que deshacer.
3. **Given** que dibujé un trazo de pincel (arrastre con varios píxeles), **When** toco
   "Deshacer" **una sola vez**, **Then** todo el trazo se revierte de una vez.

---

### User Story 2 — Rehacer la acción deshecha (Priority: P2)

Como usuario, quiero rehacer una acción que deshice por error.

**Por qué esta prioridad:** complementa al deshacer; sin él, un clic accidental en
"Deshacer" perdería trabajo irremediablemente.

**Test independiente:** puede probarse deshaciendo una acción y tocando "Rehacer".

**Acceptance Scenarios (Given/When/Then):**

1. **Given** que deshice una acción, **When** toco "Rehacer", **Then** la acción vuelve a
   aplicarse y el lienzo queda como estaba antes de deshacer.
2. **Given** que deshice varias acciones, **When** las rehago una a una, **Then** se
   restauran en el mismo orden en que las deshice.
3. **Given** que deshice una acción pero luego dibujo algo nuevo, **When** miro el botón
   "Rehacer", **Then** está deshabilitado (ya no se puede rehacer tras una acción nueva).

---

### User Story 3 — Una acción = un gesto completo (Priority: P1)

Como usuario, quiero que una acción de dibujo completa (trazo, línea o relleno) cuente
como una sola cosa para deshacer.

**Por qué esta prioridad:** define la granularidad del undo; sin esta regla, deshacer un
arrastre largo exigiría muchísimos toques.

**Test independiente:** puede probarse arrastrando un trazo largo y deshaciendo una sola vez.

**Acceptance Scenarios (Given/When/Then):**

1. **Given** el pincel (o borrador) activo, **When** arrastro sobre varias celdas sin soltar,
   **Then** al tocar "Deshacer" una vez se revierte el trazo completo.
2. **Given** la herramienta línea activa, **When** dibujo una línea y suelto, **Then** la
   línea se deshace como una sola acción.
3. **Given** la herramienta relleno activa, **When** toco una celda, **Then** el relleno se
   deshace como una sola acción.
4. **Given** que toco una celda y no cambia nada (mismo color), **When** cierro el gesto,
   **Then** no se crea un paso de undo vacío.

---

## Requisitos funcionales

- **FR-001**: El sistema DEBE ofrecer botones **Deshacer** y **Rehacer** en la barra de
  herramientas.
- **FR-002**: **Deshacer** DEBE revertir la última acción de dibujo (pincel, borrador,
  línea o relleno) al estado anterior.
- **FR-003**: **Rehacer** DEBE volver a aplicar la última acción deshecha.
- **FR-004**: Una acción DEBE ser un **gesto completo** (un toque o un arrastre), no píxel
  por píxel, para las herramientas de dibujo.
- **FR-005**: Los botones DEBEN deshabilitarse cuando no hay nada que deshacer/rehacer.
- **FR-006**: Dibujar (o borrar/rehacer) una acción nueva DEBE limpiar la pila de rehacer.
- **FR-007**: Las pilas de undo/redo y sus acciones DEBEN vivir en el **store central**
  `editor.svelte.js` (runes), por la arquitectura uni-direccional del proyecto.
- **FR-008**: El historial DEBE guardarse en memoria durante la sesión (la persistencia
  entre sesiones pertenece a F05 Galería → #6).

## Success Criteria

- **SC-001**: Un usuario puede deshacer y rehacer acciones con los botones del toolbar.
- **SC-002**: Deshacer revierte un gesto completo de una sola vez y Rehacer lo restaura.
- **SC-003**: Los estados vacíos deshabilitan el botón correspondiente.
- **SC-004**: Los escenarios Given/When/Then de las US se verifican con tests.

## Assumptions

- Se reutilizan el modelo `Canvas` (`src/lib/models/Canvas.js`), el store `editor` y los
  componentes `PixelCanvas.svelte` y `Toolbar.svelte` de F01–F03.
- **Granularidad por gesto** (decisión de producto tomada con el usuario).
- **Botones en el Toolbar** (decisión de producto tomada con el usuario).
- **Sin atajos de teclado** en esta feature (los cubre el backlog #10).
- El relleno y la línea ya son una única operación en el store; el pincel y el borrador
  agrupan todos los píxeles de un arrastre en un solo paso.
- **UI en español** (principio del proyecto).

---

## Decisiones (cómo — tecnología)

*Sección separada del "qué" para que la spec no dependa de la implementación.*

- **Historial por snapshots**: un paso de undo es una **foto completa del lienzo**
  (clon del `ImageData` de cols×rows). Con 16×16 celdas el snapshot es diminuto y
  `restore` es un solo `putImageData`, así que es simple y no hay que rastrear diffs por
  celda.
- **Modelo `Canvas`**: gana `snapshot()` (clona los píxeles vía `getImageData`) y
  `restore(snapshot)` (escribe con `createImageData` + `putImageData`), métodos puros y
  testeables con el mock de `OffscreenCanvas`.
- **Store `editor`**: gana `undoStack`/`redoStack` (arrays de snapshots), derivados
  `canUndo`/`canRedo`, y el protocolo de gesto `abrirAccion()` / `cerrarAccion()`:
  - en `pointerdown` del canvas → `abrirAccion()` guarda el estado *previo* al gesto;
  - cada mutación (pintar/borrar/rellenar) cuenta un cambio;
  - en `pointerup`/`pointerleave` → `cerrarAccion()` empuja el snapshot previo a
    `undoStack` **solo si hubo un cambio real de píxeles** (compara con el estado actual)
    y vacía `redoStack`.
- **PixelCanvas**: marca los límites del gesto llamando `abrirAccion()`/`cerrarAccion()`
  en los handlers de puntero existentes (sin tocar la lógica de cada herramienta).
- **Dos pilas clásicas**: `deshacer()` mueve el estado actual a `redoStack` y restaura el
  snapshot previo; `rehacer()` hace lo inverso. Ambos incrementan `version` para redibujar.
- **Toolbar**: botones de **icono** para las seis acciones (Pincel, Borrador, Línea,
  Relleno, Deshacer, Rehacer) usando la librería **lucide-svelte** (`@lucide/svelte`),
  con `aria-label` y `title` en español para accesibilidad y tooltip. Fila compacta que
  no desborda en móvil; su atributo `disabled` se enlaza a `canUndo`/`canRedo`.
- **Mock de `OffscreenCanvas`** (`tests/setup.js`): se agregan `createImageData` y un
  `putImageData` real que escribe en la matriz simulada, para que `restore` sea testeable
  sin DOM real.

## Relacionado con

- Siguiente: feature 05 (galería y persistencia → #6).
- Backlog: atajos de teclado (#10) habilitará Ctrl+Z / Ctrl+Shift+Z usando `canUndo`/`canRedo`.