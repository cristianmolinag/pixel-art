<script>
  import { editor } from "../stores/editor.svelte.js";
</script>

{#if editor.tool === "rectangle" || editor.tool === "circle"}
  <div class="shape-pill" role="group" aria-label="Shape mode">
    <button
      type="button"
      aria-label="Outline mode"
      title="Outline"
      aria-pressed={editor.shapeMode === "outline"}
      class="cursor-pointer rounded px-2 py-1 text-xs font-medium transition
        {editor.shapeMode === 'outline'
          ? 'bg-white text-black shadow'
          : 'text-white hover:bg-white/10'}"
      onclick={() => editor.setShapeMode("outline")}
    >
      Outline
    </button>
    <button
      type="button"
      aria-label="Fill mode"
      title="Fill"
      aria-pressed={editor.shapeMode === "fill"}
      class="cursor-pointer rounded px-2 py-1 text-xs font-medium transition
        {editor.shapeMode === 'fill'
          ? 'bg-white text-black shadow'
          : 'text-white hover:bg-white/10'}"
      onclick={() => editor.setShapeMode("fill")}
    >
      Fill
    </button>
  </div>
{/if}
