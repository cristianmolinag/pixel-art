<script>
  import { editor } from "../stores/editor.svelte.js";
  import { toasts } from "../stores/toasts.svelte.js";
  import { decodeImageFile } from "../services/referenceImage.js";
  import ImagePlus from "@lucide/svelte/icons/image-plus";
  import Trash2 from "@lucide/svelte/icons/trash-2";

  let fileInput = $state();
  let opacityPercent = $derived(Math.round(editor.referenceOpacity * 100));

  async function handleFile(event) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;
    try {
      const image = await decodeImageFile(file);
      editor.setReferenceImage(image);
    } catch {
      toasts.show("Could not load the reference image.");
    }
  }
</script>

{#if editor.referenceVisible}
  <div class="reference-pill" role="group" aria-label="Reference image controls">
    <input
      bind:this={fileInput}
      type="file"
      accept="image/*"
      class="hidden"
      aria-hidden="true"
      tabindex="-1"
      onchange={handleFile}
    />
    <button
      type="button"
      aria-label={editor.hasReferenceImage ? "Replace reference image" : "Load reference image"}
      title={editor.hasReferenceImage ? "Replace reference image" : "Load reference image"}
      class="cursor-pointer rounded p-1 text-white transition hover:bg-white/10"
      onclick={() => fileInput?.click()}
    >
      <ImagePlus size={16} />
    </button>
    <label class="flex flex-col items-center gap-0.5">
      <span class="sr-only">Reference opacity</span>
      <input
        type="range"
        min="0"
        max="100"
        step="1"
        aria-label="Reference opacity"
        title="Reference opacity"
        class="w-16 cursor-pointer accent-white"
        value={opacityPercent}
        oninput={(e) => editor.setReferenceOpacity(Number(e.currentTarget.value) / 100)}
      />
      <span class="text-xs tabular-nums text-white/80">{opacityPercent}%</span>
    </label>
    {#if editor.hasReferenceImage}
      <button
        type="button"
        aria-label="Remove reference image"
        title="Remove reference image"
        class="cursor-pointer rounded p-1 text-white transition hover:bg-white/10"
        onclick={() => editor.removeReferenceImage()}
      >
        <Trash2 size={16} />
      </button>
    {/if}
  </div>
{/if}
