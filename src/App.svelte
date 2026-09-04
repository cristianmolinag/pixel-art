<script>
  import { Canvas } from "./lib/models/Canvas.js";
  import PixelCanvas from "./lib/components/PixelCanvas.svelte";

  let model = new Canvas(16, 16);
</script>

<main class="flex h-screen items-center justify-center p-4">
  <PixelCanvas {model} />
</main>
