# Feature 003: Herramientas de dibujo

**Estado:** ✅ Implementada
**Spec escrita:** 2026-09-04
**Tests:** `tests/unit/models/Canvas.test.js`, `tests/unit/stores/editor.test.js`,
`tests/unit/components/PixelCanvas.test.js`, `tests/unit/components/Toolbar.test.js`
**Objetivo:** `specs/project/objective.md`
**Issue asociado:** [#5](https://github.com/cristianmolinag/pixel-art/issues/5)
**Depende de:** F02 Colores (#12, implementada)

> Esta spec es el **ancla** de la feature. Define **qué** debe hacer (sin decir cómo).
> Las decisiones técnicas van en la sección "Decisiones" al final, separadas del "qué".

## Historia de usuario (resumen)

> Como **usuario**, quiero **elegir una herramienta de dibujo (pincel, borrador, línea,
> relleno)** para **dibujar pixel art de forma más práctica**.

## User stories (priorizadas)

Cada user story es un **slice independiente** que entrega valor y puede probarse sola.

### User Story 1 — Seleccionar una herramienta (Priority: P1)

Como usuario, quiero elegir entre las herramientas dibujo disponibles y ver cuál está activa.

**Por qué esta prioridad:** sin selección de herramienta no hay forma de usar borrador,
línea o relleno.

**Test independiente:** puede probarse cambiando la herramienta activa y viendo la marca visual.

**Acceptance Scenarios (Given/When/Then):**

1. **Given** el editor abierto, **When** veo la barra de herramientas, **Then** hay opciones
   para Pincel, Borrador, Línea y Relleno.
2. **Given** la barra visible, **When** toco/clickeo una herramienta, **Then** esa herramienta
   queda activa y se marca visualmente.
3. **Given** el pincel activo (por defecto), **When** dibujo, **Then** pinta del color seleccionado
   (comportamiento base de F02 sin cambios).

---

### User Story 2 — Borrar píxeles (Priority: P1)

Como usuario, quiero un borrador para quitar píxeles y dejar la celda vacía.

**Por qué esta prioridad:** es imprescindible para corregir errores al dibujar.

**Test independiente:** puede probarse pintando y luego borrando una celda en concreto.

**Acceptance Scenarios (Given/When/Then):**

1. **Given** una celda pintada y el borrador activo, **When** la toco, **Then** la celda queda vacía
   (transparente, se ve el fondo).
2. **Given** el borrador activo, **When** arrastro sobre varias celdas pintadas, **Then** todas
   quedan vacías.
3. **Given** una celda ya vacía, **When** la borro, **Then** no cambia nada (no rompe el resto).

---

### User Story 3 — Dibujar una línea (Priority: P2)

Como usuario, quiero trazar una línea recta entre dos puntos.

**Por qué esta prioridad:** es muy útil para trazos rectos, pero no es la base del dibujo
(tap y arrastre del pincel ya cubren eso).

**Test independiente:** puede probarse dibujando una línea horizontal y una diagonal y
verificando los píxeles pintados.

**Acceptance Scenarios (Given/When/Then):**

1. **Given** la herramienta línea activa, **When** toco un punto y suelto en otro, **Then** se pinta
   una recta continua entre ambos puntos.
2. **Given** que arrastro sin soltar, **When** miro el lienzo, **Then** veo una vista previa de la
   línea provisional desde el punto inicial al actual.
3. **Given** que suelto, **When** miro el lienzo, **Then** la línea provisional queda pintada con el
   color seleccionado y ya no hay vista previa.
4. **Given** la línea activa, **When** toco y suelto en la misma celda, **Then** se pinta solo esa
   celda (línea de un punto).

---

### User Story 4 — Rellenar una región (Priority: P3)

Como usuario, quiero rellenar una región cerrada del mismo color con el color seleccionado.

**Por qué esta prioridad:** es muy cómoda para fondos, pero el pincel ya cubre el caso básico.

**Test independiente:** puede probarse dibujando un contorno y rellenándolo de un solo toque.

**Acceptance Scenarios (Given/When/Then):**

1. **Given** la herramienta relleno activa, **When** toco una celda, **Then** toda la región
   conectada del mismo color que esa celda se pinta del color seleccionado.
2. **Given** una región delimitada por otro color, **When** relleno, **Then** el relleno no traspasa
   el borde de distinto color.
3. **Given** que relleno con el mismo color actual de la región, **When** toco, **Then** no cambia
   nada (no se repinta ni se congela).

---

## Requisitos funcionales

- **FR-001**: El sistema DEBE ofrecer al menos las herramientas **Pincel, Borrador, Línea y
  Relleno**, con una activa por vez.
- **FR-002**: El sistema DEBE marcar visualmente la herramienta activa.
- **FR-003**: El **Pincel** DEBE pintar del color seleccionado por toque y arrastre (comportamiento
  de F02, sin cambios).
- **FR-004**: El **Borrador** DEBE dejar la celda tocada sin píxel (transparente), también
  arrastrando; borrar una celda vacía NO DEBE alterar el resto.
- **FR-005**: La **Línea** DEBE pintar una recta continua entre el punto inicial (pointerdown) y el
  final (pointerup) con el color seleccionado.
- **FR-006**: La **Línea** DEBE mostrar una **vista previa en vivo** mientras se arrastra, que
  desaparece al soltar.
- **FR-007**: El **Relleno** DEBE pintar la región conectada del mismo color del punto tocado con el
  color seleccionado, sin traspasar bordes de distinto color.
- **FR-008**: La herramienta activa y las acciones de dibujo viven en el **store central**
  `editor.svelte.js` (runes), por la arquitectura uni-direccional del proyecto.
- **FR-009**: El sistema DEBE funcionar con entrada táctil en móvil (sin scroll/zoom accidental).

## Success Criteria

- **SC-001**: Un usuario puede cambiar de herramienta y la activa se marca visualmente.
- **SC-002**: Un usuario puede borrar píxeles pintados, también arrastrando.
- **SC-003**: Un usuario puede dibujar una recta continua viendo su preview mientras arrastra.
- **SC-004**: Un usuario puede rellenar una región conectada del mismo color.
- **SC-005**: Los escenarios Given/When/Then de las US se verifican con tests.

## Assumptions

- Se reutiliza el modelo `Canvas` (`src/lib/models/Canvas.js`), el store `editor` y el componente
  `PixelCanvas.svelte` de F01/F02.
- **Semántica del borrador**: borrar = dejar la celda **transparente** (sin píxel); el fondo blanco
  del lienzo lo muestra como vacío.
- El lienzo sigue siendo 16×16 fijo y 1 celda = 1 píxel real (sin cambios).
- **UI en español** (principio del proyecto).
- El gesto de relleno es un toque (sin necesidad de arrastre).
- Undo/redo no pertenece a esta feature (lo cubre F04 → #13).

---

## Decisiones (cómo — tecnología)

*Sección separada del "qué" para que la spec no dependa de la implementación.*

- **Store central**: `herramienta = $state("pincel" | "borrador" | "linea" | "relleno")` y métodos
  `seleccionarHerramienta`, `borrarPixel`, `dibujarLinea` y `rellenar`; todos incrementan `version`
  solo si el modelo cambió (patrón de F02).
- **Modelo `Canvas`**: gana `borrarPixel(x, y)` (vía `clearRect`), `drawLine(x0,y0,x1,y1,color)`
  (Bresenham), `floodFill(x, y, color)` (BFS) y un helper puro exportado `lineaPuntos(x0,y0,x1,y1)`
  compartido entre el modelo y la vista previa.
- **PixelCanvas**: despacha según `editor.herramienta` en `pointerdown/pointermove/pointerup`.
  La vista previa de línea es un **overlay local** del componente: se dibuja el modelo y encima
  los puntos provisionales semitransparentes, sin escribir al store hasta soltar.
- **Fluidez del trazo**: el redibujado por píxel pintado no hace lecturas por celda; `drawCanvas`
  vuelca el OffscreenCanvas del modelo con un solo `drawImage` y traza la cuadrícula encima
  (orden: fondo → píxeles → grid, sin re-pintar el fondo en el grid).
- **Toolbar**: nuevo componente `Toolbar.svelte` con 4 botones de texto en español; la activa se
  marca con estilos (la selección vive en el store).
- **Mock de `OffscreenCanvas`** (`tests/setup.js`): `clearRect` ahora limpia de verdad la región en
  la matriz de píxeles simulada, para que `borrarPixel` sea testeable sin DOM real.

## Relacionado con

- Siguiente: feature 04 (undo/redo → #13).