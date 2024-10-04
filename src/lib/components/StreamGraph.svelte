<script lang="ts">
  import * as d3 from 'd3';
  import { onMount, onDestroy } from 'svelte';
  import SteamGraph from '$lib/charts/steamgraph.js';

  export let data

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
      // Create a DIV for each market
      d3.select("#streamgraph-container")
        .append('div')
        .attr('id', `streamgraph`);

      SteamGraph({
          data,
          id: `#streamgraph`, // Render within the specific DIV
          width: width || 500,
          //height: screenSize.height,
          height: 200
      });
    }
  });

  // onDestroy: Clean up the observer when the component is destroyed
  onDestroy(() => {
    if (resizeObserver && parentContainer) {
      resizeObserver.unobserve(parentContainer);
    }
  });
</script>

<div id='streamgraph' class='w-full' bind:this={parentContainer}></div>