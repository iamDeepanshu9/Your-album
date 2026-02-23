import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_key'; // Fallback to prevent crash

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Use this client ONLY on the server for admin actions (creates/deletes/updates)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
