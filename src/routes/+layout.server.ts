import type { LoadEvent } from '@sveltejs/kit'; // Import LoadEvent
import type { MainFetchDataResponse, DMAData, MarketData } from '$lib/types'; // Import your response types
export const ssr = false;

export const load = async ({ fetch }: LoadEvent): Promise<MainFetchDataResponse> => {
  try {
    const dmas = await fetchDMAData(fetch);
    const markets = await fetchMarketData(fetch);

    const data: MainFetchDataResponse = {
      dmas,
      markets
    };

    return data;
  } catch (error) {
    return { error: 'Failed to load data' } as unknown as MainFetchDataResponse; // Handle errors
  }
};

async function fetchDMAData(fetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>): Promise<DMAData[]> {
  
  const dmaEndpoint = `/api/dma`;

  try {
    const dmaResponse = await fetch(dmaEndpoint);
    if (!dmaResponse.ok) {
      throw new Error('Failed to fetch DMA data');
    }
    
    const dmaData = await dmaResponse.json();
    return dmaData.data
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}


async function fetchMarketData(fetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>): Promise<MarketData[]> {
  
  const dmaEndpoint = `/api/market`;

  try {
    const dmaResponse = await fetch(dmaEndpoint);
    if (!dmaResponse.ok) {
      throw new Error('Failed to fetch Market data');
    }
    
    const dmaData = await dmaResponse.json();
    return dmaData.data
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}