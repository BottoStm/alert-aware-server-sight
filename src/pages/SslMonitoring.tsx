import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Plus, Edit, Trash2, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";

const mockSslCertificates = [
  {
    id: "1",
    domain: "example.com",
    issuer: "Let's Encrypt",
    status: "online" as const,
    grade: "A+",
    expiryDate: "2024-12-15",
    daysLeft: 45,
    protocol: "TLS 1.3",
    keySize: 2048,
    lastCheck: "2 minutes ago"
  },
  {
    id: "2",
    domain: "api.example.com", 
    issuer: "DigiCert",
    status: "online" as const,
    grade: "A",
    expiryDate: "2024-08-22",
    daysLeft: 12,
    protocol: "TLS 1.2",
    keySize: 2048,
    lastCheck: "1 minute ago"
  },
  {
    id: "3",
    domain: "admin.example.com",
    issuer: "Let's Encrypt", 
    status: "warning" as const,
    grade: "B",
    expiryDate: "2024-07-18",
    daysLeft: 5,
    protocol: "TLS 1.2",
    keySize: 1024,
    lastCheck: "5 minutes ago"
  },
  {
    id: "4",
    domain: "old.example.com",
    issuer: "GeoTrust",
    status: "offline" as const,
    grade: "F",
    expiryDate: "2024-06-10",
    daysLeft: -3,
    protocol: "TLS 1.0",
    keySize: 1024,
    lastCheck: "1 hour ago"
  }
];

export default function SslMonitoring() {
  const [certificates, setCertificates] = useState(mockSslCertificates);
  const [newDomain, setNewDomain] = useState("");

  const addCertificate = () => {
    if (newDomain) {
      const newCert = {
        id: Date.now().toString(),
        domain: newDomain,
        issuer: "Let's Encrypt",
        status: "online" as const,
        grade: "A",
        expiryDate: "2024-12-31",
        daysLeft: 90,
        protocol: "TLS 1.3",
        keySize: 2048,
        lastCheck: "Just now"
      };
      setCertificates([...certificates, newCert]);
      setNewDomain("");
    }
  };

  const deleteCertificate = (id: string) => {
    setCertificates(certificates.filter(c => c.id !== id));
  };

  const getExpiryStatus = (daysLeft: number) => {
    if (daysLeft < 0) return "offline";
    if (daysLeft <= 7) return "warning"; 
    return "online";
  };

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            SSL Monitoring
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor SSL certificates and their expiration dates
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Input
            placeholder="Enter domain name..."
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            className="w-64"
          />
          <Button onClick={addCertificate}>
            <Plus className="w-4 h-4 mr-2" />
            Add Domain
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="glassmorphism border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Shield className="w-8 h-8 text-blue-400" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Certificates</p>
                    <p className="text-2xl font-bold">{certificates.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glassmorphism border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                  <div>
                    <p className="text-sm text-muted-foreground">Valid</p>
                    <p className="text-2xl font-bold text-green-400">
                      {certificates.filter(c => c.daysLeft > 7).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glassmorphism border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-8 h-8 text-amber-400" />
                  <div>
                    <p className="text-sm text-muted-foreground">Expiring Soon</p>
                    <p className="text-2xl font-bold text-amber-400">
                      {certificates.filter(c => c.daysLeft <= 7 && c.daysLeft > 0).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glassmorphism border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Clock className="w-8 h-8 text-red-400" />
                  <div>
                    <p className="text-sm text-muted-foreground">Expired</p>
                    <p className="text-2xl font-bold text-red-400">
                      {certificates.filter(c => c.daysLeft < 0).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="certificates" className="space-y-4">
          <div className="grid gap-4">
            {certificates.map((cert) => (
              <Card key={cert.id} className="glassmorphism border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Shield className="w-8 h-8 text-blue-400" />
                      <div>
                        <h3 className="font-semibold text-lg">{cert.domain}</h3>
                        <p className="text-muted-foreground text-sm">Issued by {cert.issuer}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-muted-foreground">
                            Expires: {cert.expiryDate}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Protocol: {cert.protocol}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Key: {cert.keySize} bits
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {cert.lastCheck}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant="outline" 
                        className={getGradeColor(cert.grade)}
                      >
                        Grade {cert.grade}
                      </Badge>
                      <Badge 
                        variant={cert.daysLeft < 0 ? "destructive" : cert.daysLeft <= 7 ? "secondary" : "default"}
                      >
                        {cert.daysLeft < 0 ? "Expired" : `${cert.daysLeft} days left`}
                      </Badge>
                      <StatusBadge status={getExpiryStatus(cert.daysLeft)}>
                        {getExpiryStatus(cert.daysLeft).charAt(0).toUpperCase() + getExpiryStatus(cert.daysLeft).slice(1)}
                      </StatusBadge>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => deleteCertificate(cert.id)}
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
          <div className="text-center p-8">
            <h2 className="text-xl font-semibold text-muted-foreground">Analytics Coming Soon</h2>
            <p className="text-muted-foreground mt-2">SSL analytics and detailed reports will be available here.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
