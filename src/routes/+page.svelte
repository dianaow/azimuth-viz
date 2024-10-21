<script lang="ts">
	import type { DMAData, MainFetchDataResponse } from '$src/lib/types.js';
	import SearchBar from '$lib/components/SearchBar.svelte';
	import Map from '$lib/components/Map.svelte';
	import { goto } from '$app/navigation';
    import { dmas } from '$lib/data/dmas.js';
    import { markets } from '$lib/data/marketsAll.js';

	//export let data: MainFetchDataResponse;
    const data = {dmas, markets}

    let isLoading = false;
	let searchQuery = '';

	// Dynamically filter cities only when there is a search query
	$: filteredCities = searchQuery
		? data.dmas.filter((city) => city.name.toLowerCase().includes(searchQuery.toLowerCase())).sort()
		: data.dmas; // Show all cities when no search query

	function handleSelection(option: DMAData) {
        isLoading = true;
		searchQuery = option.name;
		// Navigate to the same page with a query parameter for the selected city
		goto(`dma?dma=${encodeURIComponent(option.id)}`)
			.then(() => {
				// Hide the loader once the page is navigated
				isLoading = false;
			})
			.catch((error) => {
				// Hide the loader even in case of an error
				isLoading = false;
			});
	}
</script>

<div class="relative w-full h-full">
	<Map {data} lat={39.8283} lng={-98.5795} zoom={4} {handleSelection} />
	
	<!-- Search bar container -->
	<header class="w-1/3 absolute top-6 left-1/2 transform -translate-x-1/2">
		<SearchBar bind:searchQuery options={filteredCities} {handleSelection} />
	</header>

    <!-- Conditionally show the loading message -->
    {#if isLoading}
        <div class="absolute inset-0 flex items-center justify-center text-3xl text-center text-white">
            Loading...
        </div>
    {/if}
</div>
