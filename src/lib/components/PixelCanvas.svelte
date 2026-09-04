<script>
  import { drawCanvas } from "../canvas/draw.js";
  import { editor } from "../stores/editor.svelte.js";

  let canvasEl = $state();
  let pintando = $state(false);

  $effect(() => {
    const canvas = canvasEl;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawCanvas(ctx, editor.model);
    void editor.version;
  });

  function celdaDeEvento(event) {
    const rect = canvasEl.getBoundingClientRect();
    const x = Math.floor(((event.clientX - rect.left) / rect.width) * editor.model.cols);
    const y = Math.floor(((event.clientY - rect.top) / rect.height) * editor.model.rows);
    if (x < 0 || y < 0 || x >= editor.model.cols || y >= editor.model.rows) return null;
    return { x, y };
  }

  function onPointerDown(event) {
    pintando = true;
    const celda = celdaDeEvento(event);
    if (celda) editor.pintarPixel(celda.x, celda.y);
  }

  function onPointerMove(event) {
    if (!pintando) return;
    const celda = celdaDeEvento(event);
    if (celda) editor.pintarPixel(celda.x, celda.y);
  }

  function onPointerUp() {
    pintando = false;
  }
</script>

<div
  class="w-full"
  style:max-width="min(100%, 512px)"
  style:aspect-ratio="1 / 1"
>
  <canvas
    bind:this={canvasEl}
    width={editor.model.cols}
    height={editor.model.rows}
    class="block h-full w-full select-none [image-rendering:pixelated]"
    style:touch-action="none"
    onpointerdown={onPointerDown}
    onpointermove={onPointerMove}
    onpointerup={onPointerUp}
    onpointerleave={onPointerUp}
  ></canvas>
</div>