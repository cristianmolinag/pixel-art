---
description: Implement an approved GitHub issue in an Orca-managed worktree
agent: build
---

Use the `implement-issue` skill's Phase 2 implementation workflow for GitHub issue `$ARGUMENTS`.
Proceed only when the user has explicitly approved the plan. If no approved plan is present in the conversation, stop and ask the user to run `/issue-plan $ARGUMENTS` first.
