<script lang="ts">
  export let leftTabs: string[] = [];

  export let activeTab = 0;
  
  const handleLeftTabClick = (index: number) => {
    activeTab = index;
  };
</script>

<div class="flex">
  <!-- Left-hand sided tabs -->
  <div class="w-14 flex flex-col justify-start mt-20 space-y-2">
    {#each leftTabs as tab, index}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div
        class="vertical-text text-sm h-40 flex justify-center items-center rounded-r-custom cursor-pointer {activeTab === index ? 'bg-gray-300 font-bold text-black' : 'bg-white opacity-25 text-black'}"
        on:click={() => handleLeftTabClick(index)}
      >
        {tab.toUpperCase()}
      </div>
    {/each}
  </div>

  <!-- Content area -->
  <div class="w-11/12 p-4 rounded-custom bg-gray-300 shadow-lg space-y-3">
    <slot></slot>
  </div>
</div>
