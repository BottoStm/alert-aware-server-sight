
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Globe, Plus, Edit, Trash2 } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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

  // Fetch detailed data for each website
  const { data: websiteDetails } = useQuery({
    queryKey: ['website-details-all'],
    queryFn: async () => {
      if (!websitesData?.length) return {};
      
      const details = {};
      for (const website of websitesData) {
        try {
          const response = await fetch(`https://api.theservermonitor.com/website?id=${website.id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const data = await response.json();
          if (data.success) {
            details[website.id] = data.data;
          }
        } catch (error) {
          console.error(`Error fetching details for website ${website.id}:`, error);
        }
      }
      return details;
    },
    enabled: !!token && !!websitesData?.length
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
      queryClient.invalidateQueries({ queryKey: ['website-details-all'] });
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
      queryClient.invalidateQueries({ queryKey: ['website-details-all'] });
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

  const getDomainName = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  const getAverageResponseTime = (details: any) => {
    if (!details?.latest_uptime) return 'N/A';
    const times = [];
    if (details.latest_uptime.CANADA?.response_time_ms) times.push(details.latest_uptime.CANADA.response_time_ms);
    if (details.latest_uptime.LONDON?.response_time_ms) times.push(details.latest_uptime.LONDON.response_time_ms);
    return times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) + 'ms' : 'N/A';
  };

  const websites = websitesData || [];

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
            Website Monitoring
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

      <div className="grid gap-4">
        {websites.map((website) => {
          const details = websiteDetails?.[website.id];
          return (
            <Card key={website.id} className="glassmorphism border-border/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
              <CardContent className="p-6" onClick={() => window.location.href = `/website-analytics/${website.id}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Globe className="w-8 h-8 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{getDomainName(website.url)}</h3>
                      <p className="text-muted-foreground text-sm">{website.url}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-muted-foreground">
                          Added: {new Date(website.created_at).toLocaleDateString()}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Preview: {getDomainName(website.url)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        Uptime: {details?.graph_data?.uptime_percentage_24h || 'N/A'}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Avg Response: {getAverageResponseTime(details)}
                      </div>
                    </div>
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
          );
        })}
      </div>
    </div>
  );
}
