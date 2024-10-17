<script lang="ts">
  import { goto } from '$app/navigation';
  import type { FetchDataResponse } from '$src/lib/types.js';
  import SidePanel from '$src/lib/components/SidePanel.svelte';
  import Map from '$lib/components/Map.svelte';
  import * as turf from '@turf/turf';

  export let data: FetchDataResponse
  let venue: any = null

  function handleClick() {
    goto('/');
  }

  // Calculate centroid
  const coordinates = JSON.parse(data.dma.geometry);
  const geojsonData = {
    "type": "Feature",
    "geometry": {
        "type": "Polygon",
        ...coordinates
    },
  }; 
  const centroid = turf.centroid(geojsonData);
  let [longitude, latitude] = centroid.geometry.coordinates;

  $: longitude = venue ? venue.longitude : longitude
  $: latitude = venue ? venue.latitude : latitude
  $: console.log('main page', longitude, latitude, data)
</script>

<div>
  <Map data={data} bind:lat={latitude} bind:lng={longitude} zoom={7} />
  <div class='absolute top-3 left-3'>
      <button class="w-8 h-8" on:click={handleClick}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="size-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>        
      </button>
      <h1 class='text-4xl text-white pl-12'>{data.dma?.name}</h1>
      <!-- <h1 class='text-base text-white px-6'>Population: <span class="text-blue">{data.dma?.population}</span></h1> -->
  </div>
  <div class='absolute h-full top-3 right-3 w-1/3'>
      <SidePanel data={data} bind:venue={venue} />
  </div>
</div>

