# Feature 003: Drawing Tools

**Status:** Implemented (extended by [#40](https://github.com/cristianmolinag/pixel-art/issues/40))
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

### User Story 5: Sample a color with the eyedropper (Priority: P2)

The eyedropper tool MUST let the user pick a color from any painted canvas pixel and make it the current drawing color. Tapping a transparent pixel MUST be handled gracefully by switching to the eraser. After sampling, the tool MUST automatically switch back to the last drawing tool (brush by default). The `I` key MUST activate the eyedropper, and the canvas cursor MUST indicate color picking.

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
- **FR-010:** The system MUST provide an eyedropper tool selectable from the toolbar and with the `I` keyboard shortcut (#40).
- **FR-011:** The eyedropper MUST set the current color to the sampled pixel color and return to the last drawing tool (#40).
- **FR-012:** Sampling a transparent pixel with the eyedropper MUST switch to the eraser without changing the current color (#40).
- **FR-013:** The canvas cursor MUST indicate color picking while the eyedropper is active (#40).

## Success Criteria

- **SC-001:** A user can switch tools and see the active tool.
- **SC-002:** A user can erase pixels, including by dragging.
- **SC-003:** A user can draw a continuous line with a live preview.
- **SC-004:** A user can fill a connected region.
- **SC-005:** The user-story scenarios are covered by tests.
- **SC-006:** A user can sample a painted pixel color with the eyedropper (#40).
- **SC-007:** A user can sample a transparent pixel gracefully (#40).
- **SC-008:** A user can activate the eyedropper with the `I` key (#40).

## Assumptions

- Reuse `Canvas`, the editor store, `PixelCanvas.svelte`, and `Toolbar.svelte`.
- Erasing means making a cell transparent.
- The canvas remains 16x16 and one cell remains one real pixel.
- Fill is a tap action; undo/redo belongs to F04.

## Decisions

- The store uses `tool = $state("brush" | "eraser" | "line" | "fill" | "eyedropper")` and exposes tool selection and drawing methods.
- The store tracks `lastDrawingTool` so the eyedropper can return to the previous brush, eraser, line, or fill tool after sampling.
- `Canvas` provides `erasePixel`, `drawLine` (Bresenham), `floodFill` (BFS), and a pure `linePoints` helper.
- `PixelCanvas` dispatches pointer events by `editor.tool`; line preview remains local until release.
- The eyedropper samples on pointer down, changes the current color, and immediately restores the last drawing tool; it does not paint or create undo steps.
- Redraw order is background, pixels, then the full grid guide.
- `Toolbar.svelte` uses icon buttons from `lucide-svelte` with accessible English labels, including a `Pipette` icon for the eyedropper.
