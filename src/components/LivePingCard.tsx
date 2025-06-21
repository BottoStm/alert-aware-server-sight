
import { Card, CardContent } from "@/components/ui/card";
import { Activity } from "lucide-react";

interface LivePingCardProps {
  livePing: number;
}

export function LivePingCard({ livePing }: LivePingCardProps) {
  const getPingColor = (ping: number) => {
    if (ping < 100) return "text-green-400";
    if (ping < 300) return "text-amber-400";
    return "text-red-400";
  };

  return (
    <Card className="glassmorphism border-border/50">
      <CardContent className="p-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Activity className={`w-8 h-8 ${getPingColor(livePing)}`} />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Live Ping</p>
            <p className={`text-2xl font-bold ${getPingColor(livePing)}`}>
              {livePing}ms
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
