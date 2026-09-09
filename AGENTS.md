# Project Rules

## Language
- Project artifacts (commits, issues, PRs, code, comments, strings, tests, and specifications) must use American English.
- Agent-user conversations for this project take place in Spanish.
- Commit messages must use conventional commits.

## Git
- `develop` is the integration branch. Every issue/feature must be developed in its own Git worktree and dedicated branch.
- Never push directly to `develop` or `main`; all changes to protected branches must be merged through a pull request.
- Every code change must belong to a defined feature and have a corresponding GitHub issue.
- Every feature implementation must update the relevant context files, including `AGENTS.md` and the applicable files under `specs/`.
- Every issue/feature must use a dedicated Orca-managed worktree and branch.
- Plan mode is mandatory before implementation, spec edits, sub-issue creation, or code changes.
- All feature changes must be delivered through a pull request targeting `develop`.
- Never commit changes before completing local verification. First run `mise exec -- pnpm test`, `mise exec -- pnpm check`, and `mise exec -- pnpm build` in the worktree and verify that all pass. Then run the dev server and have a human manually check the affected UI flows. Finally run `git diff --check`. Only commit after all checks pass, including the human manual check.
- Before committing, run `mise exec -- pnpm build` and verify that it succeeds.
- If tests are configured, run them before committing.
- Do not make design or implementation assumptions without asking the user first.

## Deployment
- GitHub Pages deploys from `develop` through `.github/workflows/deploy.yml`.
- The `develop` and `main` branches must reject direct changes and require pull requests.

## Stack
- Svelte 5 (runes: `$state`, `$derived`, `$effect`)
- Vite 6
- Tailwind CSS v4
- vite-plugin-pwa
- Node >= 22; prefix commands with `mise exec --`

## Development
```bash
mise exec -- pnpm install   # if node_modules is missing
mise exec -- pnpm dev
mise exec -- pnpm build
mise exec -- pnpm test
mise exec -- pnpm check
```

## Architecture
- Central editor state lives in `src/lib/stores/editor.svelte.js` and uses runes.
- The canvas is redrawn at device resolution (DPR). Each cell is one model pixel; zoom and pan are applied during drawing with device-pixel integer rounding, without CSS transforms.
- Desktop canvas zoom supports `Ctrl + wheel` and reuses the store's button actions (`zoomIn`/`zoomOut`) so `ZOOM_STEP`, `MIN_ZOOM`, and `MAX_ZOOM` remain consistent. The zoom is centered on the cursor position.
- Toolbar actions communicate through pending-action flags in the store (`pendingImageData`, `pendingClear`, `pendingExport`).
- Do not use `document.querySelector` to access the canvas. Use the pending-action pattern.
- The responsive toolbar uses fluid icon and gap sizes through `clamp()` (`.toolbar-icon`, `.toolbar-row` in `src/app.css`). The editor layout is a CSS Grid with orientation-based areas: portrait mobile places the controls row below the header and the tools row in the thumb zone above the palette, landscape mobile splits tools (left) and controls (right) sidebars that reach the bottom of the screen with the palette centered under the canvas, and desktop keeps the single left sidebar with a thin-line section divider between tools and controls. The Outline/Fill shape pill floats inside the canvas viewport: bottom-centered in portrait and desktop, left-centered vertically in landscape mobile. On mobile, zoom is contained in its own expander; grid and matrix controls remain visible.
- The palette footer accounts for iOS home-indicator safe area through `env(safe-area-inset-bottom)`.
- Use custom confirmation modals (the `Matrix.svelte` pattern). Do not use `window.confirm` or `alert`.

## Issues
- Development is simple and incremental, aligned with `specs/project/objective.md`:
  - F01 Canvas -> **#11** (implemented; spec: `specs/features/01-canvas.md`)
  - F02 Colors and painting -> **#12**
  - F03 Drawing tools -> **#5** (eyedropper extension: **#40**)
  - F04 Undo/Redo -> **#13**
  - F05 Gallery and persistence -> **#6** (extended by **#28** update/save-as-new)
  - F07 Menu layout -> **#15** (implemented and closed)
  - Cross-cutting backlog: **#1** PWA icons, **#8** mobile/UX improvements, **#10** keyboard shortcuts
  - v1.0 MVP item: **#19** grid guide overlay
  - F12 UX and release workflow polish -> **#24** (implemented; spec: `specs/features/12-ux-and-release-workflow.md`)
  - F13 Issue-driven agent workflow -> **#26** (implemented; spec: `specs/features/13-issue-driven-agent-workflow.md`)
  - F14 Scaled PNG export -> **#44** (spec: `specs/features/14-export.md`)
  - F15 Mirror symmetry -> **#41** (spec: `specs/features/15-mirror-symmetry.md`)
  - F16 Mobile UX: toasts and gesture prevention -> **#51/#49** (spec: `specs/features/16-mobile-ux-toasts-gestures.md`)
  - F17 Shape tools (rectangle and circle with outline and fill) -> **#42** (spec: `specs/features/17-shape-tools.md`)
  - F18 Thumb-zone toolbar layout -> **#48** (spec: `specs/features/18-thumb-zone-toolbar.md`)
- Review open issues before implementing new work.
