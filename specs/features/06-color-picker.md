# Feature 006: Color picker

**Estado:** 📋 Pendiente (no planificada — se expande al implementar)
**Spec creada:** 2026-09-04
**Objetivo:** `specs/project/objective.md`
**Issue asociado:** [#14](https://github.com/cristianmolinag/pixel-art/issues/14)
**Depende de:** F02 Colores (#12, implementada)

> **Skeleton**: esta spec está en borrador. Se completa siguiendo Spec-Anchored Development
> cuando se empiece la implementación (el issue #14 es el estado vivo del trabajo).

## Historia de usuario (resumen)

> Como **usuario**, quiero **elegir un color libre de forma cómoda y tener a mano los últimos
> colores usados** para **pintar sin fricción**.

## Problema actual

El selector libre de F02 es un `input[type=color]` envuelto en un círculo con gradiente cónico
(`Palette.svelte`). Se ve mal y funciona de forma inconsistente entre navegadores (dialog nativo
en desktop, picker del sistema en mobile, `appearance-none` + `conic-gradient` se rompe).

## Alcance preliminar

- **Picker libre decente**: reemplazar el círculo por un selector de color claro y mobile-first
  (input de color clásico o equivalente) + campo de entrada hex.
- **Colores recientes**: persistir los últimos colores elegidos y mostrarlos como swatches de un
  toque.

## Preguntas abiertas (no asumir)

- ¿Dónde persisten los recientes: en memoria (session) o IndexedDB? (IndexedDB es tema de F05 → #6).
- ¿Cuántos recientes mostrar?

## Relacionado con

- F02 Colores (#12, implementada) — la paleta fija y el `colorActual` viven en el store `editor`.
- UX general: #8.