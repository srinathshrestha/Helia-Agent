"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Shield, Sprout, Sun, Sunrise, ArrowRight, Loader2 } from "lucide-react";

const icons = {
  shield: Shield,
  sprout: Sprout,
  sun: Sun,
  sunrise: Sunrise,
};

export function BotCard({ name, description, icon, color }) {
  const router = useRouter();
  const Icon = icons[icon];
  const [isLoading, setIsLoading] = useState(false);

  const handleChatClick = async () => {
    setIsLoading(true);
    router.push(`/chat/${name.toLowerCase().replace(/\s+/g, '-')}`);
  };

  return (
    <Card className="relative overflow-hidden transition-all hover:shadow-lg">
      <CardHeader>
        <div className={`inline-flex h-12 w-12 items-center justify-center rounded-lg ${color} mb-4`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <CardTitle className="text-xl">{name}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          className="w-full"
          onClick={handleChatClick}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              Chat Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
