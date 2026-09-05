<script>
  import { gallery } from "../stores/gallery.svelte.js";
  import FilePlus2 from "@lucide/svelte/icons/file-plus-2";
  import Save from "@lucide/svelte/icons/save";
  import Images from "@lucide/svelte/icons/images";

  let confirmingNew = $state(false);

  const ACCIONES = [
    {
      id: "newDrawing",
      label: "New drawing",
      icon: FilePlus2,
      fn: () => (confirmingNew = true),
    },
    { id: "save", label: "Save", icon: Save, fn: () => gallery.open({ focusSave: true }) },
    { id: "gallery", label: "Gallery", icon: Images, fn: () => gallery.open() },
  ];
</script>

<div class="flex flex-wrap items-center justify-center gap-1">
  {#each ACCIONES as { id, label, icon, fn } (id)}
    {@const Icone = icon}
    <button
      type="button"
      aria-label={label}
      title={label}
      class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md text-white transition
        hover:bg-white/10"
      onclick={fn}
    >
      <Icone size={20} />
    </button>
  {/each}
</div>

{#if confirmingNew}
  <div
    role="button"
    tabindex="-1"
    class="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
    onclick={(e) => {
      if (e.target === e.currentTarget) confirmingNew = false;
    }}
    onkeydown={(e) => {
      if (e.key === "Escape") confirmingNew = false;
    }}
  >
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Confirm new drawing"
      class="w-full max-w-xs rounded-2xl bg-surface-light p-4 shadow-xl"
    >
      <h2 class="mb-3 text-lg font-bold text-white">New drawing</h2>
      <p class="text-sm text-white/70">Start a new drawing? The current canvas will be cleared.</p>
      <div class="mt-4 flex justify-end gap-2">
        <button
          type="button"
          aria-label="Cancel"
          class="h-9 cursor-pointer rounded-md px-3 text-sm font-semibold text-white transition hover:bg-white/10"
          onclick={() => (confirmingNew = false)}
        >
          Cancel
        </button>
        <button
          type="button"
          aria-label="Start new drawing"
          class="h-9 cursor-pointer rounded-md bg-red-600 px-3 text-sm font-semibold text-white transition hover:bg-red-700"
          onclick={() => {
            gallery.newDrawing();
            confirmingNew = false;
          }}
        >
          Start new drawing
        </button>
      </div>
    </div>
  </div>
{/if}

<svelte:window
  onkeydown={(e) => {
    if (e.key === "Escape") confirmingNew = false;
  }}
/>