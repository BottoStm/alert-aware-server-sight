
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, Cell, ResponsiveContainer } from "recharts";
import { Shield } from "lucide-react";

const expiryData = [
  { domain: "example.com", daysLeft: 45, status: "valid" },
  { domain: "api.example.com", daysLeft: 12, status: "warning" },
  { domain: "admin.example.com", daysLeft: 5, status: "critical" },
  { domain: "old.example.com", daysLeft: -3, status: "expired" },
  { domain: "shop.example.com", daysLeft: 89, status: "valid" },
  { domain: "blog.example.com", daysLeft: 156, status: "valid" },
];

const chartConfig = {
  daysLeft: {
    label: "Days Until Expiry",
    color: "hsl(217, 91%, 60%)",
  },
};

const getBarColor = (daysLeft: number) => {
  if (daysLeft < 0) return "hsl(0, 84%, 60%)"; // Red for expired
  if (daysLeft <= 7) return "hsl(0, 84%, 60%)"; // Red for critical
  if (daysLeft <= 30) return "hsl(45, 93%, 47%)"; // Yellow for warning
  return "hsl(142, 76%, 36%)"; // Green for valid
};

export function SslExpiryChart() {
  return (
    <Card className="glassmorphism border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-400" />
          SSL Certificate Expiry Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart 
              data={expiryData} 
              layout="horizontal"
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis 
                type="number"
                domain={[-10, 200]}
                tickLine={false}
                axisLine={false}
                className="text-xs fill-muted-foreground"
              />
              <YAxis 
                type="category"
                dataKey="domain"
                tickLine={false}
                axisLine={false}
                className="text-xs fill-muted-foreground"
                width={120}
              />
              <ChartTooltip 
                content={<ChartTooltipContent 
                  formatter={(value, name) => [
                    `${value} days`,
                    name === 'daysLeft' ? 'Days Until Expiry' : name
                  ]}
                />}
                cursor={{ fill: "rgba(59, 130, 246, 0.1)" }}
              />
              <Bar
                dataKey="daysLeft"
                radius={[0, 4, 4, 0]}
              >
                {expiryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.daysLeft)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
