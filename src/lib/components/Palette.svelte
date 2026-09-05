<script>
  import { editor, PALETA } from "../stores/editor.svelte.js";
  import { normalizarHex, hexToRgb, hexToHsv, hsvToHex } from "../services/colores.js";

  const SV_ALTO = 256;

  let hexInput = $state(editor.colorActual);
  let abierto = $state(false);
  let hue = $state(0);
  let sat = $state(1);
  let val = $state(1);
  let svCanvas = $state(undefined);
  let hueBar = $state(undefined);
  let arrastrando = $state(false);
  let arrastrandoHue = $state(false);

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

<div class="relative flex flex-wrap items-center gap-2 rounded-xl bg-surface-light p-3">
  {#each PALETA as color}
    <button
      type="button"
      aria-label="Color {color}"
      class="h-8 w-8 cursor-pointer rounded-md border-2 transition
        {esColorActual(color)
          ? 'scale-110 border-white shadow-md'
          : 'border-white/20 hover:scale-105'}"
      style:background-color={color}
      onclick={() => editor.seleccionarColor(color)}
    ></button>
  {/each}

  <span class="mx-1 h-6 w-px bg-white/20" aria-hidden="true"></span>

  <button
    type="button"
    aria-label="Elegir color personalizado"
    title="Elegir color personalizado"
    aria-expanded={abierto}
    aria-haspopup="dialog"
    class="h-9 w-9 cursor-pointer rounded-full border-2 transition
      {abierto ? 'border-brand' : 'border-white/20 hover:scale-105'}"
    style:background-color={editor.colorActual}
    onclick={alternarPicker}
  ></button>

  {#if editor.coloresRecientes.length > 0}
    <div class="mt-1 flex w-full flex-wrap items-center gap-2">
      <span class="mr-1 text-xs uppercase tracking-wide text-white/50">Recientes</span>
      {#each editor.coloresRecientes as color (color)}
        <button
          type="button"
          aria-label="Reciente {color}"
          class="h-6 w-6 cursor-pointer rounded transition
            {esColorActual(color)
              ? 'scale-110 border-2 border-white shadow-md'
              : 'border border-white/30 hover:scale-105'}"
          style:background-color={color}
          onclick={() => editor.seleccionarColor(color)}
        ></button>
      {/each}
    </div>
  {/if}

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

<svelte:window onkeydown={(e) => e.key === "Escape" && cerrarPicker()} />