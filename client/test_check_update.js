import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';
const env = dotenv.parse(fs.readFileSync('../.env.local'));
const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data: room } = await supabase.from('chat_rooms').select('*').limit(1).single();
  const activeUserId = room.user2_id;
  const { data: inserted, error: insertError } = await supabase.from('messages').insert({
     room_id: room.id,
     sender_id: activeUserId,
     type: 'text',
     content: 'test message'
  }).select().single();
  
  console.log("Inserted:", inserted);
  
  // NOW simulate ANOTHER user trying to update it!
  const otherUserId = room.user1_id;
  // wait, the client app doesn't specify who is updating, it just uses the anon key and the active session!
  // test_check_update uses anon key without a session, so it runs as an anonymous user!
  
  const { data: updated, error: updateError } = await supabase.from('messages').update({ content: 'updated' }).eq('id', inserted.id).select().single();
  console.log("Updated:", updated, "Error:", updateError);
}
run();
