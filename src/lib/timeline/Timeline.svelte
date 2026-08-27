<script>
  import { editor } from "../stores/editor.svelte.js";
</script>

<div class="flex flex-col gap-2 mt-3">
  <div class="flex items-center justify-between">
    <span class="text-xs text-gray-400 font-medium">Frames</span>
    <div class="flex gap-1">
      <button
        onclick={() => editor.duplicateFrame(editor.activeFrameIndex)}
        class="text-xs px-2 py-0.5 rounded bg-surface-lighter hover:bg-brand transition-colors cursor-pointer"
        title="Duplicar frame"
      >
        📋
      </button>
      <button
        onclick={() => editor.addFrame()}
        class="text-xs px-2 py-0.5 rounded bg-surface-lighter hover:bg-brand transition-colors cursor-pointer"
        title="Nuevo frame"
      >
        + Nuevo
      </button>
    </div>
  </div>

  <div class="flex gap-2 overflow-x-auto pb-1">
    {#each editor.frames as frame, i}
      <div
        role="button"
        tabindex="0"
        onclick={() => editor.setActiveFrame(i)}
        onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') editor.setActiveFrame(i); }}
        class="shrink-0 w-14 h-14 rounded border-2 flex items-center justify-center text-xs font-medium transition-colors cursor-pointer"
        class:border-brand={i === editor.activeFrameIndex}
        class:border-gray-600={i !== editor.activeFrameIndex}
        class:bg-surface-lighter={i === editor.activeFrameIndex}
        class:bg-surface={i !== editor.activeFrameIndex}
      >
        <div class="flex flex-col items-center gap-0.5">
          <span>{i + 1}</span>
          {#if editor.frames.length > 1}
            <button
              onclick={(e) => { e.stopPropagation(); editor.removeFrame(i); }}
              class="text-[10px] text-gray-500 hover:text-red-400 cursor-pointer"
            >
              ✕
            </button>
          {/if}
        </div>
      </div>
    {/each}
  </div>
</div>
