import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('../.env', 'utf8');
const supabaseUrl = env.match(/VITE_SUPABASE_URL=(.*)/)[1];
const supabaseKey = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1];

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: profiles, error } = await supabase.from('profiles').select('*').limit(5);
  console.log("Profiles:", profiles.map(p => ({
    id: p.id,
    user_id: p.user_id,
    name: p.name,
    avatarUrl: p.avatarUrl,
    university: p.university ? JSON.parse(p.university) : null
  })));
}
check();
