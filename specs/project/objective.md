# Objetivo de Pixel Art Studio

Este documento es el **ancla del proyecto**: responde *qué queremos* y *qué no*.
Es la puerta de entrada para cualquier persona ajena al proyecto. Los issues y las
specs de feature se referencian desde aquí.

## Qué es

Pixel Art Studio es un **editor de pixel art web**, creado para divertirse y aprender
Svelte 5, Tailwind CSS v4 y arquitectura de frontend moderna. El objetivo del proceso
no es solo construir una app, sino **aprender el stack mientras se desarrolla un
producto real**, feature por feature.

## Para quién es

- **Principalmente**: creado en compañía de los hijos del autor, solo por diversión.
- **Audiencia/usuario final**: cualquiera que quiera dibujar pixel art en el
  navegador, en especial desde **móvil** (la app es mobile-first).

## Alcance (simple e incremental)

No partimos de un editor completo. Construimos **una feature a la vez**, en orden de
complejidad creciente, verificando antes de avanzar:

1. **Canvas** — ver un lienzo de píxeles cuadriculado (base de todo lo demás) → **#11**.
2. **Colores** — elegir color y pintar sobre píxeles → **#12**.
3. **Herramientas** — borrar, línea, relleno, etc. → **#5**.
4. **Undo/redo** — deshacer y rehacer acciones → **#13**.
5. **Galería** — guardar y listar dibujos → **#6**.
6. **Color picker** — selector de color libre decente y colores recientes → **#14**.

Cada feature se traza a un issue de GitHub (y su spec en `specs/features/`).

## No-objetivos (fuera del alcance actual)

Para mantener el aprendizaje enfocado, **queda fuera del alcance inicial**:

- Capas múltiples (se mencionan como visión futura, no se implementan al inicio).
- Animación / timeline / GIF animado / spritesheet.
- Colaboración en tiempo real.

> Los issues abiertos correspondientes a estos no-objetivos (#3, #4, #7, #9) fueron
> cerrados para trazar solo el alcance actual. El milestone v1.1/v2.0 se eliminó;
> el roadmap de trabajo vive en el milestone **v1.0 MVP** + backlog sin milestone.

## Principios

- **Mobile-first**: el canvas es un cuadrado responsivo (`aspect-ratio: 1/1`), se
  escala con CSS y `image-rendering: pixelated`. Protecciones táctiles activadas.
- **Cada celda = 1 píxel real** del canvas HTML; el display se escala con CSS.
- **UI en español** (textos de la interfaz).
- **Simplicidad**: cada feature se agrega solo cuando la anterior está verificada.
- **Estado central con runes de Svelte 5**; arquitectura uni-direccional
  (ver `specs/architecture/overview.md`).
- **No adivinar**: lo ambiguo se marca, no se asume (ver metodología abajo).

## Metodología de desarrollo

Usamos **Spec-Anchored Development**: la spec es un *ancla* que orienta y verifica el
código, no un generador. Escribimos el *qué* (spec) antes del *cómo* (código), y el
código evoluciona en paralelo con la spec verificando constantemente que no se desvía.

Este directorio (`specs/`) es la **fuente de verdad** de requisitos y arquitectura.
Los **issues de GitHub** son el estado vivo del trabajo (ver abajo).

## Dónde está el trabajo (cómo saber qué falta)

- **Qué queremos / cómo está pensado** → este documento + `specs/architecture/` + `specs/features/`.
- **En qué se está trabajando / qué falta** → *issues abiertos* de GitHub (milestone **v1.0 MVP** + backlog sin milestone: #1, #8, #10).
- Cada feature de `specs/features/` se asocia a un issue. Ver el estado en la cabecera de cada spec.

## Estado del proyecto

- **Rama activa**: `feat/sdd-rewrite` (los cambios de la reescritura viven en ramas `feat/*`).
- **Fase actual**: F03 Herramientas (#5) implementada y verificada — siguiente: F04 Undo/Redo (#13).
  En el milestone **v1.0 MVP** quedan pendientes F04 (#13), F05 Galería (#6) y el color picker (#14).
