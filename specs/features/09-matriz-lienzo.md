# Feature 009: Menú para cambiar la matriz del lienzo

**Estado:** ✅ Implementada
**Spec escrita:** 2026-09-04
**Tests:** `tests/unit/components/Matriz.test.js`, `tests/unit/stores/editor.test.js`,
`tests/unit/components/Toolbar.test.js`
**Objetivo:** `specs/project/objective.md`
**Issue asociado:** [#17](https://github.com/cristianmolinag/pixel-art/issues/17)
**Depende de:** F01 Canvas (#11) y F05 Galería (#6), implementadas

> Esta spec es el **ancla** de la feature. Define **qué** debe hacer (sin decir cómo).
> Las decisiones técnicas van en la sección "Decisiones" al final, separadas del "qué".

## Historia de usuario (resumen)

> Como **usuario**, quiero **elegir el tamaño (matriz) del lienzo** para **dibujar con más o menos
> detalle** según el proyecto.

## Problema actual

El lienzo es **fijo 16×16** desde F01. El modelo `Canvas` ya acepta `cols/rows` personalizados
(`new Canvas(cols, rows)`) y la galería restaura dimensiones al cargar, pero no existe **ninguna UI**
para cambiar las dimensiones del lienzo en el editor.

## User stories (priorizadas)

Cada user story es un **slice independiente** que entrega valor y puede probarse sola.

### User Story 1 — Elegir un preset de matriz (Priority: P1)

Como usuario, quiero un menú con presets de tamaño (mínimo 16×16, 32×32, 48×48, 64×64) que
redimensione el lienzo al elegir.

**Por qué esta prioridad:** cubre el caso común (lienzos estándar) con el mínimo de UI.

**Test independiente:** puede probarse abriendo el menú, eligiendo un preset y verificando que el
modelo cambia de dimensiones y el canvas se redibuja.

**Acceptance Scenarios (Given/When/Then):**

1. **Given** el menú de matriz abierto, **When** elijo el preset 32×32, **Then** el lienzo pasa a
   32 columnas por 32 filas y se redibuja.
2. **Given** un lienzo con píxeles pintados, **When** cambio la matriz, **Then** el comportamiento
   del contenido existente es el definido en "Decisiones" (limpiar o conservar), sin sorpresas.
3. **Given** el menú, **When** lo inspecciono, **Then** los presets son accesibles (botones/radio)
   y el popover se cierra al elegir (o al tocar fuera/Escape, como el picker de F06).

### User Story 2 — Tamaño custom (Priority: P2)

Como usuario, quiero poder indicar ancho×alto arbitrarios si un preset no me sirve.

**Por qué esta prioridad:** es valor extra; depende de la US1 y añade validación.

**Acceptance Scenarios (Given/When/Then):**

1. **Given** el menú de matriz, **When** escribo ancho y alto válidos, **Then** el lienzo adopta
   esas dimensiones.
2. **Given** ancho/alto inválido (0, negativo, valor gigante, no numérico), **When** confirmo,
   **Then** se muestra un error y no se aplica.

## Fronteras e integración

- **Undo/redo:** se conserva el historial; los snapshots que no coinciden con la matriz actual se
  omiten al deshacer/rehacer (ver "Decisiones").
- **Galería:** `Dibujo` ya serializa dimensiones y `cargar` las restaura en el editor (F05).

## No-objetivos

- No zoom (F10).
- No múltiples lienzos/páginas/spritesheet (fuera del alcance inicial).

## Decisiones

### Resueltas (decidido con el usuario)

- **Contenido al cambiar**: el lienzo se **limpia** al cambiar la matriz. Antes de aplicar se
  muestra un `window.confirm` similar al de "Nuevo dibujo" ("¿Cambiar la matriz a X×Y? El lienzo
  actual se limpiará."); si se cancela, la matriz no cambia y el popover queda abierto.
- **Opciones**: presets fijos **16×16, 32×32, 48×48 y 64×64** + **tamaño personalizado**
  (ancho×alto, enteros entre `MIN_MATRIZ=4` y `MAX_MATRIZ=128`); valor inválido muestra error
  (`aria-live`) y no aplica.
- **Historial**: se **conserva**; `deshacer`/`rehacer` **omiten snapshots cuya dimensión no
  coincide** con la matriz actual (para no romper `restore` al cambiar de tamaño).
- Estado y lógica en el store (`establecerMatriz`), UI popover en `Matriz.svelte` (patrón del
  picker de F06: backdrop + Escape), botón `LayoutGrid` junto a las herramientas en el toolbar.

## Tests

- `tests/unit/models/Canvas.test.js`: dimensiones custom (preexistente).
- `tests/unit/stores/editor.test.js`: `establecerMatriz` cambia/limpia, valida rangos y conserva
  historial omitiendo snapshots de otra dimensión.
- `tests/unit/components/Matriz.test.js`: popover con presets y custom, confirmación antes de
  limpiar, cancelación, error en inválido, cierre por Escape.
- `tests/unit/components/Toolbar.test.js`: botón presente en la lista del toolbar.

## Relacionado con

- Anterior: F01 Canvas (#11), F05 Galería (#6). #8 Mejoras mobile y UX.