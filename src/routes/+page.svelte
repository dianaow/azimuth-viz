<script lang="ts">
    import type { FetchDataResponse } from '$src/lib/types.js';
    import StreamGraph from '$src/lib/components/StreamGraph.svelte';
    import Tabs from '$src/lib/ui/Tabs.svelte';
    import Table from '$src/lib/ui/Table.svelte';
    import { transformData, getTopArtists } from '$lib/utils/data';
    //import { airplay } from '$lib/data/airplay.js';

    export let data: FetchDataResponse
    const { airplay, demographic } = data
    console.log(airplay, demographic)

    const leftTabs = ['Demographics', 'Markets', 'Venues', 'Artists']

    const transformedData = airplay ? transformData(airplay?.data) : []
    const tableData = getTopArtists(transformedData, 20)
    const graphData = getTopArtists(transformedData, 6)

    const handleRowClick = () => {};
</script>


<div class='absolute top-0 right-2'>
    <Tabs leftTabs={leftTabs} >
        {#if airplay?.data && airplay.data.length > 0}
            <Table 
                data={tableData} 
                onRowClick={handleRowClick}
                title="Daily plays for artists"
            />
            <StreamGraph 
                data={graphData} 
            />
        {/if}
    </Tabs>    
</div>

