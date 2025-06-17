
import { MetricCard } from "@/components/MetricCard";
import { StatusBadge } from "@/components/StatusBadge";
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
  Database, 
  Search,
  RefreshCw,
  Play,
  Square,
  RotateCcw,
  Trash2
} from "lucide-react";

const containers = [
  { 
    id: "web-app-01", 
    name: "nginx-proxy", 
    image: "nginx:alpine", 
    status: "running" as const, 
    ports: "80:80, 443:443",
    created: "2 days ago",
    cpu: 5.2,
    memory: 45.6
  },
  { 
    id: "db-primary", 
    name: "postgres-main", 
    image: "postgres:15", 
    status: "running" as const, 
    ports: "5432:5432",
    created: "5 days ago",
    cpu: 12.8,
    memory: 178.3
  },
  { 
    id: "cache-redis", 
    name: "redis-cache", 
    image: "redis:7-alpine", 
    status: "running" as const, 
    ports: "6379:6379",
    created: "3 days ago",
    cpu: 3.1,
    memory: 32.1
  },
  { 
    id: "api-backend", 
    name: "node-api", 
    image: "node:18-alpine", 
    status: "running" as const, 
    ports: "3000:3000",
    created: "1 day ago",
    cpu: 18.9,
    memory: 89.4
  },
  { 
    id: "monitoring", 
    name: "prometheus", 
    image: "prom/prometheus", 
    status: "running" as const, 
    ports: "9090:9090",
    created: "6 days ago",
    cpu: 8.7,
    memory: 67.2
  },
  { 
    id: "worker-01", 
    name: "celery-worker", 
    image: "python:3.11", 
    status: "offline" as const, 
    ports: "-",
    created: "4 days ago",
    cpu: 0,
    memory: 0
  },
  { 
    id: "backup-svc", 
    name: "backup-service", 
    image: "alpine:latest", 
    status: "maintenance" as const, 
    ports: "-",
    created: "1 week ago",
    cpu: 2.1,
    memory: 15.8
  }
];

export default function Containers() {
  const runningContainers = containers.filter(c => c.status === "running").length;
  const stoppedContainers = containers.filter(c => c.status === "offline").length;
  const maintenanceContainers = containers.filter(c => c.status === "maintenance").length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            Container Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor and manage Docker containers across your infrastructure
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search containers..." 
              className="pl-10 w-64"
            />
          </div>
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Container Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="Running"
          value={runningContainers}
          change="+2 today"
          changeType="positive"
          icon={<Database className="w-4 h-4" />}
          status="healthy"
          subtitle="Active containers"
        />
        
        <MetricCard
          title="Stopped"
          value={stoppedContainers}
          icon={<Database className="w-4 h-4" />}
          status="critical"
          subtitle="Not running"
        />
        
        <MetricCard
          title="Maintenance"
          value={maintenanceContainers}
          icon={<Database className="w-4 h-4" />}
          status="warning"
          subtitle="Under maintenance"
        />
        
        <MetricCard
          title="Total"
          value={containers.length}
          icon={<Database className="w-4 h-4" />}
          status="healthy"
          subtitle="All containers"
        />
      </div>

      {/* Containers Table */}
      <Card className="glassmorphism border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-400" />
            Container Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Container</TableHead>
                <TableHead>Image</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ports</TableHead>
                <TableHead>CPU</TableHead>
                <TableHead>Memory (MB)</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {containers.map((container) => (
                <TableRow key={container.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{container.name}</div>
                      <div className="text-sm text-muted-foreground font-mono">{container.id}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{container.image}</TableCell>
                  <TableCell>
                    <StatusBadge status={container.status}>
                      {container.status.charAt(0).toUpperCase() + container.status.slice(1)}
                    </StatusBadge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{container.ports}</TableCell>
                  <TableCell>
                    <span className={`font-medium ${
                      container.cpu > 15 ? 'text-red-400' : 
                      container.cpu > 10 ? 'text-amber-400' : 'text-green-400'
                    }`}>
                      {container.cpu}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`font-medium ${
                      container.memory > 150 ? 'text-red-400' : 
                      container.memory > 100 ? 'text-amber-400' : 'text-green-400'
                    }`}>
                      {container.memory}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">{container.created}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {container.status === "running" ? (
                        <Button variant="ghost" size="sm" className="text-amber-400 hover:text-amber-300">
                          <Square className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button variant="ghost" size="sm" className="text-green-400 hover:text-green-300">
                          <Play className="w-4 h-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
                        <Trash2 className="w-4 h-4" />
                      </Button>
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
