<script>
  import { toasts } from "../stores/toasts.svelte.js";
  import { fly, fade } from "svelte/transition";
  import X from "@lucide/svelte/icons/x";
</script>

{#if toasts.items.length > 0}
  <div
    class="pointer-events-none fixed bottom-4 left-1/2 z-[70] flex -translate-x-1/2 flex-col items-center gap-2"
    role="region"
    aria-live="polite"
    aria-label="Notifications"
  >
    {#each toasts.items as toast (toast.id)}
      <div
        transition:fly={{ y: 16, duration: 200 }}
        class="pointer-events-auto flex max-w-[80vw] items-center gap-2 rounded-full bg-surface-lighter px-4 py-2 text-sm font-medium text-white shadow-xl ring-1 ring-white/10"
      >
        <span>{toast.message}</span>
        <button
          type="button"
          aria-label="Dismiss notification"
          class="flex h-5 w-5 cursor-pointer items-center justify-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"
          onclick={() => toasts.dismiss(toast.id)}
        >
          <X size={12} strokeWidth={3} />
        </button>
      </div>
    {/each}
  </div>
{/if}
