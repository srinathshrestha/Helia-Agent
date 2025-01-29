import Image from "next/image";
import { BotCard } from "@/components/bots/bot-card";

const bots = [
  {
    name: "Helia Sun Shield",
    description: "Your digital safety companion. Learn about online privacy, cybersecurity, and responsible internet usage.",
    icon: "shield",
    color: "bg-blue-500/90",
  },
  {
    name: "Helia Growth Ray",
    description: "Navigate behavioral challenges and emotional development with expert guidance and practical strategies.",
    icon: "sprout",
    color: "bg-green-500/90",
  },
  {
    name: "Helia Sunbeam",
    description: "Build confidence and strengthen family bonds through engaging activities and meaningful conversations.",
    icon: "sun",
    color: "bg-yellow-500/90",
  },
  {
    name: "Helia Inner Dawn",
    description: "Discover mindfulness practices and improve relationships with guided meditation and emotional awareness.",
    icon: "sunrise",
    color: "bg-purple-500/90",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-4xl font-bold tracking-tight">Welcome to Helia AI</h1>
            <p className="text-lg text-muted-foreground">
              Choose your AI companion and start a meaningful conversation
            </p>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {bots.map((bot) => (
              <BotCard key={bot.name} {...bot} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
