# Feature 001: Canvas

**Status:** Implemented
**Spec written:** 2026-09-04
**Objective:** `specs/project/objective.md`
**Related issue:** [#11](https://github.com/cristianmolinag/pixel-art/issues/11)

> This spec is the feature anchor. It defines what the feature must do, not how.
> Technical decisions are kept separate in the Decisions section.

## User Story Summary

> As a **user**, I want a **gridded pixel canvas** so I have a visible drawing area
> on which to paint in later features.

## Prioritized User Stories

Each user story is an independently testable slice that delivers value.

### User Story 1: View the canvas (Priority: P1)

As a user, I want to see a gridded 16x16 pixel canvas.

**Why this priority:** It is the minimum foundation; without a visible drawing area there is nothing else to use.

**Independent test:** View the rendered grid without requiring any other editor feature.

**Acceptance Scenarios (Given/When/Then):**

1. **Given** I open the editor, **When** the view loads, **Then** I see a square grid of 16 columns and 16 rows.
2. **Given** the grid is visible, **When** I inspect a cell, **Then** I can distinguish it by the grid lines.
3. **Given** the grid is visible, **When** I count the cells along an edge, **Then** there are exactly 16 cells per side.

### User Story 2: Responsive mobile-first canvas (Priority: P2)

As a user, I want the canvas to look good on both mobile and desktop.

**Acceptance Scenarios:**

1. **Given** a narrow phone screen, **When** the canvas is shown, **Then** it uses the available width with `p-4` spacing and remains square (`aspect-ratio: 1/1`).
2. **Given** a wide desktop screen, **When** the canvas is shown, **Then** its size is limited to **512px** maximum.
3. **Given** a scaled canvas, **When** the display is enlarged, **Then** pixels remain sharp with `image-rendering: pixelated`.
4. **Given** the user touches or drags the canvas on mobile, **Then** the page does not scroll or zoom accidentally (`touch-action` is controlled).

## Functional Requirements

- **FR-001:** The system MUST render a 16x16-cell canvas.
- **FR-002:** The system MUST show a visible grid between cells.
- **FR-003:** The canvas MUST remain square at every viewport size.
- **FR-004:** The canvas MUST be limited to **512px** on large screens.
- **FR-005:** The display MUST scale pixels with `image-rendering: pixelated`.
- **FR-006:** The canvas MUST NOT cause accidental scrolling or zooming on mobile.

## Success Criteria

- **SC-001:** A user can load the editor on a phone and see the complete 16x16 grid without horizontal scrolling.
- **SC-002:** A user can load the editor on desktop and see the grid without it growing beyond a reasonable maximum.
- **SC-003:** The Given/When/Then scenarios for US1 and US2 are covered by tests.

## Assumptions

- The existing `Canvas` domain model is used (`src/lib/models/Canvas.js`).
- The stack is Svelte 5, Vite, and Tailwind CSS v4.
- Each cell is one real HTML canvas pixel; CSS scales the display.
- A dedicated Svelte canvas component is used (`PixelCanvas.svelte`).

## Decisions

- Use the native 2D Canvas API (`fillRect`) instead of a grid of divs.
- Each canvas cell is one real pixel; CSS scaling uses `image-rendering: pixelated`.
- `Canvas` is a pure class tested with the `OffscreenCanvas` mock in `tests/setup.js`.
- Since F08, the grid is rendered as an overlay in `PixelCanvas` so it remains sharp and aligned at every scale.
- Visible cell size and editing zoom are handled by F10, not this feature.

## Related

- Next: Feature 002 (colors and painting).
