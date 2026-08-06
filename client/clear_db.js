import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';

const env = dotenv.parse(fs.readFileSync('../.env.local'));
const client = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY);

async function wipe() {
  console.log('Wiping mock data...');
  const { error: e1 } = await client.from('listings').delete().neq('id', 0);
  console.log('Listings wiped:', e1 ? e1.message : 'Success');
  
  const { error: e2 } = await client.from('wishes').delete().neq('id', 0);
  console.log('Wishes wiped:', e2 ? e2.message : 'Success');
  
  const { error: e3 } = await client.from('profiles').delete().like('user_id', 'mock_user_%');
  console.log('Mock Profiles wiped:', e3 ? e3.message : 'Success');
  
  console.log('Database cleared!');
}

wipe();
