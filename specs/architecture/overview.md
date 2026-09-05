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

**Rule:** do not use `document.querySelector` to access the canvas. Toolbar and other
components communicate with the canvas through pending-action flags in the store
(`pendingImageData`, `pendingClear`, `pendingExport`, `pendingComposite`). The canvas
component observes those flags with `$effect` and performs the action.

This keeps the architecture unidirectional: there is no direct DOM access, only declared flows.

## Responsive interaction

- The toolbar uses fluid icon and gap sizes through `clamp()`.
- On mobile, zoom is in a dedicated expander while grid and matrix controls remain visible.
- At zoom levels above 100%, a brief auto-hiding hint explains touch and desktop pan/zoom controls.
- Painting coordinates invert the zoom and pan transform so input maps to the correct model cell.

## Tests

- `tests/unit/` - store, model, service, and component tests.
- `tests/setup.js` - `OffscreenCanvas` mock for jsdom.

## Tooling

- Mise manages Node 22 and pnpm 12.
- Commands: `mise exec -- pnpm dev`, `mise exec -- pnpm build`, `mise exec -- pnpm check`, `mise exec -- pnpm test`.
