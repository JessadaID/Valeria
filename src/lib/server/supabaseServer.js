import { createClient } from '@supabase/supabase-js';
import { SUPABASE_SERVICE_ROLE_KEY, VITE_PUBLIC_SUPABASE_URL } from '$env/static/private';

// Create a Supabase client with the service role key to bypass RLS
export const supabaseServer = createClient(
    VITE_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY
);
