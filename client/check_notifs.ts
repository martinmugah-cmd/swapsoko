import { supabase } from './src/lib/supabase.ts';

async function check() {
  const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(5);
  console.log(JSON.stringify(data, null, 2));
}
check();
