import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
