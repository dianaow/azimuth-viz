import type { LoadEvent } from '@sveltejs/kit'; // Import LoadEvent
import type { FetchDataResponse, AirplayData, DemographicData } from '$lib/types'; // Import your response types
export const ssr = false;

export const load = async ({ fetch }: LoadEvent): Promise<FetchDataResponse> => {
  try {
    const id = "e87d94dd-3ac0-4295-bcba-1560106dd6f5"
    const airplay = await fetchAirplayData(id, fetch);
    //const demographic = await fetchDemographicData(id, fetch);

    const data: FetchDataResponse = {
      //demographic,
      airplay
    };
    //const data = {}
    return data;
  } catch (error) {
    return { error: 'Failed to load data' } as FetchDataResponse; // Handle errors
  }
};

async function fetchDemographicData(dmaId: string, fetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>): Promise<DemographicData[]> {
  
  const demEndpoint = `/api/demographic/${dmaId}`;

  try {
    const demResponse = await fetch(demEndpoint);
    if (!demResponse.ok) {
      throw new Error('Failed to fetch demographic data');
    }
    
    const demData = await demResponse.json();
    return demData.data
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}

async function fetchAirplayData(dmaId: string, fetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>): Promise<AirplayData[]> {
  
  const marketEndpoint = `/api/market/${dmaId}`;

  try {
    // Step 1: Fetch DMA data to extract market IDs
    const marketResponse = await fetch(marketEndpoint);
    if (!marketResponse.ok) {
      throw new Error('Failed to fetch DMA data');
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

    return airplayData.map(d => d.data).flat();
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}