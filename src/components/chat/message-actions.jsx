'use client';

import { useState } from 'react';
import { Copy, Volume2, Check, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

export default function MessageActions({ message }) {
  const [isCopied, setIsCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setIsCopied(true);
      toast({
        description: "Message copied to clipboard",
        duration: 2000,
      });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy message",
        variant: "destructive",
      });
    }
  };

  const handleReadAloud = () => {
    if ('speechSynthesis' in window) {
      if (isPlaying) {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(message);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => {
        setIsPlaying(false);
        toast({
          title: "Error",
          description: "Failed to read message",
          variant: "destructive",
        });
      };

      setIsPlaying(true);
      window.speechSynthesis.speak(utterance);
    } else {
      toast({
        title: "Error",
        description: "Text-to-speech is not supported in your browser",
        variant: "destructive",
      });
    }
  };

  const handleLike = () => {
    if (disliked) setDisliked(false);
    setLiked(!liked);
  };

  const handleDislike = () => {
    if (liked) setLiked(false);
    setDisliked(!disliked);
  };

  return (
    <div className="flex flex-col gap-3 pt-3">
      <div className="h-px bg-gradient-to-r from-transparent via-gray-700/50 to-transparent" />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 px-3 rounded-r-none border-r border-gray-700/30 transition-colors duration-200
              ${liked ? 'text-green-500 hover:text-green-400 hover:bg-green-500/10' : 
                     'text-gray-400 hover:text-gray-300 hover:bg-gray-700/30'}`}
            onClick={handleLike}
            title="Like this response"
          >
            <ThumbsUp className={`h-4 w-4 mr-1.5 ${liked ? 'fill-green-500' : ''}`} />
            {liked ? 'Liked' : 'Like'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 px-3 rounded-l-none transition-colors duration-200
              ${disliked ? 'text-red-500 hover:text-red-400 hover:bg-red-500/10' : 
                        'text-gray-400 hover:text-gray-300 hover:bg-gray-700/30'}`}
            onClick={handleDislike}
            title="Dislike this response"
          >
            <ThumbsDown className={`h-4 w-4 mr-1.5 ${disliked ? 'fill-red-500' : ''}`} />
            {disliked ? 'Disliked' : 'Dislike'}
          </Button>
        </div>

        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 px-3 rounded-r-none border-r border-gray-700/30 transition-colors duration-200
              text-gray-400 hover:text-gray-300 hover:bg-gray-700/30`}
            onClick={handleCopy}
            title="Copy to clipboard"
          >
            {isCopied ? (
              <>
                <Check className="h-4 w-4 mr-1.5 text-green-500" />
                <span className="text-green-500">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-1.5" />
                Copy
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 px-3 rounded-l-none transition-colors duration-200
              ${isPlaying ? 'text-primary hover:text-primary/90 hover:bg-primary/10' : 
                         'text-gray-400 hover:text-gray-300 hover:bg-gray-700/30'}`}
            onClick={handleReadAloud}
            title="Read aloud"
          >
            <Volume2 className={`h-4 w-4 mr-1.5 ${isPlaying ? 'fill-primary/20' : ''}`} />
            {isPlaying ? 'Stop' : 'Read'}
          </Button>
        </div>
      </div>
    </div>
  );
}
