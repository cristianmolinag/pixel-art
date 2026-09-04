<script>
  import { drawCanvas } from "../canvas/draw.js";

  let { model } = $props();

  let canvasEl = $state();

  $effect(() => {
    const canvas = canvasEl;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawCanvas(ctx, model);
  });
</script>

<div
  class="w-full"
  style:max-width="min(100%, 512px)"
  style:aspect-ratio="1 / 1"
>
  <canvas
    bind:this={canvasEl}
    width={model.cols}
    height={model.rows}
    class="block h-full w-full select-none [image-rendering:pixelated]"
    style:touch-action="none"
  ></canvas>
</div>
