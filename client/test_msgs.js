import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';
const env = dotenv.parse(fs.readFileSync('../.env.local'));
const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase.from('messages').select('*').like('content', '%[AGREEMENT]%');
  console.log("Agreement messages:", data?.length);
  if (data?.length > 0) {
     console.log(data[0]);
  }
}
run();
