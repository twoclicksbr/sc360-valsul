import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isConfigured =
  supabaseUrl &&
  !supabaseUrl.startsWith('your_') &&
  supabaseAnonKey &&
  !supabaseAnonKey.startsWith('your_');

/**
 * Creates and exports a Supabase client instance configured with
 * environment variables.
 *
 * This client can be imported and used throughout the application for
 * authentication and database operations.
 *
 * When VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are placeholders
 * the client is initialised with safe dummy values so the app loads
 * without crashing; actual Supabase calls will fail gracefully until
 * real credentials are provided.
 */
export const supabase: SupabaseClient = createClient(
  isConfigured ? supabaseUrl : 'https://placeholder.supabase.co',
  isConfigured ? supabaseAnonKey : 'placeholder-anon-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  },
);
