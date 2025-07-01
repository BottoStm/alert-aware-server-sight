import { useState } from "react";
import { useParams } from "react-router-dom";
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
  Wifi,
  Clock,
  HardDrive,
  Network,
  BarChart3,
  Database,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { UsageOverview } from "@/components/charts/UsageOverview";
import Processes from "./Processes";
import Containers from "./Containers";
import NetworkPage from "./Network";
import Storage from "./Storage";

interface LiveStatsData {
  uptime: string;
  fs_stats: {
    device_name: string;
    fs_type: string;
    mnt_point: string;
    size: number;
    used: number;
    free: number;
    percent: number;
    key: string;
  }[];
  network_stats: {
    bytes_sent: number;
    bytes_recv: number;
    speed: number;
    interface_name: string;
    alias: string | null;
    bytes_all: number;
    time_since_update: number;
    bytes_recv_gauge: number;
    bytes_recv_rate_per_sec: number;
    bytes_sent_gauge: number;
    bytes_sent_rate_per_sec: number;
    bytes_all_gauge: number;
    bytes_all_rate_per_sec: number;
  }[];
  connections_list: any;
  proc_total: number;
  proc_running: number;
  proc_sleeping: number;
  proc_threads: number;
  last_updated: string;
}

interface LiveStatsResponse {
  success: boolean;
  data: LiveStatsData;
}

export default function ServerDetails() {
  const { serverId } = useParams();
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch live server stats from API
  const { data: liveStats, isLoading, error, refetch } = useQuery({
    queryKey: ['server-live-stats', serverId],
    queryFn: async (): Promise<LiveStatsResponse> => {
      console.log('Fetching live stats for server ID:', serverId);
      const response = await fetch(`https://api.theservermonitor.com/server/${serverId}/live-stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      console.log('Live stats API response:', result);

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to fetch live stats');
      }

      return result;
    },
    enabled: !!token && !!serverId,
    refetchInterval: 10000, // Refresh every 10 seconds for live data
  });

  const handleRefresh = () => {
    refetch();
  };

  // Calculate metrics from live stats
  const totalDiskSpace = liveStats?.data.fs_stats?.reduce((acc, fs) => acc + fs.size, 0) || 0;
  const usedDiskSpace = liveStats?.data.fs_stats?.reduce((acc, fs) => acc + fs.used, 0) || 0;
  const diskUsagePercent = totalDiskSpace > 0 ? (usedDiskSpace / totalDiskSpace) * 100 : 0;

  const totalNetworkSent = liveStats?.data.network_stats?.reduce((acc, net) => acc + net.bytes_sent, 0) || 0;
  const totalNetworkReceived = liveStats?.data.network_stats?.reduce((acc, net) => acc + net.bytes_recv, 0) || 0;

  // Format bytes for display
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="text-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold">Loading server data...</h1>
        <p className="text-muted-foreground">Please wait while we fetch the latest server information.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold">Error Loading Server Data</h1>
        <p className="text-muted-foreground mb-4">
          {error.message || "Failed to load server information"}
        </p>
        <Button onClick={handleRefresh}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            Server Details
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time monitoring and system information
          </p>
          {liveStats?.data.last_updated && (
            <p className="text-xs text-muted-foreground mt-1">
              Last updated: {new Date(liveStats.data.last_updated).toLocaleString()}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Current Performance Metrics */}
      <Card className="glassmorphism border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            Current Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <MetricCard
              title="System Uptime"
              value={liveStats?.data.uptime || "Unknown"}
              icon={<Clock className="w-4 h-4" />}
              status="healthy"
              subtitle="Continuous operation"
            />

            <MetricCard
              title="Total Processes"
              value={liveStats?.data.proc_total || 0}
              icon={<Activity className="w-4 h-4" />}
              status="healthy"
              subtitle={`${liveStats?.data.proc_running || 0} running, ${liveStats?.data.proc_sleeping || 0} sleeping`}
            />

            <MetricCard
              title="Disk Usage"
              value={`${diskUsagePercent.toFixed(1)}%`}
              icon={<HardDrive className="w-4 h-4" />}
              status={diskUsagePercent > 80 ? "critical" : diskUsagePercent > 60 ? "warning" : "healthy"}
              subtitle={`${formatBytes(usedDiskSpace)} / ${formatBytes(totalDiskSpace)}`}
            />

            <MetricCard
              title="Network I/O"
              value={`${formatBytes(totalNetworkSent + totalNetworkReceived)}`}
              icon={<Network className="w-4 h-4" />}
              status="healthy"
              subtitle={`↑ ${formatBytes(totalNetworkSent)} ↓ ${formatBytes(totalNetworkReceived)}`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        {[
          { id: "overview", label: "Overview", icon: BarChart3 },
          { id: "processes", label: "Processes", icon: Activity },
          { id: "containers", label: "Containers", icon: Database },
          { id: "network", label: "Network", icon: Network },
          { id: "storage", label: "Storage", icon: HardDrive },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <UsageOverview />

          {/* Filesystem Stats */}
          <Card className="glassmorphism border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-blue-400" />
                Filesystem Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mount Point</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Used</TableHead>
                    <TableHead>Free</TableHead>
                    <TableHead>Usage %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {liveStats?.data.fs_stats?.map((fs, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono">{fs.mnt_point}</TableCell>
                      <TableCell className="font-mono text-sm">{fs.device_name}</TableCell>
                      <TableCell>{fs.fs_type}</TableCell>
                      <TableCell>{formatBytes(fs.size)}</TableCell>
                      <TableCell>{formatBytes(fs.used)}</TableCell>
                      <TableCell>{formatBytes(fs.free)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={fs.percent} className="w-16 h-2" />
                          <span className={`text-xs font-mono ${
                            fs.percent > 80 ? 'text-red-400' :
                            fs.percent > 60 ? 'text-amber-400' : 'text-green-400'
                          }`}>
                            {fs.percent.toFixed(1)}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  )) || (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        No filesystem data available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "processes" && <Processes />}
      {activeTab === "containers" && <Containers />}
      {activeTab === "network" && <NetworkPage />}
      {activeTab === "storage" && <Storage />}
    </div>
  );
}
