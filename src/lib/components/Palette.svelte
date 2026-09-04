<script>
  import { editor, PALETA } from "../stores/editor.svelte.js";
</script>

<div class="flex flex-wrap items-center gap-2 rounded-xl bg-surface-light p-3">
  {#each PALETA as color}
    <button
      type="button"
      aria-label="Color {color}"
      class="h-8 w-8 cursor-pointer rounded-md border-2 transition
        {editor.colorActual === color
          ? 'scale-110 border-white shadow-md'
          : 'border-white/20 hover:scale-105'}"
      style:background-color={color}
      onclick={() => (editor.colorActual = color)}
    ></button>
  {/each}

  <div
    class="ml-1 h-9 w-9 rounded-full bg-[conic-gradient(from_90deg,red,orange,yellow,green,blue,indigo,violet,red)] p-[3px]"
    title="Elegir color personalizado"
  >
    <input
      type="color"
      value={editor.colorActual}
      oninput={(e) => (editor.colorActual = e.currentTarget.value)}
      class="box-content block h-full w-full cursor-pointer appearance-none rounded-full border-none bg-transparent p-0 [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-2 [&::-webkit-color-swatch]:border-white/30 [&::-webkit-color-swatch]:shadow-inner [&::-webkit-color-swatch-wrapper]:p-0"
    />
  </div>
</div>