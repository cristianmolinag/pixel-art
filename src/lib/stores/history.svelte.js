class HistoryState {
  undoStack = $state([]);
  redoStack = $state([]);

  canUndo = $derived(this.undoStack.length > 1);
  canRedo = $derived(this.redoStack.length > 0);

  push(imageData) {
    this.undoStack = [...this.undoStack, imageData];
    this.redoStack = [];
  }

  undo() {
    if (this.undoStack.length <= 1) return null;
    const current = this.undoStack[this.undoStack.length - 1];
    this.undoStack = this.undoStack.slice(0, -1);
    this.redoStack = [...this.redoStack, current];
    return this.undoStack[this.undoStack.length - 1] ?? null;
  }

  redo() {
    if (this.redoStack.length === 0) return null;
    const next = this.redoStack[this.redoStack.length - 1];
    this.redoStack = this.redoStack.slice(0, -1);
    this.undoStack = [...this.undoStack, next];
    return next;
  }

  clear() {
    this.undoStack = [];
    this.redoStack = [];
  }
}

export const history = new HistoryState();
