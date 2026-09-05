# Feature 003: Drawing Tools

**Status:** Implemented
**Spec written:** 2026-09-04
**Tests:** `tests/unit/models/Canvas.test.js`, `tests/unit/stores/editor.test.js`, `tests/unit/components/PixelCanvas.test.js`, `tests/unit/components/Toolbar.test.js`
**Objective:** `specs/project/objective.md`
**Related issue:** [#5](https://github.com/cristianmolinag/pixel-art/issues/5)
**Depends on:** F02 Colors (#12, implemented)

## User Story Summary

> As a **user**, I want to choose a drawing tool (brush, eraser, line, or fill) to draw pixel art more effectively.

## Prioritized User Stories

### User Story 1: Select a tool (Priority: P1)

The toolbar MUST offer Brush, Eraser, Line, and Fill; the active tool is visibly marked. Brush remains the default and paints with the selected color.

### User Story 2: Erase pixels (Priority: P1)

The eraser MUST make touched or dragged-over cells transparent. Erasing an empty cell MUST have no effect.

### User Story 3: Draw a line (Priority: P2)

The line tool MUST paint a continuous line between the start and end cells, show a live preview while dragging, and paint only one cell when both points match.

### User Story 4: Fill a region (Priority: P3)

The fill tool MUST paint the connected region of the touched color without crossing differently colored borders. Filling with the same color MUST do nothing.

## Functional Requirements

- **FR-001:** The system MUST provide Brush, Eraser, Line, and Fill, with one active at a time.
- **FR-002:** The active tool MUST be marked visually.
- **FR-003:** Brush MUST paint the selected color by touch and drag.
- **FR-004:** Eraser MUST clear touched cells to transparency, including during dragging.
- **FR-005:** Line MUST paint a continuous selected-color line from pointer down to pointer up.
- **FR-006:** Line MUST show a live preview while dragging and remove it on release.
- **FR-007:** Fill MUST paint the connected region of the touched color without crossing borders.
- **FR-008:** The active tool and drawing actions MUST live in `editor.svelte.js`.
- **FR-009:** Touch input MUST work on mobile without accidental scroll or zoom.

## Success Criteria

- **SC-001:** A user can switch tools and see the active tool.
- **SC-002:** A user can erase pixels, including by dragging.
- **SC-003:** A user can draw a continuous line with a live preview.
- **SC-004:** A user can fill a connected region.
- **SC-005:** The user-story scenarios are covered by tests.

## Assumptions

- Reuse `Canvas`, the editor store, `PixelCanvas.svelte`, and `Toolbar.svelte`.
- Erasing means making a cell transparent.
- The canvas remains 16x16 and one cell remains one real pixel.
- Fill is a tap action; undo/redo belongs to F04.

## Decisions

- The store uses `tool = $state("brush" | "eraser" | "line" | "fill")` and exposes tool selection and drawing methods.
- `Canvas` provides `erasePixel`, `drawLine` (Bresenham), `floodFill` (BFS), and a pure `linePoints` helper.
- `PixelCanvas` dispatches pointer events by `editor.tool`; line preview remains local until release.
- Redraw order is background, pixels, then the full grid guide.
- `Toolbar.svelte` uses four icon buttons from `lucide-svelte` with accessible English labels.
