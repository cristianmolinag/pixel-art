# Feature 018: Thumb-zone Toolbar Layout for Portrait Mobile

**Status:** Implemented  
**Spec written:** 2026-09-08  
**Objective:** `specs/project/objective.md`  
**Related issues:**
- [#48](https://github.com/cristianmolinag/pixel-art/issues/48) Thumb-zone toolbar layout for portrait mobile
- Backlog: [#8](https://github.com/cristianmolinag/pixel-art/issues/8) Mobile/UX improvements

## User Story Summary

> As a mobile user holding the phone in one hand, I want the toolbar within easy thumb reach so I can switch tools quickly in portrait mode.

## Prioritized User Stories

### User Story 1: Portrait layout (Priority: P1)

On a phone in portrait orientation, the controls row sits directly below the header, above the canvas, and the drawing tools row sits in the thumb zone between the canvas and the palette, so the drawing tools stay closest to the thumb and each row fits on a single line.

### User Story 2: Landscape split sidebars (Priority: P1)

When the phone is rotated to landscape, the drawing tools move to a left sidebar and the controls move to a right sidebar, both spanning the full screen height, while the palette footer is centered under the canvas so the sidebars gain visibility without needing to scroll.

### User Story 3: Unchanged desktop layout (Priority: P1)

On desktop and tablet-width viewports, the toolbar keeps the existing single left sidebar with the tools group above the controls group.

### User Story 4: Floating shape mode pill (Priority: P1)

When a shape tool (rectangle or circle) is active, an Outline/Fill pill floats inside the canvas viewport without overlapping the drawing square: at the bottom edge, centered, in portrait and desktop where the square canvas leaves vertical dead space, and at the left edge, vertically centered, in landscape mobile where the free space is beside the canvas instead.

## Functional Requirements

- **FR-001:** In portrait mobile, the editor layout MUST place the controls row directly below the header, above the canvas, and the drawing tools row directly above the palette.
- **FR-002:** In landscape mobile, the editor layout MUST place drawing tools in a left sidebar and controls in a right sidebar spanning the full screen height, with the canvas and the palette footer centered between them.
- **FR-003:** In portrait mobile, each toolbar row MUST fit on a single line without wrapping under normal phone widths.
- **FR-004:** The zoom controls MUST stay available in both orientations: inline in the sidebar layouts and inside the mobile zoom expander in portrait.
- **FR-005:** The desktop layout MUST keep the single left sidebar with drawing tools above controls.
- **FR-006:** The canvas MUST remain fully visible and centered in all orientations; in portrait mobile it MUST shrink to fit the remaining vertical space rather than being clipped.
- **FR-007:** The toolbar MUST be split into a tools group (brush, eraser, line, rectangle, circle, fill, eyedropper) and a controls group ordered undo, redo, mirrors, grid, matrix, zoom, so undo/redo stay visible before the zoom group in every layout.
- **FR-008:** The shape mode pill MUST be visible only while a shape tool is active, floating inside the canvas viewport: bottom-centered in portrait and desktop, left-centered vertically in landscape mobile.

## Success Criteria

- **SC-001:** In portrait mobile, the controls row appears below the header and the tools row appears above the palette, each on one line.
- **SC-002:** In landscape mobile, tools appear on the left and controls on the right reaching the bottom of the screen, and the palette is centered under the canvas.
- **SC-003:** On desktop, the single left sidebar shows tools above controls as before.
- **SC-004:** All toolbar buttons remain functional after the layout change.
- **SC-005:** Zoom controls work in both mobile orientations.
- **SC-006:** The canvas is fully visible (not clipped) in portrait, landscape, and desktop viewports.
- **SC-007:** The Outline/Fill pill appears only with rectangle or circle active, floats bottom-centered in portrait and desktop, and floats left-centered vertically in landscape mobile.

## Scope / Non-goals

- This is a mobile UX improvement related to #8.
- Focus on portrait phones; tablets may keep the existing layout.
- Does not change tool functionality, iconography, or shortcuts.
- Does not add new tools or reorder existing tools.

## Decisions

- The editor layout uses CSS Grid with named template areas switched by orientation and width media queries, so the change is purely presentational and does not require JavaScript state.
- Custom utility classes in `src/app.css` drive the layout: `.editor-layout`, `.toolbar-tools`, `.toolbar-controls`, `.toolbar-container`, `.toolbar-separator`, `.toolbar-zoom-inline`, `.toolbar-zoom-toggle`, `.toolbar-zoom-panel`, and `.shape-pill`.
- Portrait mobile places `controls`, `canvas`, and `tools` on three grid rows; landscape mobile uses one row with three columns; desktop stacks `tools` and `controls` in a single left column.
- `Toolbar.svelte` renders a group based on its `mode` prop (`tools` or `controls`); `App.svelte` mounts one instance per grid area.
- The shape mode segmented control moved out of the toolbar into `ShapeModePill.svelte`, rendered once inside the canvas viewport; media queries move it from bottom-centered (portrait and desktop) to left-centered vertically (landscape mobile).
- On desktop, the stacked tools and controls sections of the left sidebar are divided by a `.toolbar-section-separator` element reusing the same thin-line style as `.toolbar-separator`.
- In landscape mobile, the palette footer spans only the center column so both sidebars reach the bottom of the screen.
- The zoom panel closes on any click outside the zoom toggle/panel through a window click handler in the controls instance.
- The eyedropper keyboard shortcut (`I`) was registered by the tools instance; F20 (#50) superseded this by consolidating it into the single global handler in `App.svelte` (see `specs/features/20-keyboard-shortcuts.md`).

## Related

- Previous: F17 Shape tools (#42), F16 Mobile UX: Toasts and Gesture Prevention (#51/#49).
- Backlog: #1 PWA icons, #8 mobile/UX improvements, #10 keyboard shortcuts.
