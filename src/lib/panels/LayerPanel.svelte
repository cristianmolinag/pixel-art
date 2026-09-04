<script>
  import { editor } from "../stores/editor.svelte.js";

  function handleVisibilityToggle(i) {
    editor.toggleLayerVisibility(i);
    editor.requestComposite();
  }

  function handleOpacityChange(i, value) {
    editor.layers[i].opacity = parseFloat(value);
    editor.requestComposite();
  }
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
        class="flex flex-col gap-1 px-2 py-1.5 rounded text-sm transition-colors"
        class:bg-surface-lighter={i === editor.activeLayerIndex}
        class:bg-surface={i !== editor.activeLayerIndex}
      >
        <div class="flex items-center gap-2">
          <button
            onclick={() => handleVisibilityToggle(i)}
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

        {#if i === editor.activeLayerIndex}
          <div class="flex items-center gap-2 mt-0.5">
            <span class="text-[10px] text-gray-500">Opacidad</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={layer.opacity}
              oninput={(e) => handleOpacityChange(i, e.target.value)}
              class="flex-1 h-1 accent-brand cursor-pointer"
            />
            <span class="text-[10px] text-gray-400 w-7 text-right">{Math.round(layer.opacity * 100)}%</span>
          </div>
        {/if}
      </div>
    {/each}
  </div>
</div>
