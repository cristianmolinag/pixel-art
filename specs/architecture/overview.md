# Arquitectura de Pixel Art Studio

## Stack

- **Svelte 5** (runes: `$state`, `$derived`, `$effect`)
- **Vite 6**
- **Tailwind CSS v4** (config vía `@theme` en CSS, sin `tailwind.config.js`)
- **vite-plugin-pwa**
- **Vitest** + **jsdom** (tests)
- **Node 22** + **pnpm 12** gestionados por **mise**

## Organización de `src/`

```
src/
├── main.js                     # Montaje de la app (mount de Svelte 5)
├── App.svelte                  # Raíz / layout
├── app.css                     # Tailwind v4 + tokens @theme
└── lib/
    ├── stores/                 # Estado central con runes
    ├── models/                 # Clases de dominio puras
    └── components/             # Componentes de UI
```

## Estado central

- El estado vive en stores con runes (ej. `editor.svelte.js`) que exportan una
  instancia singleton (`export const editor = new EditorState()`).
- Los componentes leen `$state` / `$derived` y mutan a través de métodos del store.
- El estado es la **única fuente de verdad**; los componentes son una proyección de él.

## Canvas y comunicación (patrón de acciones pendientes)

Cada celda del canvas = 1 píxel real; el display se escala con CSS.

**Regla de oro:** no usar `document.querySelector` para acceder al canvas. En su
lugar, el toolbar y otros componentes se comunican con el canvas mediante **flags
de acciones pendientes** en el store (`pendingImageData`, `pendingClear`,
`pendingExport`, `pendingComposite`). El componente del canvas observa esos flags
con `$effect` y ejecuta la acción.

Este patrón mantiene la arquitectura uni-direccional: no hay acceso directo al DOM,
solo flujos declarados.

## Tests

- `tests/unit/` — tests de stores y models (lógica pura).
- `tests/integration/` — flujos que combinan varias piezas.
- `tests/setup.js` — mock de `OffscreenCanvas` (no existe en jsdom).

## Herramientas

- Mise gestiona Node 22 y pnpm 12 (ver `mise.toml`).
- Comandos: `pnpm dev`, `pnpm build`, `pnpm check`, `pnpm test`.
