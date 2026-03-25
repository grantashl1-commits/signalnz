import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { captureReferralParam } from "@/hooks/useReferral";

// Capture ?ref= on first load
captureReferralParam();
import Layout from "@/components/Layout";
import { SignalPanelProvider } from "@/hooks/useSignalPanel";
import { AuthProvider } from "@/contexts/AuthContext";
import { CycleProvider } from "@/contexts/CycleContext";
import { HeartRateProvider } from "@/contexts/HeartRateContext";
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
import Admin from "./pages/Admin";
import Coach from "./pages/Coach";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <CycleProvider>
          <HeartRateProvider>
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
                    <Route path="/daily-habits" element={<Navigate to="/my-practice" replace />} />
                    <Route path="/recommendations" element={<Recommendations />} />
                    <Route path="/community" element={<Community />} />
                    <Route path="/account" element={<Account />} />
                    <Route path="/settings" element={<Navigate to="/account" replace />} />
                    <Route path="/profile" element={<Navigate to="/account" replace />} />
                    <Route path="/home" element={<Navigate to="/" replace />} />
                    <Route path="/feedback" element={<Feedback />} />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/coach" element={<Coach />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Layout>
              } />
            </Routes>
          </SignalPanelProvider>
          </HeartRateProvider>
          </CycleProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
