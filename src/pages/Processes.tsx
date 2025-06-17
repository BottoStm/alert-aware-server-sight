
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

const processes = [
  { 
    pid: 1234, 
    name: "nginx", 
    user: "www-data", 
    cpu: 12.5, 
    memory: 3.2, 
    status: "running",
    command: "/usr/sbin/nginx -g daemon off;"
  },
  { 
    pid: 5678, 
    name: "mysql", 
    user: "mysql", 
    cpu: 45.8, 
    memory: 15.6, 
    status: "running",
    command: "/usr/sbin/mysqld --basedir=/usr"
  },
  { 
    pid: 9012, 
    name: "redis-server", 
    user: "redis", 
    cpu: 8.3, 
    memory: 2.1, 
    status: "running",
    command: "/usr/bin/redis-server *:6379"
  },
  { 
    pid: 3456, 
    name: "node", 
    user: "app", 
    cpu: 23.7, 
    memory: 8.9, 
    status: "running",
    command: "node /app/server.js"
  },
  { 
    pid: 7890, 
    name: "systemd", 
    user: "root", 
    cpu: 0.1, 
    memory: 0.5, 
    status: "running",
    command: "/lib/systemd/systemd --system"
  },
  { 
    pid: 2468, 
    name: "ssh", 
    user: "root", 
    cpu: 0.3, 
    memory: 1.2, 
    status: "running",
    command: "/usr/sbin/sshd -D"
  },
  { 
    pid: 1357, 
    name: "docker", 
    user: "root", 
    cpu: 18.9, 
    memory: 6.7, 
    status: "running",
    command: "/usr/bin/dockerd -H fd://"
  },
  { 
    pid: 8642, 
    name: "postgres", 
    user: "postgres", 
    cpu: 31.2, 
    memory: 12.4, 
    status: "running",
    command: "/usr/lib/postgresql/14/bin/postgres"
  }
];

export default function Processes() {
  const runningProcesses = processes.filter(p => p.status === "running").length;
  const totalCpuUsage = processes.reduce((sum, p) => sum + p.cpu, 0);
  const totalMemoryUsage = processes.reduce((sum, p) => sum + p.memory, 0);

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
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search processes..." 
              className="pl-10 w-64"
            />
          </div>
          <Button variant="outline" size="sm">
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
          subtitle="Active processes"
        />
        
        <MetricCard
          title="Total Processes"
          value={processes.length}
          icon={<Activity className="w-4 h-4" />}
          status="healthy"
          subtitle="System processes"
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
            Active Processes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PID</TableHead>
                <TableHead>Process Name</TableHead>
                <TableHead>User</TableHead>
                <TableHead>CPU %</TableHead>
                <TableHead>Memory %</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Command</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {processes.map((process) => (
                <TableRow key={process.pid}>
                  <TableCell className="font-mono">{process.pid}</TableCell>
                  <TableCell className="font-medium">{process.name}</TableCell>
                  <TableCell>{process.user}</TableCell>
                  <TableCell>
                    <span className={`font-medium ${
                      process.cpu > 30 ? 'text-red-400' : 
                      process.cpu > 15 ? 'text-amber-400' : 'text-green-400'
                    }`}>
                      {process.cpu}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`font-medium ${
                      process.memory > 10 ? 'text-red-400' : 
                      process.memory > 5 ? 'text-amber-400' : 'text-green-400'
                    }`}>
                      {process.memory}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full border bg-green-500/20 text-green-400 border-green-500/30">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      Running
                    </span>
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                    {process.command}
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
        </CardContent>
      </Card>
    </div>
  );
}
