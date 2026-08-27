<script>
  let savedArtworks = $state([]);

  function loadArtworks() {
    try {
      const data = localStorage.getItem("pixel-art-gallery");
      savedArtworks = data ? JSON.parse(data) : [];
    } catch {
      savedArtworks = [];
    }
  }

  function deleteArtwork(index) {
    savedArtworks = savedArtworks.filter((_, i) => i !== index);
    localStorage.setItem("pixel-art-gallery", JSON.stringify(savedArtworks));
  }

  $effect(() => {
    loadArtworks();
  });
</script>

<div class="flex-1 p-4 overflow-y-auto">
  <h2 class="text-lg font-bold mb-4">Mi Galeria</h2>

  {#if savedArtworks.length === 0}
    <div class="text-center text-gray-500 mt-20">
      <p class="text-4xl mb-3">🎨</p>
      <p class="text-sm">No hay obras guardadas aun.</p>
      <p class="text-xs text-gray-600 mt-1">
        Crea tu primera obra en el editor y exportala para verla aqui.
      </p>
    </div>
  {:else}
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {#each savedArtworks as artwork, i}
        <div class="bg-surface-light rounded-lg overflow-hidden border border-surface-lighter">
          <img
            src={artwork.dataUrl}
            alt={artwork.name}
            class="w-full aspect-square object-contain bg-white"
          />
          <div class="p-2 flex items-center justify-between">
            <span class="text-xs text-gray-400 truncate">{artwork.name}</span>
            <button
              onclick={() => deleteArtwork(i)}
              class="text-xs text-gray-500 hover:text-red-400 cursor-pointer"
            >
              🗑️
            </button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
