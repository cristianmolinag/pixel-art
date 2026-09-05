# Pixel Art Studio Specifications

This directory is the **source of truth** for project requirements and architecture,
following **Spec-Anchored Development**.

## Spec-Anchored Development

A spec is written *before* the code and acts as an anchor: it guides development and
verifies that the code does not drift from the intended behavior. Code and specs evolve
in parallel; when the design changes, update the spec first.

### Concepts used in this project

- **What vs. how**: each spec defines what the feature does without prescribing technology; technical decisions belong in a separate Decisions section.
- **Prioritized user stories**: each feature is split into independent slices (P1, P2, ...) that deliver value and can be tested in isolation.
- **Given/When/Then**: acceptance criteria are written as verifiable behavior scenarios.
- **No guessing**: mark ambiguous items as `[NEEDS CLARIFICATION]` instead of assuming.

## Workflow

For each feature:

1. **Spec** - Write `features/NN-name.md` with prioritized user stories, Given/When/Then scenarios, requirements, success criteria, and assumptions.
2. **Code** - Implement the feature against the spec.
3. **Tests** - Verify the Given/When/Then scenarios.
4. **Verification** - Run `mise exec -- pnpm check`, `mise exec -- pnpm test`, and `mise exec -- pnpm build`.
5. **Mark the spec** - Check completed criteria and update the status and issue.

## Directory map

```text
specs/
├── README.md
├── _template.md
├── project/           # Project objective and principles
│   └── objective.md
├── architecture/      # Architecture and patterns
└── features/          # One spec per feature (NN-name.md)
```

## GitHub issues

- Specs describe what is wanted and how the project is structured.
- GitHub issues describe current work and remaining work.
- Each feature spec is associated with an issue or issue group.

Start with `project/objective.md` to understand the project.
