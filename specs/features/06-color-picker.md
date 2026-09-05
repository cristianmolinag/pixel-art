# Feature 006: Free Color Picker and Recent Colors

**Status:** Implemented
**Spec written:** 2026-09-04
**Tests:** color-service tests, `tests/unit/stores/editor.test.js`, `tests/unit/components/Palette.test.js`
**Objective:** `specs/project/objective.md`
**Related issue:** [#14](https://github.com/cristianmolinag/pixel-art/issues/14)
**Depends on:** F02 Colors (#12, implemented)

## User Story Summary

> As a **user**, I want to choose any color comfortably and keep recent colors available so I can paint without friction.

## Problem

The original F02 native color input and gradient wrapper behaved inconsistently across desktop and mobile. The feature provides an in-app picker with a clear hex field.

## User Stories

### User Story 1: Choose a free color (Priority: P1)

The picker MUST open beside the palette, allow hue and saturation/value selection, and accept valid `#rrggbb` or `#rgb` input. Invalid input leaves the selected color unchanged and restores the current hex value.

### User Story 2: Use recent colors (Priority: P1)

Painting records recent colors newest first, without duplicates, up to six colors. Selecting a recent color does not reorder it; recent colors persist across reloads.

## Functional Requirements

- **FR-001:** The system MUST provide an in-app picker, not the native system dialog.
- **FR-002:** The picker MUST provide hue and saturation/value controls with live updates.
- **FR-003:** It MUST accept valid `#rrggbb` and `#rgb` values on Enter or blur.
- **FR-004:** Invalid hex MUST not change the selected color.
- **FR-005:** A color becomes recent only when used to paint with brush, line, or fill.
- **FR-006:** Recent colors MUST be newest first, unique, and limited to six.
- **FR-007:** Selecting a recent color MUST not reorder the row.
- **FR-008:** Recent colors MUST persist in localStorage.
- **FR-009:** Current color and recent colors MUST live in `editor.svelte.js`.

## Success Criteria

- **SC-001:** A user can choose a free color without a broken gradient control.
- **SC-002:** A user can type hex and use it for painting.
- **SC-003:** A user can switch to a recent color with one touch.
- **SC-004:** Recents survive reloads.

## Assumptions and Decisions

- The color service uses English exports: `normalizeHex`, `loadRecentColors`, `saveRecentColors`, `hexToRgb`, `hexToHsv`, and `hsvToHex`.
- The custom picker uses a saturation/value canvas, hue slider, and hex field; it does not use `conic-gradient`, `appearance-none`, or the native color input.
- `editor.svelte.js` exposes `currentColor`, `recentColors`, `selectColor`, and `trackColorUsage`.
- `Palette.svelte` shows the fixed palette and a recent row of up to six swatches.

## Related

- Previous: F05 Gallery (#6).
- F02 Colors (#12).
- UX backlog: #8.
