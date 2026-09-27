/**
 * Desktop keyboard shortcuts for the editor.
 *
 * The dispatcher is a pure function that maps keyboard events to semantic
 * actions; App.svelte registers it exactly once on the window and maps each
 * action to store methods. Tool shortcuts consolidate the previous
 * per-instance eyedropper handler from Toolbar.svelte (F19, issue #50).
 */

const TOOL_KEYS = {
  b: "brush",
  e: "eraser",
  l: "line",
  r: "rectangle",
  c: "circle",
  f: "fill",
  i: "eyedropper",
};

/**
 * Whether the event target is an element where typing happens, so editor
 * shortcuts must not fire.
 *
 * @param {EventTarget|null} target
 * @returns {boolean}
 */
export function isEditableTarget(target) {
  return Boolean(
    target instanceof HTMLElement &&
      (target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable),
  );
}

/**
 * Elements where the browser uses Space natively (activation/scroll).
 * Space pan is skipped for them so their default behavior stays intact.
 *
 * @param {EventTarget|null} target
 * @returns {boolean}
 */
function isSpaceGuardedTarget(target) {
  return (
    target instanceof HTMLElement &&
    (target.tagName === "BUTTON" ||
      target.tagName === "A" ||
      target.tagName === "SELECT" ||
      target.tagName === "SUMMARY")
  );
}

/**
 * Map a keydown event to editor actions. Returns true when the event was
 * handled (and its default was prevented).
 *
 * @param {KeyboardEvent} event
 * @param {{
 *   onTool?: (tool: string) => void,
 *   onGrid?: () => void,
 *   onZoomIn?: () => void,
 *   onZoomOut?: () => void,
 *   onZoomReset?: () => void,
 *   onUndo?: () => void,
 *   onRedo?: () => void,
 *   onSave?: () => void,
 *   onExport?: () => void,
 *   onSpaceStart?: () => void,
 * }} actions
 * @returns {boolean}
 */
export function handleKeydown(event, actions = {}) {
  if (isEditableTarget(event.target)) return false;

  if (event.key === " ") {
    if (isSpaceGuardedTarget(event.target)) return false;
    actions.onSpaceStart?.();
    event.preventDefault();
    return true;
  }

  if (event.ctrlKey || event.metaKey) {
    switch (event.key.toLowerCase()) {
      case "z":
        event.preventDefault();
        if (event.shiftKey) actions.onRedo?.();
        else actions.onUndo?.();
        return true;
      case "y":
        event.preventDefault();
        actions.onRedo?.();
        return true;
      case "s":
        event.preventDefault();
        actions.onSave?.();
        return true;
      case "e":
        event.preventDefault();
        actions.onExport?.();
        return true;
      default:
        return false;
    }
  }

  if (event.altKey) return false;

  switch (event.key) {
    case "+":
    case "=":
      event.preventDefault();
      actions.onZoomIn?.();
      return true;
    case "-":
    case "_":
      event.preventDefault();
      actions.onZoomOut?.();
      return true;
    case "0":
      event.preventDefault();
      actions.onZoomReset?.();
      return true;
  }

  const tool = TOOL_KEYS[event.key.toLowerCase()];
  if (tool) {
    event.preventDefault();
    actions.onTool?.(tool);
    return true;
  }

  if (event.key.toLowerCase() === "g") {
    event.preventDefault();
    actions.onGrid?.();
    return true;
  }

  return false;
}

/**
 * Map a keyup event to editor actions. Returns true when the event was
 * handled. Space release always clears pan mode, even when the keydown was
 * ignored (e.g. it started while an input had focus).
 *
 * @param {KeyboardEvent} event
 * @param {{ onSpaceEnd?: () => void }} [actions]
 * @returns {boolean}
 */
export function handleKeyup(event, actions = {}) {
  if (event.key !== " ") return false;
  actions.onSpaceEnd?.();
  return true;
}
