<script>
  import PixelCanvas from "./lib/components/PixelCanvas.svelte";
  import Palette from "./lib/components/Palette.svelte";
  import Toolbar from "./lib/components/Toolbar.svelte";
  import ShapeModePill from "./lib/components/ShapeModePill.svelte";
  import ReferencePill from "./lib/components/ReferencePill.svelte";
  import FileActions from "./lib/components/FileActions.svelte";
  import Gallery from "./lib/components/Gallery.svelte";
  import Toast from "./lib/components/Toast.svelte";
  import { editor } from "./lib/stores/editor.svelte.js";
  import { handleKeydown, handleKeyup } from "./lib/utils/shortcuts.js";

  const shortcutActions = {
    onTool: (tool) => editor.selectTool(tool),
    onGrid: () => editor.toggleGrid(),
    onZoomIn: () => editor.zoomIn(),
    onZoomOut: () => editor.zoomOut(),
    onZoomReset: () => editor.resetZoom(),
    onUndo: () => editor.undo(),
    onRedo: () => editor.redo(),
    onSave: () => (editor.pendingSave = true),
    onExport: () => (editor.pendingExport = true),
    onSpaceStart: () => (editor.spaceHeld = true),
    onSpaceEnd: () => (editor.spaceHeld = false),
  };
</script>

<div class="flex h-full flex-col bg-surface">
  <header class="flex items-center gap-3 bg-surface-light px-4 py-3 shadow-md">
    <img
      src={`${import.meta.env.BASE_URL}icon.svg`}
      alt=""
      width="32"
      height="32"
      class="h-8 w-8 rounded-lg"
    />
    <h1 class="text-xl font-bold text-white">Pixel Art Studio</h1>
    <div class="ml-auto flex items-center gap-1">
      <FileActions />
    </div>
  </header>

  <div class="editor-layout">
    <aside class="toolbar-tools">
      <Toolbar mode="tools" />
    </aside>

    <main class="canvas-viewport relative flex min-h-0 touch-none overscroll-none items-center justify-center overflow-hidden p-4">
      <PixelCanvas />
      <ShapeModePill />
      <ReferencePill />
    </main>

    <aside class="toolbar-controls">
      <Toolbar mode="controls" />
    </aside>

    <footer
      class="palette-footer bg-surface-light px-4 pt-3 shadow-[0_-4px_6px_rgba(0,0,0,0.25)]"
      style:padding-bottom="max(0.75rem, env(safe-area-inset-bottom))"
    >
      <Palette />
    </footer>
  </div>
</div>

<Gallery />

<Toast />

<svelte:window
  onkeydown={(e) => handleKeydown(e, shortcutActions)}
  onkeyup={(e) => handleKeyup(e, shortcutActions)}
  onblur={() => (editor.spaceHeld = false)}
/>