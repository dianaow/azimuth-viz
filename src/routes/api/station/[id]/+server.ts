import { supabase } from '$lib/supabase';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params }) => {
  const { id } = params;

  const { data, error } = await supabase
    .from('station')
    .select('*')
    .eq('market_id', id)

  if (error) {
    return json({ error: error.message }, { status: 500 });
  }

  return json({ data });
};