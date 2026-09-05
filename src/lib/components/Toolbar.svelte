<script>
  import { editor, MIN_ZOOM, MAX_ZOOM } from "../stores/editor.svelte.js";
  import Brush from "@lucide/svelte/icons/brush";
  import Eraser from "@lucide/svelte/icons/eraser";
  import Slash from "@lucide/svelte/icons/slash";
  import PaintBucket from "@lucide/svelte/icons/paint-bucket";
  import Undo2 from "@lucide/svelte/icons/undo-2";
  import Redo2 from "@lucide/svelte/icons/redo-2";
  import Grid3x3 from "@lucide/svelte/icons/grid-3x3";
  import Minus from "@lucide/svelte/icons/minus";
  import Plus from "@lucide/svelte/icons/plus";
  import Maximize from "@lucide/svelte/icons/maximize";
  import ZoomIn from "@lucide/svelte/icons/zoom-in";
  import Matrix from "./Matrix.svelte";

  const TOOLS = [
    { id: "brush", label: "Brush", icon: Brush },
    { id: "eraser", label: "Eraser", icon: Eraser },
    { id: "line", label: "Line", icon: Slash },
    { id: "fill", label: "Fill", icon: PaintBucket },
  ];

  let zoomOpen = $state(false);

  function closePanelOnSelect(node) {
    const zoomButton = node.querySelector('[aria-label="Zoom"]');
    node.addEventListener("click", (e) => {
      if (zoomButton && zoomButton.contains(e.target)) return;
      if (e.target.closest("[data-zoom-panel]")) return;
      if (zoomOpen) zoomOpen = false;
    });
  }
</script>

{#snippet zoomGroup()}
  <span class="mx-1 h-6 w-px bg-white/20 lg:mx-0 lg:my-1 lg:h-px lg:w-6" aria-hidden="true"></span>

  <button
    type="button"
    aria-label="Zoom out"
    title="Zoom out (zoom −)"
    disabled={editor.zoom <= MIN_ZOOM}
    class="tam-icono flex cursor-pointer items-center justify-center rounded-md text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
    onclick={() => editor.zoomOut()}
  >
    <Minus size={20} />
  </button>
  <span class="tam-icono-width flex items-center justify-center text-center text-xs text-white/70" aria-live="polite">
    {Math.round(editor.zoom * 100)}%
  </span>
  <button
    type="button"
    aria-label="Zoom in"
    title="Zoom in (zoom +)"
    disabled={editor.zoom >= MAX_ZOOM}
    class="tam-icono flex cursor-pointer items-center justify-center rounded-md text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
    onclick={() => editor.zoomIn()}
  >
    <Plus size={20} />
  </button>
  <button
    type="button"
    aria-label="Reset zoom to 100%"
    title="Reset zoom and pan"
    class="tam-icono flex cursor-pointer items-center justify-center rounded-md text-white transition hover:bg-white/10"
    onclick={() => editor.resetZoom()}
  >
    <Maximize size={20} />
  </button>

  <span class="mx-1 h-6 w-px bg-white/20 lg:mx-0 lg:my-1 lg:h-px lg:w-6" aria-hidden="true"></span>
{/snippet}

<div
  role="group"
  use:closePanelOnSelect
  class="toolbar-fila flex flex-wrap items-center justify-center lg:items-center lg:justify-start lg:flex-col lg:gap-0"
>
  {#each TOOLS as { id, label, icon } (id)}
    {@const Icone = icon}
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={editor.tool === id}
      class="tam-icono flex cursor-pointer items-center justify-center rounded-md transition
        {editor.tool === id
          ? 'bg-white text-black shadow'
          : 'text-white hover:bg-white/10'}"
      onclick={() => editor.selectTool(id)}
    >
      <Icone size={20} />
    </button>
  {/each}

  <button
    type="button"
    aria-label={editor.showGrid ? "Hide grid" : "Show grid"}
    title={editor.showGrid ? "Hide grid" : "Show grid"}
    aria-pressed={editor.showGrid}
    class="tam-icono flex cursor-pointer items-center justify-center rounded-md transition
      {editor.showGrid
        ? 'bg-white text-black shadow'
        : 'text-white hover:bg-white/10'}"
    onclick={() => editor.toggleGrid()}
  >
    <Grid3x3 size={20} />
  </button>

  <Matrix />

  <div class="hidden lg:flex lg:flex-col lg:items-center">
    {@render zoomGroup()}
  </div>

  <button
    type="button"
    aria-label="Undo"
    title="Undo"
    disabled={!editor.canUndo}
    class="tam-icono flex cursor-pointer items-center justify-center rounded-md text-white transition
      hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
    onclick={() => editor.undo()}
  >
    <Undo2 size={20} />
  </button>
  <button
    type="button"
    aria-label="Redo"
    title="Redo"
    disabled={!editor.canRedo}
    class="tam-icono flex cursor-pointer items-center justify-center rounded-md text-white transition
      hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
    onclick={() => editor.redo()}
  >
    <Redo2 size={20} />
  </button>

  <button
    type="button"
    aria-label="Zoom"
    title="Zoom"
    aria-expanded={zoomOpen}
    class="tam-icono flex cursor-pointer items-center justify-center rounded-md transition lg:hidden
      {zoomOpen ? 'bg-white text-black shadow' : 'text-white hover:bg-white/10'}"
    onclick={(e) => {
      e.stopPropagation();
      zoomOpen = !zoomOpen;
    }}
  >
    <ZoomIn size={20} />
  </button>

  {#if zoomOpen}
    <div data-zoom-panel class="toolbar-fila flex w-full flex-wrap items-center lg:hidden">
      {@render zoomGroup()}
    </div>
  {/if}
</div>

<svelte:window
  onkeydown={(e) => {
    if (e.key === "Escape") zoomOpen = false;
  }}
/>