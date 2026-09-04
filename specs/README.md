# Specs de Pixel Art Studio

Este directorio es la **fuente de verdad** de requisitos y arquitectura del proyecto,
siguiendo **Spec-Anchored Development**.

## Qué es Spec-Anchored en este proyecto

La spec se escribe *antes* del código y actúa como un **ancla**: orienta el desarrollo
y sirve para **verificar** que el código no se desvía del *qué*. El código y la spec
evolucionan en paralelo; cuando cambia el diseño, se actualiza la spec primero.

### Conceptos que usamos (para aprenderlos en la práctica)

- **¿Qué vs. cómo**: cada spec define el *qué* (sin tecnología); las decisiones
  técnicas van en una sección "Decisiones" separada.
- **User stories priorizadas**: cada feature se divide en slices independientes
  (P1, P2, ...) que entregan valor por sí solos y pueden probarse aislados.
- **Given/When/Then**: los criterios de aceptación se escriben como escenarios de
  comportamiento verificables.
- **No adivinar**: lo ambiguo se marca `[NEEDS CLARIFICATION]`, no se asume.

> Nota: *Spec-Anchored* (spec como ancla/guía) es el enfoque que usamos para aprender.
> *Spec-first* (spec que genera el código, típico de GitHub Spec Kit) se puede evaluar
> más adelante, no es el proceso actual.

## Flujo de trabajo

Para cada feature:

1. **Spec** — Escribir `features/NN-nombre.md`: user stories priorizadas, escenarios
   Given/When/Then, requisitos, success criteria, assumptions.
2. **Código** — Implementar la feature contra la spec, anclando el código al *qué*.
3. **Tests** — Verificar los escenarios Given/When/Then.
4. **Verificación** — `pnpm check`, `pnpm test`, `pnpm build`.
5. **Marcar la spec** — Tildar criterios cumplidos y actualizar estado/issue.

## Cómo leer este directorio

```
specs/
├── README.md          # Este archivo
├── _template.md       # Plantilla a copiar para cada feature
├── project/           # Objetivo y principios del proyecto (ancla global)
│   └── objective.md   # Qué queremos y qué no (puerta de entrada)
├── architecture/      # Documentos de arquitectura y patrones
└── features/          # Una spec por feature (NN-nombre.md)
```

## Relación con los issues de GitHub

- Este directorio responde **qué** se quiere y **cómo** está pensado (estable).
- Los **issues** de GitHub responden **en qué se trabaja** y **qué falta** (vivo).
- Cada feature de `features/` se asocia a un issue (o grupo); se referencian en ambos.

Empieza por `project/objective.md` para entender el proyecto completo.
