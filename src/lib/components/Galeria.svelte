<script>
  import { galeria } from "../stores/galeria.svelte.js";
  import { nombreSugerido } from "../models/Dibujo.js";
  import Save from "@lucide/svelte/icons/save";
  import Trash2 from "@lucide/svelte/icons/trash-2";
  import X from "@lucide/svelte/icons/x";

  let nombre = $state("");
  let inputNombre = $state(null);
  let confirmando = $state(null);

  $effect(() => {
    if (galeria.visible) {
      nombre = nombreSugerido();
    }
  });

  $effect(() => {
    if (galeria.visible && galeria.enfocarGuardar && inputNombre) {
      inputNombre.focus();
    }
  });

  async function confirmarGuardar() {
    if (await galeria.guardar(nombre)) {
      nombre = nombreSugerido();
    }
  }

  function confirmarEliminar(dibujo) {
    confirmando = dibujo;
  }

  function eliminarConfirmado() {
    if (confirmando) {
      galeria.eliminar(confirmando.id);
      confirmando = null;
    }
  }

  function manejarEscape() {
    if (confirmando) {
      confirmando = null;
    } else {
      galeria.cerrar();
    }
  }

  function formatearFecha(ts) {
    return new Date(ts).toLocaleString("es");
  }
</script>

{#if galeria.visible}
  <div
    role="button"
    tabindex="-1"
    aria-label="Cerrar galería"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
    onclick={(e) => {
      if (e.target === e.currentTarget) galeria.cerrar();
    }}
    onkeydown={(e) => {
      if (e.key === "Escape") {
        manejarEscape();
      } else if ((e.key === "Enter" || e.key === " ") && !confirmando) {
        galeria.cerrar();
      }
    }}
  >
    <div
      class="flex max-h-[85dvh] w-full max-w-md flex-col rounded-2xl bg-surface-light p-4 shadow-xl"
      role="dialog"
      aria-modal="true"
      tabindex="-1"
      aria-label="Galería de dibujos"
    >
      <div class="mb-3 flex items-center justify-between">
        <h2 class="text-lg font-bold text-white">Galería</h2>
        <button
          type="button"
          aria-label="Cerrar galería"
          class="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-white transition hover:bg-white/10"
          onclick={() => galeria.cerrar()}
        >
          <X size={20} />
        </button>
      </div>

      <section class="mb-4 rounded-xl bg-surface p-3">
        <h3 class="mb-2 text-sm font-semibold text-white">Guardar dibujo actual</h3>
        <div class="flex gap-2">
          <input
            bind:this={inputNombre}
            bind:value={nombre}
            placeholder="Nombre del dibujo"
            class="min-w-0 flex-1 rounded-md bg-surface-light px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-brand"
          />
          <button
            type="button"
            class="flex h-10 shrink-0 cursor-pointer items-center gap-1 rounded-md bg-brand px-3 text-sm font-semibold text-white transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
            onclick={confirmarGuardar}
            disabled={galeria.guardando}
          >
            <Save size={18} />
            Guardar
          </button>
        </div>
        {#if galeria.error}
          <p class="mt-2 text-xs text-red-400" role="alert">{galeria.error}</p>
        {/if}
      </section>

      <div class="mb-2 flex shrink-0 items-center justify-between">
        <h3 class="text-sm font-semibold text-white">Mis dibujos</h3>
        <span class="text-xs text-white/50">{galeria.dibujos.length} guardados</span>
      </div>

      <div class="min-h-0 flex-1 overflow-y-auto">
        {#if galeria.dibujos.length === 0}
          <p class="py-8 text-center text-sm text-white/60">Aún no has guardado dibujos.</p>
        {:else}
          <ul class="grid grid-cols-2 gap-3">
          {#each galeria.dibujos as dibujo (dibujo.id)}
            <li class="relative">
              <button
                type="button"
                class="w-full cursor-pointer rounded-xl bg-surface p-2 text-left transition hover:bg-surface-lighter"
                aria-label={`Cargar ${dibujo.nombre}`}
                onclick={() => galeria.cargar(dibujo)}
              >
                <span
                  class="mb-1 flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-white [image-rendering:pixelated]"
                >
                  {#if dibujo.thumbnail}
                    <img
                      src={dibujo.thumbnail}
                      alt=""
                      width={dibujo.cols}
                      height={dibujo.rows}
                      class="h-full w-full object-contain [image-rendering:pixelated]"
                    />
                  {:else}
                    <span class="text-xs text-black/40">sin vista</span>
                  {/if}
                </span>
                <span class="block truncate text-sm font-medium text-white">{dibujo.nombre}</span>
                <span class="block text-xs text-white/50">{formatearFecha(dibujo.createdAt)}</span>
              </button>
              <button
                type="button"
                aria-label={`Eliminar ${dibujo.nombre}`}
                class="absolute right-2 top-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-md bg-black/40 text-white transition hover:bg-red-600"
                onclick={() => confirmarEliminar(dibujo)}
              >
                <Trash2 size={14} />
              </button>
            </li>
          {/each}
        </ul>
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
      aria-label="Confirmar eliminación"
      class="w-full max-w-xs rounded-2xl bg-surface-light p-4 shadow-xl"
    >
      <h2 class="mb-3 text-lg font-bold text-white">Eliminar dibujo</h2>
      <p class="text-sm text-white/70">{`¿Eliminar "${confirmando.nombre}"? Esta acción no se puede deshacer.`}</p>
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
          aria-label="Confirmar eliminación"
          class="h-9 cursor-pointer rounded-md bg-red-600 px-3 text-sm font-semibold text-white transition hover:bg-red-700"
          onclick={eliminarConfirmado}
        >
          Eliminar
        </button>
      </div>
    </div>
  </div>
{/if}

<svelte:window onkeydown={(e) => e.key === "Escape" && manejarEscape()} />