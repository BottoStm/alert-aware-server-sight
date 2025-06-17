
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, Plus, Edit, Trash2, BarChart3, Clock, Zap } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { WebsiteResponseChart } from "@/components/charts/WebsiteResponseChart";
import { UptimeChart } from "@/components/charts/UptimeChart";

const mockWebsites = [
  {
    id: "1",
    name: "Main Website",
    url: "https://example.com",
    status: "online" as const,
    responseTime: 245,
    uptime: 99.9,
    lastCheck: "2 minutes ago",
    statusCode: 200,
    region: "US-East-1"
  },
  {
    id: "2", 
    name: "API Endpoint",
    url: "https://api.example.com",
    status: "online" as const,
    responseTime: 156,
    uptime: 99.7,
    lastCheck: "1 minute ago",
    statusCode: 200,
    region: "EU-West-1"
  },
  {
    id: "3",
    name: "Admin Panel", 
    url: "https://admin.example.com",
    status: "warning" as const,
    responseTime: 1250,
    uptime: 98.5,
    lastCheck: "5 minutes ago",
    statusCode: 200,
    region: "US-West-2"
  },
  {
    id: "4",
    name: "CDN Assets",
    url: "https://cdn.example.com",
    status: "offline" as const,
    responseTime: 0,
    uptime: 95.2,
    lastCheck: "15 minutes ago",
    statusCode: 503,
    region: "Asia-Pacific"
  }
];

export default function WebsiteChecks() {
  const [websites, setWebsites] = useState(mockWebsites);
  const [newUrl, setNewUrl] = useState("");

  const addWebsite = () => {
    if (newUrl) {
      const newWebsite = {
        id: Date.now().toString(),
        name: `Website ${websites.length + 1}`,
        url: newUrl,
        status: "online" as const,
        responseTime: Math.floor(Math.random() * 500) + 100,
        uptime: 99.0 + Math.random(),
        lastCheck: "Just now",
        statusCode: 200,
        region: "US-East-1"
      };
      setWebsites([...websites, newWebsite]);
      setNewUrl("");
    }
  };

  const deleteWebsite = (id: string) => {
    setWebsites(websites.filter(w => w.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            Website Monitoring
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor your websites' uptime and performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Input
            placeholder="Enter website URL..."
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            className="w-64"
          />
          <Button onClick={addWebsite}>
            <Plus className="w-4 h-4 mr-2" />
            Add Website
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="websites">Websites</TabsTrigger>
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
                      {websites.filter(w => w.status === 'online').length}
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
                      {Math.round(websites.reduce((acc, w) => acc + w.responseTime, 0) / websites.length)}ms
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glassmorphism border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-8 h-8 text-cyan-400" />
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Uptime</p>
                    <p className="text-2xl font-bold">
                      {(websites.reduce((acc, w) => acc + w.uptime, 0) / websites.length).toFixed(1)}%
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
            {websites.map((website) => (
              <Card key={website.id} className="glassmorphism border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Globe className="w-8 h-8 text-blue-400" />
                      <div>
                        <h3 className="font-semibold text-lg">{website.name}</h3>
                        <p className="text-muted-foreground text-sm">{website.url}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-muted-foreground">
                            Status: {website.statusCode}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Response: {website.responseTime}ms
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Uptime: {website.uptime.toFixed(1)}%
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {website.lastCheck}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{website.region}</Badge>
                      <StatusBadge status={website.status}>
                        {website.status.charAt(0).toUpperCase() + website.status.slice(1)}
                      </StatusBadge>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => deleteWebsite(website.id)}
                        className="text-red-400 hover:text-red-300"
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
