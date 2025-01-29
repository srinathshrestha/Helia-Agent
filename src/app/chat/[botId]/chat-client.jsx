'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Sprout, Sun, Sunrise, Send, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { useSupabase } from '@/lib/hooks/use-supabase';
import { generateResponse, estimateTokens } from '@/lib/gemini';
import MarkdownRenderer from '@/components/chat/markdown-renderer';
import MessageActions from '@/components/chat/message-actions';

const CREDITS_PER_TOKEN = 0.1; // 1 credit = 10 tokens

const botIcons = {
  'helia-sun-shield': Shield,
  'helia-growth-ray': Sprout,
  'helia-sunbeam': Sun,
  'helia-inner-dawn': Sunrise
};

export default function ChatClient({ botId, botInfo }) {
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const supabase = useSupabase();
  const { toast } = useToast();
  const router = useRouter();
  
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [credits, setCredits] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const initSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session) {
        fetchUserData(session.user.id);
        fetchMessages(session.user.id);
      }
    };

    initSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchUserData(session.user.id);
        fetchMessages(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth, botId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, streamingMessage]);

  const fetchUserData = async (userId) => {
    try {
      const { data: userData, error } = await supabase
        .from('users')
        .select('credits, is_subscribed')
        .eq('id', userId)
        .single();

      if (error) throw error;

      setCredits(userData.credits);
      setIsSubscribed(userData.is_subscribed);
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast({
        title: "Error",
        description: "Failed to load user data: " + error.message,
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('chats')
        .select('*')
        .eq('user_id', userId)
        .eq('bot_name', botId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load chat history: " + error.message,
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  // Function to update credits in the database
  const updateCredits = async (newCredits) => {
    try {
      const { error: updateError } = await supabase
        .from('users')
        .update({ credits: newCredits })
        .eq('id', session.user.id);

      if (updateError) throw updateError;
      setCredits(newCredits);
    } catch (error) {
      console.error('Error updating credits:', error);
      throw new Error('Failed to update credits');
    }
  };

  // Function to show the upgrade toast
  const showUpgradeToast = (message) => {
    toast({
      title: "Insufficient Credits",
      description: message,
      action: (
        <Button 
          variant="outline" 
          className="border-yellow-500/30 hover:bg-yellow-500/10 hover:text-yellow-500"
          onClick={() => router.push('/subscribe')}
        >
          <Crown className="w-4 h-4 mr-2" />
          Upgrade Now
        </Button>
      ),
      duration: 10000,
    });
  };

  // Function to check if user has enough credits
  const checkCredits = (messageLength) => {
    if (isSubscribed) return true;
    
    const estimatedTokens = estimateTokens(messageLength);
    const requiredCredits = Math.ceil(estimatedTokens * CREDITS_PER_TOKEN);
    
    if (credits < requiredCredits) {
      showUpgradeToast(
        `You need ${requiredCredits} credits for this message, but you only have ${credits} credits. Upgrade to Premium for unlimited messages!`
      );
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const userMessage = form.message.value.trim();
    
    if (!userMessage || isLoading) return;
    
    // Check credits before proceeding
    if (!isSubscribed && !checkCredits(userMessage.length)) {
      return;
    }
    
    form.message.value = '';
    setIsLoading(true);

    try {
      if (!session) {
        throw new Error('Please sign in to continue');
      }

      // Add user message to chat
      const userMessageObj = {
        id: crypto.randomUUID(),
        user_id: session.user.id,
        bot_name: botId,
        message: userMessage,
        role: 'user',
        created_at: new Date().toISOString()
      };

      // Insert user message
      const { error: userInsertError } = await supabase
        .from('chats')
        .insert([userMessageObj]);

      if (userInsertError) throw userInsertError;
      setMessages(prev => [...prev, userMessageObj]);

      // Generate bot response
      const fullPrompt = `${botInfo.prompt}\n\nUser: ${userMessage}\nAssistant:`;
      let responseText = '';
      let tokensUsed = 0;
      
      const { message: botMessage, tokens } = await generateResponse(fullPrompt, (token) => {
        setStreamingMessage(prev => {
          const newText = prev + token;
          return newText;
        });
      });

      // Update credits for non-subscribers
      if (!isSubscribed) {
        tokensUsed = Math.ceil(tokens * CREDITS_PER_TOKEN);
        const newCredits = credits - tokensUsed;
        await updateCredits(newCredits);
      }

      // Add bot response to chat
      const botMessageObj = {
        id: crypto.randomUUID(),
        user_id: session.user.id,
        bot_name: botId,
        message: botMessage,
        role: 'assistant',
        created_at: new Date().toISOString()
      };

      const { error: botInsertError } = await supabase
        .from('chats')
        .insert([botMessageObj]);

      if (botInsertError) throw botInsertError;
      setMessages(prev => [...prev, botMessageObj]);

    } catch (error) {
      console.error('Error:', error);
      
      if (error.message?.includes('network') || error.message?.includes('Failed to fetch') || error.message?.includes('connection')) {
        toast({
          title: "Connection Error",
          description: "Unable to connect to the AI service. Please check your internet connection and try again.",
          action: (
            <Button 
              variant="outline" 
              onClick={() => {
                setIsLoading(false);
                setStreamingMessage('');
              }}
            >
              Try Again
            </Button>
          ),
          duration: 10000,
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "An unexpected error occurred",
          variant: "destructive",
          duration: 5000,
        });
      }
    } finally {
      setStreamingMessage('');
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  // Get the appropriate icon component
  const BotIcon = botIcons[botId] || Sprout;

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <BotIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold">{botInfo.name}</h2>
            <p className="text-sm text-gray-400">{isSubscribed ? 'Premium Access' : `${credits} credits remaining`}</p>
          </div>
        </div>
        {isSubscribed ? (
          <div className="flex items-center text-yellow-500">
            <Crown className="w-5 h-5 mr-2" />
            <span className="text-sm">Premium</span>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="border-yellow-500/30 hover:bg-yellow-500/10 hover:text-yellow-500"
            onClick={() => router.push('/subscribe')}
          >
            <Crown className="w-4 h-4 mr-2" />
            Upgrade to Premium
          </Button>
        )}
      </header>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`group relative rounded-lg px-4 py-2 max-w-[80%] ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              <MarkdownRenderer 
                content={msg.message}
                isUser={msg.role === 'user'}
              />
              {msg.role === 'assistant' && (
                <div className="mt-2 pt-2 border-t border-gray-700/50">
                  <MessageActions message={msg.message} />
                </div>
              )}
            </div>
          </div>
        ))}
        
        {streamingMessage && (
          <div className="flex justify-start">
            <div className="rounded-lg px-4 py-2 max-w-[80%] bg-muted animate-pulse">
              <MarkdownRenderer 
                content={streamingMessage}
                isUser={false}
              />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-800">
        <div className="flex space-x-2">
          <Input
            ref={inputRef}
            type="text"
            name="message"
            placeholder="Type your message..."
            disabled={isLoading || !session}
            className="flex-1"
            autoComplete="off"
          />
          <Button type="submit" disabled={isLoading || !session}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
      <Toaster />
    </div>
  );
}
