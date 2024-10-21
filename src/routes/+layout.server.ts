import type { LoadEvent } from '@sveltejs/kit'; // Import LoadEvent
import type { MainFetchDataResponse, DMAData, MarketData } from '$lib/types'; // Import your response types
import { fetchData } from '$lib/utils/data';
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

async function fetchMarketData(fetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>): Promise<MarketData[]> {
  return fetchData<MarketData>(
    fetch,
    `/api/market`,
    'Failed to fetch markets data'
  );
}

async function fetchDMAData(fetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>): Promise<DMAData[]> {
  return fetchData<DMAData>(
    fetch,
    `/api/dma`,
    'Failed to fetch DMA data'
  );
}
