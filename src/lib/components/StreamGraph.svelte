<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import StreamGraph from '$src/lib/charts/streamgraph.js';

  export let id
  export let data

  let chartRendered = false;
  let parentContainer: HTMLElement | null = null;
  let width = 0;
  let height = 0;

  // ResizeObserver to observe the parent container's dimensions
  let resizeObserver: ResizeObserver;

  onMount(() => {
    if (parentContainer) {
      resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
          const { width: newWidth, height: newHeight } = entry.contentRect;
          width = newWidth;
          height = newHeight;
        }
  
        const element = document.getElementById(`streamgraph-${id}`);

        // Render the chart only after width is updated
        if (!chartRendered && element && data && width > 0) {
          StreamGraph({
            data,
            id: `#streamgraph-${id}`,
            width: width || 500,
            height: 200
          });
          chartRendered = true;
          console.log('rendered')
        }
      });

      // Only observe if parentContainer is not null
      if (parentContainer instanceof HTMLElement) {
        resizeObserver.observe(parentContainer);
      }
    }
  });

  // onDestroy: Clean up the observer when the component is destroyed
  onDestroy(() => {
    if (resizeObserver && parentContainer) {
      resizeObserver.unobserve(parentContainer);
    }
  });
</script>

<div class='w-full' bind:this={parentContainer}>
  <div id={`streamgraph-${id}`}></div>
</div>