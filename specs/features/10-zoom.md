# Feature 010: Zoom del lienzo

**Estado:** 🚧 En revisión (ajustes de UX acordados con el usuario el 2026-09-04, pendientes de implementar)
**Spec escrita:** 2026-09-04
**Objetivo:** `specs/project/objective.md`
**Issue asociado:** [#18](https://github.com/cristianmolinag/pixel-art/issues/18)
**Depende de:** F01 Canvas (#11) y F09 Matriz (#17), implementadas

> Esta spec es el **ancla** de la feature. Define **qué** debe hacer (sin decir cómo).
> Las decisiones técnicas van en la sección "Decisiones" al final, separadas del "qué".

## Historia de usuario (resumen)

> Como **usuario**, quiero **ampliar o reducir la vista del lienzo** para **editar con precisión
> (píxel a píxel) o ver el dibujo completo** según lo que necesite.

## Problema actual

F01 dejó el zoom **fuera de scope** (decisión documentada en su spec: "el tamaño de celda visible /
zoom de edición queda fuera de esta feature"). El display escala el grid con CSS
(`max-width: min(100%, 512px)`) y no hay control de zoom. En pantallas grandes el lienzo 16×16
queda diminuto; en lienzos grandes (F09) pintar píxel a píxel es impreciso.

## User stories (priorizadas)

Cada user story es un **slice independiente** que entrega valor y puede probarse sola.

### User Story 1 — Zoom con botones (+/- y 100%) (Priority: P1)

Como usuario, quiero botones para acercar, alejar y restablecer el zoom del lienzo.

**Por qué esta prioridad:** es el control de zoom mínimo, predecible y accesible, sin conflictos
de gestos táctiles.

**Acceptance Scenarios (Given/When/Then):**

1. **Given** el editor, **When** toco "+", **Then** la vista del lienzo se amplía en un paso.
2. **Given** el editor, **When** toco "−", **Then** la vista se reduce en un paso (mínimo 0.5×).
3. **Given** un zoom cualquiera (y/o pan), **When** toco "100%", **Then** la vista vuelve al
   tamaño base y al centrado original (sin pan).
4. **Given** zoom activo, **When** pinto, **Then** la conversión de coordenadas sigue siendo exacta
   (la celda bajo el puntero es la correcta).
5. **Given** zoom activo, **When** pinto, **Then** **dibujo y cuadrícula se redimensionan juntos**
   (las guías siguen alineadas a los píxeles; es un tema de precisión al pintar).
6. **Given** el toolbar, **Then** se muestra **un único porcentaje de zoom** (sin duplicados).

### User Story 2 — Pan en desktop: Ctrl + arrastrar (Priority: P2)

Como usuario con mouse, quiero mover la vista del lienzo haciendo **Ctrl + click y arrastrar**
para navegar por el área ampliada.

**Por qué esta prioridad:** sin pan, el zoom >1× deja contenido fuera del contenedor; hace falta
pan para editar con zoom (depende de US1).

**Acceptance Scenarios (Given/When/Then):**

1. **Given** zoom activo, **When** mantengo Ctrl y arrastro sobre el lienzo, **Then** la vista se
   desplaza con el arrastre y **no se pinta** nada.
2. **Given** pan activo, **When** suelto, **Then** la vista queda donde la dejé.
3. **Given** un zoom en su mínimo, **Then** el pan no se sale de límites razonables del lienzo.

### User Story 3 — Zoom táctil en móvil: pellizco (Priority: P2)

Como usuario táctil, quiero **pellizcar (pinch)** sobre el lienzo para hacer zoom.

**Por qué esta prioridad:** en móvil no hay rueda ni Ctrl; sin pellizco el usuario no puede
ampliar. Depende de US1 (estado y render compartidos).

**Acceptance Scenarios (Given/When/Then):**

1. **Given** el lienzo, **When** separo dos dedos, **Then** la vista se amplía según la distancia.
2. **Given** el lienzo, **When** junto dos dedos, **Then** la vista se reduce (mínimo 0.5×).
3. **Given** dos dedos sobre el lienzo, **Then** no se pinta ni se dispara el gesto de zoom/scroll
   del navegador (`touch-action: none` intacto).
4. **Given** un solo dedo, **Then** se pinta normalmente (sin interferencias del cambio de zoom).

## Non-functional

- El **contenedor del canvas siempre mantiene el mismo tamaño**: es un marco fijo
  (`min(100%, 512px)`) y el contenido escalado se recorta dentro (`overflow: hidden`); el dibujo
  no desborda ni mueve el layout.
- **Un solo indicador de porcentaje** en el toolbar (el botón de reset no muestra porcentaje).
- El escalado NO debe degradar los píxeles (mantener `image-rendering: pixelated`).
- Compatible con el `touch-action: none` del canvas (pintado táctil y pellizco con pointer events).
- Sin gesto de rueda del mouse: el zoom solo se controla con botones y pellizco (descartado por
  conflicto con el scroll de la página).

## No-objetivos

- No escalar el modelo: cada celda sigue siendo **1 píxel real**; el zoom es visual (CSS).
- No zoom con rueda del mouse (solo botones y pellizco).
- No otra forma de navegación distinta de Ctrl+arrastrar (pan) en desktop.

## Decisiones

### Resueltas (decidido con el usuario)

- **Mecanismo y rango**: zoom con **CSS `transform: scale`** sobre el contenido del lienzo (los
  píxeles no se alteran; se mantiene `image-rendering: pixelated`), entre **0.5× y 4×**
  (`MIN_ZOOM=0.5`, `MAX_ZOOM=4`). Los botones `−`/`+` avanzan en pasos de **0.5**
  (`PASO_ZOOM=0.5`); el pellizco ajusta el zoom de forma continua dentro del rango.
- **Dibujo y cuadrícula juntos**: al hacer zoom **el dibujo y la cuadrícula se redimensionan
  juntos**, manteniendo las guías alineadas a los píxeles (precisión al pintar).
- **Contenedor fijo**: el marco del canvas mantiene siempre su tamaño; el contenido ampliado se
  recorta dentro de él (requiere pan para navegar con zoom).
- **Pan en desktop**: **Ctrl/Meta + click y arrastrar** desplaza la vista (`panX/panY`) sin pintar;
  el pan se limita para no sacar el contenido del todo del marco.
- **Pellizco en móvil**: dos punteros simultáneos sobre el canvas ajustan el zoom de forma
  continua (alrededor del centro del marco). Un solo dedo sigue pintando.
- **Rueda del mouse**: **fuera de scope** (se elimina; era "solo con Ctrl/Meta"). El zoom se
  controla con botones y pellizco.
- **Controles en toolbar** (junto a la matriz): botones `−` / `+` **y un único indicador de
  porcentaje** (`aria-live`); el botón de reset usa un icono (no muestra "100%" como texto) y
  restablece zoom + pan. Lógica en el store (`zoom`, `panX`, `panY`, `acercar`, `alejar`,
  `reiniciarZoom`, `desplazarPan`), render vía `transform: translate(...) scale(...)`.
- **Coordenadas (US1/AS4)**: la conversión de celda usa `getBoundingClientRect()`, que ya refleja
  la escala; la razón `(evento - rect)/rect` es invariante al escalado uniforme, así que la celda
  bajo el puntero sigue siendo exacta con zoom.

## Tests

- `tests/unit/stores/editor.test.js`: estado de zoom (pasos 0.5), límites 0.5×–4×, reseteo a 1×
  (también del pan) y clamping de `desplazarPan`.
- `tests/unit/components/Toolbar.test.js`: botones `−`/`+`/reset-icon, indicador único de
  porcentaje, US1.
- `tests/unit/components/PixelCanvas.test.js`: `transform: translate(...) scale(...)` por CSS sin
  tocar la resolución (16×16); pan con Ctrl+arrastrar no pinta (US2); pellizco con dos punteros
  cambia el zoom (US3).

## Relacionado con

- Anterior: F01 Canvas (#11). Relacionada: F09 Matriz (#17), que motiva el zoom en lienzos grandes.
- #8 Mejoras mobile y UX.