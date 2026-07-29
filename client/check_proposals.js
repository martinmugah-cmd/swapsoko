import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';
const env = dotenv.parse(fs.readFileSync('../.env.local'));
const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { data, error } = await supabase.from('proposals').insert({ listing_id: 1, from_user_id: 'test', to_user_id: 'test2' });
  console.log("INSERT RESULT:", error);
}
run();
