
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { Database } from "lucide-react";

const memoryData = [
  { time: "00:00", used: 6.2, available: 1.8 },
  { time: "02:00", used: 5.8, available: 2.2 },
  { time: "04:00", used: 6.5, available: 1.5 },
  { time: "06:00", used: 5.9, available: 2.1 },
  { time: "08:00", used: 7.1, available: 0.9 },
  { time: "10:00", used: 7.4, available: 0.6 },
  { time: "12:00", used: 6.8, available: 1.2 },
  { time: "14:00", used: 7.8, available: 0.2 },
  { time: "16:00", used: 7.2, available: 0.8 },
  { time: "18:00", used: 6.9, available: 1.1 },
  { time: "20:00", used: 6.4, available: 1.6 },
  { time: "22:00", used: 6.0, available: 2.0 },
];

const chartConfig = {
  used: {
    label: "Used Memory (GB)",
    color: "hsl(217, 91%, 60%)",
  },
  available: {
    label: "Available Memory (GB)",
    color: "hsl(142, 76%, 36%)",
  },
};

export function MemoryUsageChart() {
  return (
    <Card className="glassmorphism border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-400" />
          Memory Usage History (24h)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart data={memoryData}>
            <XAxis 
              dataKey="time" 
              tickLine={false}
              axisLine={false}
              className="text-xs"
            />
            <YAxis 
              domain={[0, 8]}
              tickLine={false}
              axisLine={false}
              className="text-xs"
            />
            <ChartTooltip 
              content={<ChartTooltipContent />}
              cursor={{ stroke: "rgba(59, 130, 246, 0.3)" }}
            />
            <Area
              type="monotone"
              dataKey="used"
              stackId="1"
              stroke="var(--color-used)"
              fill="var(--color-used)"
              fillOpacity={0.6}
            />
            <Area
              type="monotone"
              dataKey="available"
              stackId="1"
              stroke="var(--color-available)"
              fill="var(--color-available)"
              fillOpacity={0.6}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
