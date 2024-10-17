<script lang="ts">
  export let leftTabs: string[] = [];

  export let activeTab = 0;
  
  const handleLeftTabClick = (index: number) => {
    activeTab = index;
  };
</script>

<div class="flex h-full">
  <!-- Left-hand sided tabs -->
  <div class="w-12 flex flex-col justify-start mt-20 space-y-2">
    {#each leftTabs as tab, index}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div
        class="vertical-text text-sm h-40 flex justify-center items-center rounded-r-custom cursor-pointer text-white {activeTab === index ? 'bg-indigo-950 font-semibold' : 'bg-indigo-950 opacity-50'}"
        on:click={() => handleLeftTabClick(index)}
      >
        {tab.toUpperCase()}
      </div>
    {/each}
  </div>

  <!-- Content area -->
  <div class="w-11/12 h-full p-4 rounded-custom bg-indigo-950 shadow-lg space-y-3 flex flex-col">
    <slot></slot>
  </div>
</div>
