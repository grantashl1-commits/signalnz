import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { captureReferralParam } from "@/hooks/useReferral";
import { useState, useEffect, lazy, Suspense, type ComponentType } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Sentry from "@sentry/react";
import SignalRingAnimation from "@/components/SignalRingAnimation";
import SignalLogo from "@/components/SignalLogo";
import { supabase } from "@/integrations/supabase/client";

// Capture ?ref= on first load
captureReferralParam();
import Layout from "@/components/Layout";
import { SignalPanelProvider } from "@/hooks/useSignalPanel";
import { AuthProvider } from "@/contexts/AuthContext";
import { CycleProvider } from "@/contexts/CycleContext";
import { HeartRateProvider } from "@/contexts/HeartRateContext";
import { usePushNotifications } from "@/hooks/usePushNotifications";

// Eagerly load the home page (critical path)
import Index from "./pages/Index";

const lazyWithRetry = <T extends { default: ComponentType<any> }>(
  importer: () => Promise<T>,
  retryKey: string,
) =>
  lazy(async () => {
    const storageKey = `signal-lazy-retry:${retryKey}`;

    try {
      const module = await importer();
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(storageKey);
      }
      return module;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const isChunkLoadError = /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|Loading chunk|Failed to import/i.test(message);

      if (typeof window !== "undefined" && isChunkLoadError && !sessionStorage.getItem(storageKey)) {
        sessionStorage.setItem(storageKey, "1");
        window.location.href = `${window.location.pathname}${window.location.search}${window.location.hash}`;
        return new Promise<never>(() => {});
      }

      if (typeof window !== "undefined") {
        sessionStorage.removeItem(storageKey);
      }
      throw error;
    }
  });

// Lazy-load all other routes
const Cycle = lazy(() => import("./pages/Cycle"));
const Nutrition = lazyWithRetry(() => import("./pages/Nutrition"), "nutrition-page");
const Movement = lazy(() => import("./pages/Movement"));
const Breathwork = lazy(() => import("./pages/Breathwork"));
const NervousSystem = lazy(() => import("./pages/NervousSystem"));
const Journal = lazy(() => import("./pages/Journal"));
const Modules = lazy(() => import("./pages/Modules"));
const Membership = lazy(() => import("./pages/Membership"));
const Practice = lazy(() => import("./pages/Practice"));
const Scripts = lazy(() => import("./pages/Scripts"));
const Recommendations = lazy(() => import("./pages/Recommendations"));
const Community = lazy(() => import("./pages/Community"));
const Auth = lazy(() => import("./pages/Auth"));
const Account = lazy(() => import("./pages/Account"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Feedback = lazy(() => import("./pages/Feedback"));
const BrandGuidelines = lazy(() => import("./pages/BrandGuidelines"));
const AnimationPOC = lazy(() => import("./pages/AnimationPOC"));
const Admin = lazy(() => import("./pages/Admin"));
const Coach = lazy(() => import("./pages/Coach"));
const Feed = lazy(() => import("./pages/Feed"));
const Terms = lazy(() => import("./pages/Terms"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));
const Contact = lazy(() => import("./pages/Contact"));
const Connect = lazy(() => import("./pages/Connect"));
const ConnectCourse = lazy(() => import("./components/connect/ConnectCoursePage"));
const Parenting = lazy(() => import("./components/parenting/ParentingCoursePage"));
const FutureReleases = lazy(() => import("./pages/FutureReleases"));

const queryClient = new QueryClient();

// Minimal loading fallback for lazy routes
const RouteFallback = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <SignalRingAnimation variant="pulse" size={64} color="hsl(var(--primary))" />
  </div>
);

/** Registers device for push notifications (no-op on web) */
const PushRegistrar = () => { usePushNotifications(); return null; };

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
                {/* Spinning brand ring */}
                <motion.div
                  className="absolute inset-0"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                >
                  <img
                    src="/logos/Icon_purple.png"
                    alt=""
                    width={260}
                    height={260}
                    style={{ width: 260, height: 260, display: "block" }}
                    draggable={false}
                  />
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
              <PushRegistrar />
              <CycleProvider>
              <HeartRateProvider>
              <SignalPanelProvider>
                <Suspense fallback={<RouteFallback />}>
                  <Routes>
                    <Route path="/brand" element={<BrandGuidelines />} />
                    <Route path="/animation-poc" element={<AnimationPOC />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="*" element={
                      <Layout>
                        <Suspense fallback={<RouteFallback />}>
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
                            <Route path="/scripts" element={<Scripts />} />
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
                            <Route path="/parenting" element={<Parenting />} />
                            <Route path="/connect/course" element={<ConnectCourse />} />
                            <Route path="/vision-board" element={<Navigate to="/journal" replace />} />
                            <Route path="/future-releases" element={<FutureReleases />} />
                            <Route path="*" element={<NotFound />} />
                          </Routes>
                        </Suspense>
                      </Layout>
                    } />
                  </Routes>
                </Suspense>
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
