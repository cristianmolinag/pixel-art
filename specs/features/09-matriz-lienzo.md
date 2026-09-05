# Feature 009: Menú para cambiar la matriz del lienzo

**Estado:** 📋 Pendiente
**Spec escrita:** 2026-09-04
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

- **Undo/redo:** cambiar la matriz debe integrarse sin corromper el historial (ver F04).
- **Galería:** `Dibujo` ya serializa dimensiones y `cargar` las restaura en el editor (F05).

## No-objetivos

- No zoom (F10).
- No múltiples lienzos/páginas/spritesheet (fuera del alcance inicial).

## Decisiones

### Pendientes

- ¿Al cambiar la matriz se **limpia** el lienzo o se **conserva** el contenido (top-left, centrado)?
- ¿Se ofrece el cambio de matriz también al crear un dibujo nuevo (galería) o solo en el editor?
- ¿Presets cuáles exactamente y si incluyen opción custom (US2) en el MVP?

## Tests

- `tests/unit/models/Canvas.test.js`: ya cubre dimensiones custom; extender si aplica.
- `tests/unit/stores/editor.test.js` y nuevo `tests/unit/components/Matriz.test.js` (o dentro de
  `Toolbar.test.js`): elegir preset, validación custom, cierre del popover.

## Relacionado con

- Anterior: F01 Canvas (#11), F05 Galería (#6). #8 Mejoras mobile y UX.