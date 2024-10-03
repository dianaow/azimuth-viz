import { supabase } from '$lib/supabase';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params }) => {

  const { data, error } = await supabase
    .from('demographic_data')
    .select('*')

  if (error) {
    return json({ error: error.message }, { status: 500 });
  }

  return json({ data });
};