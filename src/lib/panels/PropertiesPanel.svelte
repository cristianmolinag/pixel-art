<script>
  import { editor, GRID_PRESETS, RATIO_PRESETS, PAPER_PRESETS } from "../stores/editor.svelte.js";

  let selectedGrid = $state("32 x 32");

  function applyGrid(preset) {
    editor.setCanvasSize(preset.cols, preset.rows);
    editor.setPaperExport(0, 0);
    selectedGrid = preset.label;
  }

  function applyRatio(preset) {
    editor.setCanvasSize(preset.cols, preset.rows);
    editor.setPaperExport(0, 0);
    selectedGrid = preset.label;
  }

  function applyPaper(preset) {
    const aspect = preset.aspect;
    let cols, rows;
    if (aspect >= 1) {
      cols = 64;
      rows = Math.round(64 / aspect);
    } else {
      rows = 64;
      cols = Math.round(64 * aspect);
    }
    editor.setCanvasSize(cols, rows);
    editor.setPaperExport(preset.exportW, preset.exportH);
    selectedGrid = preset.label;
  }
</script>

<div class="flex flex-col gap-3">
  <span class="text-xs text-gray-400 font-medium">Tamano del canvas</span>

  <div class="flex flex-wrap gap-1">
    {#each GRID_PRESETS as preset}
      <button
        onclick={() => applyGrid(preset)}
        class="px-2 py-1 rounded text-[10px] sm:text-xs transition-colors cursor-pointer"
        class:bg-brand={selectedGrid === preset.label}
        class:bg-surface-lighter={selectedGrid !== preset.label}
        class:hover:bg-brand-hover={selectedGrid !== preset.label}
      >
        {preset.label}
      </button>
    {/each}
  </div>

  <span class="text-xs text-gray-400 font-medium">Proporcion</span>
  <div class="flex flex-wrap gap-1">
    {#each RATIO_PRESETS as preset}
      <button
        onclick={() => applyRatio(preset)}
        class="px-2 py-1 rounded text-[10px] sm:text-xs transition-colors cursor-pointer"
        class:bg-brand={selectedGrid === preset.label}
        class:bg-surface-lighter={selectedGrid !== preset.label}
        class:hover:bg-brand-hover={selectedGrid !== preset.label}
      >
        {preset.label}
      </button>
    {/each}
  </div>

  <span class="text-xs text-gray-400 font-medium">Papel (exportacion)</span>
  <div class="flex flex-wrap gap-1">
    {#each PAPER_PRESETS as preset}
      <button
        onclick={() => applyPaper(preset)}
        class="px-2 py-1 rounded text-[10px] sm:text-xs transition-colors cursor-pointer"
        class:bg-brand={selectedGrid === preset.label}
        class:bg-surface-lighter={selectedGrid !== preset.label}
        class:hover:bg-brand-hover={selectedGrid !== preset.label}
      >
        {preset.label}
      </button>
    {/each}
  </div>

  <div class="flex flex-col gap-1 mt-1">
    <span class="text-[10px] text-gray-500">
      Grilla: {editor.gridCols} x {editor.gridRows}
    </span>
    {#if editor.exportWidth > 0}
      <span class="text-[10px] text-gray-500">
        Exporta: {editor.exportWidth} x {editor.exportHeight} px (300 DPI)
      </span>
    {/if}
  </div>

  <label class="flex items-center gap-2 text-xs text-gray-500">
    <input
      type="checkbox"
      checked={editor.showGrid}
      onchange={() => (editor.showGrid = !editor.showGrid)}
      class="accent-brand"
    />
    Mostrar cuadricula
  </label>
</div>
