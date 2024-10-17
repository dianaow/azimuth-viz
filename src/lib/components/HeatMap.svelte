<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { useChart } from '$src/hooks/useChart';
  import HeatMap from '$src/lib/charts/heatmap.js';

  export let id;
  export let data;

  let parentContainer: HTMLElement | null = null;
  let chartCleanup: () => void;

  // Use the custom hook for chart rendering
  onMount(() => {
    chartCleanup = useChart(HeatMap, `heatmap-${id}`, data, parentContainer, {
      id: 'artist',
      xAttr: 'date',
      yAttr: 'artist',
      colorAttr: 'count',
      height: 360
    });
  });

  onDestroy(() => {
    // Cleanup logic if necessary
    if (chartCleanup) chartCleanup();
  });
</script>

<div class='w-full' bind:this={parentContainer}>
  <div id={`heatmap-${id}`}></div>
</div>
