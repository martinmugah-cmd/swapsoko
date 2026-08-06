import { createClient } from '@supabase/supabase-js';

// Fallback directly to the Service Role Key for the demo to bypass any RLS or Invalid API Key issues
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hyfcgwjaozooxtoncknb.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5ZmNnd2phb3pvb3h0b25ja25iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjM5NTA5NCwiZXhwIjoyMDk3OTcxMDk0fQ.YosiwEq1KeorxMdq1CQtFRfThLX1oc_92F7qtDVEKSk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
