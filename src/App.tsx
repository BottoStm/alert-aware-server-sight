
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Index />} />
            {/* Placeholder routes for future pages */}
            <Route path="/servers" element={<div className="text-center p-8"><h1 className="text-2xl font-bold">Servers Page</h1><p className="text-muted-foreground">Coming soon...</p></div>} />
            <Route path="/processes" element={<div className="text-center p-8"><h1 className="text-2xl font-bold">Processes Page</h1><p className="text-muted-foreground">Coming soon...</p></div>} />
            <Route path="/containers" element={<div className="text-center p-8"><h1 className="text-2xl font-bold">Containers Page</h1><p className="text-muted-foreground">Coming soon...</p></div>} />
            <Route path="/network" element={<div className="text-center p-8"><h1 className="text-2xl font-bold">Network Page</h1><p className="text-muted-foreground">Coming soon...</p></div>} />
            <Route path="/storage" element={<div className="text-center p-8"><h1 className="text-2xl font-bold">Storage Page</h1><p className="text-muted-foreground">Coming soon...</p></div>} />
            <Route path="/website-checks" element={<div className="text-center p-8"><h1 className="text-2xl font-bold">Website Checks Page</h1><p className="text-muted-foreground">Coming soon...</p></div>} />
            <Route path="/ssl" element={<div className="text-center p-8"><h1 className="text-2xl font-bold">SSL Monitoring Page</h1><p className="text-muted-foreground">Coming soon...</p></div>} />
            <Route path="/alerts" element={<div className="text-center p-8"><h1 className="text-2xl font-bold">Alerts Page</h1><p className="text-muted-foreground">Coming soon...</p></div>} />
            <Route path="/settings" element={<div className="text-center p-8"><h1 className="text-2xl font-bold">Settings Page</h1><p className="text-muted-foreground">Coming soon...</p></div>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
