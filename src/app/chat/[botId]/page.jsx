'use client';

import { useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/lib/hooks/use-supabase';
import ChatClient from './chat-client';
import Sidebar from '@/components/layout/sidebar';

const bots = {
  "helia-sun-shield": {
    name: "Helia Sun Shield",
    prompt: "You are Helia Sun Shield, a protective AI assistant focused on mental health and emotional well-being. Help users navigate their emotional challenges with compassion and evidence-based strategies."
  },
  "helia-growth-ray": {
    name: "Helia Growth Ray",
    prompt: "You are Helia Growth Ray, an AI assistant focused on behavioral and emotional development. Your goal is to help users navigate their challenges with practical strategies and expert guidance."
  },
  "helia-sunbeam": {
    name: "Helia Sunbeam",
    prompt: "You are Helia Sunbeam, an AI assistant specialized in positive psychology. Help users build resilience and find joy through evidence-based positive psychology techniques."
  },
  "helia-inner-dawn": {
    name: "Helia Inner Dawn",
    prompt: "You are Helia Inner Dawn, an AI assistant focused on personal growth and self-discovery. Guide users through mindfulness practices and help them develop emotional awareness."
  }
};

export default function ChatPage({ params }) {
  const router = useRouter();
  const supabase = useSupabase();
  const resolvedParams = use(params);
  const { botId } = resolvedParams;

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/');
      }
    };
    checkSession();
  }, [supabase.auth, router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (!bots[botId]) {
    return <div>Bot not found</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-900">
      <Sidebar onSignOut={handleSignOut} />
      <div className="flex-1">
        <ChatClient botId={botId} botInfo={bots[botId]} />
      </div>
    </div>
  );
}
