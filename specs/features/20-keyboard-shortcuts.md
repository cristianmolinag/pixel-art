# Feature 020: Complete Desktop Keyboard Shortcuts

**Status:** Implemented  
**Spec written:** 2026-09-09  
**Objective:** `specs/project/objective.md`  
**Related issues:**
- [#50](https://github.com/cristianmolinag/pixel-art/issues/50) Complete desktop keyboard shortcuts
- Closes backlog: [#10](https://github.com/cristianmolinag/pixel-art/issues/10) Keyboard shortcuts
- Related: #5 Drawing tools, #13 Undo/Redo, #44 Export, #40 Eyedropper

## User Story Summary

> As a desktop user, I want keyboard shortcuts for common tools and actions so I can draw without constantly reaching for the toolbar.

## Prioritized User Stories

### User Story 1: Tool shortcuts (Priority: P1)

While the editor has focus, pressing `B`, `E`, `L`, `R`, `C`, `F`, or `I` activates the brush, eraser, line, rectangle, circle, fill, or eyedropper tool respectively, and pressing `G` toggles the grid overlay.

### User Story 2: Zoom shortcuts (Priority: P1)

Pressing `+` (or `=`) or `-` (or `_`) zooms the canvas in or out by the same step and limits as the toolbar zoom buttons, and pressing `0` resets zoom and pan.

### User Story 3: History and file shortcuts (Priority: P1)

Pressing `Ctrl+Z` undoes the last action, `Ctrl+Shift+Z` or `Ctrl+Y` redoes it, `Ctrl+S` opens the save flow, and `Ctrl+E` opens the PNG export flow.

### User Story 4: Space-drag pan (Priority: P1)

Holding `Space` and dragging the canvas pans the view without painting, on desktop, in addition to the existing `Ctrl + drag` pan; page scroll is prevented while `Space` is held.

### User Story 5: Typing safety (Priority: P1)

While the focus is inside an input, textarea, or `contenteditable` element, no editor shortcut fires, so typing stays untouched.

## Functional Requirements

- **FR-001:** The keys `B`, `E`, `L`, `R`, `C`, `F`, `I` MUST select brush, eraser, line, rectangle, circle, fill, and eyedropper respectively (case-insensitive, no Ctrl/Alt/Meta held).
- **FR-002:** The key `G` MUST toggle `editor.showGrid` (grid toggle per epic #10; Aseprite convention — NOT the fill tool, which is `F`).
- **FR-003:** `+`/`=` and `-`/`_` (including numpad) MUST zoom in/out through `editor.zoomIn()`/`editor.zoomOut()` so `ZOOM_STEP`, `MIN_ZOOM`, and `MAX_ZOOM` stay consistent with the toolbar buttons; `0` MUST call `editor.resetZoom()`.
- **FR-004:** `Ctrl+Z` MUST call `editor.undo()`; `Ctrl+Shift+Z` and `Ctrl+Y` MUST call `editor.redo()`.
- **FR-005:** `Ctrl+S` MUST open the save modal and `Ctrl+E` MUST open the export modal through pending-action flags in the editor store (`pendingSave`, `pendingExport`) consumed by `FileActions.svelte` with `$effect`; the flags are cleared once consumed.
- **FR-006:** Holding `Space` MUST arm pointer pan mode so `PixelCanvas` pans on drag without painting, and MUST `preventDefault()` the keydown so the page does not scroll while the key is held.
- **FR-007:** All editor shortcuts MUST be ignored when the event target is an `input`, `textarea`, or `contenteditable` element.
- **FR-008:** All tool/grid/zoom/undo/redo/save/export shortcuts MUST be registered exactly once, in a single global window keydown handler owned by `App.svelte`; `Toolbar.svelte` MUST NOT register its own tool shortcut handler.
- **FR-009:** The browser shortcuts `Ctrl+0`, `Ctrl+=`, `Ctrl+-`, `Ctrl+wheel`, and other unclaimed Ctrl/Meta/Alt combinations MUST NOT be intercepted (no `preventDefault`).

## Success Criteria

- **SC-001:** Pressing each tool key with the editor focused activates the matching tool; the toolbar marks it active (`aria-pressed`).
- **SC-002:** `G` toggles the grid on and off.
- **SC-003:** `+`/`-` change zoom in 0.5 steps within the 1–4 range, matching the toolbar buttons; `0` returns to 100% and resets pan.
- **SC-004:** `Ctrl+Z` reverts the last action and `Ctrl+Shift+Z`/`Ctrl+Y` restore it.
- **SC-005:** `Ctrl+S` opens the save modal and `Ctrl+E` opens the export modal.
- **SC-006:** `Space` + drag pans the view and paints nothing; releasing `Space` restores normal painting behavior; `Space` held during window blur does not stick.
- **SC-007:** Typing `b`, `g`, `+`, or `0` inside a text field does not change the tool, grid, or zoom.
- **SC-008:** Pressing a tool key while only a `Toolbar` instance is rendered (no `App`) does nothing, proving the per-instance handler was removed and shortcuts are global and single-instance.

## Scope / Non-goals

- Customizable/rebindable shortcuts are out of scope.
- No new shortcuts for mirror toggles, shape mode, or gallery actions (not requested).
- Shortcuts are not gated by open modals (e.g., gallery open); the typing guard from FR-007 is the only suppression. Most modal flows keep focus in inputs, which the guard already covers.
- Touch devices keep their gesture set (pinch zoom, two-finger pan); `Space`-pan is a desktop pointer feature.

## Decisions

- All key logic lives in `src/lib/utils/shortcuts.js` (`handleKeydown`, `handleKeyup`, `isEditableTarget`) as pure functions taking an actions map; `App.svelte` registers one `svelte:window` keydown/keyup pair and maps actions to store methods. This makes the dispatcher unit-testable without rendering `App`.
- The eyedropper `I` shortcut moves out of `Toolbar.svelte` (previously registered by the tools instance) into the global handler, keeping a single registration point. The zoom-panel-specific window handlers in `Toolbar` (Escape to close, click-outside) stay where they are.
- `Space`-pan state lives in the editor store as `spaceHeld` (set by the global handler, read by `PixelCanvas`). `PixelCanvas` extends its existing `Ctrl/Meta`-drag pan branch to also trigger when `spaceHeld` is true; touch handling is unaffected because `spaceHeld` is only set from a keyboard event. When the focused element is a `button`, `a`, or `select`, `Space` is left to the browser (native activation) instead of arming pan; clicking the canvas returns focus to the body so space-drag works right after.
- The save/export modal open state stays in `FileActions.svelte`; `Ctrl+S`/`Ctrl+E` set `pendingSave`/`pendingExport` flags in the editor store, which `FileActions` consumes in a `$effect` (open the modal, clear the flag). This follows the documented pending-action pattern (no `document.querySelector`, no lifting modal state).
- Modifier policy: `Ctrl` or `Meta` + `Z`/`Shift+Z`/`Y`/`S`/`E` are handled; any other Ctrl/Meta/Alt combination is left to the browser. Plain `+`/`=`/`-`/`_`/`0` and the tool/grid letters are handled only without modifiers. Handled keys call `preventDefault()` to suppress defaults deterministically.
- Toolbar button titles now surface shortcut hints (e.g., "Brush (B)", "Zoom in (+)", "Undo (Ctrl+Z)", "Save (Ctrl+S)") so the feature is discoverable, and the canvas pan hint mentions `Space` alongside `Ctrl + drag`.

## Related

- Previous: F18 Thumb-zone toolbar layout (#48), F17 Shape tools (#42), F16 Mobile UX (#51/#49), F15 Mirror symmetry (#41).
- Backlog: #1 PWA icons, #8 mobile/UX improvements.
