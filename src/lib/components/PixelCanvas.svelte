<script>
  import { GRID_COLOR } from "../canvas/draw.js";
  import { editor } from "../stores/editor.svelte.js";
  import { lineaPuntos } from "../models/Canvas.js";

  let canvasEl = $state();
  let contenedor = $state();
  let pintando = $state(false);
  let lineaInicio = $state(null);
  let lineaFin = $state(null);
  let previsualizando = $state(false);
  const punteros = new Map();
  let pellizco = null;
  let panActivo = false;
  let panUltimo = null;

  function dibujar() {
    const canvas = canvasEl;
    if (!canvas || !contenedor) return;
    const rect = contenedor.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const dpr = window.devicePixelRatio || 1;
    const ancho = Math.max(1, Math.round(rect.width * dpr));
    const alto = Math.max(1, Math.round(rect.height * dpr));
    if (canvas.width !== ancho || canvas.height !== alto) {
      canvas.width = ancho;
      canvas.height = alto;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, ancho, alto);

    const { cols, rows } = editor.model;
    const contenido = rect.width * editor.zoom;
    const izq = (rect.width - contenido) / 2 + editor.panX;
    const arriba = (rect.height - contenido) / 2 + editor.panY;
    const pasoCss = contenido / cols;
    const datos = editor.model.snapshot();
    const aX = (i) => Math.round((izq + i * pasoCss) * dpr);
    const aY = (j) => Math.round((arriba + j * pasoCss) * dpr);
    const vacio = (i, j) => datos[(j * cols + i) * 4 + 3] === 0;

    for (let j = 0; j < rows; j++) {
      const y0 = aY(j);
      const y1 = aY(j + 1);
      if (y1 <= y0) continue;
      for (let i = 0; i < cols; i++) {
        if (vacio(i, j)) continue;
        const x0 = aX(i);
        const x1 = aX(i + 1);
        if (x1 <= x0) continue;
        const off = (j * cols + i) * 4;
        ctx.fillStyle = `rgba(${datos[off]},${datos[off + 1]},${datos[off + 2]},${
          datos[off + 3] / 255
        })`;
        ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
      }
    }

    if (editor.mostrarCuadricula) {
      ctx.fillStyle = GRID_COLOR;
      for (let i = 0; i <= cols; i++) {
        const bx = aX(i);
        for (let j = 0; j < rows; j++) {
          const conDer = i < cols && vacio(i, j);
          const conIzq = i > 0 && vacio(i - 1, j);
          if (!conDer && !conIzq) continue;
          ctx.fillRect(bx, aY(j), 1, Math.max(1, aY(j + 1) - aY(j)));
        }
      }
      for (let j = 0; j <= rows; j++) {
        const by = aY(j);
        for (let i = 0; i < cols; i++) {
          const conAbajo = j < rows && vacio(i, j);
          const conArriba = j > 0 && vacio(i, j - 1);
          if (!conAbajo && !conArriba) continue;
          ctx.fillRect(aX(i), by, Math.max(1, aX(i + 1) - aX(i)), 1);
        }
      }
    }

    if (
      editor.herramienta === "linea" &&
      previsualizando &&
      lineaInicio &&
      lineaFin
    ) {
      ctx.fillStyle = editor.colorActual;
      ctx.globalAlpha = 0.5;
      for (const [x, y] of lineaPuntos(lineaInicio.x, lineaInicio.y, lineaFin.x, lineaFin.y)) {
        if (x < 0 || y < 0 || x >= cols || y >= rows) continue;
        ctx.fillRect(
          aX(x),
          aY(y),
          Math.max(1, aX(x + 1) - aX(x)),
          Math.max(1, aY(y + 1) - aY(y)),
        );
      }
      ctx.globalAlpha = 1;
    }
  }

  $effect(() => {
    dibujar();
  });

  $effect(() => {
    const el = contenedor;
    if (!el || typeof ResizeObserver === "undefined") return;
    const obs = new ResizeObserver(() => dibujar());
    obs.observe(el);
    return () => obs.disconnect();
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
  bind:this={contenedor}
  class="relative w-full overflow-hidden"
  style:max-width="min(100%, 512px)"
  style:aspect-ratio="1 / 1"
>
  <canvas
    bind:this={canvasEl}
    class="block h-full w-full select-none touch-none"
    style:background-color="#ffffff"
    onpointerdown={onPointerDown}
    onpointermove={onPointerMove}
    onpointerup={onPointerUp}
    onpointercancel={onPointerUp}
    onpointerleave={onPointerUp}
  ></canvas>
</div>