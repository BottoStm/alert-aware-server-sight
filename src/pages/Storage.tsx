
import { useParams } from "react-router-dom";
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
import { HardDrive, RefreshCw, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";

interface FilesystemStats {
  device_name: string;
  fs_type: string;
  mnt_point: string;
  size: number;
  used: number;
  free: number;
  percent: number;
  key: string;
}

interface LiveStatsData {
  fs_stats: FilesystemStats[];
  last_updated: string;
}

interface LiveStatsResponse {
  success: boolean;
  data: LiveStatsData;
}

export default function Storage() {
  const { serverId } = useParams();
  const { token } = useAuth();

  // Fetch live server stats from API
  const { data: liveStats, isLoading, error, refetch } = useQuery({
    queryKey: ['server-live-stats', serverId],
    queryFn: async (): Promise<LiveStatsResponse> => {
      console.log('Fetching live stats for server ID:', serverId);
      const response = await fetch(`https://api.theservermonitor.com/server/${serverId}/live-stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      console.log('Live stats API response:', result);

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to fetch live stats');
      }

      return result;
    },
    enabled: !!token && !!serverId,
    refetchInterval: 15000, // Refresh every 15 seconds
  });

  // Format bytes for display
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="text-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading storage information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-muted-foreground mb-2">Error Loading Storage Data</h3>
        <p className="text-muted-foreground mb-4">
          {error.message || "Failed to load storage information"}
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
      {/* Storage Overview */}
      <Card className="glassmorphism border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-blue-400" />
              Storage Overview
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
          {liveStats?.data.last_updated && (
            <p className="text-xs text-muted-foreground">
              Last updated: {new Date(liveStats.data.last_updated).toLocaleString()}
            </p>
          )}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Device</TableHead>
                <TableHead>Mount Point</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Total Size</TableHead>
                <TableHead>Used</TableHead>
                <TableHead>Available</TableHead>
                <TableHead>Usage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {liveStats?.data.fs_stats?.map((fs, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <HardDrive className="w-4 h-4 text-muted-foreground" />
                      <span className="font-mono text-sm">{fs.device_name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{fs.mnt_point}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 bg-muted rounded text-xs font-mono">
                      {fs.fs_type}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono">{formatBytes(fs.size)}</TableCell>
                  <TableCell className="font-mono">{formatBytes(fs.used)}</TableCell>
                  <TableCell className="font-mono">{formatBytes(fs.free)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={fs.percent} 
                        className="w-20 h-2"
                      />
                      <span className={`text-xs font-mono font-medium ${
                        fs.percent > 90 ? 'text-red-400' :
                        fs.percent > 80 ? 'text-amber-400' : 
                        fs.percent > 60 ? 'text-yellow-400' : 'text-green-400'
                      }`}>
                        {fs.percent.toFixed(1)}%
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              )) || (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    <HardDrive className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    No storage devices found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
