<script>
  import { drawCanvas } from "../canvas/draw.js";
  import { editor } from "../stores/editor.svelte.js";
  import { lineaPuntos } from "../models/Canvas.js";

  let canvasEl = $state();
  let pintando = $state(false);
  let lineaInicio = $state(null);
  let lineaFin = $state(null);
  let previsualizando = $state(false);
  const punteros = new Map();
  let pellizco = null;
  let panActivo = false;
  let panUltimo = null;

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

function limitesPan() {
  const base = canvasEl.clientWidth;
  if (base === 0) return { maxX: Infinity, maxY: Infinity };
  const exceso = (base * editor.zoom - base) / 2;
  return { maxX: exceso, maxY: exceso };
}

function dispararPellizco() {
  const [a, b] = [...punteros.values()];
  if (!a || !b) return;
  const dist = Math.hypot(b.x - a.x, b.y - a.y);
  if (dist === 0 || !pellizco) return;
  editor.establecerZoom(pellizco.zoomInicial * (dist / pellizco.distInicial));
}

function onPointerDown(event) {
  if (event.ctrlKey || event.metaKey) {
    panActivo = true;
    panUltimo = { x: event.clientX, y: event.clientY };
    if (canvasEl && canvasEl.setPointerCapture) {
      try {
        canvasEl.setPointerCapture(event.pointerId);
      } catch {
        /* noop */
      }
    }
    return;
  }

  punteros.set(event.pointerId, { x: event.clientX, y: event.clientY });

  if (punteros.size === 2) {
    if (pintando) {
      editor.cerrarAccion();
      pintando = false;
      previsualizando = false;
      lineaInicio = null;
      lineaFin = null;
    }
    const [a, b] = [...punteros.values()];
    pellizco = {
      distInicial: Math.hypot(b.x - a.x, b.y - a.y),
      zoomInicial: editor.zoom,
    };
    return;
  }

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
  if (panActivo && panUltimo) {
    const { maxX, maxY } = limitesPan();
    editor.desplazarPan(event.clientX - panUltimo.x, event.clientY - panUltimo.y, maxX, maxY);
    panUltimo = { x: event.clientX, y: event.clientY };
    return;
  }

  if (punteros.set(event.pointerId, { x: event.clientX, y: event.clientY }) && pellizco) {
    dispararPellizco();
    return;
  }

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

function onPointerUp(event) {
  if (panActivo) {
    panActivo = false;
    panUltimo = null;
    if (canvasEl && canvasEl.releasePointerCapture) {
      try {
        canvasEl.releasePointerCapture(event.pointerId);
      } catch {
        /* noop */
      }
    }
    return;
  }

  punteros.delete(event.pointerId);

  if (pellizco) {
    if (punteros.size < 2) {
      pellizco = null;
      punteros.clear();
      pintando = false;
      previsualizando = false;
      lineaInicio = null;
      lineaFin = null;
    }
    return;
  }

  pintando = false;
  if (editor.herramienta === "linea" && previsualizando && lineaInicio && lineaFin) {
    editor.dibujarLinea(lineaInicio.x, lineaInicio.y, lineaFin.x, lineaFin.y);
  }
  editor.cerrarAccion();
  previsualizando = false;
  lineaInicio = null;
  lineaFin = null;
}
</script>

<div
  class="w-full overflow-hidden"
  style:max-width="min(100%, 512px)"
  style:aspect-ratio="1 / 1"
>
  <canvas
    bind:this={canvasEl}
    width={editor.model.cols}
    height={editor.model.rows}
    class="block h-full w-full select-none [image-rendering:pixelated]"
    style:touch-action="none"
    style:transform="translate({editor.panX}px, {editor.panY}px) scale({editor.zoom})"
    style:transform-origin="center"
    style:background-color="#ffffff"
    style:background-image={editor.mostrarCuadricula
      ? "linear-gradient(to right, var(--color-grid) 1px, transparent 1px), linear-gradient(to bottom, var(--color-grid) 1px, transparent 1px)"
      : "none"}
    style:background-size={editor.mostrarCuadricula
      ? `${100 / editor.model.cols}% ${100 / editor.model.rows}%`
      : "auto"}
    onpointerdown={onPointerDown}
    onpointermove={onPointerMove}
    onpointerup={onPointerUp}
    onpointercancel={onPointerUp}
    onpointerleave={onPointerUp}
  ></canvas>
</div>