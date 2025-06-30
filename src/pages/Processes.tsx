
import { MetricCard } from "@/components/MetricCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Activity, 
  Search,
  RefreshCw,
  X
} from "lucide-react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

interface ProcessData {
  pid: number;
  name: string;
  username: string;
  cpu_percent: number;
  memory_percent: number;
  status: string;
  cmdline: string[];
  num_threads: number;
  nice: number;
  time_since_update: number;
}

interface ProcessResponse {
  success: boolean;
  data: {
    proc_total: number;
    proc_running: number;
    proc_sleeping: number;
    proc_threads: number;
    process_list: ProcessData[];
    last_updated: string;
  };
}

export default function Processes() {
  const { serverId } = useParams();
  const { token } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch live process data from API
  const { data: processData, isLoading, error, refetch } = useQuery({
    queryKey: ['server-processes', serverId],
    queryFn: async (): Promise<ProcessResponse> => {
      console.log('Fetching process data for server ID:', serverId);
      const response = await fetch(`https://api.theservermonitor.com/server/${serverId}/processes`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      console.log('Process data API response:', result);
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to fetch process data');
      }
      
      return result;
    },
    enabled: !!token && !!serverId,
    refetchInterval: 10000, // Refresh every 10 seconds for live data
  });

  const handleRefresh = () => {
    refetch();
  };

  // Filter processes based on search term
  const filteredProcesses = processData?.data.process_list?.filter(process =>
    process.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    process.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    process.cmdline.join(' ').toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Calculate metrics
  const runningProcesses = processData?.data.proc_running || 0;
  const totalProcesses = processData?.data.proc_total || 0;
  const totalThreads = processData?.data.proc_threads || 0;
  const totalCpuUsage = processData?.data.process_list?.reduce((sum, p) => sum + p.cpu_percent, 0) || 0;
  const totalMemoryUsage = processData?.data.process_list?.reduce((sum, p) => sum + p.memory_percent, 0) || 0;

  if (isLoading) {
    return (
      <div className="text-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold">Loading process data...</h1>
        <p className="text-muted-foreground">Please wait while we fetch the latest process information.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold">Error Loading Process Data</h1>
        <p className="text-muted-foreground mb-4">
          {error.message || "Failed to load process information"}
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
            Process Monitor
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time system process monitoring and management
          </p>
          {processData?.data.last_updated && (
            <p className="text-xs text-muted-foreground mt-1">
              Last updated: {new Date(processData.data.last_updated).toLocaleString()}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search processes..." 
              className="pl-10 w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Process Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="Running Processes"
          value={runningProcesses}
          icon={<Activity className="w-4 h-4" />}
          status="healthy"
          subtitle={`${processData?.data.proc_sleeping || 0} sleeping`}
        />
        
        <MetricCard
          title="Total Processes"
          value={totalProcesses}
          icon={<Activity className="w-4 h-4" />}
          status="healthy"
          subtitle={`${totalThreads} threads`}
        />
        
        <MetricCard
          title="CPU Usage"
          value={`${totalCpuUsage.toFixed(1)}%`}
          icon={<Activity className="w-4 h-4" />}
          status={totalCpuUsage > 80 ? "critical" : totalCpuUsage > 60 ? "warning" : "healthy"}
          subtitle="Combined usage"
        />
        
        <MetricCard
          title="Memory Usage"
          value={`${totalMemoryUsage.toFixed(1)}%`}
          icon={<Activity className="w-4 h-4" />}
          status={totalMemoryUsage > 80 ? "critical" : totalMemoryUsage > 60 ? "warning" : "healthy"}
          subtitle="Combined usage"
        />
      </div>

      {/* Processes Table */}
      <Card className="glassmorphism border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            Active Processes ({filteredProcesses.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredProcesses.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PID</TableHead>
                  <TableHead>Process Name</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>CPU %</TableHead>
                  <TableHead>Memory %</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Threads</TableHead>
                  <TableHead>Command</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProcesses.map((process) => (
                  <TableRow key={process.pid}>
                    <TableCell className="font-mono">{process.pid}</TableCell>
                    <TableCell className="font-medium">{process.name}</TableCell>
                    <TableCell>{process.username}</TableCell>
                    <TableCell>
                      <span className={`font-medium ${
                        process.cpu_percent > 30 ? 'text-red-400' : 
                        process.cpu_percent > 15 ? 'text-amber-400' : 'text-green-400'
                      }`}>
                        {process.cpu_percent.toFixed(1)}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`font-medium ${
                        process.memory_percent > 10 ? 'text-red-400' : 
                        process.memory_percent > 5 ? 'text-amber-400' : 'text-green-400'
                      }`}>
                        {process.memory_percent.toFixed(1)}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full border ${
                        process.status === 'R' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                        process.status === 'S' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                        'bg-gray-500/20 text-gray-400 border-gray-500/30'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          process.status === 'R' ? 'bg-green-400 animate-pulse' :
                          process.status === 'S' ? 'bg-blue-400' :
                          'bg-gray-400'
                        }`} />
                        {process.status === 'R' ? 'Running' : process.status === 'S' ? 'Sleeping' : process.status}
                      </span>
                    </TableCell>
                    <TableCell>{process.num_threads}</TableCell>
                    <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                      {process.cmdline.join(' ')}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
                        <X className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">No Processes Found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'No processes match your search criteria.' : 'No process data available.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
