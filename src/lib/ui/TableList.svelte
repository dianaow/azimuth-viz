<script lang="ts">
  import { onMount } from "svelte";

  type RowData = { [key: string]: string | number };

  export let data;
  export let onRowClick: (row: RowData) => void;
  export let selectedVenue: any = null;

  const handleRowClick = (row: RowData) => {
    if (onRowClick) {
      onRowClick(row);
    }
    selectedVenue = row.id === selectedVenue ? null : row.id;
  };

  let observer: any;
  let loadedImages = new Set();

  onMount(() => {
    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target.querySelector('img');
          const venueId = entry.target.dataset.venueId;
          if (img && !loadedImages.has(venueId)) {
            img.src = img.dataset.src; // Load actual image
            loadedImages.add(venueId);  // Mark image as loaded
          }
        }
      });
    });

    document.querySelectorAll('.venue').forEach(venue => {
      observer.observe(venue);
    });

    return () => {
      observer.disconnect();
    };
  });
</script>

<div class="flex flex-col h-full">
  <div class="flex-grow overflow-y-auto p-4">
    {#each data as venue}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div
        class="venue flex items-center border-b border-white border-opacity-25 p-4 hover:bg-indigo-900 cursor-pointer"
        class:bg-indigo-800={selectedVenue === venue.id}
        on:click={() => handleRowClick(venue)}
        data-venue-id={venue.id}
      >
        <!-- Venue Image with lazy loading -->
        <img
          data-src={venue.image_url_small} 
          src="placeholder_image_url"
          alt={venue.name} 
          class="w-20 h-20 object-cover rounded-lg mr-4 text-xs"
        />

        <!-- Venue Details -->
        <div class="w-40">
          <h3 class="text-white text-sm font-semibold">{venue.name}</h3>
          <p class="text-gray-200 text-xs">{venue.address}</p>
          <p class="text-gray-500 text-xs mt-2">{venue.city}, {venue.state}</p>
        </div>

        <!-- Capacity Pill -->
         <div class="w-28 flex flex-col pl-6">
          <span class={`px-3 py-1 rounded-custom text-white text-xs ${venue.color}`}>
            {venue.category}
          </span>
          <p class={`text-xs mt-3`}>{venue.capacity} capacity</p>
         </div>
      </div>
    {/each}
  </div>
</div>
