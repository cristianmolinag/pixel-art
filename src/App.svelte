<script>
  import "./app.css";
  import ToolBar from "./lib/toolbar/ToolBar.svelte";
  import PixelCanvas from "./lib/canvas/PixelCanvas.svelte";
  import ColorPalette from "./lib/panels/ColorPalette.svelte";
  import LayerPanel from "./lib/panels/LayerPanel.svelte";
  import PropertiesPanel from "./lib/panels/PropertiesPanel.svelte";
  import Timeline from "./lib/timeline/Timeline.svelte";
  import Gallery from "./lib/gallery/Gallery.svelte";
  import { editor } from "./lib/stores/editor.svelte.js";

  let showGallery = $state(false);
  let showPanels = $state(false);
</script>

<div class="h-[100dvh] flex flex-col overflow-hidden relative">
  <header class="bg-surface-light border-b border-surface-lighter px-3 py-2 flex items-center justify-between shrink-0 z-50">
    <h1 class="text-base sm:text-lg font-bold tracking-tight">Pixel Art Studio</h1>
    <div class="flex gap-2">
      <button
        onclick={() => (showPanels = !showPanels)}
        class="lg:hidden px-2.5 py-1.5 rounded-lg bg-surface-lighter hover:bg-brand text-sm font-medium transition-colors cursor-pointer z-50"
      >
        {showPanels ? "✕" : "☰"}
      </button>
      <button
        onclick={() => { showGallery = !showGallery; showPanels = false; }}
        class="px-2.5 py-1.5 rounded-lg bg-surface-lighter hover:bg-brand text-sm font-medium transition-colors cursor-pointer"
      >
        {showGallery ? "Editor" : "Galeria"}
      </button>
    </div>
  </header>

  {#if showGallery}
    <Gallery />
  {:else}
    <div class="flex flex-1 min-h-0">
      <aside class="hidden lg:flex w-56 bg-surface-light border-r border-surface-lighter p-3 flex-col gap-3 overflow-y-auto shrink-0">
        <ColorPalette />
        <PropertiesPanel />
        <LayerPanel />
      </aside>

      <main class="flex-1 flex flex-col items-center justify-start p-2 sm:p-4 overflow-auto min-w-0">
        <ToolBar />
        <PixelCanvas />
        <Timeline />
      </main>
    </div>
  {/if}

  {#if showPanels && !showGallery}
    <div class="fixed inset-0 z-40 lg:hidden flex" style="position: fixed;">
      <button class="flex-1 bg-black/50 cursor-default" onclick={() => (showPanels = false)} aria-label="Cerrar panel"></button>
      <div class="w-64 max-w-[80vw] bg-surface-light border-l border-surface-lighter p-3 flex flex-col gap-3 overflow-y-auto">
        <span class="text-xs text-gray-400 font-medium mb-1">Panel</span>
        <ColorPalette />
        <PropertiesPanel />
        <LayerPanel />
      </div>
    </div>
  {/if}

  <footer class="text-center text-[10px] sm:text-xs text-gray-500 py-1.5 border-t border-surface-lighter shrink-0 z-50">
    Hecho por Cristian, Valentina y Daniel Molina solo por diversion.
  </footer>
</div>
