# Feature 005: Gallery and Persistence

**Status:** Implemented
**Spec written:** 2026-09-04
**Tests:** `tests/unit/models/Drawing.test.js`, `tests/unit/services/gallery.test.js`, `tests/unit/stores/gallery.test.js`, `tests/unit/components/Gallery.test.js`, `tests/unit/components/Toolbar.test.js`
**Objective:** `specs/project/objective.md`
**Related issue:** [#6](https://github.com/cristianmolinag/pixel-art/issues/6), update/save-as-new tracked in [#28](https://github.com/cristianmolinag/pixel-art/issues/28)
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

### User Story 6: Update the currently loaded drawing (Priority: P2)

When a saved drawing is loaded and edited, the gallery offers an Update action that overwrites the same record. The name comes from the input, so renaming is allowed in the same action.

### User Story 7: Save the current drawing as a new entry (Priority: P2)

When a drawing is loaded, the gallery also offers a Save as new action that stores the current canvas as a new record without affecting the loaded one.

### User Story 8: Confirm before replacing unsaved work (Priority: P2)

Activating a gallery card while the editor has unsaved changes shows a custom confirmation modal. Confirming loads the selected drawing; canceling leaves the current canvas untouched.

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
- **FR-013:** The gallery store MUST track the currently loaded drawing identity (`currentDrawingId` and `currentDrawingName`).
- **FR-014:** Update MUST overwrite the record identified by `currentDrawingId` using the name in the input and MUST reset the dirty flag.
- **FR-015:** Save as new MUST create a new record, set it as the current drawing, and reset the dirty flag.
- **FR-016:** Activating a gallery card while `editor.dirty` is true MUST show a custom confirmation modal before replacing the canvas; confirming MUST load, canceling MUST leave the canvas unchanged.

## Success Criteria

- **SC-001:** A saved drawing appears with thumbnail, name, and date.
- **SC-002:** Saved drawings remain after reload.
- **SC-003:** Activating a card restores the drawing and closes the modal.
- **SC-004:** New, Delete, and Replace-on-load apply on confirmation and do nothing on cancellation.
- **SC-005:** The user-story scenarios are covered by tests.
- **SC-006:** Updating a loaded drawing changes its pixels and/or name without creating a duplicate.
- **SC-007:** Save as new creates a separate drawing and makes it the current one.

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
- The editor store tracks a `dirty` flag that is true when the canvas differs from the last saved, loaded, or new-drawing state.
- `FileActions.svelte` provides the custom confirmation modal for New.
- Tests use `fake-indexeddb`.

## Related

- Previous: F04 Undo/Redo (#13).
- Next: Feature 006 (free color picker, #14).
- Backlog: keyboard shortcuts (#10).
