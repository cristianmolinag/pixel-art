<script>
  import { editor, PALETA } from "../stores/editor.svelte.js";
  import { normalizeHex, hexToRgb, hexToHsv, hsvToHex } from "../services/colors.js";
  import Check from "@lucide/svelte/icons/check";
  import Clock from "@lucide/svelte/icons/clock";

  const SV_SIZE = 256;

  function contrastColor(hex) {
    const rgb = hexToRgb(hex);
    if (!rgb) return "#ffffff";
    const luminance = (299 * rgb.r + 587 * rgb.g + 114 * rgb.b) / 1000;
    return luminance >= 150 ? "#1a1a2e" : "#ffffff";
  }

  let hexInput = $state(editor.currentColor);
  let open = $state(false);
  let hue = $state(0);
  let sat = $state(1);
  let val = $state(1);
  let svCanvas = $state(undefined);
  let hueBar = $state(undefined);
  let dragging = $state(false);
  let draggingHue = $state(false);
  let paletteScroll = $state(undefined);
  let scrollDragging = $state(false);
  let scrollStartX = $state(0);
  let scrollStartLeft = $state(0);
  let scrollMax = $state(0);
  let scrollMoved = $state(false);
  let recentOpen = $state(false);
  let recentRef = $state(undefined);

  function syncPicker() {
    const hsv = hexToHsv(editor.currentColor);
    if (!hsv) return;
    hue = hsv.h;
    sat = hsv.s === 0 ? 1 : hsv.s;
    val = hsv.v === 0 ? 1 : hsv.v;
  }

  function applyHex() {
    const norm = normalizeHex(hexInput);
    if (norm) {
      editor.selectColor(norm);
      syncPicker();
    }
    hexInput = editor.currentColor;
  }

  function applyFromPicker() {
    editor.selectColor(hsvToHex(hue, sat, val));
    hexInput = editor.currentColor;
  }

  function isCurrentColor(color) {
    return editor.currentColor.toLowerCase() === color.toLowerCase();
  }

  function togglePicker() {
    if (!open) syncPicker();
    open = !open;
  }

  function closePicker() {
    open = false;
    dragging = false;
  }

  function paintSVArea() {
    if (!svCanvas) return;
    const ctx = svCanvas.getContext("2d");
    if (!ctx) return;
    const w = svCanvas.width;
    const h = svCanvas.height;
    const base = hexToRgb(hsvToHex(hue, 1, 1));
    if (!base) return;

    ctx.fillStyle = `rgb(${base.r}, ${base.g}, ${base.b})`;
    ctx.fillRect(0, 0, w, h);

    const white = ctx.createLinearGradient(0, 0, w, 0);
    white.addColorStop(0, "#ffffff");
    white.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = white;
    ctx.fillRect(0, 0, w, h);

    const black = ctx.createLinearGradient(0, 0, 0, h);
    black.addColorStop(0, "rgba(0,0,0,0)");
    black.addColorStop(1, "#000000");
    ctx.fillStyle = black;
    ctx.fillRect(0, 0, w, h);
  }

  $effect(() => {
    if (open) paintSVArea();
  });

  function positionFromEvent(e) {
    if (!svCanvas) return;
    const rect = svCanvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    sat = Math.min(1, Math.max(0, x));
    val = Math.min(1, Math.max(0, 1 - y));
  }

  function onSVPointerDown(e) {
    dragging = true;
    if (svCanvas && svCanvas.setPointerCapture) {
      try {
        svCanvas.setPointerCapture(e.pointerId);
      } catch {
        /* noop */
      }
    }
    positionFromEvent(e);
    applyFromPicker();
  }

  function onSVPointerMove(e) {
    if (!dragging) return;
    positionFromEvent(e);
    applyFromPicker();
  }

  function onSVPointerUp(e) {
    dragging = false;
    if (svCanvas && svCanvas.releasePointerCapture) {
      try {
        svCanvas.releasePointerCapture(e.pointerId);
      } catch {
        /* noop */
      }
    }
  }

  function huePositionFromEvent(e) {
    if (!hueBar) return;
    const rect = hueBar.getBoundingClientRect();
    if (rect.width === 0) return;
    const x = (e.clientX - rect.left) / rect.width;
    hue = Math.round(Math.min(1, Math.max(0, x)) * 360);
    applyFromPicker();
  }

  function onHuePointerDown(e) {
    draggingHue = true;
    if (hueBar && hueBar.setPointerCapture) {
      try {
        hueBar.setPointerCapture(e.pointerId);
      } catch {
        /* noop */
      }
    }
    huePositionFromEvent(e);
  }

  function onHuePointerMove(e) {
    if (!draggingHue) return;
    huePositionFromEvent(e);
  }

  function onHuePointerUp(e) {
    draggingHue = false;
    if (hueBar && hueBar.releasePointerCapture) {
      try {
        hueBar.releasePointerCapture(e.pointerId);
      } catch {
        /* noop */
      }
    }
  }

  function onHueKeyDown(e) {
    if (e.key === "Home") {
      hue = 0;
    } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      hue = (hue + 1) % 360;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      hue = (hue - 1 + 360) % 360;
    } else {
      return;
    }
    e.preventDefault();
    applyFromPicker();
  }

  function onPaletaPointerDown(e) {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    scrollDragging = true;
    scrollStartX = e.clientX;
    scrollStartLeft = paletteScroll ? paletteScroll.scrollLeft : 0;
    scrollMax = 0;
    scrollMoved = false;
  }

  function onPaletteWheel(e) {
    if (!paletteScroll) return;
    e.preventDefault();
    paletteScroll.scrollLeft += e.deltaY + (e.deltaX || 0);
  }

  function onHueWheel(e) {
    e.preventDefault();
    hue = (hue + (e.deltaY < 0 ? 1 : -1) + 360) % 360;
    applyFromPicker();
  }

  function nonPassiveWheel(node, handler) {
    node.addEventListener("wheel", handler, { passive: false });
    return {
      destroy() {
        node.removeEventListener("wheel", handler);
      },
    };
  }
</script>

{#snippet recentSwatches()}
  {#each editor.recentColors as color (color)}
    <button
      type="button"
      aria-label="Recent color {color}"
      class="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded transition hover:scale-105"
      style:background-color={color}
      onclick={() => {
        editor.selectColor(color);
        recentOpen = false;
      }}
    >
      {#if isCurrentColor(color)}
        <Check size={10} strokeWidth={3} color={contrastColor(color)} class="pointer-events-none" />
      {/if}
    </button>
  {/each}
{/snippet}

<div class="w-full min-w-0">
  <div class="flex w-full min-w-0 items-center gap-4">
  <div class="flex min-w-0 flex-1 items-center gap-2">
    <button
      type="button"
      aria-label="Choose custom color"
      title="Choose custom color"
      aria-expanded={open}
      aria-haspopup="dialog"
      class="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition
        {open ? 'scale-110' : 'hover:scale-105'}"
      style:background-color={editor.currentColor}
      onclick={togglePicker}
    >
      <Check size={16} strokeWidth={3} color={contrastColor(editor.currentColor)} class="pointer-events-none" />
    </button>

    <span class="mx-1 h-6 w-px shrink-0 bg-white/20" aria-hidden="true"></span>

    <div class="relative min-w-0 flex-1">
      <div
        bind:this={paletteScroll}
        role="region"
        aria-label="Color palette"
        class="scrollbar-invisible palette-mask w-full cursor-grab touch-pan-x select-none snap-x snap-proximity items-center gap-2 overflow-x-auto overflow-y-hidden active:cursor-grabbing flex px-2"
        style="-webkit-overflow-scrolling: touch; scroll-padding-inline: 0.5rem"
        onpointerdown={onPaletaPointerDown}
        use:nonPassiveWheel={onPaletteWheel}
      >
        {#each PALETA as color}
          <button
            type="button"
            aria-label="Color {color}"
            class="flex h-8 w-8 shrink-0 cursor-pointer snap-start items-center justify-center rounded-md transition hover:scale-105"
            style:background-color={color}
            onclick={() => {
              if (scrollMoved) return;
              editor.selectColor(color);
            }}
          >
            {#if isCurrentColor(color)}
              <Check size={14} strokeWidth={3} color={contrastColor(color)} class="pointer-events-none" />
            {/if}
          </button>
        {/each}
    </div>
  </div>
  </div>

  <div class="hidden shrink-0 items-center gap-2 lg:flex">
    <span class="text-xs uppercase tracking-wide text-white/50">Recent colors</span>
    {#if editor.recentColors.length > 0}
      {@render recentSwatches()}
    {:else}
      <span class="text-xs text-white/40">No recent colors yet</span>
    {/if}
  </div>

  {#if editor.recentColors.length > 0}
    <div bind:this={recentRef} class="relative shrink-0 lg:hidden">
      <button
        type="button"
        aria-label="Show recent colors"
        title="Recent colors"
        aria-expanded={recentOpen}
        aria-haspopup="dialog"
        class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md text-white/60 transition hover:bg-white/10 hover:text-white"
        onclick={() => (recentOpen = !recentOpen)}
      >
        <Clock size={18} />
      </button>

      {#if recentOpen}
        <div
          role="dialog"
          aria-label="Recent colors"
          class="absolute bottom-full right-0 mb-2 w-max max-w-[80vw] rounded-xl bg-surface-lighter p-3 shadow-xl ring-1 ring-white/10"
        >
          <span class="mb-2 block text-xs uppercase tracking-wide text-white/50">Recent colors</span>
          <div class="flex flex-wrap items-center gap-2">
            {@render recentSwatches()}
          </div>
        </div>
      {/if}
    </div>
  {/if}

  </div>

  {#if open}
    <div
      role="button"
      tabindex="-1"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onclick={(e) => {
        if (e.target === e.currentTarget) closePicker();
      }}
      onkeydown={(e) => {
        if (e.key === "Escape") closePicker();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Custom color picker"
        class="w-full max-w-sm rounded-2xl bg-surface-light p-4 shadow-xl"
      >
        <h2 class="mb-3 text-lg font-bold text-white">Custom color</h2>

        <div class="relative aspect-square w-full">
          <canvas
            bind:this={svCanvas}
            width={SV_SIZE}
            height={SV_SIZE}
            aria-label="Saturation and lightness area"
            class="h-full w-full cursor-crosshair touch-none rounded-lg border border-white/20"
            onpointerdown={onSVPointerDown}
            onpointermove={onSVPointerMove}
            onpointerup={onSVPointerUp}
          ></canvas>
          <div
            class="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white shadow-md"
            style:left={sat * 100 + "%"}
            style:top={(1 - val) * 100 + "%"}
          ></div>
        </div>

        <div
          role="slider"
          tabindex="0"
          aria-label="Color hue"
          aria-valuemin="0"
          aria-valuemax="360"
          aria-valuenow={Math.round(hue)}
          bind:this={hueBar}
          class="relative mt-4 h-6 w-full cursor-pointer touch-none rounded-full ring-2 ring-white/15 outline-none focus-visible:ring-brand"
          style="background: linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00);"
          use:nonPassiveWheel={onHueWheel}
          onpointerdown={onHuePointerDown}
          onpointermove={onHuePointerMove}
          onpointerup={onHuePointerUp}
          onkeydown={onHueKeyDown}
        >
          <div
            class="pointer-events-none absolute top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white shadow-md"
            style:left={hue / 3.6 + "%"}
            style:background-color={hsvToHex(hue, 1, 1)}
          ></div>
        </div>

        <div class="mt-4 flex w-full items-center gap-2">
          <span
            class="h-6 w-6 shrink-0 rounded-full border border-white/30"
            aria-hidden="true"
            style:background-color={editor.currentColor}
          ></span>
          <input
            type="text"
            aria-label="Color hex code"
            title="Color hex code (e.g. #ff0000)"
            placeholder="#rrggbb"
            spellcheck="false"
            class="h-9 w-full rounded-md border-2 border-white/20 bg-surface px-2 text-sm text-white outline-none transition focus:border-brand"
            value={hexInput}
            oninput={(e) => (hexInput = e.currentTarget.value)}
            onkeydown={(e) => e.key === "Enter" && applyHex()}
            onblur={applyHex}
          />
        </div>
      </div>
    </div>
  {/if}
</div>

<svelte:window
  onpointermove={(e) => {
    if (!scrollDragging || !paletteScroll) return;
    const dx = scrollStartX - e.clientX;
    paletteScroll.scrollLeft = scrollStartLeft + dx;
    scrollMax = Math.max(
      scrollMax,
      Math.abs(paletteScroll.scrollLeft - scrollStartLeft),
    );
  }}
  onpointerup={() => {
    if (!scrollDragging) return;
    scrollDragging = false;
    if (scrollMax > 3) scrollMoved = true;
    setTimeout(() => {
      scrollMoved = false;
    }, 0);
  }}
  onkeydown={(e) => {
    if (e.key !== "Escape") return;
    closePicker();
    recentOpen = false;
  }}
  onpointerdown={(e) => {
    if (
      recentOpen &&
      e.target instanceof Node &&
      recentRef &&
      !recentRef.contains(e.target)
    ) {
      recentOpen = false;
    }
  }}
/>
