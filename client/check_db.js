import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';
const env = dotenv.parse(fs.readFileSync('../.env.local'));
const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const saves = await supabase.from('saved_items').select('id', { count: 'exact', head: true });
  console.log("saved_items:", saves.error ? saves.error.message : saves.count);

  const views = await supabase.from('listing_views').select('id', { count: 'exact', head: true });
  console.log("listing_views:", views.error ? views.error.message : views.count);

  const offers = await supabase.from('proposals').select('id', { count: 'exact', head: true });
  console.log("proposals:", offers.error ? offers.error.message : offers.count);
}
run();
