import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';
const env = dotenv.parse(fs.readFileSync('../.env.local'));
const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function run() {
  try {
     const { data, error } = await supabase.from('messages').update({ content: 'test' }).eq('id', 1);
     console.log("Update finished. Error:", error);
  } catch(e) {
     console.error("Caught error:", e);
  }
}
run();
