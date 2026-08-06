import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';
const env = dotenv.parse(fs.readFileSync('../.env.local'));
const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data: p1 } = await supabase.from('profiles').select('name').eq('user_id', '6f6878f6-c228-402c-a878-c0d6adcdc1a2').single();
  const { data: p2 } = await supabase.from('profiles').select('name').eq('user_id', '9d029a10-e17a-422b-9faf-da476626972f').single();
  console.log("p1:", p1?.name);
  console.log("p2:", p2?.name);
}
run();
