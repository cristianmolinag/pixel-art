<script>
  import { galeria } from "../stores/galeria.svelte.js";
  import FilePlus2 from "@lucide/svelte/icons/file-plus-2";
  import Save from "@lucide/svelte/icons/save";
  import Images from "@lucide/svelte/icons/images";

  let confirmandoNuevo = $state(false);

  const ACCIONES = [
    {
      id: "nuevo",
      label: "Nuevo dibujo",
      icon: FilePlus2,
      fn: () => (confirmandoNuevo = true),
    },
    { id: "guardar", label: "Guardar", icon: Save, fn: () => galeria.abrir({ enfocarGuardar: true }) },
    { id: "galeria", label: "Galería", icon: Images, fn: () => galeria.abrir() },
  ];
</script>

<div class="flex flex-wrap items-center justify-center gap-1">
  {#each ACCIONES as { id, label, icon, fn } (id)}
    {@const Icone = icon}
    <button
      type="button"
      aria-label={label}
      title={label}
      class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md text-white transition
        hover:bg-white/10"
      onclick={fn}
    >
      <Icone size={20} />
    </button>
  {/each}
</div>

{#if confirmandoNuevo}
  <div
    role="button"
    tabindex="-1"
    class="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
    onclick={(e) => {
      if (e.target === e.currentTarget) confirmandoNuevo = false;
    }}
    onkeydown={(e) => {
      if (e.key === "Escape") confirmandoNuevo = false;
    }}
  >
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Confirmar nuevo dibujo"
      class="w-full max-w-xs rounded-2xl bg-surface-light p-4 shadow-xl"
    >
      <h2 class="mb-3 text-lg font-bold text-white">Nuevo dibujo</h2>
      <p class="text-sm text-white/70">¿Empezar un nuevo dibujo? El lienzo actual se limpiará.</p>
      <div class="mt-4 flex justify-end gap-2">
        <button
          type="button"
          aria-label="Cancelar"
          class="h-9 cursor-pointer rounded-md px-3 text-sm font-semibold text-white transition hover:bg-white/10"
          onclick={() => (confirmandoNuevo = false)}
        >
          Cancelar
        </button>
        <button
          type="button"
          aria-label="Empezar nuevo"
          class="h-9 cursor-pointer rounded-md bg-red-600 px-3 text-sm font-semibold text-white transition hover:bg-red-700"
          onclick={() => {
            galeria.nuevo();
            confirmandoNuevo = false;
          }}
        >
          Empezar nuevo
        </button>
      </div>
    </div>
  </div>
{/if}

<svelte:window
  onkeydown={(e) => {
    if (e.key === "Escape") confirmandoNuevo = false;
  }}
/>