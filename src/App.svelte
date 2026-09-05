<script>
  import PixelCanvas from "./lib/components/PixelCanvas.svelte";
  import Palette from "./lib/components/Palette.svelte";
  import Toolbar from "./lib/components/Toolbar.svelte";
  import FileActions from "./lib/components/FileActions.svelte";
  import Gallery from "./lib/components/Gallery.svelte";
</script>

<div class="flex h-screen flex-col bg-surface">
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

  <div class="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
    <aside
      class="flex items-center justify-center bg-surface-light p-2 lg:w-auto lg:shrink-0 lg:items-start lg:overflow-y-auto lg:p-3"
    >
      <Toolbar />
    </aside>

    <main class="flex min-h-0 flex-1 items-center justify-center overflow-hidden p-4">
      <PixelCanvas />
    </main>
  </div>

  <footer class="bg-surface-light px-4 py-3 shadow-[0_-4px_6px_rgba(0,0,0,0.25)]">
    <Palette />
  </footer>
</div>

<Gallery />