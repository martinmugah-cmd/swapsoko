import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';
const env = dotenv.parse(fs.readFileSync('../.env.local'));
const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data: room } = await supabase.from('chat_rooms').select('*').limit(1).single();
  const activeUserId = room.user2_id;
  const { data, error } = await supabase.from('messages').insert({
     room_id: room.id,
     sender_id: activeUserId,
     type: 'text',
     content: 'test message'
  }).select().single();
  console.log("Insert finished. Error:", error);
}
run();
