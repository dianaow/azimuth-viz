<script lang="ts">
    import type { FetchDataResponse } from '$src/lib/types.js';
    import StreamGraph from '$src/lib/components/StreamGraph.svelte';
    import Tabs from '$src/lib/ui/Tabs.svelte';
    import Table from '$src/lib/ui/Table.svelte';
    import Card from '$src/lib/ui/Card.svelte';
    import { topAirplay, groupAirplayByMarket } from '$lib/utils/data';
    import { airplay } from '$lib/data/airplay.js';

    // export let data: FetchDataResponse
    // const { airplay } = data

    const leftTabs = ['Demographics', 'Markets', 'Venues', 'Artists']

    const tableData = airplay ? topAirplay(airplay) : []
    const graphsData = airplay ? groupAirplayByMarket(airplay) : []

    const handleRowClick = () => {};
</script>


<div class='relative w-full h-full bg-blue-950'>
    <h1 class='text-5xl text-white p-6'>Phoenix</h1>
    <div class='absolute top-6 right-6 w-1/3'>
        <Tabs leftTabs={leftTabs} activeTab={3}>
            {#if airplay && airplay.length > 0}
               <Card>
                    <p class="text-sm">Daily plays for Top 15 Artists</p>
                    <Table 
                        data={tableData} 
                        onRowClick={handleRowClick}
                    />
                </Card>
                <Card>
                    <p class="text-sm">By Market: Daily plays for Top 6 Artists</p>
                    {#each graphsData as graph, index}
                        <p class="text-xs text-neutral-500 mt-2">{"Pheonix, AZ"}</p>
                        <StreamGraph 
                            data={graph.data} 
                            id={index} 
                        />
                    {/each}
                </Card>
            {/if}
        </Tabs>    
    </div>
</div>

