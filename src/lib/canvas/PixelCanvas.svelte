<script>
  import { editor } from "../stores/editor.svelte.js";
  import { history } from "../stores/history.svelte.js";

  let canvasEl;
  let ctx;
  let gridEl;
  let gridCtx;
  let viewportEl;
  let baseW = $state(400);
  let baseH = $state(400);
  let zoom = $state(1);
  let panX = $state(0);
  let panY = $state(0);
  let isPanning = $state(false);
  let lastPanX = 0;
  let lastPanY = 0;
  let pinchDist = 0;

  let zoomedW = $derived(Math.floor(baseW * zoom));
  let zoomedH = $derived(Math.floor(baseH * zoom));

  function calcBaseSize() {
    if (typeof window === "undefined") return { w: 400, h: 400 };
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const maxW = Math.min(vw - 32, 700);
    const maxH = vh - 260;
    const aspect = editor.gridCols / editor.gridRows;
    let w, h;
    if (aspect >= 1) {
      w = Math.min(maxW, maxH * aspect);
      h = w / aspect;
    } else {
      h = Math.min(maxH, maxW / aspect);
      w = h * aspect;
    }
    w = Math.max(180, Math.floor(w));
    h = Math.max(180, Math.floor(h));
    return { w, h };
  }

  function initCanvas() {
    if (!canvasEl) return;

    const size = calcBaseSize();
    baseW = size.w;
    baseH = size.h;
    zoom = 1;
    panX = 0;
    panY = 0;

    ctx = canvasEl.getContext("2d", { willReadFrequently: true });
    gridCtx = gridEl.getContext("2d");

    ctx.imageSmoothingEnabled = false;
    gridCtx.imageSmoothingEnabled = false;

    canvasEl.width = editor.gridCols;
    canvasEl.height = editor.gridRows;
    gridEl.width = editor.gridCols;
    gridEl.height = editor.gridRows;

    drawGrid();
    saveState();
  }

  $effect(() => {
    const _ = editor.gridCols;
    const __ = editor.gridRows;
    initCanvas();
  });

  $effect(() => {
    const _ = editor.showGrid;
    if (gridEl) {
      gridEl.style.display = editor.showGrid ? "block" : "none";
    }
  });

  $effect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => {
      const size = calcBaseSize();
      if (Math.abs(size.w - baseW) > 20) {
        baseW = size.w;
        baseH = size.h;
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  });

  $effect(() => {
    const _ = editor.canvasVersion;
    if (!ctx || !canvasEl) return;

    if (editor.pendingImageData) {
      ctx.putImageData(editor.pendingImageData, 0, 0);
      editor.pendingImageData = null;
    } else if (editor.pendingClear) {
      ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
      const imageData = ctx.getImageData(0, 0, canvasEl.width, canvasEl.height);
      history.push(imageData);
      editor.pendingClear = false;
    } else if (editor.pendingExport) {
      doExport();
      editor.pendingExport = false;
    }
  });

  function doExport() {
    if (!canvasEl) return;
    if (editor.exportWidth > 0 && editor.exportHeight > 0) {
      const tmp = document.createElement("canvas");
      tmp.width = editor.exportWidth;
      tmp.height = editor.exportHeight;
      const tmpCtx = tmp.getContext("2d");
      tmpCtx.imageSmoothingEnabled = false;
      tmpCtx.drawImage(canvasEl, 0, 0, editor.exportWidth, editor.exportHeight);
      const link = document.createElement("a");
      link.href = tmp.toDataURL("image/png");
      link.download = "pixel_art_print.png";
      link.click();
    } else {
      const link = document.createElement("a");
      link.href = canvasEl.toDataURL();
      link.download = "pixel_art.png";
      link.click();
    }
  }

  function saveState() {
    if (!ctx || !canvasEl) return;
    const imageData = ctx.getImageData(0, 0, canvasEl.width, canvasEl.height);
    history.push(imageData);
  }

  function drawGrid() {
    if (!gridCtx || !gridEl) return;
    const w = gridEl.width;
    const h = gridEl.height;

    gridCtx.clearRect(0, 0, w, h);
    gridCtx.beginPath();
    gridCtx.strokeStyle = "rgba(200,200,200,0.6)";
    gridCtx.lineWidth = 0.05;

    for (let x = 0; x <= w; x++) {
      gridCtx.moveTo(x, 0);
      gridCtx.lineTo(x, h);
    }
    for (let y = 0; y <= h; y++) {
      gridCtx.moveTo(0, y);
      gridCtx.lineTo(w, y);
    }
    gridCtx.stroke();
  }

  function getPixelCoords(clientX, clientY) {
    const rect = canvasEl.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const scaleX = canvasEl.width / rect.width;
    const scaleY = canvasEl.height / rect.height;
    const px = Math.floor(x * scaleX);
    const py = Math.floor(y * scaleY);
    return { px, py };
  }

  function drawPixel(px, py) {
    if (!ctx) return;
    if (px < 0 || px >= editor.gridCols || py < 0 || py >= editor.gridRows) return;
    if (editor.eraseMode) {
      ctx.clearRect(px, py, 1, 1);
    } else {
      ctx.fillStyle = editor.activeColor;
      ctx.fillRect(px, py, 1, 1);
    }
  }

  function clampPan() {
    if (!viewportEl) return;
    const vw = viewportEl.clientWidth;
    const vh = viewportEl.clientHeight;
    const maxX = Math.max(0, (zoomedW - vw) / 2);
    const maxY = Math.max(0, (zoomedH - vh) / 2);
    panX = Math.max(-maxX, Math.min(maxX, panX));
    panY = Math.max(-maxY, Math.min(maxY, panY));
  }

  function handleWheel(e) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.15 : 0.15;
    zoom = Math.max(0.5, Math.min(5, zoom + delta));
    clampPan();
  }

  function handleMouseDown(e) {
    if (e.button === 1 || (e.button === 0 && zoom > 1 && e.shiftKey)) {
      isPanning = true;
      lastPanX = e.clientX;
      lastPanY = e.clientY;
      return;
    }
    if (e.button === 2) return;
    editor.isDrawing = true;
    const { px, py } = getPixelCoords(e.clientX, e.clientY);
    drawPixel(px, py);
  }

  function handleMouseMove(e) {
    if (isPanning) {
      panX += e.clientX - lastPanX;
      panY += e.clientY - lastPanY;
      lastPanX = e.clientX;
      lastPanY = e.clientY;
      clampPan();
      return;
    }
    if (!editor.isDrawing) return;
    const { px, py } = getPixelCoords(e.clientX, e.clientY);
    drawPixel(px, py);
  }

  function handleMouseUp() {
    if (isPanning) {
      isPanning = false;
      return;
    }
    if (editor.isDrawing) {
      editor.isDrawing = false;
      saveState();
    }
  }

  function handleClick(e) {
    if (zoom > 1) return;
    const { px, py } = getPixelCoords(e.clientX, e.clientY);
    drawPixel(px, py);
    saveState();
  }

  function handleTouchStart(e) {
    if (e.touches.length === 2) {
      e.preventDefault();
      editor.isDrawing = false;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchDist = Math.hypot(dx, dy);
      lastPanX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      lastPanY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      return;
    }
    e.preventDefault();
    editor.isDrawing = true;
    const touch = e.touches[0];
    const { px, py } = getPixelCoords(touch.clientX, touch.clientY);
    drawPixel(px, py);
  }

  function handleTouchMove(e) {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;

      if (pinchDist > 0) {
        const scale = dist / pinchDist;
        zoom = Math.max(0.5, Math.min(5, zoom * scale));
        panX += midX - lastPanX;
        panY += midY - lastPanY;
        clampPan();
      }

      pinchDist = dist;
      lastPanX = midX;
      lastPanY = midY;
      return;
    }
    e.preventDefault();
    if (!editor.isDrawing) return;
    const touch = e.touches[0];
    const { px, py } = getPixelCoords(touch.clientX, touch.clientY);
    drawPixel(px, py);
  }

  function handleTouchEnd(e) {
    e.preventDefault();
    if (e.touches.length < 2) {
      pinchDist = 0;
    }
    if (editor.isDrawing) {
      editor.isDrawing = false;
      saveState();
    }
  }

  function handleContextMenu(e) {
    e.preventDefault();
    editor.eraseMode = !editor.eraseMode;
  }

  function zoomIn() {
    zoom = Math.min(5, zoom + 0.25);
    clampPan();
  }

  function zoomOut() {
    zoom = Math.max(0.5, zoom - 0.25);
    clampPan();
  }

  function zoomReset() {
    zoom = 1;
    panX = 0;
    panY = 0;
  }
</script>

<div class="flex flex-col items-center gap-1.5 mb-2">
  <div class="flex items-center gap-1.5">
    <button
      onclick={zoomOut}
      class="w-7 h-7 rounded bg-surface-lighter hover:bg-brand text-sm font-bold flex items-center justify-center cursor-pointer"
    >
      −
    </button>
    <button
      onclick={zoomReset}
      class="px-2 py-1 rounded bg-surface-lighter hover:bg-brand text-[10px] font-medium cursor-pointer min-w-[48px] text-center"
    >
      {Math.round(zoom * 100)}%
    </button>
    <button
      onclick={zoomIn}
      class="w-7 h-7 rounded bg-surface-lighter hover:bg-brand text-sm font-bold flex items-center justify-center cursor-pointer"
    >
      +
    </button>
  </div>
</div>

<div
  bind:this={viewportEl}
  class="relative select-none border border-gray-600 bg-white overflow-hidden shrink-0"
  style="width: {Math.min(baseW, window?.innerWidth - 32 || 700)}px; height: {Math.min(baseH, (window?.innerHeight - 260) || 400)}px; touch-action: none;"
  onwheel={handleWheel}
>
  <div
    class="absolute"
    style="width: {zoomedW}px; height: {zoomedH}px; left: 50%; top: 50%; transform: translate(-50%, -50%) translate({panX}px, {panY}px); image-rendering: pixelated;"
  >
    <canvas
      bind:this={canvasEl}
      width={editor.gridCols}
      height={editor.gridRows}
      class="absolute top-0 left-0 z-10"
      style="cursor: {editor.eraseMode ? 'auto' : zoom > 1 ? (isPanning ? 'grabbing' : 'grab') : 'crosshair'}; width: {zoomedW}px; height: {zoomedH}px; touch-action: none; image-rendering: pixelated; image-rendering: crisp-edges;"
      onmousedown={handleMouseDown}
      onmousemove={handleMouseMove}
      onmouseup={handleMouseUp}
      onmouseleave={handleMouseUp}
      onclick={handleClick}
      ontouchstart={handleTouchStart}
      ontouchmove={handleTouchMove}
      ontouchend={handleTouchEnd}
      oncontextmenu={handleContextMenu}
    ></canvas>
    <canvas
      bind:this={gridEl}
      width={editor.gridCols}
      height={editor.gridRows}
      class="absolute top-0 left-0 z-0 pointer-events-none"
      style="width: {zoomedW}px; height: {zoomedH}px; image-rendering: pixelated; image-rendering: crisp-edges;"
    ></canvas>
  </div>
</div>
