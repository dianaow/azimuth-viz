import { supabase } from '$lib/supabase';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params }) => {

  const startDate = '2024-06-01T00:00:00Z'; // Example start date (ISO format)
  const endDate = '2024-10-01T23:59:59Z'; // Example end date (ISO format)

  const { data, error } = await supabase
    .from('airplay')
    .select('*')
    .gte('timestamp', startDate)  // Greater than or equal to the start date
    .lte('timestamp', endDate);   // Less than or equal to the end date

  if (error) {
    return json({ error: error.message }, { status: 500 });
  }

  return json({ data });
};