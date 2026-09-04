<script>
  import { editor } from "../stores/editor.svelte.js";

  const HERRAMIENTAS = [
    { id: "pincel", label: "Pincel" },
    { id: "borrador", label: "Borrador" },
    { id: "linea", label: "Línea" },
    { id: "relleno", label: "Relleno" },
  ];
</script>

<div class="flex items-center justify-center gap-2 rounded-xl bg-surface-light p-2">
  {#each HERRAMIENTAS as { id, label }}
    <button
      type="button"
      aria-pressed={editor.herramienta === id}
      class="cursor-pointer rounded-md px-3 py-2 text-sm font-medium transition
        {editor.herramienta === id
          ? 'bg-white text-black shadow'
          : 'text-white hover:bg-white/10'}"
      onclick={() => editor.seleccionarHerramienta(id)}
    >
      {label}
    </button>
  {/each}
</div>