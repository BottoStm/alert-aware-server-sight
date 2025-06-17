
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { BarChart3 } from "lucide-react";

const uptimeData = [
  { time: "00:00", main: 99.9, api: 99.8, admin: 98.5, cdn: 95.2 },
  { time: "02:00", main: 99.9, api: 99.7, admin: 98.6, cdn: 95.1 },
  { time: "04:00", main: 99.8, api: 99.9, admin: 98.4, cdn: 95.3 },
  { time: "06:00", main: 99.9, api: 99.8, admin: 98.7, cdn: 95.0 },
  { time: "08:00", main: 99.7, api: 99.6, admin: 98.3, cdn: 94.8 },
  { time: "10:00", main: 99.8, api: 99.8, admin: 98.5, cdn: 95.1 },
  { time: "12:00", main: 99.9, api: 99.9, admin: 98.6, cdn: 95.4 },
  { time: "14:00", main: 99.8, api: 99.7, admin: 98.4, cdn: 95.2 },
  { time: "16:00", main: 99.9, api: 99.8, admin: 98.5, cdn: 95.0 },
  { time: "18:00", main: 99.9, api: 99.9, admin: 98.7, cdn: 95.3 },
  { time: "20:00", main: 99.8, api: 99.7, admin: 98.6, cdn: 95.1 },
  { time: "22:00", main: 99.9, api: 99.8, admin: 98.5, cdn: 95.2 },
];

const chartConfig = {
  main: {
    label: "Main Website (%)",
    color: "hsl(217, 91%, 60%)",
  },
  api: {
    label: "API Endpoint (%)",
    color: "hsl(142, 76%, 36%)",
  },
  admin: {
    label: "Admin Panel (%)",
    color: "hsl(45, 93%, 47%)",
  },
  cdn: {
    label: "CDN Assets (%)",
    color: "hsl(285, 85%, 50%)",
  },
};

export function UptimeChart() {
  return (
    <Card className="glassmorphism border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-400" />
          Website Uptime Percentage (24h)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart data={uptimeData}>
            <XAxis 
              dataKey="time" 
              tickLine={false}
              axisLine={false}
              className="text-xs"
            />
            <YAxis 
              domain={[94, 100]}
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
              dataKey="main"
              stackId="1"
              stroke="var(--color-main)"
              fill="var(--color-main)"
              fillOpacity={0.3}
            />
            <Area
              type="monotone"
              dataKey="api"
              stackId="2"
              stroke="var(--color-api)"
              fill="var(--color-api)"
              fillOpacity={0.3}
            />
            <Area
              type="monotone"
              dataKey="admin"
              stackId="3"
              stroke="var(--color-admin)"
              fill="var(--color-admin)"
              fillOpacity={0.3}
            />
            <Area
              type="monotone"
              dataKey="cdn"
              stackId="4"
              stroke="var(--color-cdn)"
              fill="var(--color-cdn)"
              fillOpacity={0.3}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
