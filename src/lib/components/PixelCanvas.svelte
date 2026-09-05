<script>
  import { GRID_COLOR, GRID_ALPHA } from "../canvas/draw.js";
  import { editor } from "../stores/editor.svelte.js";
  import { linePoints } from "../models/Canvas.js";

  let canvasEl = $state();
  let container = $state();
  let painting = $state(false);
  let lineStart = $state(null);
  let lineEnd = $state(null);
  let previewing = $state(false);
  let touchStartCell = $state(null);
  let touchStartTime = $state(0);
  let touchStartPos = $state(null);
  let touchDelayTimer;
  const pointers = new Map();

  const TOUCH_GRACE_MS = 120;
  const TOUCH_SLOP_PX = 6;
  let pinch = null;
  let panActive = false;
  let lastPan = null;
  let hintVisible = $state(false);
  let hintTimer;
  let prevZoomLevel = null;
  const isTouch =
    typeof window !== "undefined" && !!window.matchMedia?.("(pointer: coarse)").matches;

  function draw() {
    void editor.version;
    const canvas = canvasEl;
    if (!canvas || !container) return;
    const rect = container.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const dpr = window.devicePixelRatio || 1;
    const width = Math.max(1, Math.round(rect.width * dpr));
    const height = Math.max(1, Math.round(rect.height * dpr));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, width, height);

    const { cols, rows } = editor.model;
    const contentWidth = rect.width * editor.zoom;
    const contentHeight = rect.height * editor.zoom;
    const left = (rect.width - contentWidth) / 2 + editor.panX;
    const top = (rect.height - contentHeight) / 2 + editor.panY;
    const stepCssX = contentWidth / cols;
    const stepCssY = contentHeight / rows;
    const data = editor.model.snapshot();
    const aX = (i) => Math.round((left + i * stepCssX) * dpr);
    const aY = (j) => Math.round((top + j * stepCssY) * dpr);
    const isEmpty = (i, j) => data[(j * cols + i) * 4 + 3] === 0;

    for (let j = 0; j < rows; j++) {
      const y0 = aY(j);
      const y1 = aY(j + 1);
      if (y1 <= y0) continue;
      for (let i = 0; i < cols; i++) {
        if (isEmpty(i, j)) continue;
        const x0 = aX(i);
        const x1 = aX(i + 1);
        if (x1 <= x0) continue;
        const off = (j * cols + i) * 4;
        ctx.fillStyle = `rgba(${data[off]},${data[off + 1]},${data[off + 2]},${
          data[off + 3] / 255
        })`;
        ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
      }
    }

    if (editor.showGrid) {
      ctx.globalAlpha = GRID_ALPHA;
      ctx.fillStyle = GRID_COLOR;
      const thickness = Math.max(1, Math.round(dpr));
      const y0 = aY(0);
      const y1 = aY(rows);
      for (let i = 0; i <= cols; i++) {
        ctx.fillRect(aX(i), y0, thickness, y1 - y0);
      }
      for (let j = 0; j <= rows; j++) {
        const by = aY(j);
        for (let i = 0; i < cols; i++) {
          const sx = aX(i) + thickness;
          const ex = aX(i + 1);
          if (ex <= sx) continue;
          ctx.fillRect(sx, by, ex - sx, thickness);
        }
      }
      ctx.globalAlpha = 1;
    }

    if (
      editor.tool === "line" &&
      previewing &&
      lineStart &&
      lineEnd
    ) {
      ctx.fillStyle = editor.currentColor;
      ctx.globalAlpha = 0.5;
      for (const [x, y] of linePoints(lineStart.x, lineStart.y, lineEnd.x, lineEnd.y)) {
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
    draw();
  });

  $effect(() => {
    const el = container;
    if (!el || typeof ResizeObserver === "undefined") return;
    const obs = new ResizeObserver(() => draw());
    obs.observe(el);
    return () => obs.disconnect();
  });

  $effect(() => {
    const nivel = editor.zoom > 1 ? 1 : 0;
    if (nivel === prevZoomLevel) return;
    prevZoomLevel = nivel;
    clearTimeout(hintTimer);
    if (nivel === 1) {
      hintVisible = true;
      hintTimer = setTimeout(() => {
        hintVisible = false;
      }, 3000);
    } else {
      hintVisible = false;
    }
  });

  $effect(() => () => clearTimeout(hintTimer));

  function cellFromEvent(event) {
    const rect = canvasEl.getBoundingClientRect();
    const contentWidth = rect.width * editor.zoom;
    const contentHeight = rect.height * editor.zoom;
    const left = (rect.width - contentWidth) / 2 + editor.panX;
    const top = (rect.height - contentHeight) / 2 + editor.panY;
    const x = Math.floor(((event.clientX - rect.left - left) / contentWidth) * editor.model.cols);
    const y = Math.floor(((event.clientY - rect.top - top) / contentHeight) * editor.model.rows);
    if (x < 0 || y < 0 || x >= editor.model.cols || y >= editor.model.rows) return null;
    return { x, y };
  }

function panLimits() {
  const base = canvasEl.clientWidth;
  if (base === 0) return { maxX: Infinity, maxY: Infinity };
  const excess = (base * editor.zoom - base) / 2;
  return { maxX: excess, maxY: excess };
}

function applyToolToCell(cell) {
  switch (editor.tool) {
    case "eraser":
      editor.erasePixel(cell.x, cell.y);
      break;
    case "fill":
      editor.floodFill(cell.x, cell.y);
      break;
    default:
      editor.paintPixel(cell.x, cell.y);
  }
}

function clearTouchDelay() {
  clearTimeout(touchDelayTimer);
  touchDelayTimer = undefined;
}

function startTouchAction() {
  if (!touchStartCell) return;
  painting = true;
  editor.beginAction();
  if (editor.tool === "line") {
    lineStart = touchStartCell;
    lineEnd = touchStartCell;
    previewing = true;
  } else {
    applyToolToCell(touchStartCell);
  }
  touchStartCell = null;
  touchStartTime = 0;
  touchStartPos = null;
}

function scheduleTouchAction() {
  clearTouchDelay();
  touchDelayTimer = setTimeout(() => {
    startTouchAction();
  }, TOUCH_GRACE_MS);
}

function applyPinch() {
  const [a, b] = [...pointers.values()];
  if (!a || !b) return;
  const dist = Math.hypot(b.x - a.x, b.y - a.y);
  if (dist === 0 || !pinch) return;
  editor.setZoom(pinch.initialZoom * (dist / pinch.initialDistance));

  const midX = (a.x + b.x) / 2;
  const midY = (a.y + b.y) / 2;
  const { maxX, maxY } = panLimits();
  editor.panBy(midX - pinch.initialMidX, midY - pinch.initialMidY, maxX, maxY);
  pinch.initialMidX = midX;
  pinch.initialMidY = midY;
}

function onPointerDown(event) {
  if (event.ctrlKey || event.metaKey) {
    panActive = true;
    lastPan = { x: event.clientX, y: event.clientY };
    if (canvasEl && canvasEl.setPointerCapture) {
      try {
        canvasEl.setPointerCapture(event.pointerId);
      } catch {
        /* noop */
      }
    }
    return;
  }

  pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

  if (pointers.size === 2) {
    if (painting) {
      editor.endAction();
      painting = false;
      previewing = false;
      lineStart = null;
      lineEnd = null;
    }
    clearTouchDelay();
    touchStartCell = null;
    touchStartTime = 0;
    touchStartPos = null;
    const [a, b] = [...pointers.values()];
    const midX = (a.x + b.x) / 2;
    const midY = (a.y + b.y) / 2;
    pinch = {
      initialDistance: Math.hypot(b.x - a.x, b.y - a.y),
      initialZoom: editor.zoom,
      initialMidX: midX,
      initialMidY: midY,
    };
    return;
  }

  const cell = cellFromEvent(event);
  if (!cell) return;

  if (event.pointerType === "touch") {
    touchStartCell = cell;
    touchStartTime = Date.now();
    touchStartPos = { x: event.clientX, y: event.clientY };
    scheduleTouchAction();
    return;
  }

  painting = true;
  editor.beginAction();
  switch (editor.tool) {
    case "line":
      lineStart = cell;
      lineEnd = cell;
      previewing = true;
      break;
    default:
      applyToolToCell(cell);
  }
}

function onPointerMove(event) {
  if (panActive && lastPan) {
    const { maxX, maxY } = panLimits();
    editor.panBy(event.clientX - lastPan.x, event.clientY - lastPan.y, maxX, maxY);
    lastPan = { x: event.clientX, y: event.clientY };
    return;
  }

  if (pointers.set(event.pointerId, { x: event.clientX, y: event.clientY }) && pinch) {
    applyPinch();
    return;
  }

  if (touchStartCell) {
    if (touchStartPos) {
      const dx = event.clientX - touchStartPos.x;
      const dy = event.clientY - touchStartPos.y;
      if (Math.hypot(dx, dy) > TOUCH_SLOP_PX) {
        clearTouchDelay();
        startTouchAction();
      }
    }
  }

  if (!painting) return;
  const cell = cellFromEvent(event);
  if (!cell) return;
  switch (editor.tool) {
    case "line":
      lineEnd = cell;
      break;
    default:
      applyToolToCell(cell);
  }
}

function onPointerUp(event) {
  if (panActive) {
    panActive = false;
    lastPan = null;
    if (canvasEl && canvasEl.releasePointerCapture) {
      try {
        canvasEl.releasePointerCapture(event.pointerId);
      } catch {
        /* noop */
      }
    }
    return;
  }

  pointers.delete(event.pointerId);

  if (pinch) {
    if (pointers.size < 2) {
      pinch = null;
      pointers.clear();
      painting = false;
      previewing = false;
      lineStart = null;
      lineEnd = null;
      touchStartCell = null;
      touchStartTime = 0;
      touchStartPos = null;
      clearTouchDelay();
    }
    return;
  }

  if (touchStartCell) {
    clearTouchDelay();
    editor.beginAction();
    if (editor.tool === "line") {
      editor.drawLine(touchStartCell.x, touchStartCell.y, touchStartCell.x, touchStartCell.y);
    } else {
      applyToolToCell(touchStartCell);
    }
    editor.endAction();
    touchStartCell = null;
    touchStartTime = 0;
    touchStartPos = null;
    return;
  }

  painting = false;
  if (editor.tool === "line" && previewing && lineStart && lineEnd) {
    editor.drawLine(lineStart.x, lineStart.y, lineEnd.x, lineEnd.y);
  }
  editor.endAction();
  previewing = false;
  lineStart = null;
  lineEnd = null;
}

function onWheel(event) {
  if (!event.ctrlKey) return;
  event.preventDefault();

  const rect = canvasEl.getBoundingClientRect();
  const cursorX = event.clientX - rect.left;
  const cursorY = event.clientY - rect.top;

  const oldZoom = editor.zoom;
  const oldContentWidth = rect.width * oldZoom;
  const oldContentHeight = rect.height * oldZoom;
  const oldLeft = (rect.width - oldContentWidth) / 2 + editor.panX;
  const oldTop = (rect.height - oldContentHeight) / 2 + editor.panY;

  const modelX = (cursorX - oldLeft) / oldContentWidth;
  const modelY = (cursorY - oldTop) / oldContentHeight;

  if (event.deltaY < 0) {
    editor.zoomIn();
  } else if (event.deltaY > 0) {
    editor.zoomOut();
  }

  const newZoom = editor.zoom;
  const newContentWidth = rect.width * newZoom;
  const newContentHeight = rect.height * newZoom;
  const newLeft = (rect.width - newContentWidth) / 2;
  const newTop = (rect.height - newContentHeight) / 2;

  const newPanX = cursorX - newLeft - modelX * newContentWidth;
  const newPanY = cursorY - newTop - modelY * newContentHeight;

  const { maxX, maxY } = panLimits();
  editor.panX = Math.min(maxX, Math.max(-maxX, newPanX));
  editor.panY = Math.min(maxY, Math.max(-maxY, newPanY));
}
</script>

<div
  bind:this={container}
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
    onwheel={onWheel}
  ></canvas>
  <div
    data-pan-hint
    aria-hidden={!hintVisible}
    class="pointer-events-none absolute left-1/2 top-2 z-10 -translate-x-1/2 select-none rounded-full bg-neutral-900/85 px-3 py-1.5 text-center text-xs text-white shadow transition-opacity duration-300
      {hintVisible ? 'opacity-100' : 'opacity-0'}"
  >
    {isTouch ? "Pan with two fingers · Pinch to zoom" : "Move with Ctrl + drag · Zoom with Ctrl + wheel or + / −"}
  </div>
</div>
