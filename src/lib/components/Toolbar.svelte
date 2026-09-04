<script>
  import { editor } from "../stores/editor.svelte.js";
  import Brush from "@lucide/svelte/icons/brush";
  import Eraser from "@lucide/svelte/icons/eraser";
  import Slash from "@lucide/svelte/icons/slash";
  import PaintBucket from "@lucide/svelte/icons/paint-bucket";
  import Undo2 from "@lucide/svelte/icons/undo-2";
  import Redo2 from "@lucide/svelte/icons/redo-2";

  const HERRAMIENTAS = [
    { id: "pincel", label: "Pincel", icon: Brush },
    { id: "borrador", label: "Borrador", icon: Eraser },
    { id: "linea", label: "Línea", icon: Slash },
    { id: "relleno", label: "Relleno", icon: PaintBucket },
  ];
</script>

<div class="flex items-center justify-center gap-1 rounded-xl bg-surface-light p-2">
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
</div>