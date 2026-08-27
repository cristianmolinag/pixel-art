<script>
  import { editor } from "../stores/editor.svelte.js";
  import { history } from "../stores/history.svelte.js";

  function undo() {
    const state = history.undo();
    if (state) {
      editor.pendingImageData = state;
      editor.canvasVersion++;
    }
  }

  function redo() {
    const state = history.redo();
    if (state) {
      editor.pendingImageData = state;
      editor.canvasVersion++;
    }
  }

  function clearCanvas() {
    editor.pendingClear = true;
    editor.canvasVersion++;
  }

  function exportCanvas() {
    editor.pendingExport = true;
    editor.canvasVersion++;
  }

  function handleKeyboard(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === "z") {
      e.preventDefault();
      if (e.shiftKey) {
        redo();
      } else {
        undo();
      }
    }
  }
</script>

<svelte:window onkeydown={handleKeyboard} />

<div class="flex flex-wrap justify-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
  <button
    onclick={() => editor.setTool("pen")}
    class="px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer"
    class:bg-brand={editor.activeTool === "pen"}
    class:bg-surface-lighter={editor.activeTool !== "pen"}
    class:hover:bg-brand-hover={editor.activeTool !== "pen"}
  >
    ✏️ <span class="hidden sm:inline">Lapiz</span>
  </button>

  <button
    onclick={() => editor.setTool("eraser")}
    class="px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer"
    class:bg-brand={editor.activeTool === "eraser"}
    class:bg-surface-lighter={editor.activeTool !== "eraser"}
    class:hover:bg-brand-hover={editor.activeTool !== "eraser"}
  >
    🧹 <span class="hidden sm:inline">Goma</span>
  </button>

  <div class="w-px bg-surface-lighter hidden sm:block"></div>

  <button
    onclick={undo}
    disabled={!history.canUndo}
    class="px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-surface-lighter hover:bg-brand-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
  >
    ↩️ <span class="hidden sm:inline">Deshacer</span>
  </button>

  <button
    onclick={redo}
    disabled={!history.canRedo}
    class="px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-surface-lighter hover:bg-brand-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
  >
    ↪️ <span class="hidden sm:inline">Rehacer</span>
  </button>

  <div class="w-px bg-surface-lighter hidden sm:block"></div>

  <button
    onclick={clearCanvas}
    class="px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-surface-lighter hover:bg-red-600 transition-colors cursor-pointer"
  >
    🗑️ <span class="hidden sm:inline">Borrar</span>
  </button>

  <button
    onclick={exportCanvas}
    class="px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-brand hover:bg-brand-hover transition-colors cursor-pointer"
  >
    💾 <span class="hidden sm:inline">Exportar</span>
  </button>
</div>
