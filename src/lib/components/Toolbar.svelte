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
  import Matriz from "./Matriz.svelte";

  const HERRAMIENTAS = [
    { id: "pincel", label: "Pincel", icon: Brush },
    { id: "borrador", label: "Borrador", icon: Eraser },
    { id: "linea", label: "Línea", icon: Slash },
    { id: "relleno", label: "Relleno", icon: PaintBucket },
  ];

  let zoomAbierto = $state(false);

  function cerrarPanelAlSeleccionar(node) {
    const zoomButton = node.querySelector('[aria-label="Zoom"]');
    node.addEventListener("click", (e) => {
      if (zoomButton && zoomButton.contains(e.target)) return;
      if (e.target.closest("[data-zoom-panel]")) return;
      if (zoomAbierto) zoomAbierto = false;
    });
  }
</script>

{#snippet zoomGrupo()}
  <span class="mx-1 h-6 w-px bg-white/20 lg:mx-0 lg:my-1 lg:h-px lg:w-6" aria-hidden="true"></span>

  <button
    type="button"
    aria-label="Alejar (zoom)"
    title="Alejar vista (zoom −)"
    disabled={editor.zoom <= MIN_ZOOM}
    class="tam-icono flex cursor-pointer items-center justify-center rounded-md text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
    onclick={() => editor.alejar()}
  >
    <Minus size={20} />
  </button>
  <span class="tam-icono-ancho flex items-center justify-center text-center text-xs text-white/70" aria-live="polite">
    {Math.round(editor.zoom * 100)}%
  </span>
  <button
    type="button"
    aria-label="Acercar (zoom)"
    title="Acercar vista (zoom +)"
    disabled={editor.zoom >= MAX_ZOOM}
    class="tam-icono flex cursor-pointer items-center justify-center rounded-md text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
    onclick={() => editor.acercar()}
  >
    <Plus size={20} />
  </button>
  <button
    type="button"
    aria-label="Restablecer zoom al 100%"
    title="Restablecer zoom y centrado"
    class="tam-icono flex cursor-pointer items-center justify-center rounded-md text-white transition hover:bg-white/10"
    onclick={() => editor.reiniciarZoom()}
  >
    <Maximize size={20} />
  </button>

  <span class="mx-1 h-6 w-px bg-white/20 lg:mx-0 lg:my-1 lg:h-px lg:w-6" aria-hidden="true"></span>
{/snippet}

<div
  role="group"
  use:cerrarPanelAlSeleccionar
  class="toolbar-fila flex flex-wrap items-center justify-center lg:items-center lg:justify-start lg:flex-col lg:gap-0"
>
  {#each HERRAMIENTAS as { id, label, icon } (id)}
    {@const Icone = icon}
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={editor.herramienta === id}
      class="tam-icono flex cursor-pointer items-center justify-center rounded-md transition
        {editor.herramienta === id
          ? 'bg-white text-black shadow'
          : 'text-white hover:bg-white/10'}"
      onclick={() => editor.seleccionarHerramienta(id)}
    >
      <Icone size={20} />
    </button>
  {/each}

  <button
    type="button"
    aria-label={editor.mostrarCuadricula ? "Ocultar cuadrícula" : "Mostrar cuadrícula"}
    title={editor.mostrarCuadricula ? "Ocultar cuadrícula" : "Mostrar cuadrícula"}
    aria-pressed={editor.mostrarCuadricula}
    class="tam-icono flex cursor-pointer items-center justify-center rounded-md transition
      {editor.mostrarCuadricula
        ? 'bg-white text-black shadow'
        : 'text-white hover:bg-white/10'}"
    onclick={() => editor.alternarCuadricula()}
  >
    <Grid3x3 size={20} />
  </button>

  <Matriz />

  <div class="hidden lg:flex lg:flex-col lg:items-center">
    {@render zoomGrupo()}
  </div>

  <button
    type="button"
    aria-label="Deshacer"
    title="Deshacer"
    disabled={!editor.canUndo}
    class="tam-icono flex cursor-pointer items-center justify-center rounded-md text-white transition
      hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
    onclick={() => editor.deshacer()}
  >
    <Undo2 size={20} />
  </button>
  <button
    type="button"
    aria-label="Rehacer"
    title="Rehacer"
    disabled={!editor.canRedo}
    class="tam-icono flex cursor-pointer items-center justify-center rounded-md text-white transition
      hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
    onclick={() => editor.rehacer()}
  >
    <Redo2 size={20} />
  </button>

  <button
    type="button"
    aria-label="Zoom"
    title="Zoom"
    aria-expanded={zoomAbierto}
    class="tam-icono flex cursor-pointer items-center justify-center rounded-md transition lg:hidden
      {zoomAbierto ? 'bg-white text-black shadow' : 'text-white hover:bg-white/10'}"
    onclick={(e) => {
      e.stopPropagation();
      zoomAbierto = !zoomAbierto;
    }}
  >
    <ZoomIn size={20} />
  </button>

  {#if zoomAbierto}
    <div data-zoom-panel class="toolbar-fila flex w-full flex-wrap items-center lg:hidden">
      {@render zoomGrupo()}
    </div>
  {/if}
</div>

<svelte:window
  onkeydown={(e) => {
    if (e.key === "Escape") zoomAbierto = false;
  }}
/>