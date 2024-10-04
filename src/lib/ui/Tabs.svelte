<script lang="ts">
  export let leftTabs: string[] = [];

  let activeLeftTab = 0;

  const handleLeftTabClick = (index: number) => {
    activeLeftTab = index;
  };
</script>

<div class="flex">
  <!-- Left-hand sided tabs -->
  <div class="w-1/6 border-r border-gray-200 flex flex-col justify-start mt-10">
    {#each leftTabs as tab, index}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div
        class="p-4 cursor-pointer {activeLeftTab === index ? 'bg-gray-200 font-bold' : ''}"
        on:click={() => handleLeftTabClick(index)}
      >
        {tab}
      </div>
    {/each}
  </div>

  <!-- Content area -->
  <div class="w-5/6 p-4">
    <!-- Display either the left tab content or the top tab content -->
    <div class="space-y-8">
      <slot></slot>
    </div>
  </div>
</div>
