<script>
  import { galeria } from "../stores/galeria.svelte.js";
  import FilePlus2 from "@lucide/svelte/icons/file-plus-2";
  import Save from "@lucide/svelte/icons/save";
  import Images from "@lucide/svelte/icons/images";

  const ACCIONES = [
    {
      id: "nuevo",
      label: "Nuevo dibujo",
      icon: FilePlus2,
      fn: () => {
        if (window.confirm("¿Empezar un nuevo dibujo? El lienzo actual se limpiará.")) {
          galeria.nuevo();
        }
      },
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