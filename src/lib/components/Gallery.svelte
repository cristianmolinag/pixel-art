<script>
  import { gallery } from "../stores/gallery.svelte.js";
  import { editor } from "../stores/editor.svelte.js";
  import Trash2 from "@lucide/svelte/icons/trash-2";
  import X from "@lucide/svelte/icons/x";

  let confirming = $state(null);
  let confirmingLoad = $state(null);

  function startDelete(drawing) {
    confirming = drawing;
  }

  function confirmDelete() {
    if (confirming) {
      gallery.delete(confirming.id);
      confirming = null;
    }
  }

  function startLoad(drawing) {
    if (editor.dirty) {
      confirmingLoad = drawing;
    } else {
      gallery.load(drawing);
    }
  }

  function confirmLoad() {
    if (confirmingLoad) {
      gallery.load(confirmingLoad);
      confirmingLoad = null;
    }
  }

  function handleEscape() {
    if (confirmingLoad) {
      confirmingLoad = null;
    } else if (confirming) {
      confirming = null;
    } else {
      gallery.close();
    }
  }

  function formatDate(ts) {
    return new Date(ts).toLocaleString("en-US");
  }
</script>

{#if gallery.visible}
  <div
    role="button"
    tabindex="-1"
    aria-label="Close gallery"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
    onclick={(e) => {
      if (e.target === e.currentTarget) gallery.close();
    }}
    onkeydown={(e) => {
      if (e.key === "Escape") {
        handleEscape();
      } else if ((e.key === "Enter" || e.key === " ") && !confirming && !confirmingLoad) {
        gallery.close();
      }
    }}
  >
    <div
      class="flex max-h-[85dvh] w-full max-w-md flex-col rounded-2xl bg-surface-light p-4 shadow-xl"
      role="dialog"
      aria-modal="true"
      tabindex="-1"
      aria-label="Drawing gallery"
    >
      <div class="mb-3 flex items-center justify-between">
        <h2 class="text-lg font-bold text-white">Gallery</h2>
        <button
          type="button"
          aria-label="Close gallery"
          class="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-white transition hover:bg-white/10"
          onclick={() => gallery.close()}
        >
          <X size={20} />
        </button>
      </div>

      <div class="mb-2 flex shrink-0 items-center justify-between">
        <h3 class="text-sm font-semibold text-white">My drawings</h3>
        <span class="text-xs text-white/50">{gallery.drawings.length} saved</span>
      </div>

      <div class="min-h-0 flex-1 overflow-y-auto">
        {#if gallery.drawings.length === 0}
          <p class="py-8 text-center text-sm text-white/60">You haven't saved any drawings yet.</p>
        {:else}
          <ul class="grid grid-cols-2 gap-3">
          {#each gallery.drawings as drawing (drawing.id)}
            <li class="relative">
              <button
                type="button"
                class="w-full cursor-pointer rounded-xl bg-surface p-2 text-left transition hover:bg-surface-lighter"
                aria-label={`Load ${drawing.name}`}
                onclick={() => startLoad(drawing)}
              >
                <span
                  class="mb-1 flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-white [image-rendering:pixelated]"
                >
                  {#if drawing.thumbnail}
                    <img
                      src={drawing.thumbnail}
                      alt=""
                      width={drawing.cols}
                      height={drawing.rows}
                      class="h-full w-full object-contain [image-rendering:pixelated]"
                    />
                  {:else}
                    <span class="text-xs text-black/40">no preview</span>
                  {/if}
                </span>
                <span class="block truncate text-sm font-medium text-white">{drawing.name}</span>
                <span class="block text-xs text-white/50">{formatDate(drawing.createdAt)}</span>
              </button>
              <button
                type="button"
                aria-label={`Delete ${drawing.name}`}
                class="absolute right-2 top-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-md bg-black/40 text-white transition hover:bg-red-600"
                onclick={() => startDelete(drawing)}
              >
                <Trash2 size={14} />
              </button>
            </li>
          {/each}
        </ul>
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
      aria-label="Confirm deletion"
      class="w-full max-w-xs rounded-2xl bg-surface-light p-4 shadow-xl"
    >
      <h2 class="mb-3 text-lg font-bold text-white">Delete drawing</h2>
      <p class="text-sm text-white/70">{`Delete "${confirming.name}"? This cannot be undone.`}</p>
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
          aria-label="Confirm deletion"
          class="h-9 cursor-pointer rounded-md bg-red-600 px-3 text-sm font-semibold text-white transition hover:bg-red-700"
          onclick={confirmDelete}
        >
          Delete
        </button>
      </div>
    </div>
  </div>
{/if}

{#if confirmingLoad}
  <div
    role="button"
    tabindex="-1"
    class="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
    onclick={(e) => {
      if (e.target === e.currentTarget) confirmingLoad = null;
    }}
    onkeydown={(e) => {
      if (e.key === "Escape") confirmingLoad = null;
    }}
  >
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Confirm load"
      class="w-full max-w-xs rounded-2xl bg-surface-light p-4 shadow-xl"
    >
      <h2 class="mb-3 text-lg font-bold text-white">Load drawing</h2>
      <p class="text-sm text-white/70">{`Load "${confirmingLoad.name}"? This will replace the current canvas and unsaved work will be lost.`}</p>
      <div class="mt-4 flex justify-end gap-2">
        <button
          type="button"
          aria-label="Cancel"
          class="h-9 cursor-pointer rounded-md px-3 text-sm font-semibold text-white transition hover:bg-white/10"
          onclick={() => (confirmingLoad = null)}
        >
          Cancel
        </button>
        <button
          type="button"
          aria-label="Confirm load"
          class="h-9 cursor-pointer rounded-md bg-brand px-3 text-sm font-semibold text-white transition hover:bg-brand-hover"
          onclick={confirmLoad}
        >
          Load
        </button>
      </div>
    </div>
  </div>
{/if}

<svelte:window onkeydown={(e) => e.key === "Escape" && handleEscape()} />