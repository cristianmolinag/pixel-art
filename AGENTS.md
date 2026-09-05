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
- Canvas logic: el canvas se redibuja a resolución de dispositivo (DPR); cada celda = 1 píxel del modelo y zoom/pan se aplican en el draw con redondeo a enteros de dispositivo (sin `transform` CSS)
- Acciones del toolbar se comunican via flags en el store (`pendingImageData`, `pendingClear`, `pendingExport`)
- No usar `document.querySelector` para acceder al canvas — usar el patrón de acciones pendientes
- Toolbar responsivo: tamaños de icono y gap **fluidos** via clamp (`.tam-icono`, `.toolbar-fila` en `src/app.css`); en mobile el **zoom** se pliega en su propio expander (sin elipsis) y cuadrícula/matriz quedan visibles
- Confirmaciones de usuario con **modales propios** (patrón `Matriz.svelte`): nada de `window.confirm`/`alert`

## Issues
- El plan de desarrollo es **simple e incremental**, alineado a `specs/project/objective.md`:
  - F01 Canvas → **#11** (implementada; spec en `specs/features/01-canvas.md`)
  - F02 Colores y pintar píxeles → **#12**
  - F03 Herramientas de dibujo (borrador, línea, relleno) → **#5**
  - F04 Undo/Redo (deshacer/rehacer) → **#13**
  - F05 Galería y persistencia (IndexedDB) → **#6**
  - F07 Layout del menú → **#15** (implementada y cerrada)
  - Backlog cross-cutting (sin milestone): **#1** Iconos PWA, **#8** Mejoras mobile/UX, **#10** Atajos de teclado
  - Pendiente en milestone **v1.0 MVP**: **#19** Ajustar la cuadrícula como capa-guía superpuesta
- Cualquier sesión debe consultar los issues abiertos antes de implementar algo nuevo
