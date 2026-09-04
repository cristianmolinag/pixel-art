# Reglas del proyecto

## Git
- Siempre trabajar en la rama `develop` (nunca hacer commits directos a `main`)
- Antes de hacer commit, siempre correr `npm run build` y verificar que no tenga errores
- Si hay tests configurados, correrlos antes del commit
- No asumir nada — siempre preguntar al usuario antes de tomar decisiones de diseño o implementación
- Hacer commit con mensajes descriptivos en inglés siguiendo conventional commits

## Stack
- Svelte 5 (runes: $state, $derived, $effect)
- Vite 6
- Tailwind CSS v4
- vite-plugin-pwa
- Node >= 22 (usar `mise exec --` antes de cualquier comando)

## Desarrollo
```bash
mise exec -- pnpm install   # si no hay node_modules
mise exec -- pnpm dev       # para desarrollo
mise exec -- pnpm build     # verificar antes de commit
mise exec -- pnpm test      # correr tests
mise exec -- pnpm check     # typecheck (svelte-check)
```

## Arquitectura
- Estado central en `src/lib/stores/editor.svelte.js` (runes)
- Canvas logic: cada celda = 1 píxel real, display escala con CSS
- Acciones del toolbar se comunican via flags en el store (`pendingImageData`, `pendingClear`, `pendingExport`)
- No usar `document.querySelector` para acceder al canvas — usar el patrón de acciones pendientes

## Issues
- El plan de desarrollo es **simple e incremental**, alineado a `specs/project/objective.md`:
  - F01 Canvas → **#11** (implementada; spec en `specs/features/01-canvas.md`)
  - F02 Colores y pintar píxeles → **#12**
  - F03 Herramientas de dibujo (borrador, línea, relleno) → **#5**
  - F04 Undo/Redo (deshacer/rehacer) → **#13**
  - F05 Galería y persistencia (IndexedDB) → **#6**
  - Backlog cross-cutting (sin milestone): **#1** Iconos PWA, **#8** Mejoras mobile/UX, **#10** Atajos de teclado
- Cualquier sesión debe consultar los issues abiertos antes de implementar algo nuevo
