
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { Activity } from "lucide-react";

const cpuData = [
  { time: "00:00", usage: 45 },
  { time: "02:00", usage: 38 },
  { time: "04:00", usage: 52 },
  { time: "06:00", usage: 41 },
  { time: "08:00", usage: 68 },
  { time: "10:00", usage: 72 },
  { time: "12:00", usage: 65 },
  { time: "14:00", usage: 78 },
  { time: "16:00", usage: 85 },
  { time: "18:00", usage: 76 },
  { time: "20:00", usage: 69 },
  { time: "22:00", usage: 58 },
];

const chartConfig = {
  usage: {
    label: "CPU Usage (%)",
    color: "hsl(217, 91%, 60%)",
  },
};

export function CpuUsageChart() {
  return (
    <Card className="glassmorphism border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-400" />
          CPU Usage History (24h)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart data={cpuData}>
            <XAxis 
              dataKey="time" 
              tickLine={false}
              axisLine={false}
              className="text-xs"
            />
            <YAxis 
              domain={[0, 100]}
              tickLine={false}
              axisLine={false}
              className="text-xs"
            />
            <ChartTooltip 
              content={<ChartTooltipContent />}
              cursor={{ stroke: "rgba(59, 130, 246, 0.3)" }}
            />
            <Line
              type="monotone"
              dataKey="usage"
              stroke="var(--color-usage)"
              strokeWidth={2}
              dot={{ fill: "var(--color-usage)", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: "var(--color-usage)", strokeWidth: 2 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
