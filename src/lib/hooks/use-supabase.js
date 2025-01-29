import { createBrowserClient } from '@supabase/ssr'
import { useState, useEffect } from 'react'

export function useSupabase() {
  const [supabase] = useState(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ))

  return supabase
}
