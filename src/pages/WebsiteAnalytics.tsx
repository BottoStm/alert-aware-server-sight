import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Globe, Clock, Zap, MapPin, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { StatusBadge } from "@/components/StatusBadge";
import { WebsiteResponseChart } from "@/components/charts/WebsiteResponseChart";

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
    region: "US-East-1",
    ssl: {
      issuer: "Let's Encrypt",
      grade: "A+",
      expiryDate: "2024-12-15",
      daysLeft: 45,
      protocol: "TLS 1.3",
      keySize: 2048
    }
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
    region: "EU-West-1",
    ssl: {
      issuer: "DigiCert",
      grade: "A",
      expiryDate: "2024-08-22",
      daysLeft: 12,
      protocol: "TLS 1.2",
      keySize: 2048
    }
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
    region: "US-West-2",
    ssl: {
      issuer: "Let's Encrypt",
      grade: "B",
      expiryDate: "2024-07-18",
      daysLeft: 5,
      protocol: "TLS 1.2",
      keySize: 1024
    }
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
    region: "Asia-Pacific",
    ssl: {
      issuer: "GeoTrust",
      grade: "F",
      expiryDate: "2024-06-10",
      daysLeft: -3,
      protocol: "TLS 1.0",
      keySize: 1024
    }
  }
];

const serverLocations = [
  { name: "London", responseTime: 245, status: "online" as const },
  { name: "Canada", responseTime: 187, status: "online" as const },
  { name: "India", responseTime: 432, status: "online" as const }
];

export default function WebsiteAnalytics() {
  const { websiteId } = useParams();
  const navigate = useNavigate();
  const [website, setWebsite] = useState(null);

  useEffect(() => {
    const foundWebsite = mockWebsites.find(w => w.id === websiteId);
    setWebsite(foundWebsite);
  }, [websiteId]);

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A+":
      case "A": return "text-green-400";
      case "B": return "text-amber-400";
      case "C":
      case "D": return "text-orange-400";
      default: return "text-red-400";
    }
  };

  const getSslStatus = (daysLeft: number) => {
    if (daysLeft < 0) return "offline";
    if (daysLeft <= 7) return "warning"; 
    return "online";
  };

  if (!website) {
    return (
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold">Website Not Found</h1>
        <Button onClick={() => navigate('/websites')} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Websites
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/websites')}
            className="hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              {website.name} Analytics
            </h1>
            <p className="text-muted-foreground mt-1">{website.url}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline">{website.region}</Badge>
          <StatusBadge status={website.status}>
            {website.status.charAt(0).toUpperCase() + website.status.slice(1)}
          </StatusBadge>
        </div>
      </div>

      {/* Overview Cards - Removed Live Ping */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glassmorphism border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Globe className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-sm text-muted-foreground">Status Code</p>
                <p className="text-2xl font-bold">{website.statusCode}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glassmorphism border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-sm text-muted-foreground">Response Time</p>
                <p className="text-2xl font-bold">{website.responseTime}ms</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glassmorphism border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Zap className="w-8 h-8 text-amber-400" />
              <div>
                <p className="text-sm text-muted-foreground">Uptime</p>
                <p className="text-2xl font-bold">{website.uptime.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SSL Certificate Information */}
      <Card className="glassmorphism border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            SSL Certificate Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">Certificate Grade</h4>
                <Badge 
                  variant="outline" 
                  className={getGradeColor(website.ssl.grade)}
                >
                  {website.ssl.grade}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">Issued by {website.ssl.issuer}</p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">Expiry Status</h4>
                <StatusBadge status={getSslStatus(website.ssl.daysLeft)}>
                  {website.ssl.daysLeft < 0 ? "Expired" : `${website.ssl.daysLeft} days`}
                </StatusBadge>
              </div>
              <p className="text-sm text-muted-foreground">Expires: {website.ssl.expiryDate}</p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">Protocol</h4>
                <Badge variant="outline">{website.ssl.protocol}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Security Protocol</p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">Key Size</h4>
                <Badge variant="outline">{website.ssl.keySize} bits</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Encryption Strength</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Server Locations Response Times */}
      <Card className="glassmorphism border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-400" />
            Response Times by Location
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {serverLocations.map((location) => (
              <div key={location.name} className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{location.name}</h4>
                  <StatusBadge status={location.status}>
                    {location.status.charAt(0).toUpperCase() + location.status.slice(1)}
                  </StatusBadge>
                </div>
                <p className="text-2xl font-bold text-blue-400">{location.responseTime}ms</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Website Response Chart */}
      <div className="grid grid-cols-1 gap-6">
        <WebsiteResponseChart />
      </div>
    </div>
  );
}
