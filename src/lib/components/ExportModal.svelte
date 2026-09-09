<script>
  import { exportPng, downloadBlob, suggestedExportName, EXPORT_SCALES, DEFAULT_EXPORT_SCALE } from "../services/export.js";
  import { editor } from "../stores/editor.svelte.js";
  import X from "@lucide/svelte/icons/x";
  import Download from "@lucide/svelte/icons/download";

  let { open, onClose } = $props();

  let scale = $state(DEFAULT_EXPORT_SCALE);
  let exporting = $state(false);
  let error = $state("");

  $effect(() => {
    if (open) {
      scale = DEFAULT_EXPORT_SCALE;
      error = "";
      exporting = false;
    }
  });

  async function handleExport() {
    if (exporting) return;
    exporting = true;
    error = "";
    try {
      const blob = await exportPng(editor.model, scale);
      await downloadBlob(blob, suggestedExportName(scale));
      onClose?.();
    } catch (err) {
      error = err instanceof Error ? err.message : "Export failed";
    } finally {
      exporting = false;
    }
  }

  function handleEscape() {
    if (!exporting) {
      onClose?.();
    }
  }
</script>

{#if open}
  <div
    role="button"
    tabindex="-1"
    aria-label="Close export dialog"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
    onclick={(e) => {
      if (e.target === e.currentTarget && !exporting) onClose?.();
    }}
    onkeydown={(e) => {
      if (e.key === "Escape") handleEscape();
    }}
  >
    <div
      class="flex w-full max-w-xs flex-col rounded-2xl bg-surface-light p-4 shadow-xl"
      role="dialog"
      aria-modal="true"
      tabindex="-1"
      aria-label="Export drawing"
    >
      <div class="mb-3 flex items-center justify-between">
        <h2 class="text-lg font-bold text-white">Export PNG</h2>
        <button
          type="button"
          aria-label="Close export dialog"
          class="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-white transition hover:bg-white/10"
          onclick={() => !exporting && onClose?.()}
          disabled={exporting}
        >
          <X size={20} />
        </button>
      </div>

      <span class="text-xs uppercase tracking-wide text-white/50">Scale</span>
      <div class="mt-2 grid grid-cols-4 gap-2">
        {#each EXPORT_SCALES as s}
          <button
            type="button"
            aria-label="Export at {s}x"
            aria-pressed={scale === s}
            class="h-10 cursor-pointer rounded-md border-2 text-sm font-medium transition
              {scale === s
                ? 'border-brand bg-brand/10 text-white'
                : 'border-white/20 text-white hover:bg-white/10'}"
            onclick={() => (scale = s)}
            disabled={exporting}
          >
            {s}x
          </button>
        {/each}
      </div>

      <p class="mt-3 text-xs text-white/60">
        {editor.model.cols}×{editor.model.rows} → {editor.model.cols * scale}×{editor.model.rows * scale}
      </p>

      {#if error}
        <p class="mt-2 text-xs text-red-400" role="alert">{error}</p>
      {/if}

      <div class="mt-4 flex justify-end gap-2">
        <button
          type="button"
          aria-label="Cancel"
          class="h-9 cursor-pointer rounded-md px-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-50"
          onclick={() => onClose?.()}
          disabled={exporting}
        >
          Cancel
        </button>
        <button
          type="button"
          aria-label="Export PNG"
          class="flex h-9 cursor-pointer items-center gap-1 rounded-md bg-brand px-3 text-sm font-semibold text-white transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
          onclick={handleExport}
          disabled={exporting}
        >
          <Download size={18} />
          {exporting ? "Exporting..." : "Export"}
        </button>
      </div>
    </div>
  </div>
{/if}

<svelte:window onkeydown={(e) => e.key === "Escape" && open && !exporting && handleEscape()} />
