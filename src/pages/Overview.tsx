import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MetricCard } from "@/components/MetricCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Server, 
  Activity, 
  AlertTriangle,
  TrendingUp,
  Eye,
  ExternalLink,
  Wifi
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";

const servers = [
  { 
    id: 1, 
    name: "Web Server 01", 
    ip: "192.168.1.10", 
    status: "online" as const, 
    cpu: 65, 
    memory: 78, 
    disk: 45,
    uptime: "15 days, 4h",
    os: "Ubuntu 22.04",
    location: "US-East-1"
  },
  { 
    id: 2, 
    name: "Database Server", 
    ip: "192.168.1.20", 
    status: "online" as const, 
    cpu: 82, 
    memory: 89, 
    disk: 67,
    uptime: "28 days, 12h",
    os: "CentOS 8",
    location: "US-West-2"
  },
  { 
    id: 3, 
    name: "API Gateway", 
    ip: "192.168.1.30", 
    status: "warning" as const, 
    cpu: 91, 
    memory: 85, 
    disk: 23,
    uptime: "7 days, 18h",
    os: "Ubuntu 20.04",
    location: "EU-Central-1"
  },
  { 
    id: 4, 
    name: "Load Balancer", 
    ip: "192.168.1.40", 
    status: "online" as const, 
    cpu: 34, 
    memory: 56, 
    disk: 78,
    uptime: "45 days, 2h",
    os: "RHEL 9",
    location: "US-East-1"
  },
  { 
    id: 5, 
    name: "Backup Server", 
    ip: "192.168.1.50", 
    status: "offline" as const, 
    cpu: 0, 
    memory: 0, 
    disk: 89,
    uptime: "0 days, 0h",
    os: "Ubuntu 22.04",
    location: "US-West-1"
  }
];

// Mock data for demonstration
const systemMetrics = {
  servers: { total: 12, online: 11, offline: 1 },
  containers: { total: 47, running: 44, stopped: 3 },
  alerts: { total: 3, critical: 1, warning: 2 }
};

const recentAlerts = [
  { id: 1, message: "High CPU usage on Database Server", severity: "critical" as const, time: "2 min ago" },
  { id: 2, message: "SSL certificate expires in 7 days", severity: "warning" as const, time: "1 hour ago" },
  { id: 3, message: "Backup process completed successfully", severity: "info" as const, time: "3 hours ago" }
];

export default function Overview() {
  const navigate = useNavigate();
  const { token } = useAuth();

  // Fetch website status from API
  const { data: websiteStatus, isLoading: websiteStatusLoading, error: websiteStatusError } = useQuery({
    queryKey: ['website-status'],
    queryFn: async () => {
      console.log('🔄 Making request to /status endpoint...');
      console.log('🔑 Using token:', token ? 'Token present' : 'No token');
      
      try {
        const response = await fetch('https://api.theservermonitor.com/status', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('📡 Response status:', response.status);
        console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
        
        const data = await response.json();
        console.log('📊 Raw API response:', data);
        
        if (data.success) {
          console.log('✅ Successfully fetched website status:', data.data);
          return data.data;
        } else {
          console.error('❌ API returned error:', data.message || 'Unknown error');
          return { online: 0, total: 0, status_text: "0/0 Online" };
        }
      } catch (error) {
        console.error('💥 Fetch error:', error);
        throw error;
      }
    },
    enabled: !!token,
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: 3
  });

  console.log('🎯 Current websiteStatus state:', websiteStatus);
  console.log('⏳ Loading state:', websiteStatusLoading);
  console.log('🚨 Error state:', websiteStatusError);

  const onlineServers = servers.filter(s => s.status === "online").length;
  const warningServers = servers.filter(s => s.status === "warning").length;
  const offlineServers = servers.filter(s => s.status === "offline").length;

  const handleServerClick = (serverId: number) => {
    navigate(`/servers/${serverId}`);
  };

  const websiteUptime = websiteStatus?.total > 0 ? 
    ((websiteStatus.online / websiteStatus.total) * 100).toFixed(1) : '0.0';

  const getWebsiteStatusForCard = () => {
    if (websiteStatusLoading) return "warning";
    if (!websiteStatus) return "critical";
    if (websiteStatus.online === websiteStatus.total && websiteStatus.total > 0) return "healthy";
    if (websiteStatus.online === 0) return "critical";
    return "warning";
  };

  const getAverageResponseTime = () => {
    // This would typically come from the API, using placeholder for now
    return "245ms";
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Infrastructure Overview
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Monitor your server infrastructure at a glance
        </p>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="Total Servers"
          value={servers.length}
          icon={<Server className="w-4 h-4" />}
          status="healthy"
          subtitle="Active infrastructure"
        />
        
        <MetricCard
          title="Online"
          value={onlineServers}
          change="+2 today"
          changeType="positive"
          icon={<Activity className="w-4 h-4" />}
          status="healthy"
          subtitle="Running smoothly"
        />
        
        <MetricCard
          title="Website Status"
          value={websiteStatusLoading ? "Loading..." : (websiteStatus?.status_text || "0/0 Online")}
          change={`${websiteUptime}% uptime`}
          changeType="positive"
          icon={<Wifi className="w-4 h-4" />}
          status={getWebsiteStatusForCard()}
          subtitle={`${websiteStatus?.online || 0} of ${websiteStatus?.total || 0} online`}
        />
        
        <MetricCard
          title="Active Alerts"
          value={systemMetrics.alerts.total}
          change={`${systemMetrics.alerts.critical} critical`}
          changeType="negative"
          icon={<AlertTriangle className="w-4 h-4" />}
          status="critical"
          subtitle="Requires immediate attention"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Server Status List */}
        <div className="lg:col-span-2">
          <Card className="glassmorphism border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5 text-blue-400" />
                Server Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {servers.map((server, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-card/50 border border-border/30 hover:border-border/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div>
                        <h3 className="font-medium text-foreground">{server.name}</h3>
                        <p className="text-sm text-muted-foreground">{server.ip}</p>
                      </div>
                      <StatusBadge status={server.status}>
                        {server.status.charAt(0).toUpperCase() + server.status.slice(1)}
                      </StatusBadge>
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <div className="text-muted-foreground">CPU</div>
                        <div className={`font-medium ${server.cpu > 80 ? 'text-red-400' : server.cpu > 60 ? 'text-amber-400' : 'text-green-400'}`}>
                          {server.cpu}%
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-muted-foreground">RAM</div>
                        <div className={`font-medium ${server.memory > 80 ? 'text-red-400' : server.memory > 60 ? 'text-amber-400' : 'text-green-400'}`}>
                          {server.memory}%
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-muted-foreground">Disk</div>
                        <div className={`font-medium ${server.disk > 80 ? 'text-red-400' : server.disk > 60 ? 'text-amber-400' : 'text-green-400'}`}>
                          {server.disk}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Alerts */}
        <div>
          <Card className="glassmorphism border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                Recent Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentAlerts.map((alert) => (
                  <div key={alert.id} className="p-3 rounded-lg border border-border/30 bg-card/30">
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                        alert.severity === 'critical' ? 'bg-red-400' : 
                        alert.severity === 'warning' ? 'bg-amber-400' : 'bg-blue-400'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground mb-1">
                          {alert.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {alert.time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* System Resource Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glassmorphism border-border/50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Average CPU</CardTitle>
              <Activity className="w-4 h-4 text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground mb-2">67%</div>
            <Progress value={67} className="h-2 mb-2" />
            <p className="text-xs text-muted-foreground">Across all servers</p>
          </CardContent>
        </Card>

        <Card className="glassmorphism border-border/50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Memory Usage</CardTitle>
              <Server className="w-4 h-4 text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground mb-2">72%</div>
            <Progress value={72} className="h-2 mb-2" />
            <p className="text-xs text-muted-foreground">89.6 GB / 124 GB</p>
          </CardContent>
        </Card>

        <Card className="glassmorphism border-border/50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Website Uptime</CardTitle>
              <Wifi className="w-4 h-4 text-amber-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground mb-2">{websiteUptime}%</div>
            <Progress value={parseFloat(websiteUptime)} className="h-2 mb-2" />
            <p className="text-xs text-muted-foreground">
              Average response: {getAverageResponseTime()}
            </p>
          </CardContent>
        </Card>

        <Card className="glassmorphism border-border/50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Alerts</CardTitle>
              <AlertTriangle className="w-4 h-4 text-red-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground mb-2">{systemMetrics.alerts.total}</div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{systemMetrics.alerts.critical} critical</span>
              <span>{systemMetrics.alerts.warning} warning</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
