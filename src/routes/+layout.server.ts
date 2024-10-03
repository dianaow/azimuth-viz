import type { LoadEvent } from '@sveltejs/kit'; // Import LoadEvent
import type { FetchDataResponse } from '$lib/types'; // Import your response types
export const ssr = false;

export const load = async ({ fetch }: LoadEvent): Promise<FetchDataResponse> => {
  try {
    const data = await fetchDataFromAPIs(fetch); // Fetch data from your APIs
    //const data = {}
    return data;
  } catch (error) {
    return { error: 'Failed to load data' } as FetchDataResponse; // Handle errors
  }
};

// Helper function to fetch data from multiple APIs
async function fetchDataFromAPIs(fetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>): Promise<FetchDataResponse> {
  const apiEndpoints = [
    { url: '/api/demographic', key: 'demographic' },
    { url: '/api/airplay', key: 'airplay' }
  ];

  try {
    // Fetch all data in parallel
    const responses = await Promise.all(
      apiEndpoints.map(endpoint => fetch(endpoint.url))
    );

    // Check for any response failures
    if (responses.some(response => !response.ok)) {
      throw new Error('Failed to fetch some data');
    }

    // Process all responses into a key-value object
    const data = await Promise.all(responses.map(res => res.json()));

    // Construct the final object by combining keys and data
    const result = apiEndpoints.reduce((acc, endpoint, index) => {
      acc[endpoint.key] = data[index];
      return acc;
    }, {} as FetchDataResponse); // Type assertion for result

    return result;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error; // Re-throw the error for handling
  }
}
