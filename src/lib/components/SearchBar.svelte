<script lang="ts">
  import { onMount } from 'svelte';
  import type { DMAData } from '$lib/types';

  export let searchQuery: string = "";
  export let options: DMAData[] = [];
  export let handleSelection: (option: DMAData) => void;

  let inputElement: HTMLInputElement | null = null;
  // Focus input on mount
  onMount(() => {
    inputElement?.focus();
  });

  // Function to handle selection
  const selectOption = (option: DMAData) => {
    handleSelection(option);
    searchQuery = option.name; // Clear search query to hide the dropdown
    inputElement?.focus(); // Keep focus on input after selecting an option
    options = []; 
  };

</script>

<div class="relative w-full">
  <!-- Search Input -->
  <input
    bind:this={inputElement}
    type="text"
    class="w-full px-4 py-2 text-lg border border-gray-300 rounded-custom shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    placeholder="Search city..."
    bind:value={searchQuery}
  />

  <!-- Dropdown Results -->
  {#if searchQuery || options.length > 0}
    <ul class="absolute w-full bg-white border border-gray-200 mt-1 rounded-custom shadow-lg z-10 max-h-80 overflow-y-scroll">
      {#each options as option (option)}
        <li>
          <button
            type="button"
            class="w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-100"
            on:click={() => selectOption(option)} 
          >
            {option.name}
          </button>
        </li>
      {/each}
    </ul>  
  {/if}
</div>
