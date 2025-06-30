import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Server, Activity, Database, Network as NetworkIcon, HardDrive, Edit, Trash2 } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

// Import the existing page components
import Processes from "./Processes";
import Containers from "./Containers";
import Network from "./Network";
import Storage from "./Storage";

// Import chart components
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, AreaChart, Area } from "recharts";

export default function ServerDetails() {
  const { serverId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch server details with performance history from API
  const { data: serverData, isLoading, error } = useQuery({
    queryKey: ['server-details', serverId],
    queryFn: async () => {
      console.log('Fetching server details for ID:', serverId);
      const response = await fetch(`https://api.theservermonitor.com/server?id=${serverId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      console.log('Server details API response:', result);
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to fetch server details');
      }
      
      return result.data;
    },
    enabled: !!token && !!serverId,
    refetchInterval: 30000, // Refresh every 30 seconds for live data
  });

  // Delete server mutation
  const deleteServerMutation = useMutation({
    mutationFn: async (serverId: number) => {
      const response = await fetch('https://api.theservermonitor.com/server', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id: serverId })
      });

      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to delete server');
      }
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servers'] });
      toast({
        title: 'Server Deleted',
        description: 'Server has been successfully removed from your infrastructure.',
      });
      navigate('/servers');
    },
    onError: (error: Error) => {
      toast({
        title: 'Error Deleting Server',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const handleDeleteServer = () => {
    if (serverData?.server_info && window.confirm(`Are you sure you want to delete "${serverData.server_info.server_name}"? This action cannot be undone.`)) {
      deleteServerMutation.mutate(serverData.server_info.id);
    }
  };

  // Helper functions to process the API data
  const getLatestMetrics = () => {
    if (!serverData?.history_24h) return null;

    const { cpu, memory, network, disk_io } = serverData.history_24h;
    
    // Get latest CPU data
    const latestCpu = cpu && cpu.length > 0 ? cpu[cpu.length - 1] : null;
    
    // Get latest memory data
    const latestMemory = memory && memory.length > 0 ? memory[memory.length - 1] : null;
    
    // Calculate network totals from all interfaces
    let totalNetworkSent = 0;
    let totalNetworkRecv = 0;
    if (network) {
      Object.values(network).forEach((interfaceData: any) => {
        if (interfaceData && interfaceData.length > 0) {
          const latest = interfaceData[interfaceData.length - 1];
          totalNetworkSent += parseInt(latest.bytes_sent || 0);
          totalNetworkRecv += parseInt(latest.bytes_recv || 0);
        }
      });
    }
    
    // Calculate disk I/O totals
    let totalDiskRead = 0;
    let totalDiskWrite = 0;
    if (disk_io) {
      Object.values(disk_io).forEach((diskData: any) => {
        if (diskData && diskData.length > 0) {
          const latest = diskData[diskData.length - 1];
          totalDiskRead += parseInt(latest.read_bytes || 0);
          totalDiskWrite += parseInt(latest.write_bytes || 0);
        }
      });
    }

    return {
      cpu: latestCpu ? parseFloat(latestCpu.total) : 0,
      memory: latestMemory ? parseFloat(latestMemory.percent) : 0,
      disk: 45, // Mock disk usage percentage (not provided in API)
      networkSent: totalNetworkSent,
      networkRecv: totalNetworkRecv,
      diskRead: totalDiskRead,
      diskWrite: totalDiskWrite,
      uptime: "Unknown" // Not provided in current API
    };
  };

  // Format chart data for CPU usage
  const formatCpuChartData = () => {
    if (!serverData?.history_24h?.cpu) return [];
    
    return serverData.history_24h.cpu.map((item: any) => ({
      time: new Date(item.report_time).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }),
      total: parseFloat(item.total),
      user: parseFloat(item.user),
      system: parseFloat(item.system),
      iowait: parseFloat(item.iowait)
    }));
  };

  // Format chart data for Memory usage
  const formatMemoryChartData = () => {
    if (!serverData?.history_24h?.memory) return [];
    
    return serverData.history_24h.memory.map((item: any) => ({
      time: new Date(item.report_time).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }),
      used: parseFloat(item.percent),
      available: 100 - parseFloat(item.percent),
      usedGB: (parseInt(item.used) / (1024 * 1024 * 1024)).toFixed(1),
      totalGB: (parseInt(item.total) / (1024 * 1024 * 1024)).toFixed(1)
    }));
  };

  // Format chart data for Network usage
  const formatNetworkChartData = () => {
    if (!serverData?.history_24h?.network) return [];
    
    const chartData = [];
    const timePoints = new Set();
    
    // Collect all time points
    Object.values(serverData.history_24h.network).forEach((interfaceData: any) => {
      interfaceData.forEach((item: any) => {
        timePoints.add(item.report_time);
      });
    });
    
    // Create data points for each time
    Array.from(timePoints).sort().forEach((time: any) => {
      let totalSent = 0;
      let totalRecv = 0;
      
      Object.values(serverData.history_24h.network).forEach((interfaceData: any) => {
        const dataPoint = interfaceData.find((item: any) => item.report_time === time);
        if (dataPoint) {
          totalSent += parseInt(dataPoint.bytes_sent || 0);
          totalRecv += parseInt(dataPoint.bytes_recv || 0);
        }
      });
      
      chartData.push({
        time: new Date(time).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        }),
        sent: Math.round(totalSent / (1024 * 1024)), // Convert to MB
        recv: Math.round(totalRecv / (1024 * 1024))  // Convert to MB
      });
    });
    
    return chartData;
  };

  const chartConfig = {
    cpu: {
      total: { label: "Total CPU (%)", color: "hsl(217, 91%, 60%)" },
      user: { label: "User (%)", color: "hsl(142, 76%, 36%)" },
      system: { label: "System (%)", color: "hsl(45, 93%, 47%)" },
      iowait: { label: "I/O Wait (%)", color: "hsl(0, 84%, 60%)" }
    },
    memory: {
      used: { label: "Used Memory (%)", color: "hsl(217, 91%, 60%)" },
      available: { label: "Available Memory (%)", color: "hsl(142, 76%, 36%)" }
    },
    network: {
      sent: { label: "Sent (MB)", color: "hsl(217, 91%, 60%)" },
      recv: { label: "Received (MB)", color: "hsl(142, 76%, 36%)" }
    }
  };

  if (isLoading) {
    return (
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold">Loading server details...</h1>
        <p className="text-muted-foreground">Please wait while we fetch the server information.</p>
      </div>
    );
  }

  if (error || !serverData || !serverData.server_info) {
    return (
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold">Server Not Found</h1>
        <p className="text-muted-foreground mb-4">
          {error?.message || "The requested server could not be found or the server data is incomplete."}
        </p>
        <Button onClick={() => navigate("/servers")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Servers
        </Button>
      </div>
    );
  }

  const server = serverData.server_info;
  const metrics = getLatestMetrics();
  const hasMonitoringData = serverData.history_24h && (
    serverData.history_24h.cpu?.length > 0 || 
    serverData.history_24h.memory?.length > 0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/servers")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Servers
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              {server.server_name}
            </h1>
            <p className="text-muted-foreground mt-1">
              ID: {server.unique_identifier} • Created: {new Date(server.created_at).toLocaleDateString()}
            </p>
            {server.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {server.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={hasMonitoringData ? "online" : "warning"}>
            {hasMonitoringData ? "Monitoring Active" : "No Data"}
          </StatusBadge>
          <Button variant="outline" size="sm">
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDeleteServer}
            className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
            disabled={deleteServerMutation.isPending}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {deleteServerMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>

      {/* Server Overview */}
      <Card className="glassmorphism border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="w-5 h-5 text-blue-400" />
            Server Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hasMonitoringData && metrics ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">CPU Usage</span>
                  <span className={`text-sm font-medium ${
                    metrics.cpu > 80 ? 'text-red-400' : 
                    metrics.cpu > 60 ? 'text-amber-400' : 'text-green-400'
                  }`}>
                    {metrics.cpu.toFixed(1)}%
                  </span>
                </div>
                <Progress value={metrics.cpu} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Memory</span>
                  <span className={`text-sm font-medium ${
                    metrics.memory > 80 ? 'text-red-400' : 
                    metrics.memory > 60 ? 'text-amber-400' : 'text-green-400'
                  }`}>
                    {metrics.memory.toFixed(1)}%
                  </span>
                </div>
                <Progress value={metrics.memory} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Network I/O</span>
                  <span className="text-sm font-medium text-blue-400">
                    {(metrics.networkSent / (1024 * 1024)).toFixed(1)} MB
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  ↑ {(metrics.networkSent / (1024 * 1024)).toFixed(1)} MB ↓ {(metrics.networkRecv / (1024 * 1024)).toFixed(1)} MB
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Disk I/O</span>
                  <span className="text-sm font-medium text-purple-400">
                    {(metrics.diskWrite / (1024 * 1024 * 1024)).toFixed(1)} GB
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  R: {(metrics.diskRead / (1024 * 1024 * 1024)).toFixed(1)} GB W: {(metrics.diskWrite / (1024 * 1024 * 1024)).toFixed(1)} GB
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">No Monitoring Data Available</h3>
              <p className="text-muted-foreground">
                Install the monitoring agent to see real-time server metrics.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monitoring Agent Setup */}
      <Card className="glassmorphism border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-amber-400" />
            Monitoring Agent Setup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
              Install Monitoring Agent
            </h4>
            <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
              To see real-time metrics for this server, install our monitoring agent using the command below:
            </p>
            <div className="bg-slate-900 text-green-400 p-3 rounded font-mono text-sm overflow-x-auto">
              curl -sSL https://api.theservermonitor.com/install.sh | bash -s {server.unique_identifier}
            </div>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
              This command will install and configure the monitoring agent with your server's unique identifier.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Performance Charts - Only show if we have data */}
      {hasMonitoringData && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground">Performance Metrics (24h)</h2>
          
          {/* CPU Usage Chart */}
          {serverData.history_24h.cpu && serverData.history_24h.cpu.length > 0 && (
            <Card className="glassmorphism border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-400" />
                  CPU Usage History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig.cpu}>
                  <LineChart data={formatCpuChartData()}>
                    <XAxis 
                      dataKey="time" 
                      tickLine={false}
                      axisLine={false}
                      className="text-xs"
                    />
                    <YAxis 
                      domain={[0, 100]}
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
                      dataKey="total"
                      stroke="var(--color-total)"
                      strokeWidth={2}
                      dot={{ fill: "var(--color-total)", strokeWidth: 2, r: 3 }}
                      activeDot={{ r: 5, stroke: "var(--color-total)", strokeWidth: 2 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="user"
                      stroke="var(--color-user)"
                      strokeWidth={1}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="system"
                      stroke="var(--color-system)"
                      strokeWidth={1}
                      dot={false}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
          )}

          {/* Memory Usage Chart */}
          {serverData.history_24h.memory && serverData.history_24h.memory.length > 0 && (
            <Card className="glassmorphism border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-blue-400" />
                  Memory Usage History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig.memory}>
                  <AreaChart data={formatMemoryChartData()}>
                    <XAxis 
                      dataKey="time" 
                      tickLine={false}
                      axisLine={false}
                      className="text-xs"
                    />
                    <YAxis 
                      domain={[0, 100]}
                      tickLine={false}
                      axisLine={false}
                      className="text-xs"
                    />
                    <ChartTooltip 
                      content={<ChartTooltipContent 
                        formatter={(value, name) => [
                          name === 'used' ? `${value}% (${formatMemoryChartData().find(d => d.used === value)?.usedGB} GB)` : `${value}%`,
                          name === 'used' ? 'Used Memory' : 'Available Memory'
                        ]}
                      />}
                      cursor={{ stroke: "rgba(59, 130, 246, 0.3)" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="used"
                      stackId="1"
                      stroke="var(--color-used)"
                      fill="var(--color-used)"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>
          )}

          {/* Network Usage Chart */}
          {serverData.history_24h.network && Object.keys(serverData.history_24h.network).length > 0 && (
            <Card className="glassmorphism border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <NetworkIcon className="w-5 h-5 text-blue-400" />
                  Network Usage History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig.network}>
                  <LineChart data={formatNetworkChartData()}>
                    <XAxis 
                      dataKey="time" 
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
                      dataKey="sent"
                      stroke="var(--color-sent)"
                      strokeWidth={2}
                      dot={{ fill: "var(--color-sent)", strokeWidth: 2, r: 3 }}
                      activeDot={{ r: 5, stroke: "var(--color-sent)", strokeWidth: 2 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="recv"
                      stroke="var(--color-recv)"
                      strokeWidth={2}
                      dot={{ fill: "var(--color-recv)", strokeWidth: 2, r: 3 }}
                      activeDot={{ r: 5, stroke: "var(--color-recv)", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Server Details Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Server className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="processes" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Processes
          </TabsTrigger>
          <TabsTrigger value="containers" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Containers
          </TabsTrigger>
          <TabsTrigger value="network" className="flex items-center gap-2">
            <NetworkIcon className="w-4 h-4" />
            Network
          </TabsTrigger>
          <TabsTrigger value="storage" className="flex items-center gap-2">
            <HardDrive className="w-4 h-4" />
            Storage
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          {hasMonitoringData ? (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Real-time Monitoring Active</h3>
              <p className="text-muted-foreground">
                Performance charts are displayed above with live data from your monitoring agent.
              </p>
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">Install Monitoring Agent</h3>
              <p className="text-muted-foreground">
                Install the monitoring agent to see detailed performance metrics and charts.
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="processes">
          <Processes />
        </TabsContent>
        
        <TabsContent value="containers">
          <Containers />
        </TabsContent>
        
        <TabsContent value="network">
          <Network />
        </TabsContent>
        
        <TabsContent value="storage">
          <Storage />
        </TabsContent>
      </Tabs>
    </div>
  );
}
