<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { useChart } from '$src/hooks/useChart';
  import BarChart from '$src/lib/charts/barchart.js';

  export let id;
  export let data;

  let parentContainer: HTMLElement | null = null;
  let chartCleanup: () => void;

  // Use the custom hook for chart rendering
  onMount(() => {
    chartCleanup = useChart(BarChart, `barchart-${id}`, data, parentContainer, {
      id: 'key',
      yAttr: 'key',
      xAttr: 'value'
    });
  });

  onDestroy(() => {
    // Cleanup logic if necessary
    if (chartCleanup) chartCleanup();
  });
</script>

<div class='w-full' bind:this={parentContainer}>
  <div id={`barchart-${id}`}></div>
</div>
