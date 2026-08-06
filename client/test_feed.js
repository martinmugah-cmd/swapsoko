import { createClient } from '@supabase/supabase-js';

import fs from 'fs';
import dotenv from 'dotenv';
const env = dotenv.parse(fs.readFileSync('../.env.local'));
const client = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY);

// simulate snakeToCamel
const snakeToCamel = (obj) => {
  if (Array.isArray(obj)) return obj.map(snakeToCamel);
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase()),
        snakeToCamel(value)
      ])
    );
  }
  return obj;
};

async function check() {
  const { data } = await client.from('listings').select('*').order('created_at', { ascending: false }).limit(20);
  
  let camelData = snakeToCamel(data);
  // simulate feed filter
  const filtered = camelData.filter(l => !l.description?.includes(`<!--soko:`));
  
  console.log("ALL LISTINGS DB:", data.length);
  console.log("FILTERED (global feed):", filtered.length);
  console.log(JSON.stringify(filtered.map(l => ({ id: l.id, userId: l.userId, desc: l.description, category: l.category, condition: l.condition })), null, 2));
}
check();
