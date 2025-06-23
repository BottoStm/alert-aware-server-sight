
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, Plus, Edit, Trash2, BarChart3, Clock, Zap, Shield } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { WebsiteResponseChart } from "@/components/charts/WebsiteResponseChart";
import { UptimeChart } from "@/components/charts/UptimeChart";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const mockWebsiteDetails = {
  "1": { name: "Main Website", status: "online" as const, responseTime: 245, uptime: 99.9, lastCheck: "2 minutes ago", statusCode: 200, region: "US-East-1" },
  "2": { name: "API Endpoint", status: "online" as const, responseTime: 156, uptime: 99.7, lastCheck: "1 minute ago", statusCode: 200, region: "EU-West-1" },
  "3": { name: "Admin Panel", status: "warning" as const, responseTime: 1250, uptime: 98.5, lastCheck: "5 minutes ago", statusCode: 200, region: "US-West-2" },
  "4": { name: "CDN Assets", status: "offline" as const, responseTime: 0, uptime: 95.2, lastCheck: "15 minutes ago", statusCode: 503, region: "Asia-Pacific" }
};

export default function WebsiteChecks() {
  const [newUrl, setNewUrl] = useState("");
  const { token } = useAuth();
  const queryClient = useQueryClient();

  // Fetch websites from API
  const { data: websitesData, isLoading } = useQuery({
    queryKey: ['websites'],
    queryFn: async () => {
      const response = await fetch('https://api.theservermonitor.com/website', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      return data.success ? data.data : [];
    },
    enabled: !!token
  });

  // Add website mutation
  const addWebsiteMutation = useMutation({
    mutationFn: async (urls: string[]) => {
      const response = await fetch('https://api.theservermonitor.com/website', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ urls })
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['websites'] });
      setNewUrl("");
    }
  });

  // Delete website mutation
  const deleteWebsiteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch('https://api.theservermonitor.com/website', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id })
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['websites'] });
    }
  });

  const addWebsite = () => {
    if (newUrl.trim()) {
      addWebsiteMutation.mutate([newUrl.trim()]);
    }
  };

  const deleteWebsite = (id: number) => {
    deleteWebsiteMutation.mutate(id);
  };

  const websites = websitesData || [];

  // Enhanced websites with mock details for display
  const enhancedWebsites = websites.map(website => ({
    ...website,
    ...(mockWebsiteDetails[website.id] || {
      name: new URL(website.url).hostname,
      status: "online" as const,
      responseTime: Math.floor(Math.random() * 500) + 100,
      uptime: 99.0 + Math.random(),
      lastCheck: "Just now",
      statusCode: 200,
      region: "US-East-1"
    })
  }));

  if (isLoading) {
    return (
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold">Loading websites...</h1>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            Website & SSL Monitoring
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor your websites' uptime, performance, and SSL certificates
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Input
            placeholder="Enter website URL..."
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            className="w-64"
            onKeyPress={(e) => e.key === 'Enter' && addWebsite()}
          />
          <Button 
            onClick={addWebsite} 
            disabled={addWebsiteMutation.isPending || !newUrl.trim()}
          >
            <Plus className="w-4 h-4 mr-2" />
            {addWebsiteMutation.isPending ? 'Adding...' : 'Add Website'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="websites">Websites & SSL</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="glassmorphism border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Globe className="w-8 h-8 text-blue-400" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Websites</p>
                    <p className="text-2xl font-bold">{websites.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glassmorphism border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Zap className="w-8 h-8 text-green-400" />
                  <div>
                    <p className="text-sm text-muted-foreground">Online</p>
                    <p className="text-2xl font-bold text-green-400">
                      {enhancedWebsites.filter(w => w.status === 'online').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glassmorphism border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Clock className="w-8 h-8 text-amber-400" />
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Response</p>
                    <p className="text-2xl font-bold">
                      {enhancedWebsites.length > 0 ? Math.round(enhancedWebsites.reduce((acc, w) => acc + (w.responseTime || 0), 0) / enhancedWebsites.length) : 0}ms
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glassmorphism border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Shield className="w-8 h-8 text-cyan-400" />
                  <div>
                    <p className="text-sm text-muted-foreground">SSL Secure</p>
                    <p className="text-2xl font-bold">
                      {websites.filter(w => w.protocol === 'https').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <WebsiteResponseChart />
            <UptimeChart />
          </div>
        </TabsContent>

        <TabsContent value="websites" className="space-y-4">
          <div className="grid gap-4">
            {enhancedWebsites.map((website) => (
              <Card key={website.id} className="glassmorphism border-border/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                <CardContent className="p-6" onClick={() => window.location.href = `/website-analytics/${website.id}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Globe className="w-8 h-8 text-blue-400" />
                        <Shield className={`w-6 h-6 ${website.protocol === 'https' ? 'text-green-400' : 'text-red-400'}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{website.name}</h3>
                        <p className="text-muted-foreground text-sm">{website.url}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-muted-foreground">
                            Protocol: {website.protocol?.upper()}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Status: {website.statusCode || 'Unknown'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Response: {website.responseTime || 'N/A'}ms
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Uptime: {website.uptime?.toFixed(1) || 'N/A'}%
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Added: {new Date(website.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{website.region || 'Unknown'}</Badge>
                      <Badge variant={website.protocol === 'https' ? 'default' : 'destructive'}>
                        {website.protocol === 'https' ? 'SSL Secure' : 'Not Secure'}
                      </Badge>
                      <StatusBadge status={website.status || 'online'}>
                        {(website.status || 'online').charAt(0).toUpperCase() + (website.status || 'online').slice(1)}
                      </StatusBadge>
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
                          deleteWebsite(website.id);
                        }}
                        className="text-red-400 hover:text-red-300"
                        disabled={deleteWebsiteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 gap-6">
            <WebsiteResponseChart />
            <UptimeChart />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
