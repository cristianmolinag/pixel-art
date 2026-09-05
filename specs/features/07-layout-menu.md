# Feature 007: Layout del menú (agrupar iconos sin saltos de línea)

**Estado:** 📋 Pendiente (decisión de diseño en evaluación — ver "Decisiones")
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

## No-objetivos

- No cambiar la lógica de herramientas/historial/galería.
- No atajos de teclado (cubiertos por #10).
- No alterar el comportamiento de los botones existentes.

## Decisiones

### De diseño (pendiente — elegir una de las opciones del issue #15)

- **A) Dos filas fijas separadas** — tarjeta 1: Herramientas (Pincel, Borrador, Línea, Relleno);
  tarjeta 2: Acciones (Deshacer, Rehacer | Nuevo, Guardar, Galería). Sin `flex-wrap`; cada fila con
  `justify-center`. Cambio mínimo, predecible y agrupa por función.
- **B) Header tipo AppBar** — el título pasa a una barra superior con las acciones globales (Nuevo,
  Guardar, Galería) a la derecha; el toolbar queda solo con herramientas + deshacer/rehacer (caben
  en cualquier ancho). Requiere refactor de layout (`App.svelte`).
- **C) Menú overflow "•••"** — las acciones secundarias se pliegan en un botón `MoreHorizontal` con
  popover. Una sola fila siempre; pero más complejo (estado, posicionamiento, accesibilidad, tests)
  y añade taps en móvil.

## Tests

- Pendientes de la decisión de diseño (los tests actuales de `Toolbar.test.js` deben seguir en verde).

## Relacionado

- #8 Mejoras mobile y UX.
- #10 Atajos de teclado (puede combinarse con el layout final).