<script lang="ts">
  import { onMount } from "svelte";

  type RowData = { [key: string]: string | number };

  export let data;
  export let onRowClick: (row: RowData) => void;
  export let selectedStation: any = null;

  const handleRowClick = (row: RowData) => {
    if (onRowClick) {
      onRowClick(row);
    }
    selectedStation = row.id === selectedStation ? null : row.id;
  };

  let observer: any;
  let loadedImages = new Set();

  onMount(() => {
    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target.querySelector('img');
          const stationId = entry.target.dataset.stationId;
          if (img && img.dataset.src && !loadedImages.has(stationId)) {
            img.src = img.dataset.src; // Load actual image
            loadedImages.add(stationId);  // Mark image as loaded
          }
        }
      });
    });

    document.querySelectorAll('.station').forEach(venue => {
      observer.observe(venue);
    });

    return () => {
      observer.disconnect();
    };
  });
</script>

<div class="flex flex-col h-full">
  <div class="flex-grow overflow-y-auto p-4">
    {#each data as station}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div
        class="station flex items-center border-b border-white border-opacity-25 p-4 hover:bg-neutral-800 cursor-pointer"
        class:bg-neutral-700={selectedStation === station.id}
        on:click={() => handleRowClick(station)}
        data-station-id={station.id}
      >
        <img
          data-src={station.image} 
          src="placeholder-img.png"
          alt={station.name} 
          class="w-16 h-16 object-cover rounded-lg mr-4 text-xs"
        />

        <div class="w-40">
          <h3 class="text-white text-sm font-semibold">{station.name}</h3>
          <p class="text-gray-200 text-xs">{station.frequency}</p>
          <p class="text-gray-500 text-xs  mt-3">{station.format_name}</p>
        </div>

        <div class="w-24 flex flex-col pl-8">
          <span class={`px-3 py-1 rounded-custom text-white text-center text-xs ${station.azimuth_panel ? "bg-blue-500" : "bg-gray-500"}`}>
            {station.azimuth_panel ? 'Panel' : "Non-Panel"}
          </span>
        </div>
      </div>
    {/each}
  </div>
</div>
