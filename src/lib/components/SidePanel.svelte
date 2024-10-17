<script lang="ts">
    import type { FetchDataResponse, AirplayData } from '$src/lib/types.js';
    import StreamGraph from '$src/lib/components/StreamGraph.svelte';
    import BarChart from '$src/lib/components/BarChart.svelte';
    import PieChart from '$src/lib/components/PieChart.svelte';
    import HeatMap from '$src/lib/components/HeatMap.svelte';
    import Tabs from '$src/lib/ui/Tabs.svelte';
    import TableList from '$src/lib/ui/TableList.svelte';
    import Card from '$src/lib/ui/Card.svelte';
    import { topAirplay, groupAirplayByMarket } from '$lib/utils/data';

    //import { airplay } from '$lib/data/airplay.js';

    export let venue
    export let data: FetchDataResponse;
    const { demographic, dma, venues } = data

    const leftTabs = ['Demographics', 'Markets', 'Venues', 'Artists']

    $: activeTab = 2

    const handleRowClick = (value: any) => {
      venue = value
    };

    let airplay: any = null;

    // Watch for activeTab changes and fetch data when activeTab is 0
    $: if (activeTab === 3 && !airplay) {
      fetchAirplay();
    }

    async function fetchAirplay() {
      airplay = await fetchAirplayData(dma.id);
    }

    async function fetchAirplayData(dmaId: string): Promise<AirplayData> {
      
      const marketEndpoint = `/api/market/${dmaId}`;

      try {
        // Step 1: Fetch DMA data to extract market IDs
        const marketResponse = await fetch(marketEndpoint);
        if (!marketResponse.ok) {
          throw new Error('Failed to fetch airplay data');
        }
        
        const marketData = await marketResponse.json();

        // Assuming dmaData contains an array of objects where each object has a market_id field
        const marketIds = marketData.data.map((market: { id: string }) => market.id);

        // Step 2: Use the extracted market IDs to build URLs for the airplay API
        const airplayEndpoints = marketIds.map((id:string) => `/api/airplay/${id}`);

        // Step 3: Fetch airplay data for each market
        const airplayResponses = await Promise.all(
          airplayEndpoints.map((url:string) => fetch(url))
        );

        // Check for any response failures
        if (airplayResponses.some(response => !response.ok)) {
          throw new Error('Failed to fetch some airplay data');
        }

        // Step 4: Process the airplay responses into a key-value object
        const airplayData = await Promise.all(airplayResponses.map(res => res.json()));

        const airplay = airplayData.map(d => d.data).flat();

        const heatmap = topAirplay(airplay);
        const streamgraph = groupAirplayByMarket(airplay);

        return {heatmap, streamgraph}
      } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
      }
    }
</script>

<Tabs leftTabs={leftTabs} bind:activeTab={activeTab}>
  {#if activeTab === 0 && demographic}
    <Card>
      <div class='flex w-full'>
        <div class='w-1/3'>
          <p class="text-lg mb-3 font-bold">{dma.name}</p>
          <p class="text-xs">Population</p>  
          <p class="text-xl mb-5">{demographic.population}</p>  
          <p class="text-xs">Median age</p>        
          <p class="text-xl mb-5">{demographic.median_age}</p>  
          <p class="text-xs">Rank</p>        
          <p class="text-xl mb-5">{demographic.rank}</p>  
        </div>
        <div class='w-2/3 mt-6'>
          <PieChart 
              data={demographic.gender}
              id="gender"
          /> 
        </div>
      </div>             
    </Card>
    <Card>
        <p class="text-sm">Age (%)</p>
        <BarChart 
            data={demographic.age}
            id="age"
        />
    </Card>
  {:else if activeTab === 2 && venues && venues.length > 0}
    <p class="text-lg font-semibold ml-2">Venues</p>
    <TableList 
        data={venues} 
        onRowClick={handleRowClick}
    />
  {:else if activeTab === 3 && airplay}
    <p class="text-lg font-semibold ml-2">Daily plays for Top 15 Artists</p>
    <HeatMap
        data={airplay.heatmap} 
        id="airplay"
    />
    <Card>
        <p class="text-sm font-semibold">By Market: Daily plays for Top 6 Artists</p>
        {#each airplay.streamgraph as graph, index}
            <p class="text-xs text-neutral-500 mt-2">{dma.name}</p>
            <StreamGraph 
                data={graph.data} 
                id={index} 
            />
        {/each}
    </Card>
  {/if}
</Tabs> 