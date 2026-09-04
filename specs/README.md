# Specs de Pixel Art Studio

Este directorio es la **fuente de verdad** de los requisitos del proyecto, siguiendo
**Spec-Driven Development (SDD)**.

## Qué es SDD en este proyecto

Cada feature se describe en un documento de especificación *antes* de escribir código.
La spec responde **qué** debe hacer la feature y **cómo validar que funciona**, en
lenguaje humano. El código y los tests se construyen después, contra esa spec.

## Flujo de trabajo (Spec → Código → Tests)

Para cada feature:

1. **Spec** — Escribir `features/NN-nombre.md` definiendo historia de usuario y
   criterios de aceptación.
2. **Código** — Implementar la feature hasta cumplir todos los criterios.
3. **Tests** — Escribir tests que verifiquen los criterios de aceptación
   (como refuerzo/verificación, no TDD estricto).
4. **Verificación** — `pnpm check`, `pnpm test`, `pnpm build`.
5. **Marcar la spec** — Tildar los criterios cumplidos y actualizar el estado.

## Cómo leer una spec

Cada spec tiene:

- **Estado**: 📋 Planeada · 🚧 En progreso · ✅ Implementada
- **Historia de usuario**: el *para qué* desde la perspectiva del usuario.
- **Criterios de aceptación**: lista verificable de "el usuario puede...".
- **Decisiones técnicas**: qué elegimos y por qué (lecciones de aprendizaje).
- **Tests**: qué archivos de test cubren la feature.

## Estructura

```
specs/
├── README.md          # Este archivo
├── _template.md       # Plantilla a copiar para cada feature
├── architecture/      # Documentos de arquitectura y patrones
└── features/          # Una spec por feature (NN-nombre.md)
```

## Juntar con el roadmap

Las features se implementan una a la vez, en orden de complejidad creciente para
aprender Svelte 5 y Tailwind CSS v4. El roadmap vive en `features/` ordenado por número.
