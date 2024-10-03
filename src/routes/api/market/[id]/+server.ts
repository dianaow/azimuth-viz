import { supabase } from '$lib/supabase';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params }) => {
  const { id } = params;

  const { data, error } = await supabase
    .from('market')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return json({ error: error.message }, { status: 500 });
  }

  return json({ data });
};