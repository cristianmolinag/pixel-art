# Feature 004: Undo/Redo

**Status:** Implemented
**Spec written:** 2026-09-04
**Tests:** `tests/unit/models/Canvas.test.js`, `tests/unit/stores/editor.test.js`, `tests/unit/components/PixelCanvas.test.js`, `tests/unit/components/Toolbar.test.js`
**Objective:** `specs/project/objective.md`
**Related issue:** [#13](https://github.com/cristianmolinag/pixel-art/issues/13)
**Depends on:** F03 Tools (#5, implemented)

## User Story Summary

> As a **user**, I want to undo and redo drawing actions so I can correct mistakes without erasing pixel by pixel.

## Prioritized User Stories

### User Story 1: Undo the last action (Priority: P1)

Undo returns the canvas to the state before the last drawing action. It is disabled when empty, and one brush drag is undone as one action.

### User Story 2: Redo an undone action (Priority: P2)

Redo reapplies the last undone action in order. A new drawing action clears the redo history.

### User Story 3: One action equals one complete gesture (Priority: P1)

Brush/eraser drags, lines, and fills each create one undo step. A gesture that changes no pixels creates no empty step.

## Functional Requirements

- **FR-001:** The toolbar MUST provide Undo and Redo buttons.
- **FR-002:** Undo MUST revert the last brush, eraser, line, or fill action.
- **FR-003:** Redo MUST reapply the last undone action.
- **FR-004:** An action MUST be a complete tap or drag, not one step per pixel.
- **FR-005:** Buttons MUST be disabled when their stack is empty.
- **FR-006:** A new drawing, erasing, or redo action MUST clear the redo stack.
- **FR-007:** Undo/redo stacks and actions MUST live in `editor.svelte.js`.
- **FR-008:** History MUST remain in memory for the session; cross-session persistence belongs to F05.

## Success Criteria

- **SC-001:** A user can undo and redo actions from the toolbar.
- **SC-002:** Undo reverses one complete gesture and redo restores it.
- **SC-003:** Empty states disable the corresponding button.
- **SC-004:** The user-story scenarios are covered by tests.

## Assumptions

- Reuse `Canvas`, the editor store, `PixelCanvas.svelte`, and `Toolbar.svelte`.
- Keyboard shortcuts are out of scope and belong to backlog #10.

## Decisions

- Each undo entry is a complete canvas snapshot (`ImageData`); `Canvas` exposes `snapshot()` and `restore(snapshot)`.
- `editor.svelte.js` owns `undoStack`, `redoStack`, `canUndo`, `canRedo`, and gesture boundaries `beginAction()`/`endAction()`.
- `PixelCanvas` opens an action on pointer down and closes it on pointer up/leave, recording only real pixel changes.
- Undo and redo move the current snapshot between the two stacks and increment `version`.
- Toolbar buttons use `lucide-svelte`, accessible labels, and `disabled` bindings.
