<script lang="ts">
  import type { DMAData } from '$lib/types';

  export let searchQuery: string = "";
  export let options: DMAData[] = [];
  export let handleSelection: (option: DMAData) => void;

  let inputElement: HTMLInputElement | null = null;
  let highlightedOptionIndex = 0; // To track the selected option via keyboard
  $: isOpen = false

  // Function to handle selection
  const selectOption = (option: DMAData) => {
    isOpen = false
    if(handleSelection) handleSelection(option);
    searchQuery = option.name; // Clear search query to hide the dropdown
    inputElement?.focus(); // Keep focus on input after selecting an option
    options = []
  };

  // Handle keyboard events for input
  const handleKeyDown = (event: KeyboardEvent) => {
    isOpen=true
    if (options.length > 0) {
      if (event.key === 'ArrowDown') {
        // Move down the list
        event.preventDefault();
        highlightedOptionIndex = (highlightedOptionIndex + 1) % options.length;
      } else if (event.key === 'ArrowUp') {
        // Move up the list
        event.preventDefault();
        highlightedOptionIndex = (highlightedOptionIndex - 1 + options.length) % options.length;
      } else if (event.key === 'Enter') {
        // Select the highlighted option
        event.preventDefault();
        if (options[highlightedOptionIndex]) {
          selectOption(options[highlightedOptionIndex]);
        }
      }
    }
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
    on:keydown={handleKeyDown}
  />

  <!-- Dropdown Results -->
  {#if isOpen || (searchQuery && options.length > 0)}
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
