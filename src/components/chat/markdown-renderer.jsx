'use client';

import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function MarkdownRenderer({ content, isUser }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="animate-pulse bg-muted h-4 w-full rounded" />;
  }

  return (
    <ReactMarkdown 
      remarkPlugins={[remarkGfm]}
      className={`prose prose-invert prose-sm ${
        isUser ? 'text-primary-foreground' : ''
      }`}
      components={{
        p: ({ children }) => (
          <p className={`my-1 ${isUser ? 'text-primary-foreground' : ''}`}>
            {children}
          </p>
        ),
        ul: ({ children }) => (
          <ul className="list-disc ml-4 my-1">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal ml-4 my-1">{children}</ol>
        ),
        li: ({ children }) => (
          <li className="my-0.5">{children}</li>
        ),
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
      {content}
    </ReactMarkdown>
  );
}
