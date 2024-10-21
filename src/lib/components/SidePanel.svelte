<script lang="ts">
    import type { FetchDataResponse, AirplayData, MarketData } from '$src/lib/types.js';
    import StreamGraph from '$src/lib/components/StreamGraph.svelte';
    import BarChart from '$src/lib/components/BarChart.svelte';
    import PieChart from '$src/lib/components/PieChart.svelte';
    import HeatMap from '$src/lib/components/HeatMap.svelte';
    import Tabs from '$src/lib/ui/Tabs.svelte';
    import VenueList from '$src/lib/components/VenueList.svelte';
    import StationList from '$src/lib/components/StationList.svelte';
    import Card from '$src/lib/ui/Card.svelte';
    import { topAirplay, groupAirplayByMarket } from '$lib/utils/data';

    export let clickedPoint = null
    export let data: FetchDataResponse;
    const { demographic, dma, markets, venues, stations } = data

    const leftTabs = ['Demographics', 'Radio Station', 'Venues', 'Artists']

    $: activeTab = 2

    let airplay: any = null;
    let isLoading = false;
    
    const handleRowClick = (value: any) => {
      clickedPoint = value
    };

    $: if (activeTab === 3 && !airplay) {
      fetchAirplay();
    }

    async function fetchAirplay() {
      isLoading = true;
      airplay = await fetchAirplayData(markets);
      isLoading = false;
    }

    async function fetchAirplayData(marketData: MarketData[]): Promise<AirplayData> {
      try {
        // Assuming dmaData contains an array of objects where each object has a market_id field
        const marketIds = marketData.map((market: { id: string }) => market.id);

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
          <h1 class='text-gray-100 text-3xl mb-8 font-bold'>{dma.name}</h1>
          <p class="text-xs">Population</p>  
          <p class="text-xl mb-5">{demographic.population}</p>  
          <p class="text-xs">Median age</p>        
          <p class="text-xl mb-5">{demographic.median_age}</p>  
          <p class="text-xs">Rank</p>        
          <p class="text-xl mb-5">{demographic.rank}</p>  
        </div>
        <div class='w-2/3 mt-15'>
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
  {:else if activeTab === 1 && stations && stations.length > 0}
    <p class="text-lg font-semibold ml-2">Stations</p>
    <StationList 
        data={stations} 
        onRowClick={handleRowClick}
    />
  {:else if activeTab === 2 && venues && venues.length > 0}
    <p class="text-lg font-semibold ml-2">Venues</p>
    <VenueList 
        data={venues} 
        onRowClick={handleRowClick}
    />
  {:else if activeTab === 3 && airplay}
    {#if isLoading}
      <div class="text-3xl text-center text-white">
          Loading...
      </div>
    {/if}
    <p class="text-lg font-semibold ml-2">Daily plays for Top 15 Artists</p>
    <HeatMap
        data={airplay.heatmap} 
        id="airplay"
    />
    <div class="max-h-1/2 overflow-y-scroll">
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
    </div>
  {/if}
</Tabs> 