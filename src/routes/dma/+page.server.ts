import type { LoadEvent } from '@sveltejs/kit'; // Import LoadEvent
import type { FetchDataResponse, AirplayData, DemographicData, VenueData } from '$lib/types'; 
import { topAirplay, groupAirplayByMarket, getAgeDistribution, getGenderDistribution} from '$lib/utils/data';
export const ssr = false;

export const load = async ({ url, fetch, parent }: LoadEvent): Promise<FetchDataResponse> => {
  try {
    const id = url.searchParams.get('dma') || "e87d94dd-3ac0-4295-bcba-1560106dd6f5"
    const { dmas } = await parent();  
    const dma = dmas.find(d => d.id === id) || {id, name: "Arizona"}

    //const airplay = await fetchAirplayData(id, fetch);
    const demographic = await fetchDemographicData(id, fetch);
    const venues = await fetchVenueData(id, fetch);

    const data: FetchDataResponse = {
      //dmas,
      dma,
      demographic,
      //airplay,
      venues
    };
    return data;
  } catch (error) {
    return { error: 'Failed to load data' } as unknown as FetchDataResponse; // Handle errors
  }
};

async function fetchVenueData(dmaId: string, fetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>): Promise<VenueData[]> {
  
  const venuesEndpoint = `/api/venue_dma/${dmaId}`;

  try {
    const venuesResponse = await fetch(venuesEndpoint);
    if (!venuesResponse.ok) {
      throw new Error('Failed to fetch venue data');
    }
    
    const venuesData = await venuesResponse.json();
    return venuesData.data
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}

async function fetchDemographicData(dmaId: string, fetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>): Promise<DemographicData> {
  
  const demEndpoint = `/api/demographic/${dmaId}`;

  try {
    const demResponse = await fetch(demEndpoint);
    if (!demResponse.ok) {
      throw new Error('Failed to fetch demographic data');
    }
    
    const demData = await demResponse.json();
    const demographic = demData.data

    const age = getAgeDistribution(demographic)
    const gender = getGenderDistribution(demographic)
    const population = demographic[0].population_total
    const median_age = demographic[0].median_age
    const rank = demographic[0].azimuth_rank

    return {age, gender, population, median_age, rank}
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}

async function fetchAirplayData(dmaId: string, fetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>): Promise<AirplayData> {
  
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