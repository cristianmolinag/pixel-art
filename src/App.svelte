<script>
  import PixelCanvas from "./lib/components/PixelCanvas.svelte";
  import Palette from "./lib/components/Palette.svelte";
</script>

<main class="flex h-screen flex-col items-center justify-center gap-4 p-4">
  <h1 class="text-xl font-bold text-white">Pixel Art Studio</h1>
  <PixelCanvas />
  <Palette />
</main>