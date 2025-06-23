
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Globe, Clock, Zap, MapPin, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { StatusBadge } from "@/components/StatusBadge";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { Card as ChartCard, CardContent as ChartCardContent, CardHeader as ChartCardHeader, CardTitle as ChartCardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";

export default function WebsiteAnalytics() {
  const { websiteId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  // Fetch website details from API
  const { data: websiteData, isLoading } = useQuery({
    queryKey: ['website-details', websiteId],
    queryFn: async () => {
      const response = await fetch(`https://api.theservermonitor.com/website?id=${websiteId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      return data.success ? data.data : null;
    },
    enabled: !!token && !!websiteId
  });

  const getDomainName = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  const getGradeFromProtocol = (protocol: number) => {
    switch (protocol) {
      case 3: return "A+";
      case 2: return "A";
      case 1: return "B";
      default: return "C";
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A+":
      case "A": return "text-green-400";
      case "B": return "text-amber-400";
      case "C":
      case "D": return "text-orange-400";
      default: return "text-red-400";
    }
  };

  const getSslStatus = (daysLeft: number) => {
    if (daysLeft < 0) return "offline";
    if (daysLeft <= 7) return "warning"; 
    return "online";
  };

  const getStatusFromString = (status: string) => {
    switch (status.toLowerCase()) {
      case "up": return "online";
      case "down": return "offline";
      default: return "warning";
    }
  };

  const getAverageResponseTime = () => {
    if (!websiteData?.latest_uptime) return 0;
    const times = [];
    if (websiteData.latest_uptime.CANADA?.response_time_ms) times.push(websiteData.latest_uptime.CANADA.response_time_ms);
    if (websiteData.latest_uptime.LONDON?.response_time_ms) times.push(websiteData.latest_uptime.LONDON.response_time_ms);
    if (websiteData.latest_uptime.INDIA?.response_time_ms) times.push(websiteData.latest_uptime.INDIA.response_time_ms);
    return times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
  };

  const isWebsiteActive = () => {
    if (!websiteData?.latest_uptime) return false;
    const canadaUp = websiteData.latest_uptime.CANADA?.status?.toLowerCase() === 'up';
    const londonUp = websiteData.latest_uptime.LONDON?.status?.toLowerCase() === 'up';
    const indiaUp = websiteData.latest_uptime.INDIA?.status?.toLowerCase() === 'up';
    return canadaUp || londonUp || indiaUp; // Active if at least one location is up
  };

  const formatChartData = () => {
    if (!websiteData?.graph_data?.response_times_24h) return [];
    
    const canadaData = websiteData.graph_data.response_times_24h.CANADA || [];
    const londonData = websiteData.graph_data.response_times_24h.LONDON || [];
    const indiaData = websiteData.graph_data.response_times_24h.INDIA || [];
    
    // Create a combined dataset with timestamps
    const combinedData = [];
    const maxLength = Math.max(canadaData.length, londonData.length, indiaData.length);
    
    for (let i = 0; i < maxLength; i++) {
      const canadaPoint = canadaData[i];
      const londonPoint = londonData[i];
      const indiaPoint = indiaData[i];
      
      if (canadaPoint || londonPoint || indiaPoint) {
        combinedData.push({
          time: canadaPoint?.time || londonPoint?.time || indiaPoint?.time || '',
          canada: canadaPoint?.value || null,
          london: londonPoint?.value || null,
          india: indiaPoint?.value || null,
        });
      }
    }
    
    // Take last 24 points for better visualization
    return combinedData.slice(-24);
  };

  const chartConfig = {
    canada: {
      label: "Canada (ms)",
      color: "hsl(217, 91%, 60%)",
    },
    london: {
      label: "London (ms)",
      color: "hsl(142, 76%, 36%)",
    },
    india: {
      label: "India (ms)",
      color: "hsl(45, 93%, 47%)",
    },
  };

  if (isLoading) {
    return (
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold">Loading website details...</h1>
      </div>
    );
  }

  if (!websiteData) {
    return (
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold">Website Not Found</h1>
        <Button onClick={() => navigate('/websites')} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Websites
        </Button>
      </div>
    );
  }

  const website = websiteData.website_info;
  const sslInfo = websiteData.ssl_info;
  const uptimeData = websiteData.latest_uptime;
  const graphData = websiteData.graph_data;

  const domainName = getDomainName(website.url);
  const sslGrade = getGradeFromProtocol(sslInfo.protocol_from_cert);
  const chartData = formatChartData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/websites')}
            className="hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              {domainName}
            </h1>
            <p className="text-muted-foreground mt-1">{website.url}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={isWebsiteActive() ? "online" : "offline"}>
            {isWebsiteActive() ? "Active" : "Inactive"}
          </StatusBadge>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glassmorphism border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Globe className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-2xl font-bold">{isWebsiteActive() ? "Active" : "Inactive"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glassmorphism border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Response Time</p>
                <p className="text-2xl font-bold">{getAverageResponseTime()}ms</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glassmorphism border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Zap className="w-8 h-8 text-amber-400" />
              <div>
                <p className="text-sm text-muted-foreground">Uptime (24h)</p>
                <p className="text-2xl font-bold">{graphData.uptime_percentage_24h}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SSL Certificate Information */}
      <Card className="glassmorphism border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            SSL Certificate Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">Certificate Grade</h4>
                <Badge 
                  variant="outline" 
                  className={getGradeColor(sslGrade)}
                >
                  {sslGrade}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">Issued by {sslInfo.issued_by}</p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">Expiry Status</h4>
                <StatusBadge status={getSslStatus(sslInfo.days_until_expiry)}>
                  {sslInfo.days_until_expiry < 0 ? "Expired" : `${sslInfo.days_until_expiry} days`}
                </StatusBadge>
              </div>
              <p className="text-sm text-muted-foreground">Expires: {new Date(sslInfo.expiry_date).toLocaleDateString()}</p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">Status</h4>
                <Badge variant="outline">{sslInfo.expiry_status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Certificate Status</p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">Protocol</h4>
                <Badge variant="outline">TLS 1.{sslInfo.protocol_from_cert}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Security Protocol</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Response Times by Location */}
      <Card className="glassmorphism border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-400" />
            Response Times by Location
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">London</h4>
                <StatusBadge status={uptimeData.LONDON ? getStatusFromString(uptimeData.LONDON.status) : "warning"}>
                  {uptimeData.LONDON ? uptimeData.LONDON.status : "N/A"}
                </StatusBadge>
              </div>
              <p className="text-2xl font-bold text-blue-400">
                {uptimeData.LONDON ? `${uptimeData.LONDON.response_time_ms}ms` : "N/A"}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">Canada</h4>
                <StatusBadge status={uptimeData.CANADA ? getStatusFromString(uptimeData.CANADA.status) : "warning"}>
                  {uptimeData.CANADA ? uptimeData.CANADA.status : "N/A"}
                </StatusBadge>
              </div>
              <p className="text-2xl font-bold text-blue-400">
                {uptimeData.CANADA ? `${uptimeData.CANADA.response_time_ms}ms` : "N/A"}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">India</h4>
                <StatusBadge status={uptimeData.INDIA ? getStatusFromString(uptimeData.INDIA.status) : "warning"}>
                  {uptimeData.INDIA ? uptimeData.INDIA.status : "N/A"}
                </StatusBadge>
              </div>
              <p className="text-2xl font-bold text-blue-400">
                {uptimeData.INDIA ? `${uptimeData.INDIA.response_time_ms}ms` : "N/A"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Website Response Chart */}
      <ChartCard className="glassmorphism border-border/50">
        <ChartCardHeader>
          <ChartCardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-400" />
            {domainName} Response Times (24h)
          </ChartCardTitle>
        </ChartCardHeader>
        <ChartCardContent>
          <ChartContainer config={chartConfig}>
            <LineChart data={chartData}>
              <XAxis 
                dataKey="time"
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: false 
                  });
                }}
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
                cursor={{ stroke: "rgba(59, 130, 246, 0.3)" }}
              />
              <Line
                type="monotone"
                dataKey="canada"
                stroke="var(--color-canada)"
                strokeWidth={2}
                dot={{ fill: "var(--color-canada)", strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, stroke: "var(--color-canada)", strokeWidth: 2 }}
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="london"
                stroke="var(--color-london)"
                strokeWidth={2}
                dot={{ fill: "var(--color-london)", strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, stroke: "var(--color-london)", strokeWidth: 2 }}
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="india"
                stroke="var(--color-india)"
                strokeWidth={2}
                dot={{ fill: "var(--color-india)", strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, stroke: "var(--color-india)", strokeWidth: 2 }}
                connectNulls={false}
              />
            </LineChart>
          </ChartContainer>
        </ChartCardContent>
      </ChartCard>
    </div>
  );
}
