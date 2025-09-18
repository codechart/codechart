import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import HowToUse from "./pages/HowToUse";
import { IntroOverlay } from "./components/IntroOverlay";
import { useEffect } from "react";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Log DNS change verification
    console.log("🌐 Covalent Landing Page - DNS Verification");
    console.log("⏰ Load Time:", new Date().toISOString());
    console.log("🔗 Current Domain:", window.location.hostname);
    console.log("📍 Full URL:", window.location.href);
    console.log("🚀 Railway Custom Domain Test");
    
    // Check if this is the custom domain
    if (window.location.hostname === 'cochart.dev') {
      console.log("✅ SUCCESS: Custom domain cochart.dev is working!");
    } else if (window.location.hostname.includes('railway.app')) {
      console.log("⚠️  INFO: Still using Railway subdomain");
    } else {
      console.log("📍 INFO: Unknown domain:", window.location.hostname);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <IntroOverlay />
        <Toaster />
        <Sonner />
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/how-to-use" element={<HowToUse />} />
          </Routes>
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
