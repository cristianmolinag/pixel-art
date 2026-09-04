# Pixel Art Studio

Editor de pixel art simple e incremental, creado en compañía de mis hijos, solo por diversión.

> **¿Qué es esto?** Un editor de pixel art web (mobile-first) que se construye feature
> por feature para aprender Svelte 5, Tailwind CSS v4 y arquitectura de frontend.

## Onboarding rápido (para personas ajenas al proyecto)

1. **Qué queremos** → [`specs/project/objective.md`](specs/project/objective.md)
   (objetivo, alcance simple-incremental, no-objetivos, principios).
2. **Cómo está pensado** → [`specs/architecture/overview.md`](specs/architecture/overview.md).
3. **Qué debe hacer cada feature** → [`specs/features/`](specs/features/).
4. **En qué se trabaja / qué falta** → issues abiertos de GitHub
   (milestones: v1.0 MVP, v1.1 Animación y Galería, v2.0 Colaboración).

## Stack

- Svelte 5 (runes)
- Vite
- Tailwind CSS v4
- vite-plugin-pwa
- Vitest + jsdom (tests)
- Node 22 + pnpm 12 (mise)

## Desarrollo

```bash
mise install    # instala Node 22 y pnpm 12 según mise.toml
pnpm install
pnpm dev
pnpm check      # typecheck
pnpm test       # tests
pnpm build
```

## Deploy

Se despliega automaticamente a GitHub Pages via GitHub Actions al hacer push a `main`.
