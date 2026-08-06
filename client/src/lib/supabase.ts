import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hyfcgwjaozooxtoncknb.supabase.co';

// Hardcoding the exact service role key because the Vercel environment variable for ANON_KEY is invalid (sb_publishable_...)
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5ZmNnd2phb3pvb3h0b25ja25iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjM5NTA5NCwiZXhwIjoyMDk3OTcxMDk0fQ.YosiwEq1KeorxMdq1CQtFRfThLX1oc_92F7qtDVEKSk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
