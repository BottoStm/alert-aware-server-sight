
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { HardDrive } from "lucide-react";

const diskData = [
  { time: "00:00", reads: 234, writes: 156 },
  { time: "02:00", reads: 189, writes: 123 },
  { time: "04:00", reads: 267, writes: 178 },
  { time: "06:00", reads: 198, writes: 134 },
  { time: "08:00", reads: 356, writes: 245 },
  { time: "10:00", reads: 423, writes: 289 },
  { time: "12:00", reads: 389, writes: 267 },
  { time: "14:00", reads: 456, writes: 312 },
  { time: "16:00", reads: 512, writes: 345 },
  { time: "18:00", reads: 467, writes: 298 },
  { time: "20:00", reads: 398, writes: 267 },
  { time: "22:00", reads: 323, writes: 221 },
];

const chartConfig = {
  reads: {
    label: "Disk Reads (IOPS)",
    color: "hsl(217, 91%, 60%)",
  },
  writes: {
    label: "Disk Writes (IOPS)",
    color: "hsl(45, 93%, 47%)",
  },
};

export function DiskUsageChart() {
  return (
    <Card className="glassmorphism border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-blue-400" />
          Disk I/O History (24h)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart data={diskData}>
            <XAxis 
              dataKey="time" 
              tickLine={false}
              axisLine={false}
              className="text-xs"
            />
            <YAxis 
              domain={[0, 600]}
              tickLine={false}
              axisLine={false}
              className="text-xs"
            />
            <ChartTooltip 
              content={<ChartTooltipContent />}
              cursor={{ fill: "rgba(59, 130, 246, 0.1)" }}
            />
            <Bar
              dataKey="reads"
              fill="var(--color-reads)"
              radius={[2, 2, 0, 0]}
            />
            <Bar
              dataKey="writes"
              fill="var(--color-writes)"
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
