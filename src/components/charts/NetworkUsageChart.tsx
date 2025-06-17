
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { Network } from "lucide-react";

const networkData = [
  { time: "00:00", download: 45.2, upload: 23.8 },
  { time: "02:00", download: 38.6, upload: 19.4 },
  { time: "04:00", download: 52.1, upload: 28.7 },
  { time: "06:00", download: 41.8, upload: 22.1 },
  { time: "08:00", download: 68.4, upload: 35.2 },
  { time: "10:00", download: 72.9, upload: 38.6 },
  { time: "12:00", download: 65.3, upload: 32.8 },
  { time: "14:00", download: 78.2, upload: 41.5 },
  { time: "16:00", download: 85.7, upload: 45.3 },
  { time: "18:00", download: 76.1, upload: 39.8 },
  { time: "20:00", download: 69.4, upload: 34.7 },
  { time: "22:00", download: 58.3, upload: 29.1 },
];

const chartConfig = {
  download: {
    label: "Download (Mbps)",
    color: "hsl(217, 91%, 60%)",
  },
  upload: {
    label: "Upload (Mbps)",
    color: "hsl(142, 76%, 36%)",
  },
};

export function NetworkUsageChart() {
  return (
    <Card className="glassmorphism border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Network className="w-5 h-5 text-blue-400" />
          Network Usage History (24h)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart data={networkData}>
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
              dataKey="download"
              stroke="var(--color-download)"
              strokeWidth={2}
              dot={{ fill: "var(--color-download)", strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5, stroke: "var(--color-download)", strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="upload"
              stroke="var(--color-upload)"
              strokeWidth={2}
              dot={{ fill: "var(--color-upload)", strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5, stroke: "var(--color-upload)", strokeWidth: 2 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
