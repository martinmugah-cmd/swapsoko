import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '/home/m3/project/client/.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function main() {
  const { data, error } = await supabase.from('profiles').select('user_id, university, campus').limit(2);
  console.log("Error:", error);
  console.log("Data:", JSON.stringify(data, null, 2));
}
main();
