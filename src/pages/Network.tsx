
import { MetricCard } from "@/components/MetricCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Network as NetworkIcon, 
  Wifi,
  RefreshCw,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";

interface NetworkStats {
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
}

interface NetworkResponse {
  success: boolean;
  data: {
    network_stats: NetworkStats[];
    last_updated: string;
  };
}

export default function Network() {
  const { serverId } = useParams();
  const { token } = useAuth();

  // Fetch live network data from API
  const { data: networkData, isLoading, error, refetch } = useQuery({
    queryKey: ['server-network', serverId],
    queryFn: async (): Promise<NetworkResponse> => {
      console.log('Fetching network data for server ID:', serverId);
      const response = await fetch(`https://api.theservermonitor.com/server/${serverId}/live-stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      console.log('Network data API response:', result);
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to fetch network data');
      }
      
      return {
        success: true,
        data: {
          network_stats: result.data.network_stats || [],
          last_updated: result.data.last_updated
        }
      };
    },
    enabled: !!token && !!serverId,
    refetchInterval: 10000, // Refresh every 10 seconds for live data
  });

  const handleRefresh = () => {
    refetch();
  };

  // Format bytes for display
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format speed for display
  const formatSpeed = (speed: number) => {
    if (speed === 0) return 'N/A';
    const mbps = speed / (1024 * 1024);
    if (mbps >= 1000) {
      return `${(mbps / 1000).toFixed(1)} Gbps`;
    }
    return `${mbps.toFixed(0)} Mbps`;
  };

  // Calculate total network metrics
  const totalBytesAll = networkData?.data.network_stats?.reduce((sum, net) => sum + net.bytes_all, 0) || 0;
  const totalRatePerSec = networkData?.data.network_stats?.reduce((sum, net) => sum + net.bytes_all_rate_per_sec, 0) || 0;
  const activeInterfaces = networkData?.data.network_stats?.length || 0;

  if (isLoading) {
    return (
      <div className="text-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold">Loading network data...</h1>
        <p className="text-muted-foreground">Please wait while we fetch the latest network information.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold">Error Loading Network Data</h1>
        <p className="text-muted-foreground mb-4">
          {error.message || "Failed to load network information"}
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
            Network Monitor
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time network interface and traffic monitoring
          </p>
          {networkData?.data.last_updated && (
            <p className="text-xs text-muted-foreground mt-1">
              Last updated: {new Date(networkData.data.last_updated).toLocaleString()}
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

      {/* Network Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="Total Traffic"
          value={formatBytes(totalBytesAll)}
          icon={<NetworkIcon className="w-4 h-4" />}
          status="healthy"
          subtitle="All interfaces combined"
        />
        
        <MetricCard
          title="Current Rate"
          value={`${formatBytes(totalRatePerSec)}/s`}
          icon={<TrendingUp className="w-4 h-4" />}
          status="healthy"
          subtitle="Live transfer rate"
        />
        
        <MetricCard
          title="Active Interfaces"
          value={activeInterfaces}
          icon={<Wifi className="w-4 h-4" />}
          status="healthy"
          subtitle="Network interfaces"
        />
        
        <MetricCard
          title="Network Status"
          value="Online"
          icon={<NetworkIcon className="w-4 h-4" />}
          status="healthy"
          subtitle="All interfaces operational"
        />
      </div>

      {/* Network Interfaces */}
      <Card className="glassmorphism border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <NetworkIcon className="w-5 h-5 text-blue-400" />
            Network Interfaces ({activeInterfaces})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {networkData?.data.network_stats && networkData.data.network_stats.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Interface</TableHead>
                  <TableHead>Speed</TableHead>
                  <TableHead>Total Bytes</TableHead>
                  <TableHead>Bytes Sent</TableHead>
                  <TableHead>Bytes Received</TableHead>
                  <TableHead>Send Rate</TableHead>
                  <TableHead>Receive Rate</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {networkData.data.network_stats.map((interface_, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-mono font-medium">
                      {interface_.interface_name}
                      {interface_.alias && (
                        <span className="text-xs text-muted-foreground ml-2">({interface_.alias})</span>
                      )}
                    </TableCell>
                    <TableCell>{formatSpeed(interface_.speed)}</TableCell>
                    <TableCell>{formatBytes(interface_.bytes_all)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        {formatBytes(interface_.bytes_sent)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <TrendingDown className="w-4 h-4 text-blue-400" />
                        {formatBytes(interface_.bytes_recv)}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {formatBytes(interface_.bytes_sent_rate_per_sec)}/s
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {formatBytes(interface_.bytes_recv_rate_per_sec)}/s
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full border bg-green-500/20 text-green-400 border-green-500/30">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                        UP
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <NetworkIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">No Network Interfaces Found</h3>
              <p className="text-muted-foreground">
                No network interface data is currently available.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
