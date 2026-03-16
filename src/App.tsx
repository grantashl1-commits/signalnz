import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import { SignalPanelProvider } from "@/hooks/useSignalPanel";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Cycle from "./pages/Cycle";
import Nutrition from "./pages/Nutrition";
import Movement from "./pages/Movement";
import Breathwork from "./pages/Breathwork";
import Journal from "./pages/Journal";
import Modules from "./pages/Modules";
import Membership from "./pages/Membership";
import Practice from "./pages/Practice";
import Recommendations from "./pages/Recommendations";
import Community from "./pages/Community";
import Auth from "./pages/Auth";
import Account from "./pages/Account";
import NotFound from "./pages/NotFound";
import Feedback from "./pages/Feedback";
import BrandGuidelines from "./pages/BrandGuidelines";
import AnimationPOC from "./pages/AnimationPOC";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <SignalPanelProvider>
            <Routes>
              <Route path="/brand" element={<BrandGuidelines />} />
              <Route path="/animation-poc" element={<AnimationPOC />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="*" element={
                <Layout>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/cycle" element={<Cycle />} />
                    <Route path="/nutrition" element={<Nutrition />} />
                    <Route path="/movement" element={<Movement />} />
                    <Route path="/breathwork" element={<Breathwork />} />
                    <Route path="/nervous-system" element={<Breathwork />} />
                    <Route path="/journal" element={<Journal />} />
                    <Route path="/modules" element={<Modules />} />
                    <Route path="/membership" element={<Membership />} />
                    <Route path="/my-practice" element={<Practice />} />
                    <Route path="/recommendations" element={<Recommendations />} />
                    <Route path="/community" element={<Community />} />
                    <Route path="/account" element={<Account />} />
                    <Route path="/feedback" element={<Feedback />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Layout>
              } />
            </Routes>
          </SignalPanelProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
