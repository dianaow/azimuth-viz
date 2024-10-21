<script lang="ts">
  import * as turf from '@turf/turf';
  import type { Feature, Polygon } from 'geojson';
  import { goto } from '$app/navigation';
  import type { FetchDataResponse } from '$src/lib/types.js';
  import SidePanel from '$src/lib/components/SidePanel.svelte';
  import Map from '$lib/components/Map.svelte';
  import { dma } from '$lib/data/dma.js';
  import { demographic } from '$lib/data/demographic.js';
  import { markets } from '$lib/data/markets.js';
  import { stations } from '$lib/data/stations.js'
  import { venues } from '$lib/data/venues.js'
  
  //export let data: FetchDataResponse
  const data = {dma, demographic, markets, stations, venues}
  let clickedLocation: any = null

  function handleClick() {
    goto('/');
  }

  // Calculate centroid
  const coordinates = JSON.parse(data.dma.geometry);
  const geojsonData: Feature<Polygon> = {
    "type": "Feature",
    "geometry": {
        "type": "Polygon",
        ...coordinates
    },
    properties: {}
  }; 
  const centroid = turf.centroid(geojsonData);
  let [longitude, latitude] = centroid.geometry.coordinates;

  $: longitude = clickedLocation ? clickedLocation.longitude : longitude
  $: latitude = clickedLocation ? clickedLocation.latitude : latitude
  $: zoom = clickedLocation ? 10 : 7
</script>

<div>
  <Map data={data} bind:lat={latitude} bind:lng={longitude} zoom={zoom} handleSelection={null} />
  <div class='absolute top-3 left-3'>
    <button class="w-8 h-8" on:click={handleClick}>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width={1.5} stroke="white">
        <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>        
    </button>
  </div>
  <div class='absolute h-full top-3 right-3 w-1/3'>
    <SidePanel data={data} bind:clickedPoint={clickedLocation} />
  </div>
</div>
