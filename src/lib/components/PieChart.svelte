<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { useChart } from '$src/hooks/useChart';
  import PieChart from '$src/lib/charts/piechart.js';

  export let id;
  export let data;

  let parentContainer: HTMLElement | null = null;
  let chartCleanup: () => void;

  // Use the custom hook for chart rendering
  onMount(() => {
    chartCleanup = useChart(PieChart, `piechart-${id}`, data, parentContainer, {
      id: 'key',
      radius: 80,
      colors: {
        "#1d4ed8": "male",
        "#60a5fa": "female"
      }
    });
  });

  onDestroy(() => {
    // Cleanup logic if necessary
    if (chartCleanup) chartCleanup();
  });
</script>

<div class='w-full' bind:this={parentContainer}>
  <div id={`piechart-${id}`}></div>
</div>
