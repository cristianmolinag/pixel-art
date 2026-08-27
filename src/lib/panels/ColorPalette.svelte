<script>
  import { editor } from "../stores/editor.svelte.js";
  import { history } from "../stores/history.svelte.js";

  const PALETTE_COLORS = [
    "#000000",
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#FFFF00",
    "#FF00FF",
    "#00FFFF",
    "#800000",
    "#008000",
    "#FFFFFF",
  ];

  function selectColor(color) {
    editor.setColor(color);
    editor.setTool("pen");
  }
</script>

<div class="flex flex-col gap-2">
  <span class="text-xs text-gray-400 font-medium">Colores</span>
  <div class="flex flex-wrap gap-1.5">
    {#each PALETTE_COLORS as color}
      <button
        onclick={() => selectColor(color)}
        class="w-6 h-6 rounded border-2 transition-transform hover:scale-110 cursor-pointer"
        class:border-white={editor.activeColor === color}
        class:border-gray-700={editor.activeColor !== color}
        style="background-color: {color};"
        title={color}
      ></button>
    {/each}
  </div>
  <input
    type="color"
    value={editor.activeColor}
    oninput={(e) => selectColor(e.target.value)}
    class="w-full h-8 rounded cursor-pointer border-0"
  />
</div>
