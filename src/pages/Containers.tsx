
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
  Database, 
  Play,
  Square,
  RotateCcw,
  RefreshCw,
  Activity,
  HardDrive,
  Cpu
} from "lucide-react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";

interface ContainerData {
  key: string;
  name: string;
  id: string;
  status: string;
  created: string;
  command: string;
  io: {
    cumulative_ior: number;
    cumulative_iow: number;
    time_since_update: number;
    ior: number;
    iow: number;
  };
  cpu: {
    total: number;
  };
  memory: {
    usage: number;
    limit: number;
    inactive_file: number;
  };
  network: {
    cumulative_rx: number;
    cumulative_tx: number;
    time_since_update: number;
    rx: number;
    tx: number;
  };
  io_rx: number;
  io_wx: number;
  cpu_percent: number;
  memory_percent: number | null;
  network_rx: number;
  network_tx: number;
  uptime: string;
  image: string[];
  memory_usage: number;
  engine: string;
}

interface ContainerResponse {
  success: boolean;
  data: {
    container_list: ContainerData[];
    last_updated: string;
  };
}

export default function Containers() {
  const { serverId } = useParams();
  const { token } = useAuth();

  // Fetch live container data from API
  const { data: containerData, isLoading, error, refetch } = useQuery({
    queryKey: ['server-containers', serverId],
    queryFn: async (): Promise<ContainerResponse> => {
      console.log('Fetching container data for server ID:', serverId);
      const response = await fetch(`https://api.theservermonitor.com/server/${serverId}/containers`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      console.log('Container data API response:', result);
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to fetch container data');
      }
      
      return result;
    },
    enabled: !!token && !!serverId,
    refetchInterval: 15000, // Refresh every 15 seconds for live data
  });

  const handleRefresh = () => {
    refetch();
  };

  // Calculate metrics from container data
  const containers = containerData?.data.container_list || [];
  const runningContainers = containers.filter(c => c.status?.toLowerCase() === 'running').length;
  const stoppedContainers = containers.filter(c => c.status?.toLowerCase() !== 'running').length;
  const totalCpuUsage = containers.reduce((acc, c) => acc + (c.cpu_percent || 0), 0);
  const totalMemoryUsage = containers.reduce((acc, c) => acc + (c.memory_usage || 0), 0);

  // Format memory usage for display
  const formatMemory = (bytes: number | undefined) => {
    if (!bytes) return '0 MB';
    const mb = bytes / (1024 * 1024);
    if (mb > 1024) {
      return `${(mb / 1024).toFixed(1)} GB`;
    }
    return `${mb.toFixed(0)} MB`;
  };

  if (isLoading) {
    return (
      <div className="text-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold">Loading container data...</h1>
        <p className="text-muted-foreground">Please wait while we fetch the latest container information.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold">Error Loading Container Data</h1>
        <p className="text-muted-foreground mb-4">
          {error.message || "Failed to load container information"}
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
            Container Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor and manage Docker containers and their resources
          </p>
          {containerData?.data.last_updated && (
            <p className="text-xs text-muted-foreground mt-1">
              Last updated: {new Date(containerData.data.last_updated).toLocaleString()}
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

      {/* Container Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="Running Containers"
          value={runningContainers}
          icon={<Database className="w-4 h-4" />}
          status="healthy"
          subtitle={`${stoppedContainers} stopped`}
        />
        
        <MetricCard
          title="Total Containers"
          value={containers.length}
          icon={<Database className="w-4 h-4" />}
          status="healthy"
          subtitle="Discovered containers"
        />
        
        <MetricCard
          title="Total CPU Usage"
          value={`${totalCpuUsage.toFixed(1)}%`}
          icon={<Cpu className="w-4 h-4" />}
          status={totalCpuUsage > 80 ? "warning" : "healthy"}
          subtitle="Across all containers"
        />
        
        <MetricCard
          title="Total Memory"
          value={formatMemory(totalMemoryUsage)}
          icon={<Activity className="w-4 h-4" />}
          status={totalMemoryUsage > 2000000000 ? "warning" : "healthy"}
          subtitle="RAM consumption"
        />
      </div>

      {/* Container List */}
      <Card className="glassmorphism border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-400" />
            Docker Containers ({containers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {containers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Container Name</TableHead>
                  <TableHead>Image</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>CPU Usage</TableHead>
                  <TableHead>Memory Usage</TableHead>
                  <TableHead>Network I/O</TableHead>
                  <TableHead>Disk I/O</TableHead>
                  <TableHead>Uptime</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {containers.map((container, index) => (
                  <TableRow key={container.id || index}>
                    <TableCell className="font-mono font-medium">
                      {container.name}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {container.image?.[0] || 'Unknown'}
                    </TableCell>
                    <TableCell>
                      <StatusBadge 
                        status={container.status?.toLowerCase() === "running" ? "online" : "offline"}
                      >
                        {(container.status || 'Unknown').toUpperCase()}
                      </StatusBadge>
                    </TableCell>
                    <TableCell>
                      {container.cpu_percent !== undefined ? (
                        <div className="flex items-center gap-2">
                          <Progress value={Math.min(container.cpu_percent * 100, 100)} className="w-16 h-2" />
                          <span className="text-xs font-mono">{(container.cpu_percent * 100).toFixed(1)}%</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {container.memory_usage ? (
                        <div className="space-y-1">
                          <div>{formatMemory(container.memory_usage)}</div>
                          {container.memory.limit && (
                            <div className="text-xs text-muted-foreground">
                              / {formatMemory(container.memory.limit)}
                            </div>
                          )}
                        </div>
                      ) : 'N/A'}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      <div className="space-y-1">
                        <div className="text-xs">
                          <span className="text-blue-400">↓ {formatMemory(container.network.cumulative_rx)}</span>
                        </div>
                        <div className="text-xs">
                          <span className="text-green-400">↑ {formatMemory(container.network.cumulative_tx)}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      <div className="space-y-1">
                        <div className="text-xs">
                          <span className="text-blue-400">R: {formatMemory(container.io.cumulative_ior)}</span>
                        </div>
                        <div className="text-xs">
                          <span className="text-orange-400">W: {formatMemory(container.io.cumulative_iow)}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {container.uptime}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {container.status?.toLowerCase() === "running" ? (
                          <>
                            <Button variant="ghost" size="icon" className="w-8 h-8">
                              <Square className="w-3 h-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="w-8 h-8">
                              <RotateCcw className="w-3 h-3" />
                            </Button>
                          </>
                        ) : (
                          <Button variant="ghost" size="icon" className="w-8 h-8">
                            <Play className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Database className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">No Containers Found</h3>
              <p className="text-muted-foreground">
                No Docker containers are currently running or available on this server.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
