import { createBrowserClient } from '@supabase/ssr';

if (
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL !== 'string' ||
  typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'string'
) {
  throw new Error(
    'Please define NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables inside .env.local'
  );
}

// Ensure URL has protocol
let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (!supabaseUrl.startsWith('http://') && !supabaseUrl.startsWith('https://')) {
  supabaseUrl = `https://${supabaseUrl}`;
}

const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate URL
try {
  new URL(supabaseUrl);
} catch (error) {
  console.error('Invalid Supabase URL:', error);
  throw new Error(`Invalid Supabase URL: ${supabaseUrl}. Please check your NEXT_PUBLIC_SUPABASE_URL environment variable.`);
}

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
