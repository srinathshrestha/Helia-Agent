'use client';

import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useSupabase } from '@/lib/hooks/use-supabase';
import { generateResponse } from '@/lib/gemini';
import { updateCredits } from '@/lib/credits';

export default function ChatInterface({ botId, botPrompt }) {
  const supabase = useSupabase();
  const messagesEndRef = useRef(null);
  
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [credits, setCredits] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchUserData(session.user.id);
        fetchMessages(session.user.id);
      }
    });

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
    scrollToBottom();
  }, [messages, streamingMessage]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const fetchUserData = async (userId) => {
    try {
      const { data: userData, error } = await supabase
        .from('users')
        .select('credits, is_subscribed')
        .eq('id', userId)
        .single();

      if (error) throw error;

      // Update the credits in the database if they are negative
      if (userData.credits < 0) {
        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update({ credits: 0 })
          .eq('id', userId)
          .select('credits')
          .single();
          
        if (!updateError) {
          setCredits(0);
        } else {
          console.error('Error updating negative credits:', updateError);
        }
      } else {
        setCredits(userData.credits);
      }
      
      setIsSubscribed(userData.is_subscribed);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const fetchMessages = async (userId) => {
    try {
      setIsInitialLoading(true);
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
    } finally {
      setIsInitialLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const userMessage = form.message.value.trim();
    
    if (!userMessage || isLoading) return;
    
    form.message.value = '';
    setIsLoading(true);

    try {
      if (!session) throw new Error('No session');
      if (!isSubscribed && credits <= 0) throw new Error('Insufficient credits');

      const { error: userInsertError } = await supabase
        .from('chats')
        .insert([{
          user_id: session.user.id,
          bot_name: botId,
          message: userMessage,
          role: 'user',
          created_at: new Date().toISOString()
        }]);

      if (userInsertError) throw userInsertError;

      setMessages(prev => [...prev, {
        id: Date.now(),
        user_id: session.user.id,
        bot_name: botId,
        message: userMessage,
        role: 'user',
        created_at: new Date().toISOString()
      }]);

      const fullPrompt = `${botPrompt}\n\nUser: ${userMessage}\nAssistant:`;
      let responseText = '';
      
      setStreamingMessage('');
      
      const { message: botMessage, tokens } = await generateResponse(fullPrompt, (token) => {
        responseText += token;
        setStreamingMessage(prev => prev + token);
      });

      if (!isSubscribed) {
        const newCredits = await updateCredits(session.user.id, tokens);
        setCredits(newCredits);
      }

      const { error: botInsertError } = await supabase
        .from('chats')
        .insert([{
          user_id: session.user.id,
          bot_name: botId,
          message: botMessage,
          role: 'assistant',
          created_at: new Date().toISOString()
        }]);

      if (botInsertError) throw botInsertError;

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        user_id: session.user.id,
        bot_name: botId,
        message: botMessage,
        role: 'assistant',
        created_at: new Date().toISOString()
      }]);
      
      setStreamingMessage('');

    } catch (error) {
      console.error('Operation error:', error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen relative">
      <div className="flex-1 overflow-y-auto p-2 md:p-4 space-y-4">
        {isInitialLoading && (
          <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] space-y-4">
            <div className="relative">
              <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <div className="absolute -top-1 -right-1 h-3 w-3 border-2 border-primary border-t-transparent rounded-full animate-spin [animation-delay:0.2s]" />
            </div>
            <p className="text-sm text-muted-foreground animate-pulse">Loading messages...</p>
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`rounded-lg px-4 py-2 max-w-[80%] animate-fade-in ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                className={`prose prose-invert prose-sm ${
                  msg.role === 'user' ? 'text-primary-foreground' : ''
                }`}
                components={{
                  p: ({ children }) => <p className={`my-1 ${msg.role === 'user' ? 'text-primary-foreground' : ''}`}>{children}</p>,
                  ul: ({ children }) => <ul className="list-disc ml-4 my-1">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal ml-4 my-1">{children}</ol>,
                  li: ({ children }) => <li className="my-0.5">{children}</li>,
                  code: ({ node, inline, className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline ? (
                      <pre className="bg-gray-800 p-2 rounded-md my-2 overflow-x-auto">
                        <code className={className} {...props}>
                          {children}
                        </code>
                      </pre>
                    ) : (
                      <code className="bg-gray-800 px-1 rounded" {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {msg.message}
              </ReactMarkdown>
            </div>
          </div>
        ))}
        
        {streamingMessage && (
          <div className="flex justify-start">
            <div className="rounded-lg px-4 py-2 max-w-[80%] bg-muted animate-fade-in">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                className="prose prose-invert prose-sm"
                components={{
                  p: ({ children }) => <p className="my-1">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc ml-4 my-1">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal ml-4 my-1">{children}</ol>,
                  li: ({ children }) => <li className="my-0.5">{children}</li>,
                  code: ({ node, inline, className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline ? (
                      <pre className="bg-gray-800 p-2 rounded-md my-2 overflow-x-auto">
                        <code className={className} {...props}>
                          {children}
                        </code>
                      </pre>
                    ) : (
                      <code className="bg-gray-800 px-1 rounded" {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {streamingMessage}
              </ReactMarkdown>
              <div className="mt-2 flex items-center gap-1">
                <div className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce" />
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="sticky bottom-0 bg-background/80 backdrop-blur-sm p-2 md:p-4 border-t">
        <div className="flex gap-2 max-w-4xl mx-auto">
          <input
            type="text"
            name="message"
            placeholder={isLoading ? 'AI is thinking...' : 'Type your message...'}
            className="flex-1 rounded-md bg-background/50 backdrop-blur-sm px-4 py-2 border shadow-sm transition-all duration-200 focus:bg-background focus:shadow-md"
            disabled={!session || isLoading}
          />
          <button
            type="submit"
            className="px-3 md:px-4 py-2 bg-primary text-primary-foreground rounded-md disabled:opacity-50 transition-all duration-200 flex items-center gap-2 min-w-[40px] md:min-w-[80px] justify-center shadow-sm hover:shadow-md active:scale-95"
            disabled={!session || isLoading}
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Thinking</span>
              </>
            ) : (
              'Send'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
