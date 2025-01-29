"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

const Context = createContext(undefined);

const getSupabaseClient = () => {
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

  try {
    // Validate URL
    new URL(supabaseUrl);
    return createBrowserClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.error('Invalid Supabase URL:', error);
    throw new Error(`Invalid Supabase URL: ${supabaseUrl}. Please check your NEXT_PUBLIC_SUPABASE_URL environment variable.`);
  }
};

export function SupabaseProvider({ children }) {
  const [error, setError] = useState(null);
  const [supabase, setSupabase] = useState(null);
  const router = useRouter();

  useEffect(() => {
    try {
      const client = getSupabaseClient();
      setSupabase(client);
    } catch (err) {
      console.error('Failed to initialize Supabase client:', err);
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    if (!supabase) return;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      router.refresh();
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [router, supabase]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-500">
          {error}
        </div>
      </div>
    );
  }

  if (!supabase) {
    return null;
  }

  return (
    <Context.Provider value={{ supabase }}>
      {children}
    </Context.Provider>
  );
}

export const useSupabase = () => {
  const context = useContext(Context);
  if (context === undefined) {
    throw new Error("useSupabase must be used inside SupabaseProvider");
  }
  return context;
};
