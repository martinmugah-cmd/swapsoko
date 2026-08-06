import { createClient } from '@supabase/supabase-js';

import fs from 'fs';
import dotenv from 'dotenv';
const env = dotenv.parse(fs.readFileSync('../.env.local'));
const client = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const { data: listings, error: lError } = await client.from('listings').select('*').order('created_at', { ascending: false }).limit(5);
  console.log("LISTINGS:", JSON.stringify(listings, null, 2), lError);

  const { data: wishes, error: wError } = await client.from('wishes').select('*').order('created_at', { ascending: false }).limit(5);
  console.log("WISHES:", JSON.stringify(wishes, null, 2), wError);
}
check();
