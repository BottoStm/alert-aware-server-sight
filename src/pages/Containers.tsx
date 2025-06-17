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

const containers = [
  { 
    name: "web-app", 
    image: "nginx:latest", 
    status: "running",
    cpuUsage: "12.5",
    memoryUsage: "512 MB",
    networkIO: "500 KB/s",
    diskIO: "10 MB/s",
    uptime: "2 days"
  },
  { 
    name: "db-server", 
    image: "postgres:13", 
    status: "running",
    cpuUsage: "8.2",
    memoryUsage: "1 GB",
    networkIO: "250 KB/s",
    diskIO: "5 MB/s",
    uptime: "5 days"
  },
  { 
    name: "cache-server", 
    image: "redis:6", 
    status: "stopped",
    cpuUsage: "0.1",
    memoryUsage: "64 MB",
    networkIO: "10 KB/s",
    diskIO: "1 MB/s",
    uptime: "N/A"
  },
  { 
    name: "auth-service", 
    image: "node:16", 
    status: "running",
    cpuUsage: "5.8",
    memoryUsage: "256 MB",
    networkIO: "100 KB/s",
    diskIO: "2 MB/s",
    uptime: "1 day"
  },
  { 
    name: "monitoring-agent", 
    image: "prom/prometheus", 
    status: "running",
    cpuUsage: "3.2",
    memoryUsage: "128 MB",
    networkIO: "50 KB/s",
    diskIO: "0.5 MB/s",
    uptime: "3 days"
  }
];

export default function Containers() {
  const runningContainers = containers.filter(c => c.status === "running").length;
  const stoppedContainers = containers.filter(c => c.status === "stopped").length;
  const totalCpuUsage = containers.reduce((acc, c) => acc + parseFloat(c.cpuUsage), 0);
  const totalMemoryUsage = containers.reduce((acc, c) => acc + parseFloat(c.memoryUsage.replace(' MB', '')), 0);

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
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
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
          title="Total CPU Usage"
          value={`${totalCpuUsage.toFixed(1)}%`}
          icon={<Cpu className="w-4 h-4" />}
          status={totalCpuUsage > 80 ? "warning" : "healthy"}
          subtitle="Across all containers"
        />
        
        <MetricCard
          title="Total Memory"
          value={`${totalMemoryUsage} MB`}
          icon={<Activity className="w-4 h-4" />}
          status={totalMemoryUsage > 2000 ? "warning" : "healthy"}
          subtitle="RAM consumption"
        />
        
        <MetricCard
          title="Docker Images"
          value="12"
          icon={<HardDrive className="w-4 h-4" />}
          status="healthy"
          subtitle="Available locally"
        />
      </div>

      {/* Container List */}
      <Card className="glassmorphism border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-400" />
            Docker Containers
          </CardTitle>
        </CardHeader>
        <CardContent>
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
                <TableRow key={index}>
                  <TableCell className="font-mono font-medium">{container.name}</TableCell>
                  <TableCell className="font-mono text-sm">{container.image}</TableCell>
                  <TableCell>
                    <StatusBadge 
                      status={container.status === "running" ? "online" : "offline"}
                    >
                      {container.status.toUpperCase()}
                    </StatusBadge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={parseFloat(container.cpuUsage)} className="w-16 h-2" />
                      <span className="text-xs font-mono">{container.cpuUsage}%</span>
                    </div>
                  </TableCell>
                  <TableCell>{container.memoryUsage}</TableCell>
                  <TableCell className="font-mono text-sm">{container.networkIO}</TableCell>
                  <TableCell className="font-mono text-sm">{container.diskIO}</TableCell>
                  <TableCell>{container.uptime}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {container.status === "running" ? (
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
        </CardContent>
      </Card>
    </div>
  );
}
