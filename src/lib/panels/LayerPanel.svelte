<script>
  import { editor } from "../stores/editor.svelte.js";
</script>

<div class="flex flex-col gap-2">
  <div class="flex items-center justify-between">
    <span class="text-xs text-gray-400 font-medium">Capas</span>
    <button
      onclick={() => editor.addLayer()}
      class="text-xs px-2 py-0.5 rounded bg-surface-lighter hover:bg-brand transition-colors cursor-pointer"
    >
      + Nueva
    </button>
  </div>

  <div class="flex flex-col gap-1">
    {#each editor.layers as layer, i}
      <div
        class="flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors"
        class:bg-surface-lighter={i === editor.activeLayerIndex}
        class:bg-surface={i !== editor.activeLayerIndex}
      >
        <button
          onclick={() => editor.toggleLayerVisibility(i)}
          class="text-xs cursor-pointer"
          title={layer.visible ? "Ocultar" : "Mostrar"}
        >
          {layer.visible ? "👁" : "🚫"}
        </button>

        <button
          onclick={() => editor.setActiveLayer(i)}
          class="flex-1 text-left text-xs truncate cursor-pointer"
          class:text-white={i === editor.activeLayerIndex}
          class:text-gray-400={i !== editor.activeLayerIndex}
        >
          {layer.name}
        </button>

        {#if editor.layers.length > 1}
          <button
            onclick={() => editor.removeLayer(i)}
            class="text-xs text-gray-500 hover:text-red-400 cursor-pointer"
            title="Eliminar"
          >
            ✕
          </button>
        {/if}
      </div>
    {/each}
  </div>
</div>
