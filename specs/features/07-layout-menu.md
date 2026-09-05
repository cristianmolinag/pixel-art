# Feature 007: Layout del menú (sidebar en escritorio)

**Estado:** 🚧 En implementación
**Spec escrita:** 2026-09-04
**Objetivo:** `specs/project/objective.md`
**Issue asociado:** [#15](https://github.com/cristianmolinag/pixel-art/issues/15)
**Depende de:** F03 Herramientas (#5), F04 Undo/Redo (#13) y F05 Galería (#6), ya implementadas

> Esta spec es el **ancla** de la feature. Define **qué** debe hacer (sin decir cómo).
> Las decisiones técnicas van en la sección "Decisiones" al final, separadas del "qué".

## Historia de usuario (resumen)

> Como **usuario**, quiero **un menú ordenado en cualquier ancho de pantalla, con los iconos
> agrupados por función** para **acceder a cada acción sin saltos de línea impredecibles**.

## Problema actual

El toolbar es un único contenedor `flex flex-wrap` (`src/lib/components/Toolbar.svelte`). Según el
ancho de pantalla, los iconos saltan a una segunda línea en un punto impredecible (a veces a mitad
del grupo Deshacer/Rehacer), lo que se ve desordenado, sobre todo en móvil.

## User stories (priorizadas)

Cada user story es un **slice independiente** que entrega valor y puede probarse sola.

### User Story 1 — Menú agrupado y sin cortes (Priority: P1)

Como usuario, quiero que el menú muestre grupos claramente separados y que ningún grupo de iconos
se corte a mitad de línea al cambiar el ancho.

**Por qué esta prioridad:** es el problema visible hoy en móvil y la base de cualquier layout
posterior (AppBar u overflow).

**Test independiente:** los `aria-label` y las acciones de los botones no cambian, así que los
`tests/unit/components/Toolbar.test.js` existentes deben seguir en verde.

**Acceptance Scenarios (Given/When/Then):**

1. **Given** cualquier ancho de móvil, **When** miro el menú, **Then** ningún grupo de iconos se
   corta a mitad.
2. **Given** el menú renderizado, **When** lo inspecciono, **Then** los grupos (herramientas,
   historial, archivo) quedan visualmente separados.
3. **Given** la app funcionando, **When** ejecuto los tests existentes, **Then** siguen en verde
   (`aria-label` y acciones sin cambios).

### User Story 2 — Sidebar en escritorio con header/body/footer (Priority: P1)

Como usuario de escritorio, quiero que el menú sea un **sidebar a la izquierda con estructura de
header, body y footer**, y que el **contenedor de la cuadrícula ocupe todo el resto del área**
con el lienzo centrado.

**Por qué esta prioridad:** es el rediseño principal acordado con el usuario para F07.

**Acceptance Scenarios (Given/When/Then):**

1. **Given** una pantalla de escritorio (`≥ lg`), **When** veo el layout, **Then** el sidebar está a
   la izquierda con **header** (título), **body** (toolbar) y **footer** (paleta de colores).
2. **Given** el layout de escritorio, **When** miro el área principal, **Then** el contenedor de la
   cuadrícula ocupa todo el espacio restante y el lienzo aparece **centrado**.
3. **Given** una pantalla móvil (`< lg`), **When** veo el layout, **Then** se mantiene el layout
   actual (título, toolbar, lienzo y paleta apilados) — el ajuste móvil de la iteración siguiente.

## No-objetivos

- No cambiar la lógica de herramientas/historial/galería.
- No atajos de teclado (cubiertos por #10).
- No alterar el comportamiento de los botones existentes.
- No rediseñar el layout móvil en esta iteración (se hará después).

## Decisiones

### De diseño (resueltas con el usuario)

- **Sidebar en escritorio (`≥ lg`)**: columna izquierda fija (`w-60`, `bg-surface-light`) con:
  - **header**: título "Pixel Art Studio";
  - **body**: `Toolbar` (herramientas, historial, zoom, archivo);
  - **footer**: `Palette`, pegada abajo (`mt-auto`).
- **Área principal**: el `PixelCanvas` ocupa todo el espacio restante (`flex-1`) y queda centrado
  (`items-center justify-center`).
- **Mobile (`< lg`)**: se conserva el layout actual apilado (título → toolbar → lienzo → paleta);
  el rediseño móvil es una iteración posterior.
- Implementación en `App.svelte` (single source del layout); la paleta se monta en dos variantes
  (móvil `lg:hidden` y footer de escritorio `hidden lg:block`) para conservar el orden móvil sin
  duplicar toolbar/lienzo.

## Tests

- `tests/unit/components/Toolbar.test.js`: siguen en verde sin cambios (los `aria-label` y acciones
  no cambian). El layout es visual; no requiere test de componente nuevo en esta iteración.

## Relacionado

- #8 Mejoras mobile y UX.
- #10 Atajos de teclado (puede combinarse con el layout final).