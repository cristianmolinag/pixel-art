<script>
  import { gallery } from "../stores/gallery.svelte.js";
  import { toasts } from "../stores/toasts.svelte.js";
  import { vibrate } from "../utils/haptics.js";
  import { suggestedName } from "../models/Drawing.js";
  import Save from "@lucide/svelte/icons/save";
  import X from "@lucide/svelte/icons/x";

  let { open, onClose } = $props();

  let name = $state("");
  let nameInput = $state(null);

  $effect(() => {
    if (open) {
      name = gallery.currentDrawingName ?? suggestedName();
      gallery.error = "";
    }
  });

  $effect(() => {
    if (open && nameInput) {
      nameInput.focus();
    }
  });

  async function handleSave() {
    if (await gallery.save(name)) {
      toasts.show("Drawing saved.");
      vibrate(15);
      onClose?.();
    }
  }

  async function handleUpdate() {
    if (await gallery.updateCurrent(name)) {
      toasts.show("Drawing updated.");
      vibrate(15);
      onClose?.();
    }
  }

  function handleEscape() {
    onClose?.();
  }
</script>

{#if open}
  <div
    role="button"
    tabindex="-1"
    aria-label="Close save dialog"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
    onclick={(e) => {
      if (e.target === e.currentTarget) onClose?.();
    }}
    onkeydown={(e) => {
      if (e.key === "Escape") handleEscape();
    }}
  >
    <div
      class="flex w-full max-w-md flex-col rounded-2xl bg-surface-light p-4 shadow-xl"
      role="dialog"
      aria-modal="true"
      tabindex="-1"
      aria-label="Save drawing"
    >
      <div class="mb-3 flex items-center justify-between">
        <h2 class="text-lg font-bold text-white">Save drawing</h2>
        <button
          type="button"
          aria-label="Close save dialog"
          class="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-white transition hover:bg-white/10"
          onclick={() => onClose?.()}
        >
          <X size={20} />
        </button>
      </div>

      <div class="flex flex-wrap gap-2">
        <input
          bind:this={nameInput}
          bind:value={name}
          placeholder="Drawing name"
          class="min-w-0 flex-1 rounded-md bg-surface px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-brand"
        />
        {#if gallery.currentDrawingName}
          <button
            type="button"
            class="flex h-10 shrink-0 cursor-pointer items-center gap-1 rounded-md bg-brand px-3 text-sm font-semibold text-white transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
            onclick={handleUpdate}
            disabled={gallery.saving}
            aria-label={`Update ${gallery.currentDrawingName}`}
          >
            <Save size={18} />
            Update
          </button>
        {/if}
        <button
          type="button"
          class="flex h-10 shrink-0 cursor-pointer items-center gap-1 rounded-md bg-brand px-3 text-sm font-semibold text-white transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
          onclick={handleSave}
          disabled={gallery.saving}
        >
          <Save size={18} />
          {gallery.currentDrawingName ? "Save as new" : "Save"}
        </button>
      </div>
      {#if gallery.error}
        <p class="mt-2 text-xs text-red-400" role="alert">{gallery.error}</p>
      {/if}
    </div>
  </div>
{/if}

<svelte:window onkeydown={(e) => e.key === "Escape" && open && onClose?.()} />
