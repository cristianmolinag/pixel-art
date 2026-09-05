# Feature 010: Canvas Zoom

**Status:** Implemented (UX revision integrated 2026-09-04)
**Spec written:** 2026-09-04
**Objective:** `specs/project/objective.md`
**Related issue:** [#18](https://github.com/cristianmolinag/pixel-art/issues/18)
**Depends on:** F01 Canvas (#11) and F09 Matrix (#17), implemented

## User Story Summary

> As a **user**, I want to zoom the canvas in or out so I can edit pixel by pixel or view the complete drawing.

## User Stories

### User Story 1: Button zoom (Priority: P1)

The user can zoom in, zoom out, and reset to 100%. Zoom MUST remain between 1x and 4x. Painting at any zoom MUST target the correct cell, and drawing and grid MUST scale together.

### User Story 2: Desktop pan (Priority: P2)

Ctrl/Meta-drag MUST pan an enlarged view without painting. Pan remains within reasonable canvas bounds.

### User Story 3: Mobile pinch zoom (Priority: P2)

Two pointers MUST adjust zoom continuously without painting or triggering browser scroll. A single pointer continues to paint normally.

## Non-functional Requirements

- The canvas frame remains fixed at `min(100%, 512px)` and clips scaled content with `overflow: hidden`.
- The toolbar shows one zoom percentage indicator.
- Pixel quality uses `image-rendering: pixelated`.
- Zoom uses buttons and pinch, not the mouse wheel.
- The mobile zoom expander MUST stay open while the user operates its zoom controls. It closes only when the user explicitly collapses it, selects a separate action as designed, or presses Escape.
- The pan/zoom usage hint MUST automatically hide after 3 seconds.

## Decisions

- Store constants are `MIN_ZOOM=1`, `MAX_ZOOM=4`, and `ZOOM_STEP=0.5`. The plus and minus buttons MUST be disabled at 4x and 1x respectively.
- The visual transform is `translate(...) scale(...)`; the model pixels are not changed.
- Ctrl/Meta drag updates `panX` and `panY` without painting.
- Two simultaneous pointers adjust zoom around the frame center; one pointer paints.
- Pointer-to-cell mapping uses the transformed canvas bounds and accounts for both zoom and pan, so the cell under the pointer remains exact.
- Store actions are `zoomIn`, `zoomOut`, `resetZoom`, and `panBy`.

## Tests

- Store tests cover 0.5 steps, 1x-4x limits, reset, and pan clamping.
- Toolbar tests cover disabled boundary buttons, one percentage indicator, the reset icon, and mobile expander behavior.
- `PixelCanvas.test.js` covers transform rendering, zoom/pan-aware painting, Ctrl/Meta pan, pinch zoom, and the auto-hidden hint.

## Related

- F01 Canvas (#11).
- F09 Matrix (#17).
- #8 Mobile and UX improvements.
