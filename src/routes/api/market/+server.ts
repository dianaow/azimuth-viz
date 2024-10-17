import { supabase } from '$lib/supabase';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {

  const { data, error } = await supabase
    .from('market')
    .select('*')

  if (error) {
    return json({ error: error.message }, { status: 500 });
  }

  return json({ data });
};