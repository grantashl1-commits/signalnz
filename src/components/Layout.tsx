import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Moon, Salad, Dumbbell, Wind, PenLine, BookOpen, Crown, Heart, Users } from "lucide-react";
import { getCycleInfo, getLastPeriodStart, PHASE_SHORT } from "@/lib/cycle-utils";
import { useIsMobile, useKeyboardVisible, haptic } from "@/hooks/use-mobile";
import { useRef, useState, useEffect } from "react";
import SignalFloatingCTA from "@/components/signal/SignalFloatingCTA";
import SignalPanel from "@/components/signal/SignalPanel";
import { useSignalPanel } from "@/hooks/useSignalPanel";

const navItems = [
  { path: "/my-practice", icon: Heart, label: "Daily Habits" },
  { path: "/nutrition", icon: Salad, label: "Nutrition" },
  { path: "/movement", icon: Dumbbell, label: "Movement" },
  { path: "/cycle", icon: Moon, label: "Cycle" },
  { path: "/breathwork", icon: Wind, label: "Mindfulness" },
  { path: "/journal", icon: PenLine, label: "Journal" },
  { path: "/community", icon: Users, label: "Community" },
];

// Mobile bottom tab items — all 7 in a scrollable bar
const mobileNavItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/my-practice", icon: Heart, label: "Habits" },
  { path: "/nutrition", icon: Salad, label: "Nourish" },
  { path: "/movement", icon: Dumbbell, label: "Move" },
  { path: "/cycle", icon: Moon, label: "Cycle" },
  { path: "/breathwork", icon: Wind, label: "Mindful" },
  { path: "/journal", icon: PenLine, label: "Journal" },
  { path: "/community", icon: Users, label: "Community" },
];

const PHASE_BORDER: Record<string, string> = {
  menstrual: "border-phase-menstrual",
  follicular: "border-phase-follicular",
  ovulatory: "border-phase-ovulatory",
  luteal: "border-phase-luteal",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const info = getCycleInfo(getLastPeriodStart());
  const isMobile = useIsMobile();
  const keyboardVisible = useKeyboardVisible();
  const { open: signalOpen, openSignal, closeSignal, initialPrompt, pageContext } = useSignalPanel();

  // Swipe navigation between mobile tabs
  const mainRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const currentMobileIdx = mobileNavItems.findIndex((n) => n.path === location.pathname);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx > 0 && currentMobileIdx > 0) {
        haptic("light");
        window.location.href = mobileNavItems[currentMobileIdx - 1].path;
      } else if (dx < 0 && currentMobileIdx < mobileNavItems.length - 1 && currentMobileIdx >= 0) {
        haptic("light");
        window.location.href = mobileNavItems[currentMobileIdx + 1].path;
      }
    }
    touchStart.current = null;
  };

  // Slide direction for page transitions
  const [slideDir, setSlideDir] = useState(0);
  const prevPathRef = useRef(location.pathname);
  useEffect(() => {
    const prevIdx = mobileNavItems.findIndex((n) => n.path === prevPathRef.current);
    const newIdx = mobileNavItems.findIndex((n) => n.path === location.pathname);
    if (prevIdx >= 0 && newIdx >= 0) {
      setSlideDir(newIdx > prevIdx ? 1 : -1);
    } else {
      setSlideDir(0);
    }
    prevPathRef.current = location.pathname;
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">
      {/* Desktop header — hidden on mobile */}
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md hidden md:block pt-safe">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2 flex-shrink-0 mr-6">
            <img src="/logos/Icon.png" alt="Signal" className="h-8 w-8 object-contain" />
            <span className="font-display text-lg font-extrabold text-primary tracking-wide uppercase">Signal</span>
          </Link>

          <nav className="flex items-center gap-1 flex-1 justify-center">
            <Link
              to="/"
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-body font-medium transition-all ${
                location.pathname === "/"
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              <Home className="h-3.5 w-3.5" />
              Home
            </Link>
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-body font-medium transition-all ${
                    active
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  }`}
                >
                  <item.icon className="h-3.5 w-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className={`flex items-center gap-2 rounded-full border px-3 py-1.5 flex-shrink-0 ml-6 ${PHASE_BORDER[info.phase]}`}>
            <span className="font-hand text-sm font-bold" style={{ color: `hsl(var(--phase-${info.phase}))` }}>
              day {info.cycleDay} · {PHASE_SHORT[info.phase].toLowerCase()}
            </span>
          </div>
        </div>
      </header>

      {/* Mobile header — minimal, just branding + phase */}
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md md:hidden pt-safe">
        <div className="flex items-center justify-between px-5 py-3">
          <Link to="/" className="flex items-center gap-1.5">
            <img src="/logos/Icon.png" alt="Signal" className="h-7 w-7 object-contain" />
            <span className="font-display text-sm font-extrabold text-primary tracking-wide uppercase">Signal</span>
          </Link>
          <div className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 ${PHASE_BORDER[info.phase]}`}>
            <span className="font-hand text-xs font-bold" style={{ color: `hsl(var(--phase-${info.phase}))` }}>
              D{info.cycleDay} · {PHASE_SHORT[info.phase].toLowerCase()}
            </span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          key={location.pathname}
          ref={mainRef}
          initial={isMobile ? { opacity: 0, x: slideDir * 60 } : { opacity: 0, y: 8 }}
          animate={isMobile ? { opacity: 1, x: 0 } : { opacity: 1, y: 0 }}
          exit={isMobile ? { opacity: 0, x: slideDir * -30 } : { opacity: 0, y: -8 }}
          transition={{ duration: isMobile ? 0.25 : 0.35, ease: "easeOut" as const }}
          className="flex-1 pb-28 md:pb-8 scroll-y overflow-x-hidden"
          onTouchStart={isMobile ? handleTouchStart : undefined}
          onTouchEnd={isMobile ? handleTouchEnd : undefined}
        >
          {children}
        </motion.main>
      </AnimatePresence>

      {/* Mobile bottom tab bar — horizontally scrollable */}
      {!keyboardVisible && (
        <nav
          className="fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md md:hidden select-none-chrome"
          style={{
            paddingBottom: "env(safe-area-inset-bottom)",
            height: "calc(60px + env(safe-area-inset-bottom))",
          }}
        >
          <div className="flex items-center h-[60px] overflow-x-auto scroll-snap-x px-1 gap-0">
            {mobileNavItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => haptic("light")}
                  className={`touch-tab flex flex-col items-center gap-0.5 rounded-xl px-2.5 py-1.5 min-w-[48px] min-h-[44px] justify-center flex-shrink-0 scroll-snap-item ${
                    active ? "text-primary" : "text-muted-foreground opacity-50"
                  }`}
                >
                  <item.icon className={`${active ? "h-4.5 w-4.5" : "h-4 w-4"} transition-all`} />
                  <span className="text-[8px] font-body font-medium leading-none">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}

      {/* Give me a signal — floating CTA + panel */}
      <SignalFloatingCTA onClick={() => openSignal()} />
      <SignalPanel
        open={signalOpen}
        onClose={closeSignal}
        initialPrompt={initialPrompt}
        pageContext={pageContext}
      />
    </div>
  );
}
