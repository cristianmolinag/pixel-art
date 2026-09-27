<script>
  import { editor, MIN_ZOOM, MAX_ZOOM } from "../stores/editor.svelte.js";
  import Brush from "@lucide/svelte/icons/brush";
  import Eraser from "@lucide/svelte/icons/eraser";
  import Slash from "@lucide/svelte/icons/slash";
  import PaintBucket from "@lucide/svelte/icons/paint-bucket";
  import Square from "@lucide/svelte/icons/square";
  import Circle from "@lucide/svelte/icons/circle";
  import Undo2 from "@lucide/svelte/icons/undo-2";
  import Redo2 from "@lucide/svelte/icons/redo-2";
  import Grid3x3 from "@lucide/svelte/icons/grid-3x3";
  import FlipHorizontal from "@lucide/svelte/icons/flip-horizontal";
  import FlipVertical from "@lucide/svelte/icons/flip-vertical";
  import Minus from "@lucide/svelte/icons/minus";
  import Plus from "@lucide/svelte/icons/plus";
  import Maximize from "@lucide/svelte/icons/maximize";
  import ZoomIn from "@lucide/svelte/icons/zoom-in";
  import Pipette from "@lucide/svelte/icons/pipette";
  import ImageIcon from "@lucide/svelte/icons/image";
  import Matrix from "./Matrix.svelte";

  let { mode } = $props();

  const TOOLS = [
    { id: "brush", label: "Brush", shortcut: "B", icon: Brush },
    { id: "eraser", label: "Eraser", shortcut: "E", icon: Eraser },
    { id: "line", label: "Line", shortcut: "L", icon: Slash },
    { id: "rectangle", label: "Rectangle", shortcut: "R", icon: Square },
    { id: "circle", label: "Circle", shortcut: "C", icon: Circle },
    { id: "fill", label: "Fill", shortcut: "F", icon: PaintBucket },
    { id: "eyedropper", label: "Eyedropper", shortcut: "I", icon: Pipette },
  ];

  let zoomOpen = $state(false);
</script>

{#snippet zoomGroup()}
  <span class="toolbar-separator" aria-hidden="true"></span>

  <button
    type="button"
    aria-label="Zoom out"
    title="Zoom out (−)"
    disabled={editor.zoom <= MIN_ZOOM}
    class="toolbar-icon flex cursor-pointer items-center justify-center rounded-md text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
    onclick={() => editor.zoomOut()}
  >
    <Minus size={20} />
  </button>
  <span class="toolbar-icon-width flex items-center justify-center text-center text-xs text-white/70" aria-live="polite">
    {Math.round(editor.zoom * 100)}%
  </span>
  <button
    type="button"
    aria-label="Zoom in"
    title="Zoom in (+)"
    disabled={editor.zoom >= MAX_ZOOM}
    class="toolbar-icon flex cursor-pointer items-center justify-center rounded-md text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
    onclick={() => editor.zoomIn()}
  >
    <Plus size={20} />
  </button>
  <button
    type="button"
    aria-label="Reset zoom to 100%"
    title="Reset zoom and pan (0)"
    class="toolbar-icon flex cursor-pointer items-center justify-center rounded-md text-white transition hover:bg-white/10"
    onclick={() => editor.resetZoom()}
  >
    <Maximize size={20} />
  </button>

  <span class="toolbar-separator" aria-hidden="true"></span>
{/snippet}

{#if mode === "tools"}
  <div role="group" aria-label="Drawing tools" class="toolbar-container">
    {#each TOOLS as { id, label, shortcut, icon } (id)}
      {@const Icone = icon}
      <button
        type="button"
        aria-label={label}
        title="{label} ({shortcut})"
        aria-pressed={editor.tool === id}
        class="toolbar-icon flex cursor-pointer items-center justify-center rounded-md transition
          {editor.tool === id
            ? 'bg-white text-black shadow'
            : 'text-white hover:bg-white/10'}"
        onclick={() => editor.selectTool(id)}
      >
        <Icone size={20} />
      </button>
    {/each}
  </div>
{:else if mode === "controls"}
  <div role="group" aria-label="Tool controls" class="toolbar-container">
    <span class="toolbar-separator toolbar-section-separator" aria-hidden="true"></span>

    <button
      type="button"
      aria-label="Undo"
      title="Undo (Ctrl+Z)"
      disabled={!editor.canUndo}
      class="toolbar-icon flex cursor-pointer items-center justify-center rounded-md text-white transition
        hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
      onclick={() => editor.undo()}
    >
      <Undo2 size={20} />
    </button>
    <button
      type="button"
      aria-label="Redo"
      title="Redo (Ctrl+Y)"
      disabled={!editor.canRedo}
      class="toolbar-icon flex cursor-pointer items-center justify-center rounded-md text-white transition
        hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
      onclick={() => editor.redo()}
    >
      <Redo2 size={20} />
    </button>

    <button
      type="button"
      aria-label="Horizontal mirror"
      title="Horizontal mirror"
      aria-pressed={editor.mirrorX}
      class="toolbar-icon flex cursor-pointer items-center justify-center rounded-md transition
        {editor.mirrorX
          ? 'bg-white text-black shadow'
          : 'text-white hover:bg-white/10'}"
      onclick={() => editor.toggleMirrorX()}
    >
      <FlipHorizontal size={20} />
    </button>

    <button
      type="button"
      aria-label="Vertical mirror"
      title="Vertical mirror"
      aria-pressed={editor.mirrorY}
      class="toolbar-icon flex cursor-pointer items-center justify-center rounded-md transition
        {editor.mirrorY
          ? 'bg-white text-black shadow'
          : 'text-white hover:bg-white/10'}"
      onclick={() => editor.toggleMirrorY()}
    >
      <FlipVertical size={20} />
    </button>

    <button
      type="button"
      aria-label={editor.showGrid ? "Hide grid" : "Show grid"}
      title="{editor.showGrid ? 'Hide grid' : 'Show grid'} (G)"
      aria-pressed={editor.showGrid}
      class="toolbar-icon flex cursor-pointer items-center justify-center rounded-md transition
        {editor.showGrid
          ? 'bg-white text-black shadow'
          : 'text-white hover:bg-white/10'}"
      onclick={() => editor.toggleGrid()}
    >
      <Grid3x3 size={20} />
    </button>

    <button
      type="button"
      aria-label={editor.referenceVisible ? "Hide reference" : "Show reference"}
      title={editor.referenceVisible ? "Hide reference" : "Show reference"}
      aria-pressed={editor.referenceVisible}
      class="toolbar-icon flex cursor-pointer items-center justify-center rounded-md transition
        {editor.referenceVisible
          ? 'bg-white text-black shadow'
          : 'text-white hover:bg-white/10'}"
      onclick={() => editor.toggleReference()}
    >
      <ImageIcon size={20} />
    </button>

    <Matrix />

    <div class="toolbar-zoom-inline">
      {@render zoomGroup()}
    </div>

    <button
      type="button"
      aria-label="Zoom"
      title="Zoom"
      aria-expanded={zoomOpen}
      data-zoom-toggle
      class="toolbar-icon toolbar-zoom-toggle flex cursor-pointer items-center justify-center rounded-md transition
        {zoomOpen ? 'bg-white text-black shadow' : 'text-white hover:bg-white/10'}"
      onclick={(e) => {
        e.stopPropagation();
        zoomOpen = !zoomOpen;
      }}
    >
      <ZoomIn size={20} />
    </button>

    {#if zoomOpen}
      <div data-zoom-panel class="toolbar-row toolbar-zoom-panel flex w-full flex-wrap items-center">
        {@render zoomGroup()}
      </div>
    {/if}
  </div>
{/if}

<svelte:window
  onkeydown={(e) => {
    if (mode === "controls" && e.key === "Escape") zoomOpen = false;
  }}
  onclick={(e) => {
    if (mode !== "controls" || !zoomOpen) return;
    const target = e.target;
    if (target.closest?.("[data-zoom-toggle]") || target.closest?.("[data-zoom-panel]")) return;
    zoomOpen = false;
  }}
/>
