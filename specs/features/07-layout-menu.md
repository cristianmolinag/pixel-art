# Feature 007: Menu Layout (Desktop Sidebar)

**Status:** Implemented (#15 closed)
**Spec written:** 2026-09-04
**Objective:** `specs/project/objective.md`
**Related issue:** [#15](https://github.com/cristianmolinag/pixel-art/issues/15) (closed)
**Depends on:** F03 Tools (#5), F04 Undo/Redo (#13), and F05 Gallery (#6), implemented

## User Story Summary

> As a **user**, I want an ordered menu at every viewport width, with icons grouped by function, so actions remain accessible without unpredictable wrapping.

## User Stories

### User Story 1: Grouped menu without splits (Priority: P1)

Tool groups MUST remain visually separated and no group may break halfway through a row. Existing labels and actions remain unchanged.

### User Story 2: Desktop sidebar with header/body/footer (Priority: P1)

At `>= lg`, the sidebar is on the left with a header, toolbar body, and color-palette footer. The main grid area fills the remaining space and centers the canvas. Below `lg`, the existing stacked mobile layout remains.

### User Story 3: Responsive mobile toolbar (Priority: P1)

On mobile, tools, grid, matrix, undo/redo, and zoom remain accessible. Zoom is contained in its own expander; grid and matrix controls remain visible. Fluid icon and gap sizes prevent clipping. Selecting a zoom option or pressing Escape closes the zoom panel.

## Non-goals

- Do not change tool, history, or gallery logic.
- Do not add keyboard shortcuts (#10).
- Do not alter existing button behavior.
- Do not hide grid controls behind a generic overflow menu.

## Decisions

- `App.svelte` is the single source for the app shell: header, flex content with sidebar and centered canvas, and full-width palette footer.
- Desktop uses a stacked sidebar; mobile uses a responsive toolbar row plus a separate zoom-controls row.
- `src/app.css` provides fluid icon and toolbar-row classes with `clamp()` sizing.
- Confirmations use custom dialog modals patterned after `Matrix.svelte`, never `window.confirm`.

## Tests

- Toolbar tests cover the English accessible labels, tools, history, grid, matrix, and zoom.
- File-action tests cover the custom New confirmation dialog.

## Related

- #8 Mobile and UX improvements.
- #10 Keyboard shortcuts.
