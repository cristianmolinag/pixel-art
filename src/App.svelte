<script>
  import PixelCanvas from "./lib/components/PixelCanvas.svelte";
  import Palette from "./lib/components/Palette.svelte";
  import Toolbar from "./lib/components/Toolbar.svelte";
</script>

<main class="flex h-screen flex-col items-center justify-center gap-4 p-4">
  <h1 class="text-xl font-bold text-white">Pixel Art Studio</h1>
  <Toolbar />
  <PixelCanvas />
  <Palette />
</main>