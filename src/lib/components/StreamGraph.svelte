<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { useChart } from '$src/hooks/useChart';
  import StreamGraph from '$src/lib/charts/streamgraph.js';

  export let id;
  export let data;

  let parentContainer: HTMLElement | null = null;
  let chartCleanup: () => void;

  // Use the custom hook for chart rendering
  onMount(() => {
    chartCleanup = useChart(StreamGraph, `streamgraph-${id}`, data, parentContainer, {
      colorScheme: ['#fdf4ff', '#f5d0fe', '#e879f9', '#c026d3', '#86198f', '#ec4899']
    });
  });

  onDestroy(() => {
    // Cleanup logic if necessary
    if (chartCleanup) chartCleanup();
  });
</script>

<div class='w-full' bind:this={parentContainer}>
  <div id={`streamgraph-${id}`}></div>
</div>
