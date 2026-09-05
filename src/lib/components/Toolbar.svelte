<script>
  import { editor } from "../stores/editor.svelte.js";
  import { galeria } from "../stores/galeria.svelte.js";
  import Brush from "@lucide/svelte/icons/brush";
  import Eraser from "@lucide/svelte/icons/eraser";
  import Slash from "@lucide/svelte/icons/slash";
  import PaintBucket from "@lucide/svelte/icons/paint-bucket";
  import Undo2 from "@lucide/svelte/icons/undo-2";
  import Redo2 from "@lucide/svelte/icons/redo-2";
  import FilePlus2 from "@lucide/svelte/icons/file-plus-2";
  import Save from "@lucide/svelte/icons/save";
  import Images from "@lucide/svelte/icons/images";
  import Grid3x3 from "@lucide/svelte/icons/grid-3x3";

  const HERRAMIENTAS = [
    { id: "pincel", label: "Pincel", icon: Brush },
    { id: "borrador", label: "Borrador", icon: Eraser },
    { id: "linea", label: "Línea", icon: Slash },
    { id: "relleno", label: "Relleno", icon: PaintBucket },
  ];

  const ACCIONES_GALERIA = [
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

<div class="flex flex-wrap items-center justify-center gap-1 rounded-xl bg-surface-light p-2">
  {#each HERRAMIENTAS as { id, label, icon } (id)}
    {@const Icone = icon}
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={editor.herramienta === id}
      class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md transition
        {editor.herramienta === id
          ? 'bg-white text-black shadow'
          : 'text-white hover:bg-white/10'}"
      onclick={() => editor.seleccionarHerramienta(id)}
    >
      <Icone size={20} />
    </button>
  {/each}

  <button
    type="button"
    aria-label={editor.mostrarCuadricula ? "Ocultar cuadrícula" : "Mostrar cuadrícula"}
    title={editor.mostrarCuadricula ? "Ocultar cuadrícula" : "Mostrar cuadrícula"}
    aria-pressed={editor.mostrarCuadricula}
    class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md transition
      {editor.mostrarCuadricula
        ? 'bg-white text-black shadow'
        : 'text-white hover:bg-white/10'}"
    onclick={() => editor.alternarCuadricula()}
  >
    <Grid3x3 size={20} />
  </button>

  <span class="mx-1 h-6 w-px bg-white/20" aria-hidden="true"></span>

  <button
    type="button"
    aria-label="Deshacer"
    title="Deshacer"
    disabled={!editor.canUndo}
    class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md text-white transition
      hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
    onclick={() => editor.deshacer()}
  >
    <Undo2 size={20} />
  </button>
  <button
    type="button"
    aria-label="Rehacer"
    title="Rehacer"
    disabled={!editor.canRedo}
    class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md text-white transition
      hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
    onclick={() => editor.rehacer()}
  >
    <Redo2 size={20} />
  </button>

  <span class="mx-1 h-6 w-px bg-white/20" aria-hidden="true"></span>

  {#each ACCIONES_GALERIA as { id, label, icon, fn } (id)}
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