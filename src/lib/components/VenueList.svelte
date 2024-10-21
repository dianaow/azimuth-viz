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
          if (img && img.dataset.src && !loadedImages.has(venueId)) {
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
        class="venue flex items-center border-b border-white border-opacity-25 p-4 hover:bg-neutral-800 cursor-pointer"
        class:bg-neutral-700={selectedVenue === venue.id}
        on:click={() => handleRowClick(venue)}
        data-venue-id={venue.id}
      >
        <img
          data-src={venue.image_url_small} 
          src="placeholder-img.png"
          alt={venue.name} 
          class="w-24 h-24 object-cover rounded-lg mr-4 text-xs"
        />

        <div class="w-40">
          <h3 class="text-white text-sm font-semibold">{venue.name}</h3>
          <p class="text-gray-200 text-xs mt-3">{venue.address}</p>
          <p class="text-gray-500 text-xs">{venue.city}, {venue.state}</p>
          <div class="flex text-gray-400 mt-3 space-x-2">
            {#if venue.website}
              <a href={venue.website} target="_blank" rel="noopener noreferrer">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="15" height="15">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
                </svg>
              </a>
            {/if}
            {#if venue.facebook}
              <!-- Facebook Icon -->
              <a href={venue.facebook} target="_blank" rel="noopener noreferrer">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="15" height="15">
                  <path d="M22.675 0H1.325C.593 0 0 .593 0 1.326v21.348C0 23.407.593 24 1.325 24H12.81v-9.293H9.692v-3.622h3.118V8.413c0-3.1 1.894-4.788 4.661-4.788 1.325 0 2.464.099 2.797.144v3.244h-1.918c-1.504 0-1.794.715-1.794 1.763v2.312h3.587l-.467 3.622h-3.12V24h6.116C23.407 24 24 23.407 24 22.674V1.326C24 .593 23.407 0 22.675 0z"/>
                </svg>
              </a>
            {/if}
            {#if venue.twitter}
              <!-- X (Twitter) Icon -->
              <a href={venue.twitter} target="_blank" rel="noopener noreferrer">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="15" height="15">
                  <path d="M23.954 4.569c-.885.392-1.83.656-2.825.775 1.014-.607 1.794-1.569 2.163-2.723-.949.562-2.003.973-3.127 1.195-.896-.957-2.173-1.555-3.59-1.555-2.717 0-4.92 2.203-4.92 4.917 0 .39.045.765.127 1.124C7.691 8.094 4.066 6.13 1.64 3.161c-.427.722-.666 1.561-.666 2.475 0 1.71.87 3.213 2.188 4.096-.807-.026-1.566-.248-2.228-.616v.062c0 2.385 1.693 4.374 3.946 4.827-.413.111-.848.171-1.296.171-.314 0-.622-.03-.923-.086.623 1.951 2.432 3.376 4.575 3.416-1.676 1.31-3.787 2.094-6.078 2.094-.394 0-.779-.023-1.17-.067 2.168 1.39 4.742 2.205 7.514 2.205 9.025 0 13.961-7.481 13.961-13.961 0-.21 0-.42-.015-.63.961-.695 1.8-1.562 2.46-2.549z"/>
                </svg>
              </a>
            {/if}
            {#if venue.instagram}
              <!-- Instagram Icon -->
              <a href={venue.instagram} target="_blank" rel="noopener noreferrer">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="15" height="15">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.31 3.608 1.285.975.975 1.223 2.242 1.285 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.31 2.633-1.285 3.608-.975.975-2.242 1.223-3.608 1.285-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.31-3.608-1.285-.975-.975-1.223-2.242-1.285-3.608C2.175 15.584 2.163 15.204 2.163 12s.012-3.584.07-4.85c.062-1.366.31-2.633 1.285-3.608C4.493 2.473 5.76 2.225 7.126 2.163 8.392 2.105 8.772 2.163 12 2.163zm0-2.163C8.691 0 8.249.012 7.012.07 5.782.127 4.6.335 3.64 1.295c-.96.96-1.168 2.143-1.225 3.372-.058 1.237-.07 1.679-.07 4.88s.012 3.643.07 4.88c.057 1.229.265 2.412 1.225 3.372.96.96 2.143 1.168 3.372 1.225 1.237.058 1.679.07 4.88.07s3.643-.012 4.88-.07c1.229-.057 2.412-.265 3.372-1.225.96-.96 1.168-2.143 1.225-3.372.058-1.237.07-1.679.07-4.88s-.012-3.643-.07-4.88c-.057-1.229-.265-2.412-1.225-3.372-.96-.96-2.143-1.168-3.372-1.225C15.643.012 15.205 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.18a4.018 4.018 0 110-8.036 4.018 4.018 0 010 8.036zm6.406-10.845a1.44 1.44 0 11-2.88 0 1.44 1.44 0 012.88 0z"/>
                </svg>
              </a>  
            {/if}      
          </div>
        </div>

        <!-- Capacity Pill -->
         <div class="w-24 flex flex-col pl-5">
          <span class={`px-3 py-1 rounded-custom text-white text-center text-xs ${venue.color}`}>
            {venue.category}
          </span>
          {#if venue.capacity}
            <p class={`text-sm text-center mt-2`}>{venue.capacity}</p>
            <p class={`text-xs text-center text-gray-500`}>capacity</p>
          {/if}
         </div>
      </div>
    {/each}
  </div>
</div>
