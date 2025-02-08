'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Sprout, Sun, Sunrise, ChevronLeft, ChevronRight, LogOut, Home, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const botIcons = {
  "helia-sun-shield": Shield,
  "helia-growth-ray": Sprout,
  "helia-sunbeam": Sun,
  "helia-inner-dawn": Sunrise,
};

const bots = [
  { id: 'helia-sun-shield', name: 'Helia Sun Shield' },
  { id: 'helia-growth-ray', name: 'Helia Growth Ray' },
  { id: 'helia-sunbeam', name: 'Helia Sunbeam' },
  { id: 'helia-inner-dawn', name: 'Helia Inner Dawn' },
];

export default function Sidebar({ onSignOut }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const pathname = usePathname();
  const currentBotId = pathname.split('/').pop();

  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth <= 768);
      if (window.innerWidth <= 768) {
        setIsCollapsed(true);
      }
    };

    checkMobileView();
    window.addEventListener('resize', checkMobileView);
    return () => window.removeEventListener('resize', checkMobileView);
  }, []);

  return (
    <div 
      className={cn(
        "flex flex-col h-screen bg-gray-900/95 backdrop-blur-sm border-r border-gray-800 transition-all duration-300 z-50",
        isCollapsed ? "w-16" : "w-64",
        "fixed md:relative"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        {!isCollapsed && (
          <Link href="/" className="flex items-center gap-2 text-gray-300 hover:text-white">
            <Home className="w-5 h-5" />
            <span className="font-semibold hidden md:inline">Back to Home</span>
          </Link>
        )}
        {isCollapsed && (
          <Link href="/" className="mx-auto text-gray-300 hover:text-white" title="Back to Home">
            <Home className="w-5 h-5" />
          </Link>
        )}
        {!isMobileView && (
          <Button
            variant="ghost"
            size="sm"
            className={cn("hover:bg-gray-800", isCollapsed && "ml-auto")}
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </Button>
        )}
      </div>

      {/* Bot List */}
      <div className="flex-1 py-4 space-y-1">
        {bots.map((bot) => {
          const Icon = botIcons[bot.id];
          const isActive = currentBotId === bot.id;
          return (
            <Link
              key={bot.id}
              href={`/chat/${bot.id}`}
              title={bot.name}
              className={cn(
                "flex items-center gap-2 px-4 py-2 transition-colors group relative",
                isActive 
                  ? "bg-primary/10 text-primary border-r-2 border-primary" 
                  : "text-gray-300 hover:bg-gray-800/50 hover:text-white",
                isCollapsed && "justify-center"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive && "text-primary")} />
              {!isCollapsed && <span className="hidden md:inline">{bot.name}</span>}
              {isCollapsed && isMobileView && (
                <div className="absolute left-16 bg-gray-800 text-white px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                  {bot.name}
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800 space-y-2">
        <Button
          variant="outline"
          size="sm"
          title="Subscribe"
          className={cn(
            "w-full border-yellow-500/30 hover:bg-yellow-500/10 hover:text-yellow-500 group relative",
            isCollapsed && "flex justify-center px-2"
          )}
        >
          <Crown className={cn("w-4 h-4", !isCollapsed && "mr-2")} />
          {!isCollapsed && <span className="hidden md:inline">Subscribe</span>}
          {isCollapsed && isMobileView && (
            <div className="absolute left-16 bg-gray-800 text-white px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
              Subscribe
            </div>
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onSignOut}
          title="Sign Out"
          className={cn(
            "w-full text-red-500 hover:bg-red-500/10 hover:text-red-400 group relative",
            isCollapsed && "flex justify-center px-2"
          )}
        >
          <LogOut className={cn("w-4 h-4", !isCollapsed && "mr-2")} />
          {!isCollapsed && <span className="hidden md:inline">Sign Out</span>}
          {isCollapsed && isMobileView && (
            <div className="absolute left-16 bg-gray-800 text-white px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
              Sign Out
            </div>
          )}
        </Button>
      </div>
    </div>
  );
}
