
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import { Layout } from "./components/Layout";
import Index from "./pages/Index";
import Servers from "./pages/Servers";
import ServerDetails from "./pages/ServerDetails";
import WebsiteChecks from "./pages/WebsiteChecks";
import SslMonitoring from "./pages/SslMonitoring";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/servers" element={<Servers />} />
              <Route path="/servers/:serverId" element={<ServerDetails />} />
              <Route path="/website-checks" element={<WebsiteChecks />} />
              <Route path="/ssl" element={<SslMonitoring />} />
              {/* Placeholder routes for future pages */}
              <Route path="/alerts" element={<div className="text-center p-8"><h1 className="text-2xl font-bold">Alerts Page</h1><p className="text-muted-foreground">Coming soon...</p></div>} />
              <Route path="/settings" element={<div className="text-center p-8"><h1 className="text-2xl font-bold">Settings Page</h1><p className="text-muted-foreground">Coming soon...</p></div>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
