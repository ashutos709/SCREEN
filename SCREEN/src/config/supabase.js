import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ariujbkdlkgtawrxxxwx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyaXVqYmtkbGtndGF3cnh4eHd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzNzU4NzUsImV4cCI6MjA1OTk1MTg3NX0.Db_haaL0z_OgsSivoDDsx3Yti_YNuFfgIBeQO7vfnH0';

// Initialize the Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'X-Client-Info': 'screen-frontend'
    }
  }
});

export { supabase };
