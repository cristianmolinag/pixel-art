# Feature 019: Tracing Reference Image Overlay

**Status:** Implemented (pending review / no-commit)
**Spec written:** 2026-09-09
**Tests:** `tests/unit/stores/editor.test.js`, `tests/unit/components/PixelCanvas.test.js`, `tests/unit/components/Toolbar.test.js`, `tests/unit/components/ReferencePill.test.js`, `tests/unit/services/referenceImage.test.js`
**Objective:** `specs/project/objective.md`
**Related issue:** [#43](https://github.com/cristianmolinag/pixel-art/issues/43)
**Depends on:** F08 Grid toggle (#16, implemented), F18 Thumb-zone toolbar layout (#48, implemented), F16 toasts (#51/#49, implemented)

## User Story Summary

> As a **pixel artist**, I want to load a reference image behind the canvas with adjustable opacity so I can trace it pixel by pixel.

## Prioritized User Stories

### User Story 1: Load a reference image (Priority: P1)

From the controls, the user MUST be able to pick an image file from their device. The decoded image becomes the reference layer of the current session.

### User Story 2: Draw the reference behind grid and pixels (Priority: P1)

When the reference layer is visible and an image is loaded, PixelCanvas MUST render the reference between the cleared background and the pixel data, so the drawing order is: reference → pixels → grid → line/shape previews.

### User Story 3: Adjust opacity in real time (Priority: P1)

The reference controls MUST offer an opacity slider. Changing it MUST update the rendered transparency of the reference immediately.

### User Story 4: Export without the reference (Priority: P1)

The PNG export MUST NOT include the reference image. Export keeps rendering only `model.offscreen`, which the reference layer never touches.

### User Story 5: Toggle visibility while remembering the image (Priority: P1)

A controls toggle MUST hide/show the reference layer. Hiding MUST keep the image in memory; only an explicit remove action MUST clear it.

### User Story 6: Session-only storage (Priority: P2)

The reference image MUST live in memory only. It MUST NOT be persisted to localStorage, IndexedDB, or the gallery.

## Functional Requirements

- **FR-001:** The controls toolbar MUST provide a Reference toggle button that shows/hides the reference layer (`aria-pressed` marks the state).
- **FR-002:** While the reference layer is enabled, a floating contextual pill MUST show the reference controls: an opacity slider (0–100%), a load/replace file button, and a remove button.
- **FR-003:** Selecting a file MUST decode it (`createImageBitmap` with an `HTMLImageElement` fallback) and set it as the session reference image.
- **FR-004:** The reference MUST be drawn stretched to the full canvas content rect, before pixels and grid, with `globalAlpha` set to the current opacity.
- **FR-005:** The opacity slider MUST map 0–100% to alpha 0.0–1.0 and redraw the canvas on every input event.
- **FR-006:** Toggling the layer off MUST hide the reference without discarding the image.
- **FR-007:** The remove action MUST discard the image (the pill stays enabled so a new image can be loaded immediately).
- **FR-008:** The reference image MUST never be drawn into `model.offscreen`; export MUST stay pixel-data-only.
- **FR-009:** Reference state MUST live in `editor.svelte.js`: `referenceVisible`, `referenceOpacity`, `referenceVersion` (redraw trigger), and a plain (non-reactive) `_referenceImage` field with `hasReferenceImage`.
- **FR-010:** If image decoding fails, the app MUST show a toast and keep the previous state.

## Success Criteria

- **SC-001:** A user can load a reference image from their device.
- **SC-002:** The reference renders behind the grid and the painted pixels.
- **SC-003:** The opacity slider changes the reference transparency in real time.
- **SC-004:** The exported PNG contains only pixel data (no reference).
- **SC-005:** Hiding and re-showing the layer keeps the same image; only Remove discards it.
- **SC-006:** No reference data is written to persistent storage.
- **SC-007:** The user-story scenarios are covered by tests.

## Scope / Non-goals

- Transforming the reference (pan/scale/rotate) is out of scope.
- Painting on the reference or treating it as a paintable layer is out of scope.
- Persisting the reference image across sessions is out of scope.
- Multiple reference images are out of scope (one replaces the previous one).

## Assumptions

- The reference is stretched (not letterboxed) to fill the square canvas content area; for tracing, aligning the reference to the whole canvas is more useful than preserving aspect ratio.
- Default opacity is 50%.
- One reference image per session; loading another file replaces it.
- The reference does not affect undo/redo, toasts, or gallery data.

## Decisions

- Store API (all in `editor.svelte.js`):
  - `referenceVisible = $state(false)`, `referenceOpacity = $state(0.5)`, `referenceVersion = $state(0)`.
  - `_referenceImage` is a plain class field (ImageBitmap/HTMLImageElement are not serializable state; runes would not proxy them usefully). `referenceVersion` bumps on every image change so the canvas draw effect re-runs.
  - `setReferenceImage(image)` sets the image, bumps `referenceVersion`, and enables `referenceVisible`; `toggleReference()` flips visibility; `setReferenceOpacity(value)` clamps to 0–1; `removeReferenceImage()` clears the image and bumps the version (the layer stays enabled so the pill remains available for a new load).
- `src/lib/services/referenceImage.js` owns decoding (`decodeImageFile`): `createImageBitmap(file)` when available, `HTMLImageElement` + object URL otherwise. The store stays DOM-light and sync.
- `PixelCanvas.svelte` draws the reference in `draw()` right after `clearRect` and before the pixel loop, stretched to `(aX(0), aY(0)) → (aX(cols), aY(rows))`; `draw()` reads `referenceVersion`/`referenceVisible`/`referenceOpacity`, so the existing `$effect` redraw covers every state change.
- `Toolbar.svelte` adds the Reference toggle to the controls group (lucide `Image` icon), keeping the view-layer toggle pattern of the grid button.
- `ReferencePill.svelte` (new) reuses the floating-pill pattern; its CSS class `.reference-pill` mirrors `.shape-pill` but sits top-center in portrait/desktop and right-center in landscape so the two pills never overlap.
- The toolbar button keeps the controls row within one line on a 375px viewport (8 compact items ≈ 291px), verified manually.
- Export is safe by architecture (`exportPng` draws only `model.offscreen`); no export changes required.
