import { describe, it, expect, vi } from "vitest";
import {
  handleKeydown,
  handleKeyup,
  isEditableTarget,
} from "../../../src/lib/utils/shortcuts.js";

function keyEvent(key, init = {}) {
  return {
    key,
    ctrlKey: false,
    metaKey: false,
    altKey: false,
    shiftKey: false,
    target: document.body,
    preventDefault: vi.fn(),
    ...init,
  };
}

function spyActions() {
  return {
    onTool: vi.fn(),
    onGrid: vi.fn(),
    onZoomIn: vi.fn(),
    onZoomOut: vi.fn(),
    onZoomReset: vi.fn(),
    onUndo: vi.fn(),
    onRedo: vi.fn(),
    onSave: vi.fn(),
    onExport: vi.fn(),
    onSpaceStart: vi.fn(),
    onSpaceEnd: vi.fn(),
  };
}

describe("shortcuts — tool keys (F19/FR-001)", () => {
  const cases = [
    ["b", "brush"],
    ["e", "eraser"],
    ["l", "line"],
    ["r", "rectangle"],
    ["c", "circle"],
    ["f", "fill"],
    ["i", "eyedropper"],
  ];

  for (const [key, tool] of cases) {
    it(`selects ${tool} on "${key}"`, () => {
      const actions = spyActions();
      const event = keyEvent(key);
      expect(handleKeydown(event, actions)).toBe(true);
      expect(actions.onTool).toHaveBeenCalledWith(tool);
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it(`selects ${tool} on uppercase "${key.toUpperCase()}"`, () => {
      const actions = spyActions();
      expect(handleKeydown(keyEvent(key.toUpperCase()), actions)).toBe(true);
      expect(actions.onTool).toHaveBeenCalledWith(tool);
    });
  }

  it("ignores tool keys while Ctrl is held (browser shortcuts stay untouched)", () => {
    const actions = spyActions();
    expect(handleKeydown(keyEvent("b", { ctrlKey: true }), actions)).toBe(false);
    expect(actions.onTool).not.toHaveBeenCalled();
  });

  it("ignores tool keys while Alt is held", () => {
    const actions = spyActions();
    expect(handleKeydown(keyEvent("b", { altKey: true }), actions)).toBe(false);
    expect(actions.onTool).not.toHaveBeenCalled();
  });
});

describe("shortcuts — grid and zoom (F19/FR-002/FR-003)", () => {
  it("toggles the grid on g and G", () => {
    const actions = spyActions();
    expect(handleKeydown(keyEvent("g"), actions)).toBe(true);
    expect(handleKeydown(keyEvent("G"), actions)).toBe(true);
    expect(actions.onGrid).toHaveBeenCalledTimes(2);
  });

  it("zooms in on + and =", () => {
    const actions = spyActions();
    expect(handleKeydown(keyEvent("+"), actions)).toBe(true);
    expect(handleKeydown(keyEvent("="), actions)).toBe(true);
    expect(actions.onZoomIn).toHaveBeenCalledTimes(2);
    expect(actions.onZoomOut).not.toHaveBeenCalled();
  });

  it("zooms out on - and _", () => {
    const actions = spyActions();
    expect(handleKeydown(keyEvent("-"), actions)).toBe(true);
    expect(handleKeydown(keyEvent("_"), actions)).toBe(true);
    expect(actions.onZoomOut).toHaveBeenCalledTimes(2);
    expect(actions.onZoomIn).not.toHaveBeenCalled();
  });

  it("resets zoom on 0", () => {
    const actions = spyActions();
    expect(handleKeydown(keyEvent("0"), actions)).toBe(true);
    expect(actions.onZoomReset).toHaveBeenCalledTimes(1);
  });

  it("does not hijack Ctrl+0, Ctrl+= or Ctrl+- (browser page zoom)", () => {
    const actions = spyActions();
    expect(handleKeydown(keyEvent("0", { ctrlKey: true }), actions)).toBe(false);
    expect(handleKeydown(keyEvent("=", { ctrlKey: true }), actions)).toBe(false);
    expect(handleKeydown(keyEvent("-", { ctrlKey: true }), actions)).toBe(false);
    expect(actions.onZoomReset).not.toHaveBeenCalled();
    expect(actions.onZoomIn).not.toHaveBeenCalled();
    expect(actions.onZoomOut).not.toHaveBeenCalled();
  });
});

describe("shortcuts — undo/redo/save/export (F19/FR-004/FR-005)", () => {
  it("undoes with Ctrl+Z", () => {
    const actions = spyActions();
    const event = keyEvent("z", { ctrlKey: true });
    expect(handleKeydown(event, actions)).toBe(true);
    expect(actions.onUndo).toHaveBeenCalledTimes(1);
    expect(actions.onRedo).not.toHaveBeenCalled();
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it("redoes with Ctrl+Shift+Z", () => {
    const actions = spyActions();
    const event = keyEvent("z", { ctrlKey: true, shiftKey: true });
    expect(handleKeydown(event, actions)).toBe(true);
    expect(actions.onRedo).toHaveBeenCalledTimes(1);
    expect(actions.onUndo).not.toHaveBeenCalled();
  });

  it("redoes with Ctrl+Y", () => {
    const actions = spyActions();
    expect(handleKeydown(keyEvent("y", { ctrlKey: true }), actions)).toBe(true);
    expect(actions.onRedo).toHaveBeenCalledTimes(1);
  });

  it("accepts Meta (Cmd) as the Ctrl modifier for undo", () => {
    const actions = spyActions();
    expect(handleKeydown(keyEvent("z", { metaKey: true }), actions)).toBe(true);
    expect(actions.onUndo).toHaveBeenCalledTimes(1);
  });

  it("opens the save flow with Ctrl+S", () => {
    const actions = spyActions();
    const event = keyEvent("s", { ctrlKey: true });
    expect(handleKeydown(event, actions)).toBe(true);
    expect(actions.onSave).toHaveBeenCalledTimes(1);
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it("opens the export flow with Ctrl+E", () => {
    const actions = spyActions();
    const event = keyEvent("e", { ctrlKey: true });
    expect(handleKeydown(event, actions)).toBe(true);
    expect(actions.onExport).toHaveBeenCalledTimes(1);
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it("leaves other Ctrl combinations (e.g. Ctrl+P) unhandled", () => {
    const actions = spyActions();
    expect(handleKeydown(keyEvent("p", { ctrlKey: true }), actions)).toBe(false);
    expect(actions.onSave).not.toHaveBeenCalled();
    expect(keyEvent("p", { ctrlKey: true }).preventDefault).not.toHaveBeenCalled();
  });
});

describe("shortcuts — space pan (F19/FR-006)", () => {
  it("arms pan mode on Space and prevents the page scroll default", () => {
    const actions = spyActions();
    const event = keyEvent(" ");
    expect(handleKeydown(event, actions)).toBe(true);
    expect(actions.onSpaceStart).toHaveBeenCalledTimes(1);
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it("does not arm pan mode when a button, link or select has focus", () => {
    const actions = spyActions();
    for (const tagName of ["BUTTON", "A", "SELECT"]) {
      const target = document.createElement(tagName);
      document.body.appendChild(target);
      const event = keyEvent(" ", { target });
      expect(handleKeydown(event, actions)).toBe(false);
      expect(event.preventDefault).not.toHaveBeenCalled();
      target.remove();
    }
    expect(actions.onSpaceStart).not.toHaveBeenCalled();
  });

  it("disarms pan mode on Space keyup", () => {
    const actions = spyActions();
    expect(handleKeyup(keyEvent(" "), actions)).toBe(true);
    expect(actions.onSpaceEnd).toHaveBeenCalledTimes(1);
  });

  it("ignores keyup of other keys", () => {
    const actions = spyActions();
    expect(handleKeyup(keyEvent("z"), actions)).toBe(false);
    expect(actions.onSpaceEnd).not.toHaveBeenCalled();
  });
});

describe("shortcuts — typing guard (F19/FR-007)", () => {
  it("ignores every shortcut while typing in an input", () => {
    const actions = spyActions();
    const input = document.createElement("input");
    for (const key of ["b", "g", "+", "0"]) {
      const event = keyEvent(key, { target: input });
      expect(handleKeydown(event, actions)).toBe(false);
      expect(event.preventDefault).not.toHaveBeenCalled();
    }
    const save = keyEvent("s", { ctrlKey: true, target: input });
    expect(handleKeydown(save, actions)).toBe(false);
    expect(save.preventDefault).not.toHaveBeenCalled();
    expect(actions.onTool).not.toHaveBeenCalled();
    expect(actions.onSave).not.toHaveBeenCalled();
  });

  it("ignores shortcuts in a textarea and contenteditable elements", () => {
    const actions = spyActions();
    const textarea = document.createElement("textarea");
    const editable = document.createElement("div");
    // jsdom does not implement isContentEditable; browsers set it from the attribute.
    editable.setAttribute("contenteditable", "true");
    editable.isContentEditable = true;
    for (const target of [textarea, editable]) {
      expect(handleKeydown(keyEvent("b", { target }), actions)).toBe(false);
    }
    expect(actions.onTool).not.toHaveBeenCalled();
  });
});

describe("isEditableTarget", () => {
  it("detects editable targets and ignores the rest", () => {
    expect(isEditableTarget(null)).toBe(false);
    expect(isEditableTarget(document.body)).toBe(false);
    expect(isEditableTarget(document.createElement("input"))).toBe(true);
    expect(isEditableTarget(document.createElement("textarea"))).toBe(true);
    const editable = document.createElement("div");
    editable.isContentEditable = true;
    expect(isEditableTarget(editable)).toBe(true);
  });
});
