"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, Sprout, Sun, Sunrise, Home, LogOut } from "lucide-react";
import { createBrowserClient } from '@supabase/ssr';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const botInfo = {
  "helia-sun-shield": {
    name: "Helia Sun Shield",
    icon: Shield,
    color: "bg-blue-500",
  },
  "helia-growth-ray": {
    name: "Helia Growth Ray",
    icon: Sprout,
    color: "bg-green-500",
  },
  "helia-sunbeam": {
    name: "Helia Sunbeam",
    icon: Sun,
    color: "bg-yellow-500",
  },
  "helia-inner-dawn": {
    name: "Helia Inner Dawn",
    icon: Sunrise,
    color: "bg-purple-500",
  },
};

export default function ChatLayout({ children }) {
  return (
    <div className="flex h-screen bg-background" suppressHydrationWarning>
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
