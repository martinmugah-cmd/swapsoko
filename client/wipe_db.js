import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';

const env = dotenv.parse(fs.readFileSync('../.env.local'));
const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_SERVICE_ROLE_KEY);

async function wipeDatabase() {
  const tables = [
    'community_replies',
    'community_posts',
    'community_join_requests',
    'community_members',
    'communities',
    'saved_items',
    'messages',
    'chat_rooms',
    'proposals',
    'wishes',
    'listings',
    'profiles'
  ];

  console.log('Starting database wipe...');

  for (const table of tables) {
    console.log(`Wiping table: ${table}...`);
    // Supabase allows delete().neq('id', 0) to delete all rows
    // Since some tables use UUID for id, we can use neq('id', '00000000-0000-0000-0000-000000000000') or simply not.is_null
    const { error } = await supabase.from(table).delete().not('created_at', 'is', null);
    
    if (error) {
      // If table doesn't have created_at, fallback to another strategy or just ignore if table doesn't exist
      const { error: fallbackError } = await supabase.from(table).delete().neq('id', -1);
      if (fallbackError) {
        console.log(`Failed to wipe ${table}:`, fallbackError.message);
      } else {
        console.log(`Successfully wiped ${table} using fallback.`);
      }
    } else {
      console.log(`Successfully wiped ${table}.`);
    }
  }

  console.log('Database wipe completed.');
}

wipeDatabase();
