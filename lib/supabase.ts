import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
const serviceKey = process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseUrl = url && url !== 'undefined' && url.trim() !== '' ? url : 'https://dummy.supabase.co';
const supabaseAnonKey = anonKey && anonKey !== 'undefined' && anonKey.trim() !== '' ? anonKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_key';
const supabaseServiceKey = serviceKey && serviceKey !== 'undefined' && serviceKey.trim() !== '' ? serviceKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Use this client ONLY on the server for admin actions (creates/deletes/updates)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
