
import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: ReactNode;
  status?: "healthy" | "warning" | "critical";
  subtitle?: string;
  className?: string;
}

export function MetricCard({ 
  title, 
  value, 
  change, 
  changeType = "neutral", 
  icon, 
  status = "healthy", 
  subtitle, 
  className 
}: MetricCardProps) {
  const statusStyles = {
    healthy: "border-green-500/30 bg-green-500/5",
    warning: "border-amber-500/30 bg-amber-500/5", 
    critical: "border-red-500/30 bg-red-500/5"
  };

  const changeStyles = {
    positive: "text-green-400",
    negative: "text-red-400",
    neutral: "text-muted-foreground"
  };

  return (
    <Card className={cn(
      "metric-card border transition-all duration-300 hover:scale-105",
      statusStyles[status],
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={cn(
          "p-2 rounded-lg",
          status === "healthy" && "bg-green-500/20 text-green-400",
          status === "warning" && "bg-amber-500/20 text-amber-400",
          status === "critical" && "bg-red-500/20 text-red-400"
        )}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground mb-1">
          {value}
        </div>
        <div className="flex items-center justify-between">
          {subtitle && (
            <p className="text-xs text-muted-foreground">
              {subtitle}
            </p>
          )}
          {change && (
            <p className={cn("text-xs font-medium", changeStyles[changeType])}>
              {changeType === "positive" && "+"}
              {change}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
