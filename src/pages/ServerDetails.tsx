
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Server, Activity, Database, Network as NetworkIcon, HardDrive } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { Progress } from "@/components/ui/progress";

// Import the existing page components
import Processes from "./Processes";
import Containers from "./Containers";
import Network from "./Network";
import Storage from "./Storage";

const servers = [
  { 
    id: "1", 
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
    id: "2", 
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
    id: "3", 
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
    id: "4", 
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
    id: "5", 
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

export default function ServerDetails() {
  const { serverId } = useParams();
  const navigate = useNavigate();
  
  const server = servers.find(s => s.id === serverId);
  
  if (!server) {
    return (
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold">Server Not Found</h1>
        <p className="text-muted-foreground">The requested server could not be found.</p>
        <Button onClick={() => navigate("/servers")} className="mt-4">
          Back to Servers
        </Button>
      </div>
    );
  }

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
              {server.name}
            </h1>
            <p className="text-muted-foreground mt-1">
              {server.ip} • {server.os} • {server.location}
            </p>
          </div>
        </div>
        <StatusBadge status={server.status}>
          {server.status.charAt(0).toUpperCase() + server.status.slice(1)}
        </StatusBadge>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">CPU Usage</span>
                <span className={`text-sm font-medium ${
                  server.cpu > 80 ? 'text-red-400' : 
                  server.cpu > 60 ? 'text-amber-400' : 'text-green-400'
                }`}>
                  {server.cpu}%
                </span>
              </div>
              <Progress value={server.cpu} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Memory</span>
                <span className={`text-sm font-medium ${
                  server.memory > 80 ? 'text-red-400' : 
                  server.memory > 60 ? 'text-amber-400' : 'text-green-400'
                }`}>
                  {server.memory}%
                </span>
              </div>
              <Progress value={server.memory} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Disk Usage</span>
                <span className={`text-sm font-medium ${
                  server.disk > 80 ? 'text-red-400' : 
                  server.disk > 60 ? 'text-amber-400' : 'text-green-400'
                }`}>
                  {server.disk}%
                </span>
              </div>
              <Progress value={server.disk} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <span className="text-sm font-medium">Uptime</span>
              <p className="text-lg font-semibold text-green-400">{server.uptime}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Server Details Tabs */}
      <Tabs defaultValue="processes" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
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
