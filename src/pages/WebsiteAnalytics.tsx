
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Globe, Clock, Zap, MapPin, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { StatusBadge } from "@/components/StatusBadge";
import { WebsiteResponseChart } from "@/components/charts/WebsiteResponseChart";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";

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
    return times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
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
          <StatusBadge status={website.is_active ? "online" : "offline"}>
            {website.is_active ? "Active" : "Inactive"}
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
                <p className="text-2xl font-bold">{website.is_active ? "Active" : "Inactive"}</p>
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
                <StatusBadge status="warning">
                  {typeof uptimeData.INDIA === 'string' ? uptimeData.INDIA : "N/A"}
                </StatusBadge>
              </div>
              <p className="text-2xl font-bold text-blue-400">N/A</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Website Response Chart */}
      <div className="grid grid-cols-1 gap-6">
        <WebsiteResponseChart />
      </div>
    </div>
  );
}
