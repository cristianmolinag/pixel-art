# Feature 007: Layout del menú (sidebar en escritorio)

**Estado:** ✅ Implementada (#15 cerrada)
**Spec escrita:** 2026-09-04
**Objetivo:** `specs/project/objective.md`
**Issue asociado:** [#15](https://github.com/cristianmolinag/pixel-art/issues/15) (cerrado)
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

### User Story 3 — Toolbar móvil responsivo (Priority: P1)

Como usuario en móvil, quiero que la barra de herramientas se adapte al ancho sin apretarse ni
cortarse, manteniendo acceso directo a las herramientas.

**Por qué esta prioridad:** el ajuste móvil se iteró tras el sidebar de escritorio acordado en US2.

**Acceptance Scenarios (Given/When/Then):**

1. **Given** una pantalla móvil (`< lg`), **When** veo el toolbar, **Then** herramientas, cuadrícula,
   matriz, deshacer/rehacer y zoom están accesibles sin cortes; el zoom se pliega en un expander propio.
2. **Given** poco ancho disponible, **When** la fila no cabe, **Then** los iconos (`clamp(28px, 9vw, 40px)`)
   y el gap (`clamp(2px, 0.8vw, 4px)`) se reducen fluidamente y el grupo queda **centrado** al sobrar espacio.
3. **Given** el zoom expandido, **When** elijo una opción o pulso Escape, **Then** el panel de zoom se cierra.

## No-objetivos

- No cambiar la lógica de herramientas/historial/galería.
- No atajos de teclado (cubiertos por #10).
- No alterar el comportamiento de los botones existentes.
- El rediseño móvil se itera por separado (ver US3); sin elipsis: las opciones de cuadrícula quedan
  siempre visibles y solo el zoom se pliega.

## Decisiones

### De diseño (resueltas con el usuario)

- **Layout global (app shell)**: `header` (icono + título + `AccionesArchivo` a la derecha), un
  contenedor flex con `aside` (toolbar) + `main` (canvas centrado) y un único `footer` con la
  `Palette` **full-width** (paleta + recientes).
- **Escritorio (`≥ lg`)**: el toolbar es una **columna** apilada en el `aside` (herramientas,
  cuadrícula, matriz, zoom, historial).
- **Mobile (`< lg`)**: el toolbar es una **fila responsiva** con herramientas + cuadrícula + matriz +
  deshacer/rehacer y un botón **zoom** que despliega sus controles (−, %, +, reset) en una fila
  extra debajo. Sin elipsis genérico.
- **Iconos fluidos**: clases `tam-icono` / `tam-icono-ancho` (`clamp(28px, 9vw, 40px)`) y `toolbar-fila`
  (gap `clamp(2px, 0.8vw, 4px)`) en `src/app.css`; el icono SVG ocupa el 60% del botón. El grupo se
  centra (`justify-center`) cuando sobra espacio y arropa sin cortes cuando falta.
- **Confirmaciones propias**: modales con el patrón de `Matriz.svelte` (overlay + `role="dialog"`,
  cierre por backdrop/Escape) en lugar de `window.confirm` (ej. "Nuevo dibujo").
- Implementación en `App.svelte` (single source del layout).

## Tests

- `tests/unit/components/Toolbar.test.js`: se actualizó el orden esperado de `aria-label` (nuevo botón
  `Zoom`) y se mantienen los escenarios de herramientas/historial/cuadrícula/zoom.
- `tests/unit/components/AccionesArchivo.test.js`: el confirm de "Nuevo dibujo" ahora prueba el modal
  propio (`Empezar nuevo` / `Cancelar`) en lugar de `window.confirm`.

## Relacionado

- #8 Mejoras mobile y UX.
- #10 Atajos de teclado (puede combinarse con el layout final).