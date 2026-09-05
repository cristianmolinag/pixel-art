# Feature 013: Issue-Driven Agent Workflow

**Status:** Implemented
**Spec written:** 2026-09-05
**Objective:** `specs/project/objective.md`
**Related issue:** [#26](https://github.com/cristianmolinag/pixel-art/issues/26)

## User Story Summary

> As a maintainer, I want to turn a GitHub issue into an approved plan, isolated Orca worktree, implementation tasks, and a pull request without manually coordinating the workflow.

## User Stories

### User Story 1: Mandatory planning (Priority: P1)

The workflow MUST read the issue and produce a read-only plan before modifying files, Git state, or GitHub state. Implementation MUST require explicit user approval.

### User Story 2: Spec and sub-issue planning (Priority: P1)

The workflow MUST create or update the feature spec linked to the issue and create approved implementation tasks as GitHub sub-issues.

### User Story 3: Orca-managed implementation (Priority: P1)

The workflow MUST create the implementation worktree through Orca from `develop`, launch the implementation agent there, and preserve the full Orca worktree identity.

### User Story 4: Reviewable delivery (Priority: P1)

The workflow MUST run tests, checks, and build, then commit and push the dedicated branch and open a PR targeting `develop`.

## Decisions

- `/issue-plan <number>` is read-only and uses the built-in `plan` agent.
- `/issue-implement <number>` is the separate implementation phase and requires prior plan approval.
- Orca owns worktree and agent lifecycle; OpenCode does not install a second worktree manager.
- Worktrees are created outside the repository through Orca's managed workspace location.
- The repository default branch may be `main`, but all feature work is based on `develop`.
- Ambiguous issue-to-spec mappings and failed GitHub sub-issue relationships stop the workflow for user input.

## Verification

- Validate command discovery after restarting OpenCode.
- Verify planning does not edit files or mutate GitHub.
- Verify implementation creates an Orca worktree from `develop`.
- Verify the final PR targets `develop` and includes the issue and spec links.
