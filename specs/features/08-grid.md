# Feature 008: Canvas Grid Toggle

**Status:** Implemented
**Spec written:** 2026-09-04
**Tests:** `tests/unit/canvas/draw.test.js`, `tests/unit/stores/editor.test.js`, `tests/unit/components/Toolbar.test.js`
**Objective:** `specs/project/objective.md`
**Related issue:** [#16](https://github.com/cristianmolinag/pixel-art/issues/16)
**Depends on:** F01 Canvas (#11, implemented)

## User Story Summary

> As a **user**, I want to show or hide the canvas grid so I can view a clean drawing or distinguish cells as needed.

## Problem

F01 always showed the grid. F08 adds a toolbar toggle without changing the canvas dimensions, pixels, or history.

## User Story: Toggle the grid (Priority: P1)

The toolbar toggle MUST immediately hide or show the grid. It MUST expose `aria-pressed` and an accessible label, and toggling MUST not change pixels or history.

## Functional Requirements

- **FR-001:** The system MUST provide a grid toggle.
- **FR-002:** Hiding and showing the grid MUST leave the drawing intact.
- **FR-003:** The toggle MUST persist in localStorage under `pixel-art-studio:show-grid`, defaulting to `true`.
- **FR-004:** `drawCanvas` with `grid: false` MUST not draw grid lines.
- **FR-005:** The toggle MUST apply only to the editing canvas, not gallery thumbnails.

## Decisions

- `editor.svelte.js` owns `showGrid` and `toggleGrid`.
- `PixelCanvas.svelte` renders at device resolution and applies zoom and pan during drawing, without CSS transforms.
- The grid is rendered after pixels with the same rounded cell boundaries and a minimum one-device-pixel line width.
- The guide is a **full, uniform overlay**: every cell boundary is drawn, including over painted pixels. The former empty-cell-only behavior is not used.
- The guide redraws when visibility, zoom, pan, or the observed container size changes.
- Grid color and opacity are shared by `GRID_COLOR` and `GRID_ALPHA` in `src/lib/canvas/draw.js`.

## Tests

- Canvas drawing tests verify pixel blitting and no grid work in `drawCanvas`.
- `PixelCanvas` tests verify device-resolution grid segments according to visibility.
- Store tests verify the default, toggle, and localStorage persistence.
- Toolbar tests verify `aria-pressed`, accessible label, and icon changes.

## Related

- F01 Canvas (#11).
- #8 Mobile and UX improvements.
- F07 Layout (#15).
