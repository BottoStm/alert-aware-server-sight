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
      memoryUsedGB: latestMemory ? (parseInt(latestMemory.used) / (1024 * 1024 * 1024)).toFixed(1) : "0",
      memoryTotalGB: latestMemory ? (parseInt(latestMemory.total) / (1024 * 1024 * 1024)).toFixed(1) : "0",
      networkSentMB: (totalNetworkSent / (1024 * 1024)).toFixed(1),
      networkRecvMB: (totalNetworkRecv / (1024 * 1024)).toFixed(1),
      diskReadGB: (totalDiskRead / (1024 * 1024 * 1024)).toFixed(1),
      diskWriteGB: (totalDiskWrite / (1024 * 1024 * 1024)).toFixed(1)
    };
  };

  // Format chart data for CPU usage - last 24 hours only, hourly
  const formatCpuChartData = () => {
    if (!serverData?.history_24h?.cpu) return [];
    
    // Group data by hour and take the latest reading for each hour
    const hourlyData = new Map();
    
    serverData.history_24h.cpu.forEach((item: any) => {
      const date = new Date(item.report_time);
      const hourKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:00`;
      
      if (!hourlyData.has(hourKey) || new Date(item.report_time) > new Date(hourlyData.get(hourKey).report_time)) {
        hourlyData.set(hourKey, item);
      }
    });
    
    // Convert to array and sort by time, take last 24 hours
    return Array.from(hourlyData.values())
      .sort((a, b) => new Date(a.report_time).getTime() - new Date(b.report_time).getTime())
      .slice(-24)
      .map((item: any) => ({
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

  // Format chart data for Memory usage - last 24 hours only, hourly
  const formatMemoryChartData = () => {
    if (!serverData?.history_24h?.memory) return [];
    
    // Group data by hour and take the latest reading for each hour
    const hourlyData = new Map();
    
    serverData.history_24h.memory.forEach((item: any) => {
      const date = new Date(item.report_time);
      const hourKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:00`;
      
      if (!hourlyData.has(hourKey) || new Date(item.report_time) > new Date(hourlyData.get(hourKey).report_time)) {
        hourlyData.set(hourKey, item);
      }
    });
    
    // Convert to array and sort by time, take last 24 hours
    return Array.from(hourlyData.values())
      .sort((a, b) => new Date(a.report_time).getTime() - new Date(b.report_time).getTime())
      .slice(-24)
      .map((item: any) => ({
        time: new Date(item.report_time).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        }),
        percent: parseFloat(item.percent),
        usedGB: (parseInt(item.used) / (1024 * 1024 * 1024)).toFixed(1),
        totalGB: (parseInt(item.total) / (1024 * 1024 * 1024)).toFixed(1),
        availableGB: (parseInt(item.available) / (1024 * 1024 * 1024)).toFixed(1)
      }));
  };

  // Format chart data for Network usage - last 24 hours only, hourly
  const formatNetworkChartData = () => {
    if (!serverData?.history_24h?.network) return [];
    
    const hourlyData = new Map();
    
    // Collect all time points from all interfaces (excluding loopback)
    Object.entries(serverData.history_24h.network).forEach(([interfaceName, interfaceData]: [string, any]) => {
      if (interfaceName === 'lo') return; // Skip loopback
      
      interfaceData.forEach((item: any) => {
        const date = new Date(item.report_time);
        const hourKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:00`;
        
        if (!hourlyData.has(hourKey)) {
          hourlyData.set(hourKey, { report_time: item.report_time, sent: 0, recv: 0 });
        }
        
        const existing = hourlyData.get(hourKey);
        if (new Date(item.report_time) >= new Date(existing.report_time)) {
          existing.sent += parseInt(item.bytes_sent || 0);
          existing.recv += parseInt(item.bytes_recv || 0);
          existing.report_time = item.report_time;
        }
      });
    });
    
    // Convert to array and sort by time, take last 24 hours
    return Array.from(hourlyData.values())
      .sort((a, b) => new Date(a.report_time).getTime() - new Date(b.report_time).getTime())
      .slice(-24)
      .map((item: any) => ({
        time: new Date(item.report_time).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        }),
        sent: (item.sent / (1024 * 1024)).toFixed(1), // Convert to MB
        recv: (item.recv / (1024 * 1024)).toFixed(1)  // Convert to MB
      }));
  };

  // Format chart data for Disk I/O - last 24 hours only, hourly
  const formatDiskChartData = () => {
    if (!serverData?.history_24h?.disk_io) return [];
    
    const hourlyData = new Map();
    
    // Collect all time points from all disks
    Object.values(serverData.history_24h.disk_io).forEach((diskData: any) => {
      diskData.forEach((item: any) => {
        const date = new Date(item.report_time);
        const hourKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:00`;
        
        if (!hourlyData.has(hourKey)) {
          hourlyData.set(hourKey, { report_time: item.report_time, read: 0, write: 0 });
        }
        
        const existing = hourlyData.get(hourKey);
        if (new Date(item.report_time) >= new Date(existing.report_time)) {
          existing.read += parseInt(item.read_bytes || 0);
          existing.write += parseInt(item.write_bytes || 0);
          existing.report_time = item.report_time;
        }
      });
    });
    
    // Convert to array and sort by time, take last 24 hours
    return Array.from(hourlyData.values())
      .sort((a, b) => new Date(a.report_time).getTime() - new Date(b.report_time).getTime())
      .slice(-24)
      .map((item: any) => ({
        time: new Date(item.report_time).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        }),
        read: (item.read / (1024 * 1024 * 1024)).toFixed(2), // Convert to GB
        write: (item.write / (1024 * 1024 * 1024)).toFixed(2) // Convert to GB
      }));
  };

  const chartConfig = {
    cpu: {
      total: { label: "Total CPU (%)", color: "hsl(217, 91%, 60%)" },
      user: { label: "User (%)", color: "hsl(142, 76%, 36%)" },
      system: { label: "System (%)", color: "hsl(45, 93%, 47%)" },
      iowait: { label: "I/O Wait (%)", color: "hsl(0, 84%, 60%)" }
    },
    memory: {
      percent: { label: "Memory Usage (%)", color: "hsl(217, 91%, 60%)" }
    },
    network: {
      sent: { label: "Sent (MB)", color: "hsl(217, 91%, 60%)" },
      recv: { label: "Received (MB)", color: "hsl(142, 76%, 36%)" }
    },
    disk: {
      read: { label: "Read (GB)", color: "hsl(217, 91%, 60%)" },
      write: { label: "Write (GB)", color: "hsl(0, 84%, 60%)" }
    }
  };

  if (isLoading) {
    return (
      <div className="text-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
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
            Current Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hasMonitoringData && metrics ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* CPU Usage */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    CPU Usage
                  </span>
                  <span className={`text-lg font-bold ${
                    metrics.cpu > 80 ? 'text-red-400' : 
                    metrics.cpu > 60 ? 'text-amber-400' : 'text-green-400'
                  }`}>
                    {metrics.cpu.toFixed(1)}%
                  </span>
                </div>
                <Progress value={metrics.cpu} className="h-3" />
                <p className="text-xs text-muted-foreground">
                  {metrics.cpu > 80 ? 'High usage detected' : 
                   metrics.cpu > 60 ? 'Moderate usage' : 'Normal usage'}
                </p>
              </div>
              
              {/* Memory Usage */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    Memory
                  </span>
                  <span className={`text-lg font-bold ${
                    metrics.memory > 80 ? 'text-red-400' : 
                    metrics.memory > 60 ? 'text-amber-400' : 'text-green-400'
                  }`}>
                    {metrics.memory.toFixed(1)}%
                  </span>
                </div>
                <Progress value={metrics.memory} className="h-3" />
                <p className="text-xs text-muted-foreground">
                  {metrics.memoryUsedGB} GB / {metrics.memoryTotalGB} GB used
                </p>
              </div>
              
              {/* Network I/O */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <NetworkIcon className="w-4 h-4" />
                    Network I/O
                  </span>
                  <span className="text-lg font-bold text-blue-400">
                    Active
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-green-400">↑ Sent</span>
                    <span>{metrics.networkSentMB} MB</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-blue-400">↓ Received</span>
                    <span>{metrics.networkRecvMB} MB</span>
                  </div>
                </div>
              </div>
              
              {/* Disk I/O */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <HardDrive className="w-4 h-4" />
                    Disk I/O
                  </span>
                  <span className="text-lg font-bold text-purple-400">
                    Active
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-blue-400">Read</span>
                    <span>{metrics.diskReadGB} GB</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-orange-400">Write</span>
                    <span>{metrics.diskWriteGB} GB</span>
                  </div>
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
      {!hasMonitoringData && (
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
      )}

      {/* Performance Charts - 2x2 Grid Layout */}
      {hasMonitoringData && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground">Performance History (Last 24 Hours)</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* CPU Usage Chart */}
            {serverData.history_24h.cpu && serverData.history_24h.cpu.length > 0 && (
              <Card className="glassmorphism border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Activity className="w-5 h-5 text-blue-400" />
                    CPU Usage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ChartContainer config={chartConfig.cpu}>
                      <LineChart data={formatCpuChartData()}>
                        <XAxis 
                          dataKey="time" 
                          tickLine={false}
                          axisLine={false}
                          className="text-xs"
                          interval="preserveStartEnd"
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
                          dot={false}
                          activeDot={{ r: 4, stroke: "var(--color-total)", strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Memory Usage Chart */}
            {serverData.history_24h.memory && serverData.history_24h.memory.length > 0 && (
              <Card className="glassmorphism border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Database className="w-5 h-5 text-blue-400" />
                    Memory Usage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ChartContainer config={chartConfig.memory}>
                      <AreaChart data={formatMemoryChartData()}>
                        <XAxis 
                          dataKey="time" 
                          tickLine={false}
                          axisLine={false}
                          className="text-xs"
                          interval="preserveStartEnd"
                        />
                        <YAxis 
                          domain={[0, 100]}
                          tickLine={false}
                          axisLine={false}
                          className="text-xs"
                        />
                        <ChartTooltip 
                          content={<ChartTooltipContent 
                            formatter={(value, name, props) => [
                              `${value}% (${props?.payload?.usedGB} GB / ${props?.payload?.totalGB} GB)`,
                              'Memory Usage'
                            ]}
                          />}
                          cursor={{ stroke: "rgba(59, 130, 246, 0.3)" }}
                        />
                        <Area
                          type="monotone"
                          dataKey="percent"
                          stroke="var(--color-percent)"
                          fill="var(--color-percent)"
                          fillOpacity={0.3}
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Network Traffic Chart */}
            {serverData.history_24h.network && Object.keys(serverData.history_24h.network).length > 0 && (
              <Card className="glassmorphism border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <NetworkIcon className="w-5 h-5 text-blue-400" />
                    Network Traffic
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ChartContainer config={chartConfig.network}>
                      <LineChart data={formatNetworkChartData()}>
                        <XAxis 
                          dataKey="time" 
                          tickLine={false}
                          axisLine={false}
                          className="text-xs"
                          interval="preserveStartEnd"
                        />
                        <YAxis 
                          tickLine={false}
                          axisLine={false}
                          className="text-xs"
                        />
                        <ChartTooltip 
                          content={<ChartTooltipContent 
                            formatter={(value, name) => [
                              `${value} MB`,
                              name === 'sent' ? 'Data Sent' : 'Data Received'
                            ]}
                          />}
                          cursor={{ stroke: "rgba(59, 130, 246, 0.3)" }}
                        />
                        <Line
                          type="monotone"
                          dataKey="sent"
                          stroke="var(--color-sent)"
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 4, stroke: "var(--color-sent)", strokeWidth: 2 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="recv"
                          stroke="var(--color-recv)"
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 4, stroke: "var(--color-recv)", strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Disk I/O Chart */}
            {serverData.history_24h.disk_io && Object.keys(serverData.history_24h.disk_io).length > 0 && (
              <Card className="glassmorphism border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <HardDrive className="w-5 h-5 text-blue-400" />
                    Disk I/O
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ChartContainer config={chartConfig.disk}>
                      <LineChart data={formatDiskChartData()}>
                        <XAxis 
                          dataKey="time" 
                          tickLine={false}
                          axisLine={false}
                          className="text-xs"
                          interval="preserveStartEnd"
                        />
                        <YAxis 
                          tickLine={false}
                          axisLine={false}
                          className="text-xs"
                        />
                        <ChartTooltip 
                          content={<ChartTooltipContent 
                            formatter={(value, name) => [
                              `${value} GB`,
                              name === 'read' ? 'Disk Read' : 'Disk Write'
                            ]}
                          />}
                          cursor={{ stroke: "rgba(59, 130, 246, 0.3)" }}
                        />
                        <Line
                          type="monotone"
                          dataKey="read"
                          stroke="var(--color-read)"
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 4, stroke: "var(--color-read)", strokeWidth: 2 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="write"
                          stroke="var(--color-write)"
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 4, stroke: "var(--color-write)", strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
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
