# Feature 011: Cuadrícula como capa-guía superpuesta

**Estado:** ✅ Implementada
**Spec escrita:** 2026-09-04
**Tests:** `tests/unit/components/PixelCanvas.test.js`, `tests/unit/canvas/draw.test.js`,
`tests/unit/stores/editor.test.js`
**Objetivo:** `specs/project/objective.md`
**Issue asociado:** [#19](https://github.com/cristianmolinag/pixel-art/issues/19)
**Depende de:** F08 Toggle de cuadrícula (#16, implementada) y F10 Zoom (#18, implementada)

> Esta spec es el **ancla** de la feature. Define **qué** debe hacer (sin decir cómo).
> Las decisiones técnicas van en la sección "Decisiones" al final, separadas del "qué".

## Historia de usuario (resumen)

> Como **usuario**, quiero que la cuadrícula sea una **guía superpuesta** (verla/ocultarla y
> configurarla sin ensuciar el dibujo) para **editar con referencia limpia a las celdas a cualquier
> zoom/pan/DPR, también en móvil**.

## Problema actual

La cuadrícula se pinta en el **mismo canvas** que los píxeles (`PixelCanvas.svelte`), después del
contenido, con 1px de dispositivo y el mismo redondeo (F08). Técnicamente queda alineada, pero
**visualmente no convence al usuario en mobile** ("se ve mal") y está acoplada al render del lienzo:
no puede tratarse como un dato de presentación separado (visibilidad, opacidad, color) sin tocar la
lógica del canvas.

## User stories (priorizadas)

Cada user story es un **slice independiente** que entrega valor y puede probarse sola.

### User Story 1 — La cuadrícula como capa-guía desacoplada (Priority: P1)

Como usuario, quiero que la cuadrícula sea un **overlay de referencia**, no parte de los datos del
dibujo.

**Por qué esta prioridad:** separar conceptualmente la guía del contenido es el cambio base; el resto
de la iteración se apoya en esto.

**Acceptance Scenarios (Given/When/Then):**

1. **Given** el lienzo con cuadrícula visible, **When** dibujo o deshago, **Then** la cuadrícula no
   participa en la snapshot ni en el historial (undo/redo no la alteran).
2. **Given** un dibujo con cuadrícula, **When** exporto o guardo en la galería, **Then** la imagen
   resultante no incluye la cuadrícula.
3. **Given** el toggle existente (`mostrarCuadricula`), **When** lo alterno, **Then** sigue
   funcionando exactamente igual que en F08.

### User Story 2 — Alineación perfecta a cualquier zoom/pan/DPR (Priority: P1)

Como usuario, quiero que las líneas de la cuadrícula coincidan siempre con las celdas, incluso en
móvil con zoom/pan.

**Por qué esta prioridad:** es el defecto visual que motiva #19.

**Acceptance Scenarios (Given/When/Then):**

1. **Given** cualquier zoom (incluido el mínimo 100%) y pan, **When** examino el lienzo, **Then**
   cada línea coincide con la frontera de la celda (líneas de 1px de dispositivo, mismo redondeo que
   los píxeles).
2. **Given** una pantalla móvil con DPR ≠ 1, **When** hago zoom/pan, **Then** la cuadrícula se
   mantiene alineada y visible (nunca se pierde).
3. **Given** la cuadrícula oculta, **When** los eventos de zoom/pan hacen repaint, **Then** el estado
   de visibilidad se respeta (no reaparece sola).

### User Story 3 — Configuración de la guía (Priority: P2)

Como usuario, quiero poder ajustar la presencia visual de la guía (opacidad y/o color) para que
esté presente como referencia sin estorbar el dibujo.

**Por qué esta prioridad:** define la "capa" real; se mueve a P2 si el usuario prefiere iterar más
simple primero (ver Decisiones abiertas).

**Acceptance Scenarios (Given/When/Then):**

1. **Given** la cuadrícula visible, **When** cambio su opacidad/color, **Then** el cambio se ve
   reflejado al instante sin repintar los píxeles ni tocar el historial.
2. **Given** la configuración elegida, **When** recargo la app, **Then** se mantiene (persistencia).

## No-objetivos

- **No** construir un sistema de capas/layers para el dibujo real (se menciona como visión futura;
  esta guía es render-only).
- **No** cambiar el modelo de datos ni el historial (deshacer/rehacer) con la cuadrícula.
- **No** tocar la lógica de herramientas/zoom/matriz.
- **No** modificar qué se exporta/guarda (la guía nunca forma parte del resultado).

## Decisiones

### Resueltas (consultadas con el usuario, 2026-09-04)

1. **Bordes sobre píxeles pintados**: la guía dibuja **todas las líneas, también sobre lo pintado**
   (grid completo y uniforme, estilo Aseprite). El criterio previo "solo adyacente a celdas vacías"
   se descartó en revisión visual: producía un grid roto (tramos faltantes) y franjas de 1px sobre el
   primer píxel pintado adyacente, lo que se veía mal en mobile.
2. **Alcance de configuración**: en esta iteración **sin UI nueva** — solo el toggle existente
   (`mostrarCuadricula`), un **grosor mínimo de 1px CSS** (`Math.round(dpr)`, visible en DPR > 1) y
   una **opacidad fija** (`GRID_ALPHA = 0.5` en `src/lib/canvas/draw.js`) para que la guía se vea sin
   ensuciar el dibujo. La full configuración (opacidad/color configurables y persistente) queda
   **pendiente** (US3 P2).
3. **Implementación**: se mantiene dibujada en el **mismo canvas** (overlay lógico), después de los
   píxeles, con el mismo redondeo `aX`/`aY`. Las horizontales se parten por celda empezando tras la
   columna de cada vertical (`aX(i)+grueso`) para **no apilar alfa en las intersecciones**. Las celdas
   usan **paso por eje** (`contenidoX/cols`, `contenidoY/rows`) para que matrices no cuadradas queden
   alineadas y consistentes con `celdaDeEvento`. `ctx.globalAlpha` vuelve a `1` tras la guía.

Además, recogidas de F08 e #19:

- La guía **no participa** en snapshot, datos, historial ni export: es render-only.
- Los píxeles y la guía comparten las **mismas fronteras redondeadas** (`aX`/`aY`) a resolución de
  dispositivo; grosor de línea `Math.max(1, Math.round(dpr))`.
- El toggle `mostrarCuadricula` se conserva y persiste (localStorage, clave F08).

## Tests

- `tests/unit/components/PixelCanvas.test.js`: la guía no forma parte de la snapshot/limpieza; se
  repinta según visibilidad/zoom/pan/DPR.
- `tests/unit/canvas/draw.test.js`: lo que dibuja contenido no traza guía (F08 ya lo verifica) — se
  ajusta si la guía pasa a un elemento separado.
- `tests/unit/stores/editor.test.js`: preferencias nuevas de la guía (si US3 se acepta) + persistención.

## Relacionado con

- #8 Mejoras mobile y UX (la motivación visual). #16 (F08) aporta el render device-resolution.