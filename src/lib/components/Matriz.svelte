<script>
  import { editor, MATRICES, MIN_MATRIZ, MAX_MATRIZ } from "../stores/editor.svelte.js";
  import LayoutGrid from "@lucide/svelte/icons/layout-grid";

  let abierto = $state(false);
  let cols = $state(String(editor.model.cols));
  let rows = $state(String(editor.model.rows));
  let error = $state("");
  let confirmando = $state(null);

  function abrir() {
    cols = String(editor.model.cols);
    rows = String(editor.model.rows);
    error = "";
    abierto = true;
  }

  function cerrar() {
    abierto = false;
    confirmando = null;
    error = "";
  }

  function manejarEscape() {
    if (confirmando) {
      confirmando = null;
    } else {
      cerrar();
    }
  }

  function aplicar(c, r) {
    const ancho = Math.floor(Number(c));
    const alto = Math.floor(Number(r));
    if (
      !Number.isFinite(ancho) ||
      !Number.isFinite(alto) ||
      ancho < MIN_MATRIZ ||
      ancho > MAX_MATRIZ ||
      alto < MIN_MATRIZ ||
      alto > MAX_MATRIZ
    ) {
      error = `Usa entre ${MIN_MATRIZ} y ${MAX_MATRIZ} en cada lado.`;
      return;
    }
    error = "";
    confirmando = { ancho, alto };
  }

  function aplicarConfirmado() {
    editor.establecerMatriz(confirmando.ancho, confirmando.alto);
    cerrar();
  }
</script>

<div class="relative">
  <button
    type="button"
    aria-label="Cambiar matriz del lienzo"
    title="Cambiar matriz del lienzo"
    aria-expanded={abierto}
    aria-haspopup="dialog"
    class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md text-white transition
      {abierto ? 'bg-white/15' : 'hover:bg-white/10'}"
    onclick={() => (abierto ? cerrar() : abrir())}
  >
    <LayoutGrid size={20} />
  </button>

  {#if abierto}
    <div
      role="button"
      tabindex="-1"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onclick={(e) => {
        if (e.target === e.currentTarget) cerrar();
      }}
      onkeydown={(e) => {
        if (e.key === "Escape") manejarEscape();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Cambiar matriz del lienzo"
        class="w-full max-w-xs rounded-2xl bg-surface-light p-4 shadow-xl"
      >
        <h2 class="mb-3 text-lg font-bold text-white">Matriz</h2>

        <div class="grid grid-cols-2 gap-2">
          {#each MATRICES as n}
            <button
              type="button"
              aria-label="Matriz {n}×{n}"
              class="h-10 cursor-pointer rounded-md border-2 text-sm font-medium transition
                {editor.model.cols === n && editor.model.rows === n
                  ? 'border-brand bg-brand/10 text-white'
                  : 'border-white/20 text-white hover:bg-white/10'}"
              onclick={() => aplicar(n, n)}
            >
              {n}×{n}
            </button>
          {/each}
        </div>

        <div class="mt-4">
          <span class="text-xs uppercase tracking-wide text-white/50">Tamaño personalizado</span>
          <div class="mt-2 flex items-center gap-2">
            <input
              type="number"
              min={MIN_MATRIZ}
              max={MAX_MATRIZ}
              aria-label="Ancho de la matriz"
              title="Ancho (columnas)"
              class="h-9 w-full rounded-md border-2 border-white/20 bg-surface px-2 text-sm text-white outline-none transition focus:border-brand"
              value={cols}
              oninput={(e) => (cols = e.currentTarget.value)}
            />
            <span class="text-white/50" aria-hidden="true">×</span>
            <input
              type="number"
              min={MIN_MATRIZ}
              max={MAX_MATRIZ}
              aria-label="Alto de la matriz"
              title="Alto (filas)"
              class="h-9 w-full rounded-md border-2 border-white/20 bg-surface px-2 text-sm text-white outline-none transition focus:border-brand"
              value={rows}
              oninput={(e) => (rows = e.currentTarget.value)}
            />
            <button
              type="button"
              aria-label="Aplicar tamaño personalizado"
              class="h-9 shrink-0 cursor-pointer rounded-md bg-brand px-3 text-sm font-semibold text-white transition hover:bg-brand-hover"
              onclick={() => aplicar(cols, rows)}
            >
              Ok
            </button>
          </div>
          {#if error}
            <p class="prose mt-2 text-xs text-red-400" aria-live="polite">{error}</p>
          {/if}
        </div>
      </div>
    </div>
  {/if}

  {#if confirmando}
    <div
      role="button"
      tabindex="-1"
      class="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
      onclick={(e) => {
        if (e.target === e.currentTarget) confirmando = null;
      }}
      onkeydown={(e) => {
        if (e.key === "Escape") confirmando = null;
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Confirmar cambio de matriz"
        class="w-full max-w-xs rounded-2xl bg-surface-light p-4 shadow-xl"
      >
        <h2 class="mb-3 text-lg font-bold text-white">Cambiar matriz</h2>
        <p class="text-sm text-white/70">
          {`¿Cambiar la matriz a ${confirmando.ancho}×${confirmando.alto}? El lienzo actual se limpiará.`}
        </p>
        <div class="mt-4 flex justify-end gap-2">
          <button
            type="button"
            aria-label="Cancelar"
            class="h-9 cursor-pointer rounded-md px-3 text-sm font-semibold text-white transition hover:bg-white/10"
            onclick={() => (confirmando = null)}
          >
            Cancelar
          </button>
          <button
            type="button"
            aria-label="Aplicar y limpiar"
            class="h-9 cursor-pointer rounded-md bg-red-600 px-3 text-sm font-semibold text-white transition hover:bg-red-700"
            onclick={aplicarConfirmado}
          >
            Aplicar
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>

<svelte:window onkeydown={(e) => e.key === "Escape" && manejarEscape()} />