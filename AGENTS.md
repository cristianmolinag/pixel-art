# Project Rules

## Language
- All conversation, confirmations, decisions, commits, issues, PRs, code, comments, strings, tests, and specifications must use American English.
- Commit messages must use conventional commits.

## Git
- Always work on the `develop` branch. Never commit directly to `main`.
- Before committing, run `mise exec -- pnpm build` and verify that it succeeds.
- If tests are configured, run them before committing.
- Do not make design or implementation assumptions without asking the user first.

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
- Toolbar actions communicate through pending-action flags in the store (`pendingImageData`, `pendingClear`, `pendingExport`).
- Do not use `document.querySelector` to access the canvas. Use the pending-action pattern.
- The responsive toolbar uses fluid icon and gap sizes through `clamp()` (`.tam-icono`, `.toolbar-fila` in `src/app.css`). On mobile, zoom is contained in its own expander; grid and matrix controls remain visible.
- Use custom confirmation modals (the `Matrix.svelte` pattern). Do not use `window.confirm` or `alert`.

## Issues
- Development is simple and incremental, aligned with `specs/project/objective.md`:
  - F01 Canvas -> **#11** (implemented; spec: `specs/features/01-canvas.md`)
  - F02 Colors and painting -> **#12**
  - F03 Drawing tools -> **#5**
  - F04 Undo/Redo -> **#13**
  - F05 Gallery and persistence -> **#6**
  - F07 Menu layout -> **#15** (implemented and closed)
  - Cross-cutting backlog: **#1** PWA icons, **#8** mobile/UX improvements, **#10** keyboard shortcuts
  - v1.0 MVP item: **#19** grid guide overlay
- Review open issues before implementing new work.
