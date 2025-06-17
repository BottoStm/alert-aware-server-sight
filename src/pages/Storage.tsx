
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
  HardDrive, 
  Database,
  Folder,
  RefreshCw,
  AlertTriangle
} from "lucide-react";

const diskUsage = [
  { 
    filesystem: "/dev/sda1", 
    mountpoint: "/", 
    type: "ext4",
    total: "50.0 GB",
    used: "32.1 GB",
    available: "17.9 GB",
    usedPercent: 64,
    inodes: "3.2M / 3.3M"
  },
  { 
    filesystem: "/dev/sda2", 
    mountpoint: "/var", 
    type: "ext4",
    total: "100.0 GB",
    used: "78.5 GB",
    available: "21.5 GB",
    usedPercent: 79,
    inodes: "6.4M / 6.6M"
  },
  { 
    filesystem: "/dev/sdb1", 
    mountpoint: "/data", 
    type: "xfs",
    total: "1.0 TB",
    used: "234.7 GB",
    available: "789.3 GB",
    usedPercent: 23,
    inodes: "67M / 67M"
  },
  { 
    filesystem: "/dev/sdc1", 
    mountpoint: "/backup", 
    type: "ext4",
    total: "2.0 TB",
    used: "1.8 TB",
    available: "200.0 GB",
    usedPercent: 90,
    inodes: "134M / 134M"
  }
];

const diskIO = [
  { device: "sda", reads: "45,231", writes: "23,890", readMB: "1,234", writeMB: "890", ioWait: 2.3 },
  { device: "sdb", reads: "12,456", writes: "8,923", readMB: "456", writeMB: "334", ioWait: 1.1 },
  { device: "sdc", reads: "67,890", writes: "45,123", readMB: "2,890", writeMB: "1,567", ioWait: 5.7 }
];

export default function Storage() {
  const totalDisks = diskUsage.length;
  const warningDisks = diskUsage.filter(d => d.usedPercent > 80).length;
  const totalCapacity = diskUsage.reduce((sum, d) => sum + parseFloat(d.total.replace(/[^0-9.]/g, '')), 0);
  const totalUsed = diskUsage.reduce((sum, d) => sum + parseFloat(d.used.replace(/[^0-9.]/g, '')), 0);
  const avgUsage = Math.round((totalUsed / totalCapacity) * 100);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            Storage Monitor
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor disk usage, I/O performance, and storage health
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Storage Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="Total Disks"
          value={totalDisks}
          icon={<HardDrive className="w-4 h-4" />}
          status="healthy"
          subtitle="Mounted filesystems"
        />
        
        <MetricCard
          title="Warning Disks"
          value={warningDisks}
          icon={<AlertTriangle className="w-4 h-4" />}
          status={warningDisks > 0 ? "warning" : "healthy"}
          subtitle=">80% usage"
        />
        
        <MetricCard
          title="Average Usage"
          value={`${avgUsage}%`}
          icon={<Database className="w-4 h-4" />}
          status={avgUsage > 80 ? "critical" : avgUsage > 60 ? "warning" : "healthy"}
          subtitle="Across all disks"
        />
        
        <MetricCard
          title="Total Capacity"
          value={`${(totalCapacity / 1000).toFixed(1)} TB`}
          icon={<Folder className="w-4 h-4" />}
          status="healthy"
          subtitle={`${(totalUsed / 1000).toFixed(1)} TB used`}
        />
      </div>

      {/* Disk Usage */}
      <Card className="glassmorphism border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-blue-400" />
            Disk Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Filesystem</TableHead>
                <TableHead>Mount Point</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Used</TableHead>
                <TableHead>Available</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Inodes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {diskUsage.map((disk, index) => (
                <TableRow key={index}>
                  <TableCell className="font-mono">{disk.filesystem}</TableCell>
                  <TableCell className="font-mono">{disk.mountpoint}</TableCell>
                  <TableCell>{disk.type}</TableCell>
                  <TableCell>{disk.total}</TableCell>
                  <TableCell>{disk.used}</TableCell>
                  <TableCell>{disk.available}</TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-medium ${
                          disk.usedPercent > 90 ? 'text-red-400' : 
                          disk.usedPercent > 80 ? 'text-amber-400' : 'text-green-400'
                        }`}>
                          {disk.usedPercent}%
                        </span>
                      </div>
                      <Progress value={disk.usedPercent} className="h-2" />
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{disk.inodes}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Disk I/O Statistics */}
      <Card className="glassmorphism border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-400" />
            Disk I/O Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Device</TableHead>
                <TableHead>Reads</TableHead>
                <TableHead>Writes</TableHead>
                <TableHead>Read MB</TableHead>
                <TableHead>Write MB</TableHead>
                <TableHead>I/O Wait %</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {diskIO.map((io, index) => (
                <TableRow key={index}>
                  <TableCell className="font-mono font-medium">{io.device}</TableCell>
                  <TableCell>{io.reads}</TableCell>
                  <TableCell>{io.writes}</TableCell>
                  <TableCell>{io.readMB}</TableCell>
                  <TableCell>{io.writeMB}</TableCell>
                  <TableCell>
                    <span className={`font-medium ${
                      io.ioWait > 5 ? 'text-red-400' : 
                      io.ioWait > 3 ? 'text-amber-400' : 'text-green-400'
                    }`}>
                      {io.ioWait}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full border ${
                      io.ioWait > 5 
                        ? "bg-red-500/20 text-red-400 border-red-500/30"
                        : io.ioWait > 3
                        ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                        : "bg-green-500/20 text-green-400 border-green-500/30"
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        io.ioWait > 5 ? "bg-red-400" : 
                        io.ioWait > 3 ? "bg-amber-400 animate-pulse" : "bg-green-400 animate-pulse"
                      }`} />
                      {io.ioWait > 5 ? "High Load" : io.ioWait > 3 ? "Moderate" : "Healthy"}
                    </span>
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
