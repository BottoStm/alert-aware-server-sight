
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { MapPin } from "lucide-react";

const locationData = [
  { location: "US-East-1", responseTime: 245, uptime: 99.9 },
  { location: "EU-West-1", responseTime: 187, uptime: 99.8 },
  { location: "Asia-Pacific", responseTime: 432, uptime: 98.5 },
  { location: "US-West-2", responseTime: 298, uptime: 99.2 }
];

const chartConfig = {
  responseTime: {
    label: "Response Time (ms)",
    color: "hsl(217, 91%, 60%)",
  },
};

interface LocationResponseChartProps {
  websiteName: string;
}

export function LocationResponseChart({ websiteName }: LocationResponseChartProps) {
  return (
    <Card className="glassmorphism border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-400" />
          {websiteName} - Server Locations Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart data={locationData}>
            <XAxis 
              dataKey="location" 
              tickLine={false}
              axisLine={false}
              className="text-xs"
            />
            <YAxis 
              tickLine={false}
              axisLine={false}
              className="text-xs"
            />
            <ChartTooltip 
              content={<ChartTooltipContent />}
              cursor={{ fill: "rgba(59, 130, 246, 0.1)" }}
            />
            <Bar
              dataKey="responseTime"
              fill="var(--color-responseTime)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
