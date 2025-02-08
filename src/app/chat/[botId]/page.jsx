'use client';

import { useEffect, use, Suspense, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/lib/hooks/use-supabase';
import ChatClient from './chat-client';
import Sidebar from '@/components/layout/sidebar';
import { LoadingTransition } from '@/components/ui/loading-transition';

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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/');
        }
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();
  }, [supabase.auth, router]);

  const handleSignOut = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    router.push('/');
  };

  if (!bots[botId]) {
    return <div>Bot not found</div>;
  }

  if (isLoading) {
    return <LoadingTransition />;
  }

  return (
    <div className="flex-1 bg-gray-900">
      <Suspense fallback={<LoadingTransition />}>
        <ChatClient botId={botId} botInfo={bots[botId]} />
      </Suspense>
    </div>
  );
}
