# Pixel Art Studio Architecture

## Stack

- **Svelte 5** (runes: `$state`, `$derived`, `$effect`)
- **Vite 6**
- **Tailwind CSS v4** (theme tokens through `@theme` in CSS)
- **vite-plugin-pwa**
- **Vitest** + **jsdom** (tests)
- **Node 22** + **pnpm 12**, managed by **mise**

## `src/` organization

```text
src/
├── main.js                     # Svelte 5 application entry point
├── App.svelte                  # Root layout
├── app.css                     # Tailwind v4 and @theme tokens
└── lib/
    ├── stores/                 # Central state with runes
    ├── models/                 # Pure domain models
    └── components/             # UI components
```

## Central state

- State lives in rune-based stores such as `editor.svelte.js`, which export singleton instances.
- Components read `$state` and `$derived` values and mutate state through store methods.
- The store is the single source of truth; components are projections of it.

## Canvas and pending actions

Each canvas cell represents one real pixel. The display is rendered at device resolution,
with zoom and pan applied during drawing and rounded to device-pixel integers.

**Rule:** do not use `document.querySelector` to access the canvas or to trigger
component behavior. Cross-component actions go through pending-action flags in the
editor store (currently `pendingSave`/`pendingExport`); the owning component observes
the flags with `$effect`, performs the action, and clears the flag. `FileActions.svelte`
consumes them this way to open the save/export modals for the `Ctrl+S`/`Ctrl+E`
keyboard shortcuts.

This keeps the architecture unidirectional: there is no direct DOM access, only declared flows.

## Keyboard shortcuts (desktop)

- Key mapping logic lives in `src/lib/utils/shortcuts.js` (`handleKeydown`, `handleKeyup`,
  `isEditableTarget`) as pure functions that map events to semantic actions.
- `App.svelte` owns the single `svelte:window` keydown/keyup pair and maps each action to
  store methods, so every shortcut is registered exactly once. `Toolbar.svelte` keeps only
  its zoom-panel-specific window handlers (Escape, click-outside).
- Shortcuts: tools `B`/`E`/`L`/`R`/`C`/`F`/`I`, grid toggle `G`, zoom `+`/`-`/`0` reusing
  `zoomIn`/`zoomOut`/`resetZoom`, undo `Ctrl+Z`, redo `Ctrl+Shift+Z`/`Ctrl+Y`, save `Ctrl+S`,
  export `Ctrl+E`. Unclaimed Ctrl/Meta/Alt combinations are never intercepted.
- Shortcuts are ignored while the event target is an input, textarea, or contenteditable
  element, so typing stays native.
- Holding `Space` sets `editor.spaceHeld`; `PixelCanvas` pans on drag when `spaceHeld`
  (same branch as `Ctrl`/`Meta` drag), the canvas shows a grab cursor, and the keydown is
  prevented so the page does not scroll while the key is held. `window` blur clears the
  flag.

## Responsive interaction

- The toolbar uses fluid icon and gap sizes through `clamp()`.
- On mobile, zoom is in a dedicated expander while grid and matrix controls remain visible.
- At zoom levels above 100%, a brief auto-hiding hint explains touch and desktop pan/zoom controls.
- On desktop, `Ctrl + wheel` over the canvas reuses `editor.zoomIn()` and `editor.zoomOut()`; browser page zoom is prevented for that canvas interaction. The zoom is centered on the cursor position by adjusting the pan to keep the pixel under the cursor fixed.
- Painting coordinates invert the zoom and pan transform so input maps to the correct model cell.
- The viewport uses `viewport-fit=cover` so iOS safe-area environment variables resolve correctly. The root layout uses `100dvh` and `overflow: hidden` on `html`/`body` to prevent unwanted scroll. The palette footer uses `env(safe-area-inset-bottom)` so iOS home-indicator space does not cover the controls, and mobile swatches are sized to avoid accidental app-switch gestures.

## Tests

- `tests/unit/` - store, model, service, and component tests.
- `tests/setup.js` - `OffscreenCanvas` mock for jsdom.

## Tooling

- Mise manages Node 22 and pnpm 12.
- Commands: `mise exec -- pnpm dev`, `mise exec -- pnpm build`, `mise exec -- pnpm check`, `mise exec -- pnpm test`.
