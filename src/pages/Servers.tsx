import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Server, Plus, Eye, Edit, Trash2 } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { AddServerForm } from "@/components/AddServerForm";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface ServerData {
  id: number;
  server_name: string;
  unique_identifier: string;
  description?: string;
  created_at: string;
}

interface ServersResponse {
  success: boolean;
  data: ServerData[];
  count: number;
}

export default function Servers() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { token } = useAuth();
  const queryClient = useQueryClient();

  // Fetch servers from API
  const { data: serversData, isLoading, error } = useQuery({
    queryKey: ['servers'],
    queryFn: async (): Promise<ServersResponse> => {
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
      const response = await fetch(`https://api.theservermonitor.com/server/${serverId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to delete server');
      }
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servers'] });
    }
  });

  const servers = serversData?.data || [];
  const filteredServers = servers.filter(server => 
    server.server_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    server.unique_identifier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteServer = (serverId: number) => {
    if (confirm('Are you sure you want to delete this server?')) {
      deleteServerMutation.mutate(serverId);
    }
  };

  const handleServerClick = (serverId: number) => {
    window.location.href = `/servers/${serverId}`;
  };

  if (isLoading) {
    return (
      <div className="text-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold">Loading servers...</h1>
        <p className="text-muted-foreground">Please wait while we fetch your server data.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold">Error Loading Servers</h1>
        <p className="text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            Server Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor and manage all your servers from one central dashboard
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Server
        </Button>
      </div>

      <AddServerForm 
        open={showAddForm} 
        onOpenChange={setShowAddForm} 
      />

      <Card className="glassmorphism border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5 text-blue-400" />
              Server Details ({servers.length})
            </CardTitle>
            <Input
              placeholder="Search servers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
          </div>
        </CardHeader>
        <CardContent>
          {servers.length === 0 ? (
            <div className="text-center py-12">
              <Server className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-muted-foreground mb-2">No Servers Found</h3>
              <p className="text-muted-foreground mb-6">
                Get started by adding your first server to monitor.
              </p>
              <Button onClick={() => setShowAddForm(true)}>
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
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServers.map((server) => (
                  <TableRow 
                    key={server.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleServerClick(server.id)}
                  >
                    <TableCell>
                      <div>
                        <div className="font-semibold">{server.server_name}</div>
                        <div className="text-sm text-muted-foreground">
                          ID: {server.unique_identifier?.substring(0, 8)}...
                        </div>
                        {server.description && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {server.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status="online">Online</StatusBadge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(server.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
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
                            // Edit functionality
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteServer(server.id);
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
    </div>
  );
}
