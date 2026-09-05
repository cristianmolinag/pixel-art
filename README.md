# Pixel Art Studio

A simple, incremental pixel art editor, built together with my kids, just for fun.

> **What is this?** A mobile-first web pixel art editor built feature by feature to learn
> Svelte 5, Tailwind CSS v4 and frontend architecture.

## Quick onboarding (for people new to the project)

1. **What we want** → [`specs/project/objective.md`](specs/project/objective.md)
   (objective, simple-incremental scope, non-goals, principles).
2. **How it is designed** → [`specs/architecture/overview.md`](specs/architecture/overview.md).
3. **What each feature must do** → [`specs/features/`](specs/features/).
4. **What is being worked on / what is missing** → open GitHub issues
   (milestones: v1.0 MVP, v1.1 Animation and Gallery, v2.0 Collaboration).

## Stack

- Svelte 5 (runes)
- Vite
- Tailwind CSS v4
- vite-plugin-pwa
- Vitest + jsdom (tests)
- Node 22 + pnpm 12 (mise)

## Development

```bash
mise install    # installs Node 22 and pnpm 12 per mise.toml
pnpm install
pnpm dev
pnpm check      # typecheck
pnpm test       # tests
pnpm build
```

## Deploy

It auto-deploys to GitHub Pages via GitHub Actions on push to `main`.