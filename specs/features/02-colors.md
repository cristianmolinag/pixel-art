# Feature 002: Colors and Pixel Painting

**Status:** Implemented
**Spec written:** 2026-09-04
**Tests:** `tests/unit/models/Canvas.test.js`, `tests/unit/stores/editor.test.js`, `tests/unit/components/PixelCanvas.test.js`, `tests/unit/components/Palette.test.js`
**Objective:** `specs/project/objective.md`
**Related issue:** [#12](https://github.com/cristianmolinag/pixel-art/issues/12)
**Depends on:** F01 Canvas (#11, implemented)

## User Story Summary

> As a **user**, I want to **choose a color and paint on the canvas** so I can start drawing pixel art.

## Prioritized User Stories

### User Story 1: Choose a color (Priority: P1)

As a user, I want to choose a color from a palette and see the selection.

**Acceptance Scenarios:**

1. **Given** I open the editor, **When** the view appears, **Then** I see an accessible color palette.
2. **Given** the palette is visible, **When** I click or touch a color, **Then** it becomes selected and is marked visually.

### User Story 2: Paint a pixel (Priority: P1)

As a user, I want to touch a canvas cell to paint it with the selected color.

**Acceptance Scenarios:**

1. **Given** a selected color and visible canvas, **When** I touch an empty cell, **Then** it is painted with that color.
2. **Given** a painted cell, **When** I touch it with another selected color, **Then** it changes color.
3. **Given** I paint several cells, **Then** they remain painted while editing.

### User Story 3: Paint by dragging (Priority: P2)

As a user, I want to drag across the canvas to paint continuously.

**Acceptance Scenarios:**

1. **Given** a selected color, **When** I drag across cells without releasing, **Then** every visited cell is painted.
2. **Given** I release the pointer, **When** I touch the canvas again, **Then** the previous drag does not continue painting.
3. **Given** I drag on mobile, **Then** the page does not scroll or zoom accidentally.

## Functional Requirements

- **FR-001:** The system MUST provide a selectable color palette.
- **FR-002:** The current color MUST be marked visually.
- **FR-003:** A touched or clicked cell MUST be painted with the selected color.
- **FR-004:** Painted cells MUST persist on the canvas while editing.
- **FR-005:** Touch input MUST work on mobile without accidental page scroll or zoom.
- **FR-006:** Dragging MUST paint every cell the user crosses.
- **FR-007:** The system MUST provide a fixed palette and a free color picker.
- **FR-008:** Current color and canvas state MUST live in the central rune store `editor.svelte.js`.

## Success Criteria

- **SC-001:** A user can choose a palette color and see it marked.
- **SC-002:** A user can paint a cell and see the selected color immediately.
- **SC-003:** Painted cells remain visible after redraws and continued editing.
- **SC-004:** A user can paint by dragging on mobile without page scroll or zoom.

## Assumptions

- Reuse `Canvas` and `src/lib/canvas/draw.js` from F01.
- The canvas remains 16x16 for this feature; brush size is out of scope.
- The eraser, fill, and line tools belong to F03.

## Decisions

- The central store (`src/lib/stores/editor.svelte.js`) owns `currentColor`, `model`, and painting actions.
- `Palette.svelte` provides about 16 fixed colors and a free color picker.
- `PixelCanvas.svelte` handles pointer down/move/up and maps screen coordinates to cells through zoom and pan.
- `Canvas` provides `setPixel(x, y, color)`.
- `draw.js` blits the model's `OffscreenCanvas` with one `drawImage` for smooth redraws.
