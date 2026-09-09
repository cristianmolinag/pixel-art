# Feature 017: Shape Tools (Rectangle and Circle)

**Status:** Implemented (pending review / no-commit)
**Spec written:** 2026-09-08
**Tests:** `tests/unit/models/Canvas.test.js`, `tests/unit/stores/editor.test.js`, `tests/unit/components/PixelCanvas.test.js`, `tests/unit/components/Toolbar.test.js`
**Objective:** `specs/project/objective.md`
**Related issue:** [#42](https://github.com/cristianmolinag/pixel-art/issues/42)
**Depends on:** F03 Drawing Tools (#5, implemented; eyedropper extension #40), F15 Mirror Symmetry (#41, implemented)

## User Story Summary

> As a **pixel artist**, I want to draw rectangles and circles with an outline or solid fill so I can create clean geometric shapes pixel by pixel.

## Prioritized User Stories

### User Story 1: Select rectangle and circle tools (Priority: P1)

The toolbar MUST offer Rectangle and Circle tools. The active tool is visibly marked. Selecting either tool makes it the current drawing tool.

### User Story 2: Draw a rectangle (Priority: P1)

The rectangle tool MUST paint a rectangular preview while dragging and commit the shape on pointer release. The rectangle MUST use integer pixel boundaries.

### User Story 3: Draw a circle (Priority: P1)

The circle tool MUST paint a circular preview while dragging and commit the shape on pointer release. The circle MUST be rendered with a pixel-perfect algorithm (midpoint/Bresenham).

### User Story 4: Choose outline or fill mode (Priority: P1)

When a shape tool is active, a segmented control MUST show Outline and Fill options. Outline mode paints only the border; Fill mode paints the interior as well.

### User Story 5: Single-pixel click (Priority: P1)

If the pointer is released on the same pixel where it started, the shape tools MUST paint exactly one pixel, matching the behavior of the brush.

### User Story 6: Undo the whole shape (Priority: P1)

Releasing the pointer MUST commit the entire shape as a single undo/redo step.

### User Story 7: Respect mirror symmetry (Priority: P2)

Rectangle and circle operations MUST honor the active horizontal and/or vertical mirror toggles, drawing up to four symmetrical variants.

## Functional Requirements

- **FR-001:** The system MUST provide Rectangle and Circle tools in the toolbar.
- **FR-002:** The active tool MUST be marked visually.
- **FR-003:** The rectangle tool MUST paint a rectangle defined by the pointer-down and pointer-release cells.
- **FR-004:** The circle tool MUST paint a pixel-perfect circle defined by the drag bounding box.
- **FR-005:** A segmented control MUST appear when a shape tool is active, offering Outline and Fill modes.
- **FR-006:** Outline mode MUST paint only the perimeter of the shape.
- **FR-007:** Fill mode MUST paint the perimeter and interior of the shape.
- **FR-008:** Releasing on the starting cell MUST paint exactly one pixel.
- **FR-009:** The entire shape operation MUST create a single undo step.
- **FR-010:** Shape drawing MUST respect horizontal and vertical mirror symmetry.
- **FR-011:** Shape preview while dragging MUST render the mirrored variants when symmetry is active.
- **FR-012:** Shape drawing state and mode MUST live in `editor.svelte.js`.

## Success Criteria

- **SC-001:** A user can select rectangle and circle tools.
- **SC-002:** A user can draw a rectangle in outline and fill modes.
- **SC-003:** A user can draw a circle in outline and fill modes.
- **SC-004:** A single click with a shape tool paints one pixel.
- **SC-005:** Undo reverts the entire shape in one step.
- **SC-006:** Mirror symmetry reflects shape operations correctly.
- **SC-007:** The user-story scenarios are covered by tests.

## Scope / Non-goals

- Ellipses, rounded rectangles, and anti-aliased shapes are out of scope.
- Shape attributes such as line thickness or gradient fills are out of scope.
- Fill-tool symmetry remains out of scope (already excluded in F15).

## Assumptions

- Reuse `Canvas`, the editor store, `PixelCanvas.svelte`, `Toolbar.svelte`, and the existing mirror-symmetry helpers.
- A shape is defined by two cell corners and is normalized to a bounding box before drawing.
- Circles use the larger of the width or height of the drag bounding box as the diameter.
- Undo/redo treats the committed shape as one action.

## Decisions

- The store adds `shapeMode = $state("outline" | "fill")` and `setShapeMode(mode)`.
- `Canvas` provides pure helpers `rectPoints(x0, y0, x1, y1, mode)` and `circlePoints(x0, y0, x1, y1, mode)`, plus `drawRect` and `drawCircle` methods.
- The circle outline uses a midpoint/Bresenham algorithm; the fill uses a scanline circle fill.
- `editor.svelte.js` provides `mirroredShapeBounds(x0, y0, x1, y1)` analogous to `mirroredLineEndpoints`, and `drawRect`/`drawCircle` methods that apply symmetry internally.
- `PixelCanvas.svelte` previews shapes with the same helpers and `mirroredShapeBounds`, using `editor.shapeMode` for outline vs. fill.
- `Toolbar.svelte` renders a segmented Outline/Fill control only when the active tool is `rectangle` or `circle`.
- Toolbar icons come from `lucide-svelte` (`Square` and `Circle`).
