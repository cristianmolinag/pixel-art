# Feature 010: Zoom del lienzo

**Estado:** 📋 Pendiente
**Spec escrita:** 2026-09-04
**Objetivo:** `specs/project/objective.md`
**Issue asociado:** [#18](https://github.com/cristianmolinag/pixel-art/issues/18)
**Depende de:** F01 Canvas (#11) y F09 Matriz (#17), implementadas (F09 aún pendiente)

> Esta spec es el **ancla** de la feature. Define **qué** debe hacer (sin decir cómo).
> Las decisiones técnicas van en la sección "Decisiones" al final, separadas del "qué".

## Historia de usuario (resumen)

> Como **usuario**, quiero **ampliar o reducir la vista del lienzo** para **editar con precisión
> (píxel a píxel) o ver el dibujo completo** según lo que necesite.

## Problema actual

F01 dejó el zoom **fuera de scope** (decisión documentada en su spec: "el tamaño de celda visible /
zoom de edición queda fuera de esta feature"). Hoy el display escala el grid con CSS
(`max-width: min(100%, 512px)`) y no hay control de zoom. En pantallas grandes el lienzo 16×16
queda diminuto; en lienzos grandes (F09) pintar píxel a píxel es impreciso.

## User stories (priorizadas)

Cada user story es un **slice independiente** que entrega valor y puede probarse sola.

### User Story 1 — Zoom con botones (+/- y 100%) (Priority: P1)

Como usuario, quiero botones para acercar, alejar y restablecer el zoom del lienzo.

**Por qué esta prioridad:** es el control de zoom mínimo, predecible y accesible, sin conflictos
de gestos táctiles.

**Test independiente:** el estado de zoom en el store cambia con los botones y el canvas se escala
por CSS, sin alterar píxeles ni historial.

**Acceptance Scenarios (Given/When/Then):**

1. **Given** el editor, **When** toco "+", **Then** la vista del lienzo se amplía en un paso.
2. **Given** el editor, **When** toco "−", **Then** la vista se reduce en un paso (mínimo 1×).
3. **Given** un zoom cualquiera, **When** toco "100%", **Then** la vista vuelve al tamaño base.
4. **Given** zoom activo, **When** pinto, **Then** la conversión de coordenadas sigue siendo exacta
   (la celda bajo el puntero es la correcta).
5. **Given** un móvil, **When** pinto con zoom, **Then** no hay scroll/pan accidental
   (`touch-action` intacto).

### User Story 2 — Zoom con rueda del mouse en desktop (Priority: P2)

Como usuario con mouse, quiero acercar/alejar con la rueda (con o sin Ctrl) sin desencadenar el
scroll de la página.

**Por qué esta prioridad:** refino la UX de desktop; depende de la US1 (estado y render compartidos).

**Acceptance Scenarios (Given/When/Then):**

1. **Given** el cursor sobre el lienzo, **When** hago scroll con la rueda, **Then** el zoom cambia
   acorde al ajuste horizontal/vertical y la página no scrollea.

## Non-functional

- El escalado NO debe degradar los píxeles (mantener `image-rendering: pixelated`).
- Compatible con el `touch-action: none` del canvas (pintado táctil).

## No-objetivos

- No escalar el modelo: cada celda sigue siendo **1 píxel real**; el zoom es visual (CSS).
- No panorámica/pan del lienzo por ahora (posible iteración futura; F10 no la incluye).
- No gesto de pellizco en móvil (entra en conflicto con el pintado táctil).

## Decisiones

### Pendientes

- ¿El zoom se aplica escalando el contenedor por CSS (`transform: scale` o `width`) y hasta qué
  rango (p. ej. 1×–4× en pasos fijos)?
- ¿El zoom preserva la posición (zoom al centro) o al punto bajo el cursor?
- ¿Rueda activa zoom siempre o solo con Ctrl/Meta (evitar conflictos con scroll de página)?

## Tests

- `tests/unit/stores/editor.test.js`: estado de zoom, límites y reseteo.
- `tests/unit/components/Toolbar.test.js` (o componente nuevo): botones con `aria-label`, rueda en
  desktop (si US2 entra).
- `tests/unit/components/PixelCanvas.test.js` (si existe patrón): coordenada bajo zoom sigue
  siendo exacta.

## Relacionado con

- Anterior: F01 Canvas (#11). Relacionada: F09 Matriz (#17), que motiva el zoom en lienzos grandes.
- #8 Mejoras mobile y UX.