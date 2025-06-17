
import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  ExternalLink
} from "lucide-react";

const servers = [
  { 
    id: 1, 
    name: "Web Server 01", 
    ip: "192.168.1.10", 
    status: "online" as const, 
    cpu: 65, 
    memory: 78, 
    disk: 45,
    uptime: "15 days, 4h",
    os: "Ubuntu 22.04",
    location: "US-East-1"
  },
  { 
    id: 2, 
    name: "Database Server", 
    ip: "192.168.1.20", 
    status: "online" as const, 
    cpu: 82, 
    memory: 89, 
    disk: 67,
    uptime: "28 days, 12h",
    os: "CentOS 8",
    location: "US-West-2"
  },
  { 
    id: 3, 
    name: "API Gateway", 
    ip: "192.168.1.30", 
    status: "warning" as const, 
    cpu: 91, 
    memory: 85, 
    disk: 23,
    uptime: "7 days, 18h",
    os: "Ubuntu 20.04",
    location: "EU-Central-1"
  },
  { 
    id: 4, 
    name: "Load Balancer", 
    ip: "192.168.1.40", 
    status: "online" as const, 
    cpu: 34, 
    memory: 56, 
    disk: 78,
    uptime: "45 days, 2h",
    os: "RHEL 9",
    location: "US-East-1"
  },
  { 
    id: 5, 
    name: "Backup Server", 
    ip: "192.168.1.50", 
    status: "offline" as const, 
    cpu: 0, 
    memory: 0, 
    disk: 89,
    uptime: "0 days, 0h",
    os: "Ubuntu 22.04",
    location: "US-West-1"
  }
];

export default function Overview() {
  const navigate = useNavigate();

  const onlineServers = servers.filter(s => s.status === "online").length;
  const warningServers = servers.filter(s => s.status === "warning").length;
  const offlineServers = servers.filter(s => s.status === "offline").length;

  const handleServerClick = (serverId: number) => {
    navigate(`/servers/${serverId}`);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Infrastructure Overview
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Monitor your server infrastructure at a glance
        </p>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="Total Servers"
          value={servers.length}
          icon={<Server className="w-4 h-4" />}
          status="healthy"
          subtitle="Active infrastructure"
        />
        
        <MetricCard
          title="Online"
          value={onlineServers}
          change="+2 today"
          changeType="positive"
          icon={<Activity className="w-4 h-4" />}
          status="healthy"
          subtitle="Running smoothly"
        />
        
        <MetricCard
          title="Warning"
          value={warningServers}
          icon={<AlertTriangle className="w-4 h-4" />}
          status="warning"
          subtitle="Needs attention"
        />
        
        <MetricCard
          title="Offline"
          value={offlineServers}
          icon={<Activity className="w-4 h-4" />}
          status="critical"
          subtitle="Not responding"
        />
      </div>

      {/* Recent Servers */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Recent Server Activity
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate("/servers")}
            >
              View All
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Server</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>CPU</TableHead>
                <TableHead>Memory</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {servers.slice(0, 5).map((server) => (
                <TableRow 
                  key={server.id} 
                  className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  onClick={() => handleServerClick(server.id)}
                >
                  <TableCell>
                    <div>
                      <div className="font-medium text-slate-900 dark:text-slate-100">{server.name}</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">{server.ip}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={server.status}>
                      {server.status.charAt(0).toUpperCase() + server.status.slice(1)}
                    </StatusBadge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className={`text-sm font-medium ${
                        server.cpu > 80 ? 'text-red-600 dark:text-red-400' : 
                        server.cpu > 60 ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400'
                      }`}>
                        {server.cpu}%
                      </div>
                      <Progress value={server.cpu} className="h-1" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className={`text-sm font-medium ${
                        server.memory > 80 ? 'text-red-600 dark:text-red-400' : 
                        server.memory > 60 ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400'
                      }`}>
                        {server.memory}%
                      </div>
                      <Progress value={server.memory} className="h-1" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleServerClick(server.id);
                      }}
                    >
                      <Eye className="w-4 h-4" />
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
