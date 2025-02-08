"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, Sprout, Sun, Sunrise, Home, LogOut } from "lucide-react";
import { createBrowserClient } from '@supabase/ssr';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import Sidebar from "@/components/layout/sidebar";

export default function ChatLayout({ children }) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <div className="flex h-screen bg-background" suppressHydrationWarning>
      <Sidebar onSignOut={handleSignOut} />
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
