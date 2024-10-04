<script lang="ts">
  import * as d3 from 'd3';
  import { onMount, onDestroy } from 'svelte';
  import SteamGraph from '$lib/charts/steamgraph.js';
  import type { AirplayData } from '$src/lib/types.js';
  import { transformData, getTopArtists } from '$lib/utils/data';

  export let data: AirplayData[]

  let parentContainer: HTMLElement | null = null;
  let width = 0;
  let height = 0;

  // ResizeObserver to observe the parent container's dimensions
  let resizeObserver: ResizeObserver;

  // onMount is like React's useEffect (to add event listeners)
  onMount(() => {   
    if (parentContainer) {
      resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
          const { width: newWidth, height: newHeight } = entry.contentRect;
          width = newWidth;
          height = newHeight;
        }
      });

      // Observe the parent container for resizing
      resizeObserver.observe(parentContainer);
    }

    // Render chart when airplay data exists in the DOM
    if (data && width > 0) {
      const groupedData = groupByMarket(data);
      
      // Iterate over each group of data (market_id)
      groupedData.forEach((group: AirplayData[], marketId: string) => {
        // Create a DIV for each market
        d3.select("#streamgraphs-container")
          .append('div')
          .attr('id', `streamgraph-${marketId}`);

        const transformedData = transformData(group); // Pass each group of data
        const topData = getTopArtists(transformedData, 6);

        SteamGraph({
            data: topData,
            id: `#streamgraph-${marketId}`, // Render within the specific DIV
            width: width || 500,
            //height: screenSize.height,
            height: 130
        });
      });
    }
  });

  // onDestroy: Clean up the observer when the component is destroyed
  onDestroy(() => {
    if (resizeObserver && parentContainer) {
      resizeObserver.unobserve(parentContainer);
    }
  });

  // Group the data by market_id
  function groupByMarket(data: AirplayData[]): Map<string, AirplayData[]> { // Map where the key is market_id and value is an array of AirplayData
    return d3.group(data, (d: AirplayData) => d.market_id); // Group by market_id
  }
</script>

<div id='streamgraphs-container' class='w-full' bind:this={parentContainer}></div>