# Feature 006: Color picker libre y colores recientes

**Estado:** ✅ Implementada
**Spec escrita:** 2026-09-04
**Tests:** `tests/unit/services/colores.test.js`, `tests/unit/stores/editor.test.js`,
`tests/unit/components/Palette.test.js`
**Objetivo:** `specs/project/objective.md`
**Issue asociado:** [#14](https://github.com/cristianmolinag/pixel-art/issues/14)
**Depende de:** F02 Colores (#12, implementada)

> Esta spec es el **ancla** de la feature. Define **qué** debe hacer (sin decir cómo).
> Las decisiones técnicas van en la sección "Decisiones" al final, separadas del "qué".

## Historia de usuario (resumen)

> Como **usuario**, quiero **elegir un color libre de forma cómoda y tener a mano los últimos
> colores usados** para **pintar sin fricción**.

## Problema actual

El selector libre de F02 es un `input[type=color]` envuelto en un círculo con gradiente cónico
(`Palette.svelte`). Se ve mal y funciona de forma inconsistente entre navegadores (dialog nativo
en desktop, picker del sistema en mobile, `appearance-none` + `conic-gradient` se rompe).

## User stories (priorizadas)

Cada user story es un **slice independiente** que entrega valor y puede probarse sola.

### User Story 1 — Elegir un color libre cómodamente (Priority: P1)

Como usuario, quiero seleccionar un color fuera de la paleta fija de forma clara y mobile-first,
incluyendo escribir el código hex si lo tengo a mano.

**Por qué esta prioridad:** es el reemplazo directo del selector roto actual.

**Test independiente:** puede probarse abriendo el picker de color y escribiendo un hex válido.

**Acceptance Scenarios (Given/When/Then):**

1. **Given** que veo la paleta, **When** toco el selector de color libre, **Then** se abre el
   picker del sistema/navegador y el color elegido queda seleccionado.
2. **Given** el campo hex visible con el color actual, **When** escribo un `<color>#rrggbb` o
   `#rgb` válido y confirmo (Enter o blur), **Then** ese color queda seleccionado y normalizado.
3. **Given** que escribo un hex inválido, **When** confirmo, **Then** el color no cambia y el
   campo vuelve a mostrar el color actual.
4. **Given** que hay un color seleccionado, **When** miro la paleta, **Then** el color libre
   elegido se muestra en el swatch del picker.

### User Story 2 — Tener los colores recientes a un toque (Priority: P1)

Como usuario, quiero volver rápido a los últimos colores que usé para pintar.

**Por qué esta prioridad:** es la fricción que más se elimina al dibujar (alternar entre colores).

**Test independiente:** puede probarse pintando con varios colores y viendo la fila de recientes.

**Acceptance Scenarios (Given/When/Then):**

1. **Given** que pinté con varios colores, **When** miro la paleta, **Then** veo una fila de
   recientes con los últimos colores usados (más reciente primero, sin repetidos).
2. **Given** una fila de recientes visible, **When** toco uno, **Then** ese color queda
   seleccionado (sin mover la fila).
3. **Given** que pinté con más de 6 colores diferentes, **When** miro la fila, **Then** solo se
   muestran los 6 más recientes.
4. **Given** que recargo la página, **When** vuelvo a abrir el editor, **Then** los colores
   recientes siguen ahí (persistencia).

## Requisitos funcionales

- **FR-001**: El sistema DEBE ofrecer un selector de color libre **dentro de la app** (no el
  dialog nativo del sistema), para que se vea y se posicione igual en desktop y mobile.
- **FR-002**: El selector DEBE permitir elegir matiz (H) y saturación/luminosidad (SV) de forma
  directa, y reflejar el color en vivo.
- **FR-003**: El sistema DEBE permitir escribir un color hex (`#rrggbb` o `#rgb`) y aplicarlo
  al confirmar (Enter o blur).
- **FR-004**: Un hex inválido NO DEBE cambiar el color seleccionado y DEBE devolver el campo
  al color actual.
- **FR-005**: El sistema DEBE registrar un color como **reciente** solo cuando se usa para
  pintar (pincel, línea o relleno), no al meramente seleccionarlo.
- **FR-006**: Los recientes DEBEN mostrarse más reciente primero, sin duplicados, con un máximo
  de 6.
- **FR-007**: Un clic en un reciente DEBE seleccionarlo **sin reordenar** la fila (los recientes
  solo se reordenan al **usar** el color para pintar).
- **FR-008**: Los colores recientes DEBEN persistir entre recargas (localStorage).
- **FR-009**: El estado (color actual, recientes) vive en el **store central** `editor.svelte.js`
  (runes), por la arquitectura uni-direccional del proyecto.

## Success Criteria

- **SC-001**: Un usuario puede elegir un color libre sin ver el círculo con gradiente roto.
- **SC-002**: Un usuario puede escribir un hex y verlo aplicado al pintar.
- **SC-003**: Un usuario puede alternar entre sus últimos colores con un toque.
- **SC-004**: Los recientes sobreviven a recargar la página.

## Assumptions

- El **picker native** (`input[type=color]`) abre el dialog del sistema operativo en mobile
  (capa separada que no se puede reposicionar); por eso se construye un **picker custom in-app**
  que aparece junto a la paleta con la misma UX en desktop y mobile. No se usa el hack
  `conic-gradient` ni `appearance-none`.
- El picker custom usa un **mosaico 2D de saturación/luminosidad (SV)** + **slider de matiz (H)**
  dibujando el SV en un `<canvas>`; el campo hex vive dentro del popover del picker.
- **No se incluye** capturador de pantalla (EyeDropper API): no está en todos los navegadores y
  se mantiene el MVP mínimo. Candidato futuro.
- La paleta fija de 16 colores no cambia.
- **UI en español** (principio del proyecto).

---

## Decisiones (cómo — tecnología)

*Sección separada del "qué" para que la spec no dependa de la implementación.*

- **Service `colores`** (`src/lib/services/colores.js`): maneja **localStorage** bajo la clave
  `pixel-art-studio:colores-recientes`. Expone `normalizarHex` (`#rrggbb`/`#rgb` → `#RRGGBB`
  mayúsculas, rechaza inválidos), `cargarRecientes()` (lee, normaliza, dedupe y limita) y
  `guardarRecientes(lista)`. Se eligió **localStorage** (síncrono y suficiente para un array de
  strings) en lugar de IndexedDB, que queda reservado para los dibujos de F05 → #6. Las APIs se
  envuelven en try/catch para degradar silenciosamente (p. ej. modo privado).
- **Store `editor.svelte.js`**: nuevos miembros del singleton con runes:
  `coloresRecientes = $state(cargarRecientes())`, método `registrarColorUsado(color)` (filtra
  duplicado, pone al frente, corta a `LIMITE_RECIENTES` = 6 y persiste) y
  `seleccionarColor(color)` (normaliza y setea `colorActual`; **no** reordena ni agrega a
  recientes — eso es solo al pintar). `registrarColorUsado` se invoca desde
  `pintarPixel`, `dibujarLinea` y `rellenar` **solo cuando hubo cambio real** en el lienzo.
  Decisión (con el usuario): un color cuenta como reciente **al usarlo para pintar**,
  no al seleccionarlo.
- **Componente `Palette.svelte`**: se elimina el círculo `conic-gradient` + `appearance-none` y se
  elimina el `input[type=color]` nativo. Nuevo layout: paleta fija (sin cambios) + separador +
  **botón con el color actual** que abre un **popover custom in-app** (`absolute`, `bottom-full`,
  con backdrop y cierre por Escape) con **mosaico SV** en un `<canvas>` (arrastrable con
  `pointerdown/move/up` + `setPointerCapture`) y **barra de matiz custom** (div con gradiente + thumb
  arrastrable, `role="slider"` con soporte de teclado (flechas/Home) y **rueda del mouse**
  (listener `wheel` no pasivo); se evita el `input[type=range]` nativo por su
  aspecto inconsistente entre navegadores), con campo hex `#rrggbb`
  (commit en Enter/blur y revert en inválido) dentro del popover. **Los tres controles comparten el
  mismo ancho** (`w-full`) para un popover alineado; al abrir con un color acromático (negro/gris/
  blanco) el picker inicializa S/V para que el matiz siempre responda.
  Fila **"Recientes"** de 6 swatches en `flex-wrap` (solo si hay alguno). Clic en cualquier swatch
  (fijo o reciente) pasa por `seleccionarColor`.
- **Matemática de color en `colores.js`**: `hexToRgb`, `hexToHsv` y `hsvToHex` como funciones puras
  (H en grados 0–360, S/V en 0–1, tolerantes a matices fuera de rango); el mosaico SV se dibuja
  con 3 pases en el canvas (color base del matiz + degradado blanco horizontal + degradado negro
  vertical).
- **Tests**: `tests/unit/services/colores.test.js` (normalización, carga/guardado, límite,
  corrupción, conversiones HSV), `tests/unit/stores/editor.test.js` (LRU, dedupe, límite 6,
  registro al pintar, `localStorage` con jsdom) y `tests/unit/components/Palette.test.js`
  (render de recientes, selección sin reordenar, hex válido/inválido, apertura/cierre del picker y
  cambio de matiz).

## Relacionado con

- Anterior: F05 Galería (#6) — IndexedDB queda reservado para dibujos; los recientes usan
  localStorage.
- F02 Colores (#12) — la paleta fija y el `colorActual` viven en el store `editor`.
- UX general: #8.