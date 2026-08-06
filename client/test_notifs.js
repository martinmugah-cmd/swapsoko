import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';
const env = dotenv.parse(fs.readFileSync('../.env.local'));
const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data: users } = await supabase.from('profiles').select('user_id, name');
  const { data: notifs } = await supabase.from('notifications').select('*');
  
  users.forEach(u => {
     const myNotifs = notifs.filter(n => n.user_id === u.user_id);
     console.log(`User ${u.name} has ${myNotifs.length} notifications`);
  });
}
run();
