import type { LoadEvent } from '@sveltejs/kit'; // Import LoadEvent
import type { FetchDataResponse, MarketData, DemographicData, VenueData, StationData } from '$lib/types'; 
import { getAgeDistribution, getGenderDistribution, fetchData } from '$lib/utils/data';
export const ssr = false;

export const load = async ({ url, fetch, parent }: LoadEvent): Promise<FetchDataResponse> => {
  try {
    // const id = url.searchParams.get('dma') || "e87d94dd-3ac0-4295-bcba-1560106dd6f5"
    // const { dmas } = await parent();  
    // const dma = dmas.find((d: { id: string; }) => d.id === id) || {id, name: "Arizona"}

    // const demographic = await fetchDemographicData(id, fetch);
    // const markets = await fetchMarketsData(id, fetch);
    // const venues = await fetchVenuesData(id, fetch);
    // const stations = await fetchStationsData(markets, fetch);

    // const data: FetchDataResponse = {
    //   dma,
    //   markets,
    //   demographic,
    //   venues,
    //   stations
    // };
    const data = {}
    return data;
  } catch (error) {
    return { error: 'Failed to load data' } as unknown as FetchDataResponse; // Handle errors
  }
};

async function fetchMarketsData(dmaId: string, fetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>): Promise<MarketData[]> {
  return fetchData<MarketData>(
    fetch,
    (id) => `/api/market/${id}`,
    'Failed to fetch market data',
    dmaId
  );
}

async function fetchVenuesData(dmaId: string, fetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>): Promise<VenueData[]> {
  return fetchData<VenueData>(
    fetch,
    (id) => `/api/venue_dma/${id}`,
    'Failed to fetch venue data',
    dmaId
  );
}

async function fetchStationsData(marketData: MarketData[], fetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>): Promise<StationData[]> {
  try {
    const marketIds = marketData.map((market: { id: string }) => market.id);

    const stationsEndpoints = marketIds.map((id:string) => `/api/station/${id}`);

    const stationsResponses = await Promise.all(
      stationsEndpoints.map((url:string) => fetch(url))
    );

    if (stationsResponses.some(response => !response.ok)) {
      throw new Error('Failed to fetch some stations data');
    }

    const stationsData = await Promise.all(stationsResponses.map(res => res.json()));

    const stations = stationsData.map(d => d.data).flat();

    return stations
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