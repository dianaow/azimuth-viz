<script lang="ts">
    import type { DMAData, FetchDataResponse } from '$src/lib/types.js';
    import SearchBar from '$lib/components/SearchBar.svelte';
    import Map from '$lib/components/Map.svelte';
    import { goto } from '$app/navigation';
    
    export let data: FetchDataResponse
  
    let searchQuery = "";
    // Dynamically filter cities only when there is a search query
    $: filteredCities = searchQuery
      ? data.dmas.filter(city =>
          city.name.toLowerCase().includes(searchQuery.toLowerCase())
        ).sort()
      : data.dmas;  // Show all cities when no search query
  
    function handleSelection(option:DMAData) {
      searchQuery = option.name;
      // Navigate to the same page with a query parameter for the selected city
      goto(`dma?dma=${encodeURIComponent(option.id)}`);
    }
</script>
  
<div class='relative w-full h-full'>
    <Map data={data} lat={39.8283} lng={-98.5795} zoom={4} />
    <header class="w-1/3 absolute top-6 left-1/2 transform -translate-x-1/2">
        <!-- Slot for the search bar -->
        <SearchBar
          bind:searchQuery={searchQuery}
          options={filteredCities}
          handleSelection={handleSelection}
        />
      </header>
</div>
