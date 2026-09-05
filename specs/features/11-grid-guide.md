# Feature 011: Full Uniform Grid Guide Overlay

**Status:** Implemented
**Spec written:** 2026-09-04
**Tests:** `tests/unit/components/PixelCanvas.test.js`, `tests/unit/canvas/draw.test.js`, `tests/unit/stores/editor.test.js`
**Objective:** `specs/project/objective.md`
**Related issue:** [#19](https://github.com/cristianmolinag/pixel-art/issues/19)
**Depends on:** F08 Grid (#16, implemented) and F10 Zoom (#18, implemented)

## User Story Summary

> As a **user**, I want the grid to be a clean overlay guide that remains aligned with cells at any zoom, pan, and device pixel ratio, including mobile.

## Problem

The grid must remain presentation-only and aligned with the pixel content. The implemented solution renders a full uniform guide after the pixels using the same device-resolution rounding, including over painted cells.

## User Stories

### User Story 1: Grid as a presentation-only guide (Priority: P1)

The grid MUST not participate in snapshots, undo/redo, drawing data, exports, or Gallery records. The existing `showGrid` toggle MUST continue to work.

### User Story 2: Exact alignment at any zoom, pan, and DPR (Priority: P1)

Every cell boundary MUST align with the pixel boundaries at 100% and all supported zoom/pan/DPR combinations. A hidden grid MUST remain hidden during repaint.

### User Story 3: Implemented uniform guide rendering (Priority: P1)

The guide MUST draw every boundary, including boundaries over painted pixels, producing a complete and uniform overlay. The guide uses the existing toggle, a minimum one-CSS-pixel line width, and fixed opacity; configurable color/opacity UI remains out of scope.

## Functional Requirements

- **FR-001:** The grid MUST be render-only and excluded from snapshots, history, exports, and saved drawings.
- **FR-002:** The full grid MUST remain aligned during zoom, pan, resize, and device-pixel-ratio changes.
- **FR-003:** The guide MUST draw all boundaries uniformly, including over painted cells.
- **FR-004:** The guide MUST respect `showGrid` during every repaint.
- **FR-005:** The guide MUST use the same rounded boundaries as the pixel renderer.

## Non-goals

- Do not build a drawing-layer system.
- Do not change the canvas data model or history.
- Do not change tool, zoom, or matrix logic.
- Do not include the guide in exported or saved results.

## Decisions

- The guide remains in the same canvas as a logical overlay, after pixels, using the same `aX`/`aY` boundaries.
- `Math.max(1, Math.round(dpr))` keeps lines visible at high DPR.
- `GRID_ALPHA = 0.5` is fixed for this iteration; there is no new configuration UI.
- Horizontal segments begin after each vertical line to avoid stacking alpha at intersections.
- Per-axis cell steps keep non-square matrices aligned with pointer-to-cell mapping.
- `ctx.globalAlpha` returns to `1` after drawing the guide.

## Tests

- `PixelCanvas.test.js` verifies the guide is excluded from canvas snapshots and repaints correctly for visibility, zoom, pan, and DPR.
- `draw.test.js` verifies content drawing does not include the guide.
- `editor.test.js` verifies persisted grid visibility.

## Related

- #8 Mobile and UX improvements.
- F08 Grid (#16) provides device-resolution rendering.
