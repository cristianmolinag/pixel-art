# Pixel Art Studio Objective

This document is the **project anchor**: it explains what we want and what we do not.
It is the entry point for anyone new to the project. GitHub issues and feature specs
are referenced from here.

## What it is

Pixel Art Studio is a **web pixel art editor**, created for fun and to learn Svelte 5,
Tailwind CSS v4, and modern frontend architecture. The goal is not only to build an app,
but to learn the stack while developing a real product, one feature at a time.

## Who it is for

- **Primary audience**: the author's children and family, just for fun.
- **End users**: anyone who wants to draw pixel art in a browser, especially on mobile.

## Scope (simple and incremental)

We are not starting with a complete editor. We build **one feature at a time**, increasing
in complexity and verifying each feature before moving on:

1. **Canvas** - view a gridded pixel canvas -> **#11**.
2. **Colors** - choose colors and paint pixels -> **#12**.
3. **Tools** - eraser, line, fill, and more -> **#5**.
4. **Undo/redo** - undo and redo actions -> **#13**.
5. **Gallery** - save and list drawings -> **#6**.
6. **Color picker** - a free-form color picker and recent colors -> **#14**.
7. **Menu layout** - group icons without line wrapping -> **#15**.
8. **Grid toggle** - show or hide the canvas grid -> **#16**.
9. **Canvas matrix** - change dimensions through presets or custom values -> **#17**.
10. **Zoom** - zoom the canvas view in and out -> **#18**.
11. **Grid guide** - a reference overlay decoupled from canvas data -> **#19**.

Each feature maps to a GitHub issue and a spec in `specs/features/`.

## Non-goals

The following remain outside the initial scope:

- Multiple layers.
- Animation, timelines, animated GIFs, or spritesheets.
- Real-time collaboration.

## Principles

- **Mobile-first**: the canvas is a responsive square (`aspect-ratio: 1/1`) with pixelated rendering and touch protections.
- **One cell equals one real pixel** in the HTML canvas; the display is scaled during drawing.
- **English-first project language**: UI, code, tests, specs, and project communication use American English.
- **Simplicity**: add each feature only after the previous feature is verified.
- **Central Svelte 5 rune state** with a unidirectional architecture (see `specs/architecture/overview.md`).
- **No guessing**: mark ambiguity instead of assuming.

## Development method

We use **Spec-Anchored Development**: a spec guides and verifies the code; it is not a
code generator. We write the what (spec) before the how (code), and evolve both in
parallel while checking that implementation does not drift.

The `specs/` directory is the source of truth for requirements and architecture.
GitHub issues are the live work tracker.

## Where to find work

- **What we want / how it is structured** -> this document, `specs/architecture/`, and `specs/features/`.
- **What is being worked on / what remains** -> open GitHub issues.
- Each feature spec is associated with an issue and records its implementation status.

## Project status

- **Active branch**: `feat/sdd-rewrite` until the pending squash merge into `develop`.
- **Recent implementation**: responsive menu, mobile zoom expander, fluid toolbar sizing, grid guide overlay, zoom/pan-aware painting, auto-hiding pan/zoom hint, custom confirmation modals, and gallery list-only scrolling.
- **Remaining backlog**: #1 PWA icons, #8 mobile/UX improvements, and #10 keyboard shortcuts.
