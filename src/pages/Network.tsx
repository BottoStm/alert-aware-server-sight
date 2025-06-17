
import { MetricCard } from "@/components/MetricCard";
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
  Network as NetworkIcon, 
  Wifi,
  Router,
  Globe,
  RefreshCw,
  TrendingUp,
  TrendingDown
} from "lucide-react";

const networkInterfaces = [
  { 
    name: "eth0", 
    ip: "192.168.1.10", 
    status: "up",
    speed: "1000 Mbps",
    rxBytes: "45.2 GB",
    txBytes: "23.8 GB",
    rxPackets: "2.1M",
    txPackets: "1.8M"
  },
  { 
    name: "lo", 
    ip: "127.0.0.1", 
    status: "up",
    speed: "N/A",
    rxBytes: "12.4 MB",
    txBytes: "12.4 MB",
    rxPackets: "45K",
    txPackets: "45K"
  },
  { 
    name: "docker0", 
    ip: "172.17.0.1", 
    status: "up",
    speed: "N/A",
    rxBytes: "1.2 GB",
    txBytes: "890 MB",
    rxPackets: "156K",
    txPackets: "134K"
  }
];

const connections = [
  { port: 22, protocol: "TCP", state: "LISTEN", process: "sshd", local: "0.0.0.0:22", remote: "*:*" },
  { port: 80, protocol: "TCP", state: "LISTEN", process: "nginx", local: "0.0.0.0:80", remote: "*:*" },
  { port: 443, protocol: "TCP", state: "LISTEN", process: "nginx", local: "0.0.0.0:443", remote: "*:*" },
  { port: 3000, protocol: "TCP", state: "LISTEN", process: "node", local: "127.0.0.1:3000", remote: "*:*" },
  { port: 5432, protocol: "TCP", state: "LISTEN", process: "postgres", local: "127.0.0.1:5432", remote: "*:*" },
  { port: 6379, protocol: "TCP", state: "LISTEN", process: "redis", local: "127.0.0.1:6379", remote: "*:*" },
  { port: 43256, protocol: "TCP", state: "ESTABLISHED", process: "ssh", local: "192.168.1.10:22", remote: "192.168.1.100:43256" }
];

export default function Network() {
  const activeConnections = connections.filter(c => c.state === "ESTABLISHED").length;
  const listeningPorts = connections.filter(c => c.state === "LISTEN").length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            Network Monitor
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time network interface and connection monitoring
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Network Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="Network I/O"
          value="1.2 GB/s"
          change="+15% from last hour"
          changeType="positive"
          icon={<NetworkIcon className="w-4 h-4" />}
          status="healthy"
          subtitle="Total throughput"
        />
        
        <MetricCard
          title="Active Connections"
          value={activeConnections}
          icon={<Globe className="w-4 h-4" />}
          status="healthy"
          subtitle="Established connections"
        />
        
        <MetricCard
          title="Listening Ports"
          value={listeningPorts}
          icon={<Router className="w-4 h-4" />}
          status="healthy"
          subtitle="Open services"
        />
        
        <MetricCard
          title="Bandwidth Usage"
          value="67%"
          icon={<Wifi className="w-4 h-4" />}
          status="warning"
          subtitle="Peak: 89% at 14:30"
        />
      </div>

      {/* Network Interfaces */}
      <Card className="glassmorphism border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <NetworkIcon className="w-5 h-5 text-blue-400" />
            Network Interfaces
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Interface</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Speed</TableHead>
                <TableHead>RX Bytes</TableHead>
                <TableHead>TX Bytes</TableHead>
                <TableHead>RX Packets</TableHead>
                <TableHead>TX Packets</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {networkInterfaces.map((interface_, index) => (
                <TableRow key={index}>
                  <TableCell className="font-mono font-medium">{interface_.name}</TableCell>
                  <TableCell className="font-mono">{interface_.ip}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full border bg-green-500/20 text-green-400 border-green-500/30">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      UP
                    </span>
                  </TableCell>
                  <TableCell>{interface_.speed}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <TrendingDown className="w-4 h-4 text-blue-400" />
                      {interface_.rxBytes}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                      {interface_.txBytes}
                    </div>
                  </TableCell>
                  <TableCell>{interface_.rxPackets}</TableCell>
                  <TableCell>{interface_.txPackets}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Active Connections */}
      <Card className="glassmorphism border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-400" />
            Network Connections
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Port</TableHead>
                <TableHead>Protocol</TableHead>
                <TableHead>State</TableHead>
                <TableHead>Process</TableHead>
                <TableHead>Local Address</TableHead>
                <TableHead>Remote Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {connections.map((connection, index) => (
                <TableRow key={index}>
                  <TableCell className="font-mono">{connection.port}</TableCell>
                  <TableCell>{connection.protocol}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full border ${
                      connection.state === "ESTABLISHED" 
                        ? "bg-green-500/20 text-green-400 border-green-500/30" 
                        : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        connection.state === "ESTABLISHED" ? "bg-green-400 animate-pulse" : "bg-blue-400"
                      }`} />
                      {connection.state}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium">{connection.process}</TableCell>
                  <TableCell className="font-mono text-sm">{connection.local}</TableCell>
                  <TableCell className="font-mono text-sm">{connection.remote}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
