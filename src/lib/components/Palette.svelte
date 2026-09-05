<script>
  import { editor, PALETA } from "../stores/editor.svelte.js";
  import { normalizarHex, hexToRgb, hexToHsv, hsvToHex } from "../services/colores.js";
  import Check from "@lucide/svelte/icons/check";
  import Clock from "@lucide/svelte/icons/clock";

  const SV_ALTO = 256;

  function colorDeContraste(hex) {
    const rgb = hexToRgb(hex);
    if (!rgb) return "#ffffff";
    const luminancia = (299 * rgb.r + 587 * rgb.g + 114 * rgb.b) / 1000;
    return luminancia >= 150 ? "#1a1a2e" : "#ffffff";
  }

  let hexInput = $state(editor.colorActual);
  let abierto = $state(false);
  let hue = $state(0);
  let sat = $state(1);
  let val = $state(1);
  let svCanvas = $state(undefined);
  let hueBar = $state(undefined);
  let arrastrando = $state(false);
  let arrastrandoHue = $state(false);
  let paletaScroll = $state(undefined);
  let scrollArrastrando = $state(false);
  let scrollInicioX = $state(0);
  let scrollInicioIzq = $state(0);
  let scrollMaximo = $state(0);
  let scrollMovido = $state(false);
  let recientesAbierto = $state(false);
  let recientesRef = $state(undefined);
  let scrollInfo = $state({ izq: false, der: false });

  function sincronizarPicker() {
    const hsv = hexToHsv(editor.colorActual);
    if (!hsv) return;
    hue = hsv.h;
    sat = hsv.s === 0 ? 1 : hsv.s;
    val = hsv.v === 0 ? 1 : hsv.v;
  }

  function aplicarHex() {
    const norm = normalizarHex(hexInput);
    if (norm) {
      editor.seleccionarColor(norm);
      sincronizarPicker();
    }
    hexInput = editor.colorActual;
  }

  function aplicarDesdePicker() {
    editor.seleccionarColor(hsvToHex(hue, sat, val));
    hexInput = editor.colorActual;
  }

  function esColorActual(color) {
    return editor.colorActual.toLowerCase() === color.toLowerCase();
  }

  function alternarPicker() {
    if (!abierto) sincronizarPicker();
    abierto = !abierto;
  }

  function cerrarPicker() {
    abierto = false;
    arrastrando = false;
  }

  function pintarSVCuadrado() {
    if (!svCanvas) return;
    const ctx = svCanvas.getContext("2d");
    if (!ctx) return;
    const w = svCanvas.width;
    const h = svCanvas.height;
    const base = hexToRgb(hsvToHex(hue, 1, 1));
    if (!base) return;

    ctx.fillStyle = `rgb(${base.r}, ${base.g}, ${base.b})`;
    ctx.fillRect(0, 0, w, h);

    const blanco = ctx.createLinearGradient(0, 0, w, 0);
    blanco.addColorStop(0, "#ffffff");
    blanco.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = blanco;
    ctx.fillRect(0, 0, w, h);

    const negro = ctx.createLinearGradient(0, 0, 0, h);
    negro.addColorStop(0, "rgba(0,0,0,0)");
    negro.addColorStop(1, "#000000");
    ctx.fillStyle = negro;
    ctx.fillRect(0, 0, w, h);
  }

  $effect(() => {
    if (abierto) pintarSVCuadrado();
  });

  function posicionDesdeEvento(e) {
    if (!svCanvas) return;
    const rect = svCanvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    sat = Math.min(1, Math.max(0, x));
    val = Math.min(1, Math.max(0, 1 - y));
  }

  function onSVPointerDown(e) {
    arrastrando = true;
    if (svCanvas && svCanvas.setPointerCapture) {
      try {
        svCanvas.setPointerCapture(e.pointerId);
      } catch {
        /* noop */
      }
    }
    posicionDesdeEvento(e);
    aplicarDesdePicker();
  }

  function onSVPointerMove(e) {
    if (!arrastrando) return;
    posicionDesdeEvento(e);
    aplicarDesdePicker();
  }

  function onSVPointerUp(e) {
    arrastrando = false;
    if (svCanvas && svCanvas.releasePointerCapture) {
      try {
        svCanvas.releasePointerCapture(e.pointerId);
      } catch {
        /* noop */
      }
    }
  }

  function posicionHueDesdeEvento(e) {
    if (!hueBar) return;
    const rect = hueBar.getBoundingClientRect();
    if (rect.width === 0) return;
    const x = (e.clientX - rect.left) / rect.width;
    hue = Math.round(Math.min(1, Math.max(0, x)) * 360);
    aplicarDesdePicker();
  }

  function onHuePointerDown(e) {
    arrastrandoHue = true;
    if (hueBar && hueBar.setPointerCapture) {
      try {
        hueBar.setPointerCapture(e.pointerId);
      } catch {
        /* noop */
      }
    }
    posicionHueDesdeEvento(e);
  }

  function onHuePointerMove(e) {
    if (!arrastrandoHue) return;
    posicionHueDesdeEvento(e);
  }

  function onHuePointerUp(e) {
    arrastrandoHue = false;
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
    aplicarDesdePicker();
  }

  function onPaletaPointerDown(e) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    scrollArrastrando = true;
    scrollInicioX = e.clientX;
    scrollInicioIzq = paletaScroll ? paletaScroll.scrollLeft : 0;
    scrollMaximo = 0;
    scrollMovido = false;
  }

  function actualizarFlechas() {
    if (!paletaScroll) return;
    const { scrollLeft, scrollWidth, clientWidth } = paletaScroll;
    scrollInfo = {
      izq: scrollLeft > 0,
      der: scrollWidth - clientWidth - scrollLeft > 1,
    };
  }

  function mascaraPaleta() {
    const izq = scrollInfo.izq ? "transparent 0, black 6%" : "black 0";
    const der = scrollInfo.der ? ", black 94%, transparent 100%" : ", black 100%";
    return `linear-gradient(to right, ${izq}${der})`;
  }

  $effect(() => {
    if (paletaScroll) actualizarFlechas();
  });

  function onHueWheel(e) {
    e.preventDefault();
    hue = (hue + (e.deltaY < 0 ? 1 : -1) + 360) % 360;
    aplicarDesdePicker();
  }

  function wheelNoPasivo(node, handler) {
    node.addEventListener("wheel", handler, { passive: false });
    return {
      destroy() {
        node.removeEventListener("wheel", handler);
      },
    };
  }
</script>

{#snippet recientesSwatches()}
  {#each editor.coloresRecientes as color (color)}
    <button
      type="button"
      aria-label="Reciente {color}"
      class="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded transition hover:scale-105"
      style:background-color={color}
      onclick={() => {
        editor.seleccionarColor(color);
        recientesAbierto = false;
      }}
    >
      {#if esColorActual(color)}
        <Check size={10} strokeWidth={3} color={colorDeContraste(color)} class="pointer-events-none" />
      {/if}
    </button>
  {/each}
{/snippet}

<div class="w-full min-w-0">
  <div class="flex w-full min-w-0 items-center gap-4">
  <div class="flex min-w-0 flex-1 items-center gap-2">
    <button
      type="button"
      aria-label="Elegir color personalizado"
      title="Elegir color personalizado"
      aria-expanded={abierto}
      aria-haspopup="dialog"
      class="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition
        {abierto ? 'scale-110' : 'hover:scale-105'}"
      style:background-color={editor.colorActual}
      onclick={alternarPicker}
    >
      <Check size={16} strokeWidth={3} color={colorDeContraste(editor.colorActual)} class="pointer-events-none" />
    </button>

    <span class="mx-1 h-6 w-px shrink-0 bg-white/20" aria-hidden="true"></span>

    <div class="relative min-w-0 flex-1">
      <div
        bind:this={paletaScroll}
        role="region"
        aria-label="Paleta de colores"
        class="scrollbar-invisible w-full cursor-grab touch-pan-y select-none items-center gap-2 overflow-x-auto overflow-y-hidden active:cursor-grabbing flex px-2"
        style:mask-image={mascaraPaleta()}
        style:-webkit-mask-image={mascaraPaleta()}
        onscroll={actualizarFlechas}
        onpointerdown={onPaletaPointerDown}
      >
        {#each PALETA as color}
          <button
            type="button"
            aria-label="Color {color}"
            class="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md transition hover:scale-105"
            style:background-color={color}
            onclick={() => {
              if (scrollMovido) return;
              editor.seleccionarColor(color);
            }}
          >
            {#if esColorActual(color)}
              <Check size={14} strokeWidth={3} color={colorDeContraste(color)} class="pointer-events-none" />
            {/if}
          </button>
        {/each}
    </div>
  </div>
  </div>

  <div class="hidden shrink-0 items-center gap-2 lg:flex">
    <span class="text-xs uppercase tracking-wide text-white/50">Recientes</span>
    {#if editor.coloresRecientes.length > 0}
      {@render recientesSwatches()}
    {:else}
      <span class="text-xs text-white/40">Sin colores recientes todavía</span>
    {/if}
  </div>

  {#if editor.coloresRecientes.length > 0}
    <div bind:this={recientesRef} class="relative shrink-0 lg:hidden">
      <button
        type="button"
        aria-label="Mostrar colores recientes"
        title="Colores recientes"
        aria-expanded={recientesAbierto}
        aria-haspopup="dialog"
        class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md text-white/60 transition hover:bg-white/10 hover:text-white"
        onclick={() => (recientesAbierto = !recientesAbierto)}
      >
        <Clock size={18} />
      </button>

      {#if recientesAbierto}
        <div
          role="dialog"
          aria-label="Colores recientes"
          class="absolute bottom-full right-0 mb-2 w-max max-w-[80vw] rounded-xl bg-surface-lighter p-3 shadow-xl ring-1 ring-white/10"
        >
          <span class="mb-2 block text-xs uppercase tracking-wide text-white/50">Recientes</span>
          <div class="flex flex-wrap items-center gap-2">
            {@render recientesSwatches()}
          </div>
        </div>
      {/if}
    </div>
  {/if}

  </div>

  {#if abierto}
    <div
      role="button"
      tabindex="-1"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onclick={(e) => {
        if (e.target === e.currentTarget) cerrarPicker();
      }}
      onkeydown={(e) => {
        if (e.key === "Escape") cerrarPicker();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Selector de color personalizado"
        class="w-full max-w-sm rounded-2xl bg-surface-light p-4 shadow-xl"
      >
        <h2 class="mb-3 text-lg font-bold text-white">Color personalizado</h2>

        <div class="relative aspect-square w-full">
          <canvas
            bind:this={svCanvas}
            width={SV_ALTO}
            height={SV_ALTO}
            aria-label="Área de saturación y luminosidad"
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
          aria-label="Matiz del color"
          aria-valuemin="0"
          aria-valuemax="360"
          aria-valuenow={Math.round(hue)}
          bind:this={hueBar}
          class="relative mt-4 h-6 w-full cursor-pointer touch-none rounded-full ring-2 ring-white/15 outline-none focus-visible:ring-brand"
          style="background: linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00);"
          use:wheelNoPasivo={onHueWheel}
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
            style:background-color={editor.colorActual}
          ></span>
          <input
            type="text"
            aria-label="Código hex del color"
            title="Código hex del color (ej. #ff0000)"
            placeholder="#rrggbb"
            spellcheck="false"
            class="h-9 w-full rounded-md border-2 border-white/20 bg-surface px-2 text-sm text-white outline-none transition focus:border-brand"
            value={hexInput}
            oninput={(e) => (hexInput = e.currentTarget.value)}
            onkeydown={(e) => e.key === "Enter" && aplicarHex()}
            onblur={aplicarHex}
          />
        </div>
      </div>
    </div>
  {/if}
</div>

<svelte:window
  onpointermove={(e) => {
    if (!scrollArrastrando || !paletaScroll) return;
    const dx = scrollInicioX - e.clientX;
    paletaScroll.scrollLeft = scrollInicioIzq + dx;
    scrollMaximo = Math.max(
      scrollMaximo,
      Math.abs(paletaScroll.scrollLeft - scrollInicioIzq),
    );
  }}
  onpointerup={() => {
    if (!scrollArrastrando) return;
    scrollArrastrando = false;
    if (scrollMaximo > 3) scrollMovido = true;
    setTimeout(() => {
      scrollMovido = false;
    }, 0);
  }}
  onkeydown={(e) => {
    if (e.key !== "Escape") return;
    cerrarPicker();
    recientesAbierto = false;
  }}
  onpointerdown={(e) => {
    if (
      recientesAbierto &&
      e.target instanceof Node &&
      recientesRef &&
      !recientesRef.contains(e.target)
    ) {
      recientesAbierto = false;
    }
  }}
  onresize={actualizarFlechas}
/>