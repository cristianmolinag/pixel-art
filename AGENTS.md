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
- Node >= 22 (usar `nvm use` antes de cualquier comando)

## Desarrollo
```bash
nvm use          # siempre primero
npm install      # si no hay node_modules
npm run dev      # para desarrollo
npm run build    # verificar antes de commit
```

## Arquitectura
- Estado central en `src/lib/stores/editor.svelte.js` (runes)
- Canvas logic: cada celda = 1 píxel real, display escala con CSS
- Acciones del toolbar se comunican via flags en el store (`pendingImageData`, `pendingClear`, `pendingExport`)
- No usar `document.querySelector` para acceder al canvas — usar el patrón de acciones pendientes

## Issues
- El plan de desarrollo está en los milestones de GitHub:
  - v1.0 MVP: issues #1-3, #5, #8, #10
  - v1.1 Animación y Galería: issues #4, #6, #9
  - v2.0 Colaboración: issue #7
- Cualquier sesión debe consultar los issues abiertos antes de implementar algo nuevo
