import { createClient } from '@supabase/supabase-js'

const ANON_API_Key = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;
const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;



  export const supabase = createClient(supabaseUrl, ANON_API_Key)