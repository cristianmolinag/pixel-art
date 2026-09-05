---
name: implement-issue
description: Use when implementing a GitHub issue through the project workflow; plan first, create or update a feature spec, create GitHub sub-issues, use an Orca-managed worktree, verify the implementation, and open a PR to develop.
---

# Issue Implementation Workflow

This skill is the project workflow for turning one GitHub issue into an isolated,
reviewable implementation. Use GitHub as the issue source of truth, Orca as the
worktree and agent lifecycle manager, and OpenCode as the implementation agent.

## Non-negotiable rules

- Every issue/feature uses a dedicated Orca-managed worktree and branch.
- Never use raw `git worktree add` for implementation work.
- Never edit or commit in the `develop` or `main` worktree.
- The integration base is `develop`, even when the repository default branch is `main`.
- Planning MUST happen before spec edits, sub-issue creation, worktree creation, or code edits.
- The implementation phase MUST have an explicit approved plan from the user.
- Every feature has a spec under `specs/features/` and a GitHub issue.
- Run tests, `mise exec -- pnpm check`, and `mise exec -- pnpm build` before committing.
- Commits use conventional commits. Push the feature branch and open a PR targeting `develop`.
- Stop and ask when the issue-to-spec mapping, feature scope, or dependency graph is ambiguous.

## Phase 1: Planning

Planning is read-only. Do not edit files, create issues, create worktrees, or run
commands that mutate GitHub or Git state.

1. Parse the issue number from the user request.
2. Resolve the repository with `gh repo view --json nameWithOwner,url`.
3. Read the issue with:

   ```bash
   gh issue view <number> --json number,title,body,state,labels,assignees,comments,url
   ```

4. Inspect existing feature specs and find a matching issue link or feature number.
5. Propose either an existing spec update or the next available feature spec path.
6. Produce a plan containing:
   - issue and proposed feature/spec mapping;
   - user stories and acceptance criteria;
   - files and components likely to change;
   - tests and verification commands;
   - implementation tasks suitable for sub-issues;
   - branch and Orca worktree name.
7. Stop with the exact approval request:

   ```text
   Plan ready. Reply `Plan approved` to create sub-issues and start implementation.
   ```

The planning command is `/issue-plan <issue-number>` and runs with the built-in
`plan` agent.

## Phase 2: Implementation

Only start this phase after the user has approved the plan. The implementation
command is `/issue-implement <issue-number>`.

### Prepare the spec and sub-issues

1. Re-read the issue and verify that the approved plan still matches it.
2. Create or update the feature spec in American English. Include the issue URL,
   status, user stories, decisions, acceptance criteria, and verification.
3. If the spec is new, update `specs/project/objective.md` and the relevant context
   index. Update `AGENTS.md` when the feature changes project rules or architecture.
4. Create one GitHub issue for each approved implementation task using `gh issue create`.
5. Attach each created issue as a sub-issue of the parent. Use the GitHub REST API
   after resolving the child issue ID:

   ```bash
   child_id="$(gh issue view <child-number> --json id --jq .id)"
   gh api --method POST "repos/<owner>/<repo>/issues/<parent-number>/sub_issues" \
     -F "sub_issue_id=${child_id}"
   ```

   If the API rejects the relationship, stop and report the error instead of
   silently creating unrelated issues.

### Create the Orca worktree

1. Resolve the Orca executable. Outside an Orca terminal use `/home/cristian/.local/bin/orca-ide`; inside Orca use the exported `ORCA_CLI_COMMAND` when available.
2. Check Orca is running with `<ORCA> status --json`.
3. Resolve the repo ID with `<ORCA> repo list --json` or `<ORCA> worktree current --json`.
4. Create the worktree explicitly from `develop`:

   ```bash
   <ORCA> worktree create \
     --repo id:<repo-id> \
     --name issue-<number>-<short-name> \
     --no-parent \
     --base-branch develop \
     --agent omp \
     --prompt "Implement GitHub issue #<number> from the approved plan and feature spec. Work only in this worktree. Run the required verification and report blockers." \
     --json
   ```

5. Preserve the complete `worktree.id` from the response. It has the form
   `<repo-id>::<absolute-path>` and must not be shortened to only the repository ID.
6. If `--agent omp` is unavailable, stop and report the exact Orca error. Do not
   fall back to an untracked manually-created worktree.

### Verify, commit, push, and open the PR

1. Monitor the Orca agent using its returned terminal handle, or reacquire the
   handle with `<ORCA> terminal list --worktree <full-worktree-id> --json`.
2. Confirm the worktree is clean apart from intended changes.
3. Run:

   ```bash
   mise exec -- pnpm test
   mise exec -- pnpm check
   mise exec -- pnpm build
   git diff --check
   ```

4. Review `git status`, `git diff`, and `git log --oneline -10` before committing.
5. Commit with a conventional commit, push the dedicated branch, and create a PR:

   ```bash
   gh pr create --base develop --head <branch> --title "<conventional title>" --body-file <body-file>
   ```

6. The PR body MUST include the issue link, spec path, sub-issue links, verification
   results, and `Closes #<parent-number>`.
7. Verify the PR base is `develop`, the head is the dedicated branch, and the
   worktree remains associated with the issue/PR in Orca when supported.

## Failure handling

- Never bypass plan approval because the issue looks small.
- Never push directly to `develop` or `main`.
- Never create a second worktree manager through an OpenCode plugin.
- Never delete a worktree with uncommitted changes without explicit user approval.
- If a command fails, preserve the worktree and report the exact command and error.
