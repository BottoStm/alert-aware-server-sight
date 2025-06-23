
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import Index from "./pages/Index";
import Servers from "./pages/Servers";
import ServerDetails from "./pages/ServerDetails";
import WebsiteChecks from "./pages/WebsiteChecks";
import NotFound from "./pages/NotFound";
import WebsiteAnalytics from "./pages/WebsiteAnalytics";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/servers" element={<Servers />} />
                <Route path="/servers/:serverId" element={<ServerDetails />} />
                <Route path="/websites" element={<WebsiteChecks />} />
                <Route path="/website-analytics/:websiteId" element={<WebsiteAnalytics />} />
                <Route path="/alerts" element={<div className="text-center p-8"><h1 className="text-2xl font-bold">Alerts Page</h1><p className="text-muted-foreground">Coming soon...</p></div>} />
                <Route path="/settings" element={<div className="text-center p-8"><h1 className="text-2xl font-bold">Settings Page</h1><p className="text-muted-foreground">Coming soon...</p></div>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
