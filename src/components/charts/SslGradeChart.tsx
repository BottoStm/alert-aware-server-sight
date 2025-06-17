
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { BarChart3 } from "lucide-react";

const gradeData = [
  { grade: "A+", count: 2, color: "hsl(142, 76%, 36%)" },
  { grade: "A", count: 3, color: "hsl(162, 72%, 40%)" },
  { grade: "B", count: 2, color: "hsl(45, 93%, 47%)" },
  { grade: "C", count: 1, color: "hsl(35, 91%, 56%)" },
  { grade: "F", count: 1, color: "hsl(0, 84%, 60%)" },
];

const chartConfig = {
  count: {
    label: "Certificate Count",
    color: "hsl(217, 91%, 60%)",
  },
};

export function SslGradeChart() {
  return (
    <Card className="glassmorphism border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-400" />
          SSL Certificate Grades Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <PieChart>
            <Pie
              data={gradeData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="count"
              label={({ grade, count }) => `${grade}: ${count}`}
              labelLine={false}
            >
              {gradeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <ChartTooltip 
              content={<ChartTooltipContent />}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
