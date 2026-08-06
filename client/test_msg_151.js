import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';
const env = dotenv.parse(fs.readFileSync('../.env.local'));
const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data } = await supabase.from('messages').select('content').eq('id', 151).single();
  console.log(data.content.substring(0, 500));
  console.log("Includes status:", data.content.includes("status"));
}
run();
