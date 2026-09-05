# Feature 005: Gallery and Persistence

**Status:** Implemented
**Spec written:** 2026-09-04
**Tests:** `tests/unit/models/Drawing.test.js`, `tests/unit/services/gallery.test.js`, `tests/unit/stores/gallery.test.js`, `tests/unit/components/Gallery.test.js`, `tests/unit/components/Toolbar.test.js`
**Objective:** `specs/project/objective.md`
**Related issue:** [#6](https://github.com/cristianmolinag/pixel-art/issues/6)
**Depends on:** F04 Undo/Redo (#13, implemented)

## User Story Summary

> As a **user**, I want to save drawings and see them again in a gallery so I do not lose work and can resume it later.

## Prioritized User Stories

### User Story 1: Save the current drawing by name (Priority: P1)

Saving a non-empty name stores the complete drawing in IndexedDB and shows it in the gallery with a thumbnail. The save form suggests an editable current-date name and rejects an empty name.

### User Story 2: View saved drawings (Priority: P1)

The Gallery action opens a modal with cards showing thumbnail, name, and save date, newest first. An empty gallery shows a clear empty state; closing it leaves the editor unchanged.

### User Story 3: Load a saved drawing (Priority: P1)

Activating a card restores its pixels and dimensions and closes the modal. Unsaved work remains in the canvas until it is saved or discarded.

### User Story 4: Start a new drawing (Priority: P2)

New clears the canvas and resets undo/redo after a custom confirmation modal is accepted. Canceling leaves the canvas unchanged.

### User Story 5: Delete a saved drawing (Priority: P2)

Delete removes a drawing from the gallery and storage after a custom confirmation modal is accepted. Canceling leaves it intact.

## Functional Requirements

- **FR-001:** Save MUST open a form for naming the current drawing.
- **FR-002:** Saving MUST persist name, dimensions, pixels, thumbnail, and timestamp in IndexedDB.
- **FR-003:** Gallery MUST open a modal listing cards with thumbnail, name, and date, newest first.
- **FR-004:** Activating a card MUST restore pixels and dimensions and close the modal.
- **FR-005:** New MUST clear the canvas and reset undo/redo after confirmation.
- **FR-006:** Delete MUST remove a drawing from the gallery and storage after confirmation.
- **FR-007:** A drawing name MUST be required.
- **FR-008:** Gallery state MUST live in the central rune store `gallery.svelte.js`.
- **FR-009:** Persistence MUST survive page reloads through IndexedDB.
- **FR-010:** The UI MUST work on mobile with a mobile-first modal.
- **FR-011:** Only the saved-drawing list may scroll; the modal, save controls, and surrounding gallery UI MUST remain fixed.
- **FR-012:** Delete MUST use a custom confirmation modal, never `window.confirm`.

## Success Criteria

- **SC-001:** A saved drawing appears with thumbnail, name, and date.
- **SC-002:** Saved drawings remain after reload.
- **SC-003:** Activating a card restores the drawing and closes the modal.
- **SC-004:** New and Delete apply on confirmation and do nothing on cancellation.
- **SC-005:** The user-story scenarios are covered by tests.

## Assumptions

- Saving is manual; draft auto-save is out of scope.
- Gallery is a modal overlay, not a separate route.
- Loading or creating a drawing resets undo/redo.
- JSON import/export is out of scope.

## Decisions

- `Drawing` (`src/lib/models/Drawing.js`) serializes canvas snapshots and creates thumbnails.
- `gallery.js` isolates IndexedDB and exposes `saveDrawing`, `listDrawings`, and `deleteDrawing`.
- `gallery.svelte.js` owns drawings, visibility, save focus, errors, and loading/deletion actions.
- `Gallery.svelte` is a fixed overlay with save controls and a vertically scrollable drawing list only. Its Delete action opens the same custom dialog pattern used elsewhere in the app.
- `FileActions.svelte` provides the custom confirmation modal for New.
- Tests use `fake-indexeddb`.

## Related

- Previous: F04 Undo/Redo (#13).
- Next: Feature 006 (free color picker, #14).
- Backlog: keyboard shortcuts (#10).
