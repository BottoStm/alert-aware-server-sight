import { MetricCard } from "@/components/MetricCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Server, 
  Activity, 
  HardDrive, 
  Network, 
  Database,
  Gauge,
  Wifi,
  RefreshCw
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

interface ServerData {
  id: number;
  server_name: string;
  unique_identifier: string;
  description?: string;
  created_at: string;
}

interface WebsiteData {
  id: number;
  url: string;
  created_at: string;
}

interface ServersResponse {
  success: boolean;
  data: ServerData[];
  count: number;
}

interface WebsitesResponse {
  success: boolean;
  data: WebsiteData[];
}

// Generate mock metrics for display (in real implementation, this would come from live stats)
const generateMockMetrics = () => ({
  cpu: Math.floor(Math.random() * 80) + 10,
  memory: Math.floor(Math.random() * 70) + 20,
  disk: Math.floor(Math.random() * 60) + 15,
  status: Math.random() > 0.8 ? 'warning' as const : 'online' as const
});

export default function Index() {
  const { token } = useAuth();
  const navigate = useNavigate();

  // Fetch servers from API
  const { data: serversData, isLoading: serversLoading, refetch: refetchServers } = useQuery({
    queryKey: ['servers'],
    queryFn: async (): Promise<ServersResponse> => {
      const response = await fetch('https://api.theservermonitor.com/server', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to fetch servers');
      }
      
      return result;
    },
    enabled: !!token
  });

  // Fetch websites from API
  const { data: websitesData, isLoading: websitesLoading, refetch: refetchWebsites } = useQuery({
    queryKey: ['websites'],
    queryFn: async (): Promise<WebsitesResponse> => {
      const response = await fetch('https://api.theservermonitor.com/website', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      return { success: data.success, data: data.success ? data.data : [] };
    },
    enabled: !!token
  });

  const servers = serversData?.data || [];
  const websites = websitesData?.data || [];
  const serverCount = serversData?.count || 0;
  const websiteCount = websites.length || 0;

  // Generate mock metrics for each server for display
  const serversWithMetrics = servers.map(server => ({
    ...server,
    ...generateMockMetrics()
  }));

  const onlineServers = serversWithMetrics.filter(s => s.status === "online").length;
  const warningServers = serversWithMetrics.filter(s => s.status === "warning").length;
  const offlineServers = 0;

  const handleRefresh = () => {
    refetchServers();
    refetchWebsites();
  };

  const handleServerClick = (serverId: number) => {
    navigate(`/servers/${serverId}`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            System Overview
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time monitoring dashboard for all your infrastructure
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-muted-foreground">Live</span>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Servers"
          value={serverCount}
          icon={<Server className="w-4 h-4" />}
          status="healthy"
          subtitle="Managed servers"
        />
        
        <MetricCard
          title="Servers Online"
          value={`${onlineServers}/${serverCount}`}
          change={serverCount > 0 ? `${Math.round((onlineServers / serverCount) * 100)}% uptime` : "No servers"}
          changeType="positive"
          icon={<Activity className="w-4 h-4" />}
          status="healthy"
          subtitle="Healthy & running"
        />
        
        <MetricCard
          title="Websites Monitored"
          value={websiteCount}
          icon={<Wifi className="w-4 h-4" />}
          status="healthy"
          subtitle="Active monitoring"
        />
        
        <MetricCard
          title="Servers Need Attention"
          value={warningServers + offlineServers}
          icon={<Activity className="w-4 h-4" />}
          status={warningServers + offlineServers > 0 ? "warning" : "healthy"}
          subtitle={`${warningServers} warning, ${offlineServers} offline`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Server Status List */}
        <Card className="glassmorphism border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5 text-blue-400" />
              Server Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {serversLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading servers...</p>
              </div>
            ) : serverCount === 0 ? (
              <div className="text-center py-8">
                <Server className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">No Servers Found</h3>
                <p className="text-muted-foreground mb-4">
                  Add your first server to start monitoring.
                </p>
                <Button onClick={() => navigate('/servers')}>
                  Add Server
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {serversWithMetrics.slice(0, 5).map((server) => (
                  <div 
                    key={server.id} 
                    className="flex items-center justify-between p-4 rounded-lg bg-card/50 border border-border/30 hover:border-border/50 transition-colors cursor-pointer"
                    onClick={() => handleServerClick(server.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div>
                        <h3 className="font-medium text-foreground">{server.server_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          ID: {server.unique_identifier?.substring(0, 8)}...
                        </p>
                      </div>
                      <StatusBadge status={server.status}>
                        {server.status.charAt(0).toUpperCase() + server.status.slice(1)}
                      </StatusBadge>
                    </div>
                  </div>
                ))}
                {serverCount > 5 && (
                  <div className="text-center pt-4">
                    <Button variant="outline" onClick={() => navigate('/servers')}>
                      View All {serverCount} Servers
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Website Monitoring Overview */}
        <Card className="glassmorphism border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wifi className="w-5 h-5 text-green-400" />
              Website Monitoring
            </CardTitle>
          </CardHeader>
          <CardContent>
            {websitesLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading websites...</p>
              </div>
            ) : websiteCount === 0 ? (
              <div className="text-center py-8">
                <Wifi className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">No Websites Monitored</h3>
                <p className="text-muted-foreground mb-4">
                  Add your first website to start monitoring uptime and performance.
                </p>
                <Button onClick={() => navigate('/websites')}>
                  Add Website
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {websites.slice(0, 5).map((website) => {
                  const getDomainName = (url: string) => {
                    try {
                      return new URL(url).hostname;
                    } catch {
                      return url;
                    }
                  };

                  return (
                    <div 
                      key={website.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-card/50 border border-border/30 hover:border-border/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/website-analytics/${website.id}`)}
                    >
                      <div className="flex items-center gap-4">
                        <Wifi className="w-8 h-8 text-green-400" />
                        <div>
                          <h3 className="font-medium text-foreground">{getDomainName(website.url)}</h3>
                          <p className="text-sm text-muted-foreground">{website.url}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <StatusBadge status="online">
                          Monitoring
                        </StatusBadge>
                        <p className="text-xs text-muted-foreground mt-1">
                          Added: {new Date(website.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {websiteCount > 5 && (
                  <div className="text-center pt-4">
                    <Button variant="outline" onClick={() => navigate('/websites')}>
                      View All {websiteCount} Websites
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
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
            <div className="text-2xl font-bold text-foreground mb-2">
              {serverCount > 0 ? Math.round(serversWithMetrics.reduce((acc, s) => acc + s.cpu, 0) / serverCount) : 0}%
            </div>
            <Progress value={serverCount > 0 ? serversWithMetrics.reduce((acc, s) => acc + s.cpu, 0) / serverCount : 0} className="h-2 mb-2" />
            <p className="text-xs text-muted-foreground">Across {serverCount} servers</p>
          </CardContent>
        </Card>

        <Card className="glassmorphism border-border/50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Average Memory</CardTitle>
              <Gauge className="w-4 h-4 text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground mb-2">
              {serverCount > 0 ? Math.round(serversWithMetrics.reduce((acc, s) => acc + s.memory, 0) / serverCount) : 0}%
            </div>
            <Progress value={serverCount > 0 ? serversWithMetrics.reduce((acc, s) => acc + s.memory, 0) / serverCount : 0} className="h-2 mb-2" />
            <p className="text-xs text-muted-foreground">Memory utilization</p>
          </CardContent>
        </Card>

        <Card className="glassmorphism border-border/50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Average Disk</CardTitle>
              <HardDrive className="w-4 h-4 text-amber-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground mb-2">
              {serverCount > 0 ? Math.round(serversWithMetrics.reduce((acc, s) => acc + s.disk, 0) / serverCount) : 0}%
            </div>
            <Progress value={serverCount > 0 ? serversWithMetrics.reduce((acc, s) => acc + s.disk, 0) / serverCount : 0} className="h-2 mb-2" />
            <p className="text-xs text-muted-foreground">Storage utilization</p>
          </CardContent>
        </Card>

        <Card className="glassmorphism border-border/50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Infrastructure</CardTitle>
              <Database className="w-4 h-4 text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground mb-2">{serverCount + websiteCount}</div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{serverCount} servers</span>
              <span>{websiteCount} websites</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
