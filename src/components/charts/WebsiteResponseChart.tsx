
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { Globe } from "lucide-react";

const responseData = [
  { time: "00:00", main: 245, api: 156, admin: 890, cdn: 123 },
  { time: "02:00", main: 198, api: 134, admin: 756, cdn: 98 },
  { time: "04:00", main: 267, api: 178, admin: 1120, cdn: 134 },
  { time: "06:00", main: 198, api: 145, admin: 678, cdn: 112 },
  { time: "08:00", main: 356, api: 189, admin: 1450, cdn: 167 },
  { time: "10:00", main: 423, api: 234, admin: 1678, cdn: 198 },
  { time: "12:00", main: 289, api: 167, admin: 1234, cdn: 145 },
  { time: "14:00", main: 334, api: 198, admin: 1567, cdn: 178 },
  { time: "16:00", main: 298, api: 156, admin: 1345, cdn: 134 },
  { time: "18:00", main: 245, api: 134, admin: 1123, cdn: 123 },
  { time: "20:00", main: 223, api: 145, admin: 967, cdn: 109 },
  { time: "22:00", main: 198, api: 123, admin: 834, cdn: 98 },
];

const chartConfig = {
  main: {
    label: "Main Website (ms)",
    color: "hsl(217, 91%, 60%)",
  },
  api: {
    label: "API Endpoint (ms)",
    color: "hsl(142, 76%, 36%)",
  },
  admin: {
    label: "Admin Panel (ms)",
    color: "hsl(45, 93%, 47%)",
  },
  cdn: {
    label: "CDN Assets (ms)",
    color: "hsl(285, 85%, 50%)",
  },
};

export function WebsiteResponseChart() {
  return (
    <Card className="glassmorphism border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-blue-400" />
          Website Response Times (24h)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart data={responseData}>
            <XAxis 
              dataKey="time" 
              tickLine={false}
              axisLine={false}
              className="text-xs"
            />
            <YAxis 
              domain={[0, 2000]}
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
              dataKey="main"
              stroke="var(--color-main)"
              strokeWidth={2}
              dot={{ fill: "var(--color-main)", strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5, stroke: "var(--color-main)", strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="api"
              stroke="var(--color-api)"
              strokeWidth={2}
              dot={{ fill: "var(--color-api)", strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5, stroke: "var(--color-api)", strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="admin"
              stroke="var(--color-admin)"
              strokeWidth={2}
              dot={{ fill: "var(--color-admin)", strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5, stroke: "var(--color-admin)", strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="cdn"
              stroke="var(--color-cdn)"
              strokeWidth={2}
              dot={{ fill: "var(--color-cdn)", strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5, stroke: "var(--color-cdn)", strokeWidth: 2 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
