import { supabase } from '$lib/supabase';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params }) => {
  const { id } = params;

  const { data, error } = await supabase
    .from('venue_dma')
    .select('*')
    .eq('dma_id', id)

  const selectedVenues = data?.map(d => d.venue_id) || []
  const venuesData = await getVenues(selectedVenues);
  const venuesImages = await getVenueImages(selectedVenues);
  venuesData.forEach(d => {
    const { category, color } = getCapacityInfo(+d.capacity);
    const venue = venuesImages.find(v => v.venue_id === d.id)
    if(venue){
      d.image_url_small = venue['image_url_64x64']
      d.image_url_large = venue['image_url_328x200']
    }
    d.category = category
    d.color = color
  })

  if (error) {
    return json({ error: error.message }, { status: 500 });
  }

  return json({ data: venuesData });
};

function getCapacityInfo(capacity: number) {
  if(!capacity) return { category: 'Unknown', color: 'bg-gray-500' }
  if (capacity <= 199) return { category: 'Micro', color: 'bg-fuchsia-500' };
  if (capacity <= 999) return { category: 'Small', color: 'bg-fuchsia-500' };
  if (capacity <= 2999) return { category: 'Mid-A', color: 'bg-fuchsia-700' };
  if (capacity <= 4999) return { category: 'Mid-B', color: 'bg-fuchsia-700' };
  if (capacity <= 9999) return { category: 'Mid-C', color: 'bg-fuchsia-700' };
  if (capacity <= 15000) return { category: 'Large-A', color: 'bg-fuchsia-800' };
  if (capacity <= 20000) return { category: 'Large-B', color: 'bg-fuchsia-800' };
  if (capacity <= 50000) return { category: 'Large-C', color: 'bg-fuchsia-800' };
  if (capacity <= 2147483647) return { category: 'Mega', color: 'bg-fuchsia-900' };
  
  return { category: 'Unknown', color: 'bg-gray-500' }; // Default if out of range
}

async function getVenues(venues: string[]) {
  const { data, error } = await supabase
    .from('venue')
    .select('*')
    .in('id', venues); // venues is an array of venue names

  if (error) {
    console.error('Error fetching data:', error);
    return [];
  }
  return data;
}

async function getVenueImages(venues: string[]) {
  const { data, error } = await supabase
    .from('venue_images')
    .select('*')
    .in('venue_id', venues); // venues is an array of venue names

  if (error) {
    console.error('Error fetching data:', error);
    return [];
  }
  return data;
}