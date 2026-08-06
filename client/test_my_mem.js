import { createClient } from '@supabase/supabase-js';

import fs from 'fs';
import dotenv from 'dotenv';
const env = dotenv.parse(fs.readFileSync('../.env.local'));
const client = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const { data, error } = await client.from('community_members').select('*').order('created_at', { ascending: false });
  console.log("ERROR:", error);
}
check();
