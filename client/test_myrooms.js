import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';
const env = dotenv.parse(fs.readFileSync('../.env.local'));
const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data: rooms } = await supabase.from('chat_rooms').select('*');
  const nullRooms = rooms.filter(r => r.user2_id === null);
  console.log("Total rooms:", rooms.length);
  console.log("Rooms with user2_id == null:", nullRooms.length);
  if (nullRooms.length > 0) {
      console.log(nullRooms);
  }
}
run();
