# Feature 014: Scaled Sharp PNG Export

**Status:** Implemented
**Spec written:** 2026-09-08
**Tests:** `tests/unit/services/export.test.js`, `tests/unit/components/FileActions.test.js`
**Objective:** `specs/project/objective.md`
**Related issue:** [#44](https://github.com/cristianmolinag/pixel-art/issues/44)
**Depends on:** F05 Gallery and Persistence (#6, implemented)

## User Story Summary

> As a **pixel artist**, I want to export my drawing as a crisp PNG at a larger size so it looks sharp when shared on WhatsApp or social media.

## Prioritized User Stories

### User Story 1: Choose an export scale (Priority: P1)

The Export action opens a dedicated modal with scale options 1x, 2x, 4x, and 8x. The default scale is 4x.

### User Story 2: Export with nearest-neighbor scaling (Priority: P1)

When a scale greater than 1x is selected, the exported PNG is generated on an offscreen canvas with `imageSmoothingEnabled = false` so pixels remain sharp and are not anti-aliased.

### User Story 3: Exported dimensions match scale (Priority: P1)

A drawing with canvas dimensions 16×16 exported at 4x produces a PNG with dimensions 64×64.

### User Story 4: Preserve transparency (Priority: P1)

Transparent pixels in the drawing remain transparent in the exported PNG.

### User Story 5: Download or share on mobile (Priority: P1)

The exported PNG can be downloaded on desktop through an anchor download. On mobile, the Web Share API is used when available so the file can be shared; otherwise it falls back to the same anchor download pattern.

## Functional Requirements

- **FR-001:** Export MUST open a dedicated modal for choosing the export scale.
- **FR-002:** The modal MUST offer the scale values 1x, 2x, 4x, and 8x.
- **FR-003:** The default scale MUST be 4x.
- **FR-004:** The export service MUST use an offscreen canvas and set `imageSmoothingEnabled = false`.
- **FR-005:** The exported PNG dimensions MUST equal `cols * scale × rows * scale`.
- **FR-006:** Transparent pixels MUST remain transparent in the exported PNG.
- **FR-007:** Export MUST trigger a file download or Web Share action.
- **FR-008:** The UI MUST work on mobile with the existing responsive toolbar pattern.

## Success Criteria

- **SC-001:** The Export button is visible in the file actions bar.
- **SC-002:** Opening Export shows a modal with scale options defaulting to 4x.
- **SC-003:** Exporting at 1x produces a PNG matching the original canvas size.
- **SC-004:** Exporting at 4x from a 16×16 canvas produces a 64×64 PNG.
- **SC-005:** The exported PNG preserves transparency.
- **SC-006:** Mobile export falls back to anchor download when Web Share is unavailable.

## Assumptions

- The drawing model (`Canvas`) already renders pixels into an `OffscreenCanvas`.
- Animated or multi-frame export is out of scope.
- JSON import/export remains out of scope.

## Decisions

- `exportPng(model, scale)` lives in `src/lib/services/export.js` and returns a `Promise<Blob>`.
- The output canvas is created with `document.createElement("canvas")` and drawn using `drawImage(model.offscreen, 0, 0, width, height)` after disabling image smoothing.
- `ExportModal.svelte` follows the modal pattern used by `SaveModal.svelte` and `Matrix.svelte`.
- `FileActions.svelte` owns the Export button and modal visibility.
- `downloadBlob()` prefers the Web Share API for mobile and falls back to a temporary anchor element for desktop download.

## Related

- Previous: F13 Issue-driven agent workflow (#26).
- Backlog: #1 PWA icons, #8 mobile/UX improvements, #10 keyboard shortcuts.
