import { useState } from "react";
import { MetricCard } from "@/components/MetricCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AddServerForm } from "@/components/AddServerForm";
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
  HardDrive, 
  Network, 
  Plus,
  RefreshCw,
  Eye,
  Edit,
  Trash2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

// Mock data for display purposes (will be replaced with real metrics when available)
const generateMockMetrics = () => ({
  cpu: Math.floor(Math.random() * 80) + 10,
  memory: Math.floor(Math.random() * 70) + 20,
  disk: Math.floor(Math.random() * 60) + 15,
  uptime: `${Math.floor(Math.random() * 30)} days, ${Math.floor(Math.random() * 24)}h`,
  status: Math.random() > 0.8 ? 'warning' as const : 'online' as const
});

export default function Servers() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddServerOpen, setIsAddServerOpen] = useState(false);

  // Fetch servers from API
  const { data: serversData, isLoading, error } = useQuery({
    queryKey: ['servers'],
    queryFn: async () => {
      const response = await fetch('https://api.theservermonitor.com/server', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to fetch servers');
      }
      
      return result;
    },
    enabled: !!token
  });

  // Delete server mutation
  const deleteServerMutation = useMutation({
    mutationFn: async (serverId: number) => {
      const response = await fetch('https://api.theservermonitor.com/server', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id: serverId })
      });

      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to delete server');
      }
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servers'] });
      toast({
        title: 'Server Deleted',
        description: 'Server has been successfully removed from your infrastructure.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error Deleting Server',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const servers = serversData?.data || [];
  const serverCount = serversData?.count || 0;

  // Generate mock metrics for each server (in real implementation, this would come from monitoring agents)
  const serversWithMetrics = servers.map(server => ({
    ...server,
    ...generateMockMetrics()
  }));

  const onlineServers = serversWithMetrics.filter(s => s.status === "online").length;
  const warningServers = serversWithMetrics.filter(s => s.status === "warning").length;
  const offlineServers = serversWithMetrics.filter(s => s.status === "offline").length;

  const handleServerClick = (serverId: number) => {
    navigate(`/servers/${serverId}`);
  };

  const handleDeleteServer = (serverId: number, serverName: string) => {
    if (window.confirm(`Are you sure you want to delete "${serverName}"? This action cannot be undone.`)) {
      deleteServerMutation.mutate(serverId);
    }
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['servers'] });
    toast({
      title: 'Refreshing',
      description: 'Server data is being updated...',
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              Server Management
            </h1>
            <p className="text-muted-foreground mt-1">Loading your servers...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              Server Management
            </h1>
            <p className="text-muted-foreground mt-1 text-red-500">
              Error loading servers: {error.message}
            </p>
          </div>
          <Button onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            Server Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor and manage your server infrastructure
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setIsAddServerOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Server
          </Button>
        </div>
      </div>

      {/* Server Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="Total Servers"
          value={serverCount}
          icon={<Server className="w-4 h-4" />}
          status="healthy"
          subtitle="Managed servers"
        />
        
        <MetricCard
          title="Online"
          value={onlineServers}
          change={serverCount > 0 ? `${Math.round((onlineServers / serverCount) * 100)}% uptime` : "No data"}
          changeType="positive"
          icon={<Activity className="w-4 h-4" />}
          status="healthy"
          subtitle="Healthy & running"
        />
        
        <MetricCard
          title="Warning"
          value={warningServers}
          icon={<Activity className="w-4 h-4" />}
          status={warningServers > 0 ? "warning" : "healthy"}
          subtitle="Needs attention"
        />
        
        <MetricCard
          title="Offline"
          value={offlineServers}
          icon={<Activity className="w-4 h-4" />}
          status={offlineServers > 0 ? "critical" : "healthy"}
          subtitle="Not responding"
        />
      </div>

      {/* Servers Table */}
      <Card className="glassmorphism border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="w-5 h-5 text-blue-400" />
            Server Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          {serverCount === 0 ? (
            <div className="text-center py-12">
              <Server className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">No Servers Found</h3>
              <p className="text-muted-foreground mb-4">
                Get started by adding your first server to the monitoring system.
              </p>
              <Button onClick={() => setIsAddServerOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Server
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Server</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>CPU</TableHead>
                  <TableHead>Memory</TableHead>
                  <TableHead>Disk</TableHead>
                  <TableHead>Uptime</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {serversWithMetrics.map((server) => (
                  <TableRow 
                    key={server.id} 
                    className="cursor-pointer hover:bg-accent/50"
                    onClick={() => handleServerClick(server.id)}
                  >
                    <TableCell>
                      <div>
                        <div className="font-medium">{server.server_name}</div>
                        <div className="text-sm text-muted-foreground">
                          ID: {server.unique_identifier?.substring(0, 8)}...
                        </div>
                        {server.description && (
                          <div className="text-xs text-muted-foreground mt-1 max-w-xs truncate">
                            {server.description}
                          </div>
                        )}
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
                          server.cpu > 80 ? 'text-red-400' : 
                          server.cpu > 60 ? 'text-amber-400' : 'text-green-400'
                        }`}>
                          {server.cpu}%
                        </div>
                        <Progress value={server.cpu} className="h-1" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className={`text-sm font-medium ${
                          server.memory > 80 ? 'text-red-400' : 
                          server.memory > 60 ? 'text-amber-400' : 'text-green-400'
                        }`}>
                          {server.memory}%
                        </div>
                        <Progress value={server.memory} className="h-1" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className={`text-sm font-medium ${
                          server.disk > 80 ? 'text-red-400' : 
                          server.disk > 60 ? 'text-amber-400' : 'text-green-400'
                        }`}>
                          {server.disk}%
                        </div>
                        <Progress value={server.disk} className="h-1" />
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{server.uptime}</TableCell>
                    <TableCell className="text-sm">
                      {new Date(server.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
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
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            // TODO: Implement edit functionality
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteServer(server.id, server.server_name);
                          }}
                          className="text-red-400 hover:text-red-300"
                          disabled={deleteServerMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Server Form Dialog */}
      <AddServerForm 
        open={isAddServerOpen}
        onOpenChange={setIsAddServerOpen}
      />
    </div>
  );
}