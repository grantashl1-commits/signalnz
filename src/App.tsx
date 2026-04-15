import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { captureReferralParam } from "@/hooks/useReferral";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SignalLogo from "@/components/SignalLogo";
import { supabase } from "@/integrations/supabase/client";

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
import NervousSystem from "./pages/NervousSystem";
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
import Feed from "./pages/Feed";
<<<<<<< Updated upstream
import Terms from "./pages/Terms";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import RefundPolicy from "./pages/RefundPolicy";
import Contact from "./pages/Contact";
import Connect from "./pages/Connect";
=======
>>>>>>> Stashed changes


const queryClient = new QueryClient();

const App = () => {
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      setAppReady(true);
    });
    const timeout = setTimeout(() => setAppReady(true), 1500);
    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {/* Branded loading splash */}
        <AnimatePresence>
          {!appReady && (
            <motion.div
              key="splash"
              className="fixed inset-0 z-[9999] flex items-center justify-center"
              style={{ backgroundColor: "#F5F0EC" }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <div className="relative" style={{ width: 260, height: 260 }}>
                {/* Spinning ring */}
                <motion.div
                  className="absolute inset-0"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                >
                  <SignalLogo size={260} color="#9B7BB0" />
                </motion.div>
                {/* Centre text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="text-2xl tracking-[0.15em] uppercase"
                    style={{ color: "#9B7BB0", fontFamily: "Montserrat, sans-serif", fontWeight: 700 }}
                  >
                    Signal
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                    className="text-[9px] tracking-[0.25em] uppercase mt-0.5"
                    style={{ color: "#9B7BB0", fontFamily: "Montserrat, sans-serif", fontWeight: 500 }}
                  >
                    Tune into your inner self
                  </motion.p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          animate={{ opacity: appReady ? 1 : 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="h-full"
        >
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
                        <Route path="/breathwork" element={<Navigate to="/mindfulness" replace />} />
                        <Route path="/nervous-system" element={<Navigate to="/mindfulness" replace />} />
                        <Route path="/mindfulness" element={<NervousSystem />} />
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
                        <Route path="/feed" element={<Feed />} />
                        <Route path="/terms" element={<Terms />} />
                        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                        <Route path="/refund-policy" element={<RefundPolicy />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/connect" element={<Connect />} />
                        <Route path="/vision-board" element={<Navigate to="/journal" replace />} />
                        <Route path="/feed" element={<Feed />} />
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
        </motion.div>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
