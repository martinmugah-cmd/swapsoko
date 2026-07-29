import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';
const env = dotenv.parse(fs.readFileSync('../.env.local'));
const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data: profiles } = await supabase.from('profiles').select('user_id, full_name, email');
  console.log("Profiles:");
  profiles.forEach(p => console.log(p.full_name, p.user_id, p.email));
  
  const { data: rooms } = await supabase.from('chat_rooms').select('*');
  console.log("Rooms count:", rooms.length);
}
run();
