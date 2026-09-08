# Feature 012: UX and Release Workflow Polish

**Status:** Implemented
**Spec written:** 2026-09-05
**Objective:** `specs/project/objective.md`
**Related issue:** [#24](https://github.com/cristianmolinag/pixel-art/issues/24)
**Follow-up issue:** [#38](https://github.com/cristianmolinag/pixel-art/issues/38)
**Related feature:** F10 Canvas Zoom (#18)

## User Story Summary

> As a user and maintainer, I want zoom to stay anchored to my pointer, the mobile footer to respect iOS safe areas, and releases to follow a protected integration workflow.

## User Stories

### User Story 1: Cursor-centered desktop zoom (Priority: P1)

When the pointer is inside the canvas, `Ctrl + wheel` MUST zoom around the pointer. The model point under the pointer MUST remain fixed after each zoom step, and zoom MUST reuse the existing button actions and limits.

### User Story 2: iOS footer safe area (Priority: P1)

The palette footer MUST include the iOS home-indicator safe area without reducing the minimum footer spacing on other platforms. The layout MUST NOT scroll vertically on iOS, and mobile palette swatches MUST be large enough to avoid accidental app-switch gestures.

### User Story 3: Protected release workflow (Priority: P1)

Each issue or feature MUST be developed in a dedicated Git worktree and branch. Changes to `develop` and `main` MUST be merged through pull requests. GitHub Pages MUST deploy from `develop`.

## Decisions

- Desktop wheel zoom calls `editor.zoomIn()` or `editor.zoomOut()` so `ZOOM_STEP`, `MIN_ZOOM`, and `MAX_ZOOM` remain shared with the toolbar.
- Cursor-centered zoom calculates the normalized model coordinates before zoom and adjusts `panX` and `panY` afterward, clamped to the current pan limits.
- The viewport meta tag includes `viewport-fit=cover` so `env(safe-area-inset-bottom)` resolves to the real iOS home-indicator inset.
- The root layout uses `h-full` to inherit `#app { height: 100dvh }` instead of `h-screen`, preventing a layout taller than the visible viewport on iOS Safari.
- `html` and `body` use `overflow: hidden` together with `overscroll-behavior: none` to prevent unwanted body scroll.
- The footer keeps `0.75rem` top padding and uses `max(0.75rem, env(safe-area-inset-bottom))` for its bottom padding.
- Mobile palette color swatches render at `2.5rem` (40px) with desktop fallback to `2rem` (32px), and the palette wrapper adds internal vertical breathing room.
- Feature work uses a dedicated worktree and branch, then merges through a pull request into `develop`.
- GitHub Pages deployment is triggered by pushes to `develop`.

## Verification

- `mise exec -- pnpm test`
- `mise exec -- pnpm check`
- `mise exec -- pnpm build`
- `git diff --check`
