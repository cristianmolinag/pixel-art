# Feature 009: Canvas Matrix Menu

**Status:** Implemented
**Spec written:** 2026-09-04
**Tests:** `tests/unit/components/Matrix.test.js`, `tests/unit/stores/editor.test.js`, `tests/unit/components/Toolbar.test.js`
**Objective:** `specs/project/objective.md`
**Related issue:** [#17](https://github.com/cristianmolinag/pixel-art/issues/17)
**Depends on:** F01 Canvas (#11) and F05 Gallery (#6), implemented

## User Story Summary

> As a **user**, I want to choose the canvas matrix size so I can draw with more or less detail for each project.

## User Stories

### User Story 1: Choose a matrix preset (Priority: P1)

The menu MUST offer 16x16, 32x32, 48x48, and 64x64 presets. Choosing one clears and redraws the canvas after confirmation. Presets MUST be accessible and the popover MUST close after selection or outside/Escape dismissal.

### User Story 2: Custom size (Priority: P2)

The user MUST be able to enter arbitrary valid width and height. Values outside 4-128, zero, negative, huge, or non-numeric values MUST show an error and not apply.

## Integration

- Undo/redo history is retained; snapshots with dimensions different from the current matrix are skipped.
- `Drawing` serializes dimensions and restores them when loading from the Gallery.

## Non-goals

- No zoom (F10).
- No multiple canvases, pages, or sprite sheets.

## Decisions

- Changing the matrix clears the canvas after a custom confirmation dialog; canceling leaves the matrix and popover unchanged.
- Presets are fixed at 16x16, 32x32, 48x48, and 64x64. Custom sizes use `MIN_MATRIX_SIZE=4` and `MAX_MATRIX_SIZE=128`.
- `editor.setMatrix` owns validation, clearing, and dimension-aware history behavior.
- `Matrix.svelte` uses a backdrop/Escape popover and the `LayoutGrid` toolbar icon.

## Tests

- `Canvas.test.js` covers custom dimensions.
- Store tests cover changing/clearing, validation, and dimension-aware history.
- `Matrix.test.js` covers presets, custom size, confirmation, cancellation, invalid values, and Escape.
- Toolbar tests cover the matrix button.

## Related

- F01 Canvas (#11).
- F05 Gallery (#6).
- #8 Mobile and UX improvements.
