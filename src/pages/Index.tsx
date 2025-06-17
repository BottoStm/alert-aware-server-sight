
import { MetricCard } from "@/components/MetricCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Server, 
  Activity, 
  HardDrive, 
  Network, 
  Database,
  Gauge,
  AlertTriangle,
  Wifi
} from "lucide-react";

// Mock data for demonstration
const systemMetrics = {
  servers: { total: 12, online: 11, offline: 1 },
  containers: { total: 47, running: 44, stopped: 3 },
  websites: { total: 25, up: 23, down: 2 },
  alerts: { total: 3, critical: 1, warning: 2 }
};

const serverList = [
  { name: "Web Server 01", ip: "192.168.1.10", status: "online" as const, cpu: 65, memory: 78, disk: 45 },
  { name: "Database Server", ip: "192.168.1.20", status: "online" as const, cpu: 82, memory: 89, disk: 67 },
  { name: "API Gateway", ip: "192.168.1.30", status: "warning" as const, cpu: 91, memory: 85, disk: 23 },
  { name: "Load Balancer", ip: "192.168.1.40", status: "online" as const, cpu: 34, memory: 56, disk: 78 },
  { name: "Backup Server", ip: "192.168.1.50", status: "offline" as const, cpu: 0, memory: 0, disk: 89 }
];

const recentAlerts = [
  { id: 1, message: "High CPU usage on Database Server", severity: "critical" as const, time: "2 min ago" },
  { id: 2, message: "SSL certificate expires in 7 days", severity: "warning" as const, time: "1 hour ago" },
  { id: 3, message: "Backup process completed successfully", severity: "info" as const, time: "3 hours ago" }
];

export default function Index() {
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
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-muted-foreground">Live</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Servers Online"
          value={`${systemMetrics.servers.online}/${systemMetrics.servers.total}`}
          change="+1 today"
          changeType="positive"
          icon={<Server className="w-4 h-4" />}
          status="healthy"
          subtitle="2 servers in maintenance"
        />
        
        <MetricCard
          title="Active Containers"
          value={`${systemMetrics.containers.running}/${systemMetrics.containers.total}`}
          change="-3 stopped"
          changeType="negative"
          icon={<Database className="w-4 h-4" />}
          status="warning"
          subtitle="3 containers need attention"
        />
        
        <MetricCard
          title="Website Status"
          value={`${systemMetrics.websites.up}/${systemMetrics.websites.total}`}
          change="99.8% uptime"
          changeType="positive"
          icon={<Wifi className="w-4 h-4" />}
          status="healthy"
          subtitle="Average response: 245ms"
        />
        
        <MetricCard
          title="Active Alerts"
          value={systemMetrics.alerts.total}
          change={`${systemMetrics.alerts.critical} critical`}
          changeType="negative"
          icon={<AlertTriangle className="w-4 h-4" />}
          status="critical"
          subtitle="Requires immediate attention"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Server Status List */}
        <div className="lg:col-span-2">
          <Card className="glassmorphism border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5 text-blue-400" />
                Server Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {serverList.map((server, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-card/50 border border-border/30 hover:border-border/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div>
                        <h3 className="font-medium text-foreground">{server.name}</h3>
                        <p className="text-sm text-muted-foreground">{server.ip}</p>
                      </div>
                      <StatusBadge status={server.status}>
                        {server.status.charAt(0).toUpperCase() + server.status.slice(1)}
                      </StatusBadge>
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <div className="text-muted-foreground">CPU</div>
                        <div className={`font-medium ${server.cpu > 80 ? 'text-red-400' : server.cpu > 60 ? 'text-amber-400' : 'text-green-400'}`}>
                          {server.cpu}%
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-muted-foreground">RAM</div>
                        <div className={`font-medium ${server.memory > 80 ? 'text-red-400' : server.memory > 60 ? 'text-amber-400' : 'text-green-400'}`}>
                          {server.memory}%
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-muted-foreground">Disk</div>
                        <div className={`font-medium ${server.disk > 80 ? 'text-red-400' : server.disk > 60 ? 'text-amber-400' : 'text-green-400'}`}>
                          {server.disk}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Alerts */}
        <div>
          <Card className="glassmorphism border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                Recent Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentAlerts.map((alert) => (
                  <div key={alert.id} className="p-3 rounded-lg border border-border/30 bg-card/30">
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                        alert.severity === 'critical' ? 'bg-red-400' : 
                        alert.severity === 'warning' ? 'bg-amber-400' : 'bg-blue-400'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground mb-1">
                          {alert.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {alert.time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
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
            <div className="text-2xl font-bold text-foreground mb-2">67%</div>
            <Progress value={67} className="h-2 mb-2" />
            <p className="text-xs text-muted-foreground">Across all servers</p>
          </CardContent>
        </Card>

        <Card className="glassmorphism border-border/50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Memory Usage</CardTitle>
              <Gauge className="w-4 h-4 text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground mb-2">72%</div>
            <Progress value={72} className="h-2 mb-2" />
            <p className="text-xs text-muted-foreground">89.6 GB / 124 GB</p>
          </CardContent>
        </Card>

        <Card className="glassmorphism border-border/50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Disk Usage</CardTitle>
              <HardDrive className="w-4 h-4 text-amber-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground mb-2">58%</div>
            <Progress value={58} className="h-2 mb-2" />
            <p className="text-xs text-muted-foreground">2.3 TB / 4.0 TB</p>
          </CardContent>
        </Card>

        <Card className="glassmorphism border-border/50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Network I/O</CardTitle>
              <Network className="w-4 h-4 text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground mb-2">1.2 GB/s</div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>↑ 789 MB/s</span>
              <span>↓ 456 MB/s</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
