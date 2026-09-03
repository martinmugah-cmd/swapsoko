import { createClient } from '@supabase/supabase-js';

// Using dummy values if env variables are missing for development safety

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

// Debugging for invalid API key issue (only visible in dev console)
console.log("Supabase URL initialized:", supabaseUrl);
console.log("Supabase Key length:", supabaseAnonKey?.length);
console.log("Supabase Key starts with:", supabaseAnonKey?.substring(0, 15) + "...");
if (supabaseAnonKey === 'placeholder-anon-key') {
    console.error("CRITICAL: Supabase API Key is missing! Vercel did not inject VITE_SUPABASE_ANON_KEY.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
