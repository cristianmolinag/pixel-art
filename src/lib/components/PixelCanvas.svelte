<script>
  import { drawCanvas } from "../canvas/draw.js";
  import { editor } from "../stores/editor.svelte.js";
  import { lineaPuntos } from "../models/Canvas.js";

  let canvasEl = $state();
  let pintando = $state(false);
  let lineaInicio = $state(null);
  let lineaFin = $state(null);
  let previsualizando = $state(false);

  $effect(() => {
    const canvas = canvasEl;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawCanvas(ctx, editor.model);
    void editor.version;
    if (
      editor.herramienta === "linea" &&
      previsualizando &&
      lineaInicio &&
      lineaFin
    ) {
      ctx.fillStyle = editor.colorActual;
      ctx.globalAlpha = 0.5;
      for (const [x, y] of lineaPuntos(lineaInicio.x, lineaInicio.y, lineaFin.x, lineaFin.y)) {
        if (x < 0 || y < 0 || x >= editor.model.cols || y >= editor.model.rows) continue;
        ctx.fillRect(x, y, 1, 1);
      }
      ctx.globalAlpha = 1;
    }
  });

  function celdaDeEvento(event) {
    const rect = canvasEl.getBoundingClientRect();
    const x = Math.floor(((event.clientX - rect.left) / rect.width) * editor.model.cols);
    const y = Math.floor(((event.clientY - rect.top) / rect.height) * editor.model.rows);
    if (x < 0 || y < 0 || x >= editor.model.cols || y >= editor.model.rows) return null;
    return { x, y };
  }

  function onPointerDown(event) {
    const celda = celdaDeEvento(event);
    if (!celda) return;
    pintando = true;
    editor.abrirAccion();
    switch (editor.herramienta) {
      case "borrador":
        editor.borrarPixel(celda.x, celda.y);
        break;
      case "linea":
        lineaInicio = celda;
        lineaFin = celda;
        previsualizando = true;
        break;
      case "relleno":
        editor.rellenar(celda.x, celda.y);
        break;
      default:
        editor.pintarPixel(celda.x, celda.y);
    }
  }

  function onPointerMove(event) {
    if (!pintando) return;
    const celda = celdaDeEvento(event);
    if (!celda) return;
    switch (editor.herramienta) {
      case "borrador":
        editor.borrarPixel(celda.x, celda.y);
        break;
      case "linea":
        lineaFin = celda;
        break;
      default:
        editor.pintarPixel(celda.x, celda.y);
    }
  }

  function onPointerUp() {
    if (editor.herramienta === "linea" && previsualizando && lineaInicio && lineaFin) {
      editor.dibujarLinea(lineaInicio.x, lineaInicio.y, lineaFin.x, lineaFin.y);
    }
    editor.cerrarAccion();
    pintando = false;
    previsualizando = false;
    lineaInicio = null;
    lineaFin = null;
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