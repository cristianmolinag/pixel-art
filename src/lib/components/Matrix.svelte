<script>
  import { editor, MATRIX_PRESETS, MIN_MATRIX_SIZE, MAX_MATRIX_SIZE } from "../stores/editor.svelte.js";
  import LayoutGrid from "@lucide/svelte/icons/layout-grid";

  let visible = $state(false);
  let cols = $state(String(editor.model.cols));
  let rows = $state(String(editor.model.rows));
  let error = $state("");
  let confirming = $state(null);

  function open() {
    cols = String(editor.model.cols);
    rows = String(editor.model.rows);
    error = "";
    visible = true;
  }

  function close() {
    visible = false;
    confirming = null;
    error = "";
  }

  function handleEscape() {
    if (confirming) {
      confirming = null;
    } else {
      close();
    }
  }

  function apply(c, r) {
    const width = Math.floor(Number(c));
    const height = Math.floor(Number(r));
    if (
      !Number.isFinite(width) ||
      !Number.isFinite(height) ||
      width < MIN_MATRIX_SIZE ||
      width > MAX_MATRIX_SIZE ||
      height < MIN_MATRIX_SIZE ||
      height > MAX_MATRIX_SIZE
    ) {
      error = `Use between ${MIN_MATRIX_SIZE} and ${MAX_MATRIX_SIZE} per side.`;
      return;
    }
    error = "";
    confirming = { width, height };
  }

  function applyConfirmed() {
    editor.setMatrix(confirming.width, confirming.height);
    close();
  }
</script>

<div class="relative">
  <button
    type="button"
    aria-label="Change canvas matrix"
    title="Change canvas matrix"
    aria-expanded={visible}
    aria-haspopup="dialog"
    class="tam-icono flex cursor-pointer items-center justify-center rounded-md text-white transition
      {visible ? 'bg-white/15' : 'hover:bg-white/10'}"
    onclick={() => (visible ? close() : open())}
  >
    <LayoutGrid size={20} />
  </button>

  {#if visible}
    <div
      role="button"
      tabindex="-1"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onclick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
      onkeydown={(e) => {
        if (e.key === "Escape") handleEscape();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Change canvas matrix"
        class="w-full max-w-xs rounded-2xl bg-surface-light p-4 shadow-xl"
      >
        <h2 class="mb-3 text-lg font-bold text-white">Matrix</h2>

        <div class="grid grid-cols-2 gap-2">
          {#each MATRIX_PRESETS as n}
            <button
              type="button"
              aria-label="Matrix {n}×{n}"
              class="h-10 cursor-pointer rounded-md border-2 text-sm font-medium transition
                {editor.model.cols === n && editor.model.rows === n
                  ? 'border-brand bg-brand/10 text-white'
                  : 'border-white/20 text-white hover:bg-white/10'}"
              onclick={() => apply(n, n)}
            >
              {n}×{n}
            </button>
          {/each}
        </div>

        <div class="mt-4">
          <span class="text-xs uppercase tracking-wide text-white/50">Custom matrix size</span>
          <div class="mt-2 flex items-center gap-2">
            <input
              type="number"
              min={MIN_MATRIX_SIZE}
              max={MAX_MATRIX_SIZE}
              aria-label="Matrix width"
              title="Width (columns)"
              class="h-9 w-full rounded-md border-2 border-white/20 bg-surface px-2 text-sm text-white outline-none transition focus:border-brand"
              value={cols}
              oninput={(e) => (cols = e.currentTarget.value)}
            />
            <span class="text-white/50" aria-hidden="true">×</span>
            <input
              type="number"
              min={MIN_MATRIX_SIZE}
              max={MAX_MATRIX_SIZE}
              aria-label="Matrix height"
              title="Height (rows)"
              class="h-9 w-full rounded-md border-2 border-white/20 bg-surface px-2 text-sm text-white outline-none transition focus:border-brand"
              value={rows}
              oninput={(e) => (rows = e.currentTarget.value)}
            />
            <button
              type="button"
              aria-label="Apply custom matrix size"
              class="h-9 shrink-0 cursor-pointer rounded-md bg-brand px-3 text-sm font-semibold text-white transition hover:bg-brand-hover"
              onclick={() => apply(cols, rows)}
            >
              Ok
            </button>
          </div>
          {#if error}
            <p class="prose mt-2 text-xs text-red-400" aria-live="polite">{error}</p>
          {/if}
        </div>
      </div>
    </div>
  {/if}

  {#if confirming}
    <div
      role="button"
      tabindex="-1"
      class="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
      onclick={(e) => {
        if (e.target === e.currentTarget) confirming = null;
      }}
      onkeydown={(e) => {
        if (e.key === "Escape") confirming = null;
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Confirm matrix change"
        class="w-full max-w-xs rounded-2xl bg-surface-light p-4 shadow-xl"
      >
        <h2 class="mb-3 text-lg font-bold text-white">Change matrix</h2>
        <p class="text-sm text-white/70">
          {`Change the matrix to ${confirming.width}×${confirming.height}? The current canvas will be cleared.`}
        </p>
        <div class="mt-4 flex justify-end gap-2">
          <button
            type="button"
            aria-label="Cancel"
            class="h-9 cursor-pointer rounded-md px-3 text-sm font-semibold text-white transition hover:bg-white/10"
            onclick={() => (confirming = null)}
          >
            Cancel
          </button>
          <button
            type="button"
            aria-label="Apply and clear"
            class="h-9 cursor-pointer rounded-md bg-red-600 px-3 text-sm font-semibold text-white transition hover:bg-red-700"
            onclick={applyConfirmed}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>

<svelte:window onkeydown={(e) => e.key === "Escape" && handleEscape()} />
