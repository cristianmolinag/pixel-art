# Feature 016: Mobile UX — Toast Notifications and Gesture Prevention

**Status:** Implemented  
**Spec written:** 2026-09-08  
**Objective:** `specs/project/objective.md`  
**Related issues:**
- [#51](https://github.com/cristianmolinag/pixel-art/issues/51) Toast notifications and haptic feedback
- [#49](https://github.com/cristianmolinag/pixel-art/issues/49) Prevent pull-to-refresh and gesture interference
- Implementation tasks: [#58](https://github.com/cristianmolinag/pixel-art/issues/58), [#59](https://github.com/cristianmolinag/pixel-art/issues/59)
**Depends on:** F05 Gallery and Persistence (#6, implemented), F14 Scaled PNG Export (#44, implemented)
**Related feature:** F08 Mobile/UX improvements (#8)

## User Story Summary

> As a mobile user, I want clear but non-blocking feedback when I save or export, a short vibration when I paint or change tools, and a canvas that does not accidentally reload the page because of browser gestures.

## Prioritized User Stories

### User Story 1: Non-blocking toast after save (Priority: P1)

When a drawing is saved or updated successfully, a toast message appears near the bottom of the screen and disappears automatically after a few seconds. It MUST NOT block interaction with the editor.

### User Story 2: Non-blocking toast after export (Priority: P1)

When an export finishes (download or successful Web Share), a toast confirms the export. If the user cancels the share sheet, no toast is shown.

### User Story 3: Haptic feedback on completed stroke (Priority: P1)

On devices that support vibration, completing a paint stroke triggers a short pulse (`navigator.vibrate(15)`). Devices without vibration support MUST silently ignore the call.

### User Story 4: Haptic feedback on tool change and save (Priority: P1)

Changing the active tool and saving a drawing also trigger the same short haptic pulse.

### User Story 5: Disable pull-to-refresh and browser page zoom (Priority: P1)

Touching and dragging the canvas MUST NOT trigger the browser's pull-to-refresh. Two-finger pinch gestures MUST NOT zoom the browser page. The app's own pinch-to-zoom MUST keep working.

## Functional Requirements

- **FR-001:** A central toast store MUST support adding and removing toast messages.
- **FR-002:** Toasts MUST render through a `Toast.svelte` component mounted in `App.svelte`.
- **FR-003:** Toasts MUST auto-dismiss after a configurable duration (default 2.5 s).
- **FR-004:** Multiple toasts MUST stack without blocking the UI.
- **FR-005:** Save success (new drawing or update) MUST show a toast and trigger haptic feedback.
- **FR-006:** Export success MUST show a toast and trigger haptic feedback.
- **FR-007:** Cancelled Web Share MUST NOT show an export toast.
- **FR-008:** Completed paint strokes MUST trigger haptic feedback.
- **FR-009:** Tool changes MUST trigger haptic feedback.
- **FR-010:** The haptic utility MUST check `navigator.vibrate` availability and fail silently.
- **FR-011:** The canvas container and main editor container MUST use `touch-action: none` and `overscroll-behavior: none`.
- **FR-012:** The existing pointer-based pinch zoom MUST remain functional.

## Success Criteria

- **SC-001:** Saving a drawing shows a non-blocking toast.
- **SC-002:** Exporting a PNG shows a non-blocking toast.
- **SC-003:** Cancelling a mobile share sheet does not show an export toast.
- **SC-004:** `navigator.vibrate(15)` is called on completed strokes, tool changes, and saves when supported.
- **SC-005:** On unsupported devices the app does not throw errors.
- **SC-006:** Pull-to-refresh is disabled on the canvas/main container.
- **SC-007:** Browser page zoom is disabled while app pinch zoom still works.

## Scope / Non-goals

- Sound effects are out of scope.
- Toast styling is intentionally minimal and consistent with the existing dark theme.
- This feature does not change desktop zoom/pan shortcuts.

## Decisions

- Toast state lives in `src/lib/stores/toasts.svelte.js` and uses a Svelte 5 rune array.
- `Toast.svelte` renders a fixed bottom-center stack with Svelte transitions and `role="status"` / `aria-live="polite"`.
- Haptics live in `src/lib/utils/haptics.js` as a small `vibrate(ms)` wrapper.
- `editor.selectTool()` calls `vibrate(15)` so every tool change path (toolbar click, keyboard shortcut, eyedropper return) is covered.
- `PixelCanvas` calls `vibrate(15)` in `onPointerUp` when a real painting action completes.
- `SaveModal` calls the toast store and `vibrate(15)` after `gallery.save()` or `gallery.updateCurrent()` succeeds.
- `ExportModal` calls the toast store and `vibrate(15)` after `downloadBlob()` returns a non-aborted result.
- `downloadBlob()` in `src/lib/services/export.js` returns `{ shared: boolean, aborted: boolean }` so callers can distinguish a completed share/download from a cancelled share.
- Gesture protection is applied with Tailwind utilities `touch-none` and `overscroll-none` on the `<main>` element in `App.svelte` and on the canvas wrapper in `PixelCanvas.svelte`.
- The existing viewport meta tag (`user-scalable=no`) remains in place.

## Related

- Previous: F14 Scaled PNG Export (#44).
- Backlog: #1 PWA icons, #8 mobile/UX improvements, #10 keyboard shortcuts.
