import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';
const env = dotenv.parse(fs.readFileSync('../.env.local'));
const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data: user } = await supabase.from('profiles').select('user_id').eq('full_name', 'Mugah Mugah').limit(1).single();
  const userId = user.user_id;
  console.log("Mugah Mugah user_id:", userId);
  
  // Find a room where Mugah is user1 or user2
  const { data: rooms } = await supabase.from('chat_rooms').select('*').or(`user1_id.eq.${userId},user2_id.eq.${userId}`).limit(1);
  const room = rooms[0];
  console.log("Room:", room);
  
  // Insert a test proposal
  const { data: msg } = await supabase.from('messages').insert({
    room_id: room.id,
    sender_id: room.user1_id === userId ? room.user2_id : room.user1_id,
    type: 'proposal',
    content: JSON.stringify({
      proposalId: 999,
      listingId: 999,
      listingTitle: 'test item',
      message: 'test offer',
      cashTopUp: 0
    })
  }).select().single();
  console.log("Inserted proposal msg:", msg.id);
  
  // Now simulate "Accept Offer" -> onSend
  // It updates the proposal status:
  await supabase.from('messages').update({
    content: JSON.stringify({
      proposalId: 999,
      listingId: 999,
      listingTitle: 'test item',
      message: 'test offer',
      cashTopUp: 0,
      status: 'accepted'
    })
  }).eq('id', msg.id);
  console.log("Updated proposal status");
  
  // Then handleSend inserts [AGREEMENT]
  const data = {
    itemsExchanged: 'test item for test item',
    cashTopUp: 0,
    meetupPlace: 'test place',
    timeWindow: 'test time',
    conditionNotes: 'test notes',
    listingId: 999
  };
  const { data: insertedMsg, error } = await supabase.from('messages').insert({
    room_id: room.id,
    sender_id: userId,
    type: 'text',
    content: "[AGREEMENT]" + JSON.stringify(data)
  }).select().single();
  
  console.log("Inserted agreement:", insertedMsg, "Error:", error);
}
run();
