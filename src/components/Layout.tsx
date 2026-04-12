import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Moon, Dumbbell, BookOpen, User, UserCircle, MoreHorizontal, Utensils, Leaf, Brain, Users, X, Sparkles, Heart } from "lucide-react";
import { useCycle } from "@/contexts/CycleContext";
import { PHASE_SHORT } from "@/lib/cycle-utils";
import { useIsMobile, useKeyboardVisible, haptic } from "@/hooks/use-mobile";
import { useRef, useEffect, useState } from "react";
import SignalFloatingCTA from "@/components/signal/SignalFloatingCTA";
import SignalPanel from "@/components/signal/SignalPanel";
import { useSignalPanel } from "@/hooks/useSignalPanel";
import SignalAmbientDots from "@/components/SignalAmbientDots";
import SignalLogo from "@/components/SignalLogo";

import PageTransition from "@/components/PageTransition";

// Desktop nav: Home | Daily Habits | Nutrition | Movement | Cycle | Mindfulness | Journal | Community
// Desktop nav: Home | Nutrition | Movement | Cycle | Mindfulness | Journal | Community
const navItems = [
  { path: "/my-practice", icon: Leaf, label: "My Practice" },
  { path: "/nutrition", icon: Utensils, label: "Nutrition" },
  { path: "/movement", icon: Dumbbell, label: "Movement" },
  { path: "/cycle", icon: Moon, label: "Cycle" },
  { path: "/mindfulness", icon: Brain, label: "Mindfulness" },
  { path: "/journal", icon: BookOpen, label: "Journal" },
  { path: "/community", icon: Users, label: "Community" },
];

// Mobile bottom tabs: Daily Habits | Nutrition | Movement | Cycle | More | Journal | Community | Account
// That's 8 items — too many for a tab bar. We'll do 5 primary + More overlay.
// Primary: Home(logo) + Daily Habits | Cycle | Journal | Move | More
// Per user request exact order: Daily Habits | Nutrition | Movement | Cycle | More
// With More containing: Mindfulness | Journal | Community | Account
// But user also wants Journal and Community as top-level... Let's use 5 tabs + More:
// Tabs: Daily Habits | Cycle | Journal | Move | More
// More: Nutrition | Mindfulness | Community | Account

const PRIMARY_TABS = [
  { path: "/", label: "Home", icon: Home },
  { path: "/nutrition", label: "Nourish", icon: Utensils },
  { path: "/movement", label: "Move", icon: Dumbbell },
  { path: "/cycle", label: "Cycle", icon: Moon },
  { path: "more", label: "More", icon: MoreHorizontal },
];

const MORE_ITEMS = [
  { path: "/my-practice", label: "My Practice", icon: Leaf },
  { path: "/mindfulness", label: "Mindfulness", icon: Brain },
  { path: "/journal", label: "Journal", icon: BookOpen },
  { path: "/community", label: "Community", icon: Users },
  { path: "/account", label: "Account", icon: User },
];

const PHASE_BORDER: Record<string, string> = {
  menstrual: "border-phase-menstrual",
  follicular: "border-phase-follicular",
  ovulatory: "border-phase-ovulatory",
  luteal: "border-phase-luteal",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { currentPhase, currentCycleDay } = useCycle();
  const info = { phase: currentPhase, cycleDay: currentCycleDay, name: PHASE_SHORT[currentPhase] };
  const isMobile = useIsMobile();
  const keyboardVisible = useKeyboardVisible();
  const { open: signalOpen, openSignal, closeSignal, initialPrompt, pageContext } = useSignalPanel();
  const navigate = useNavigate();
  const [moreOpen, setMoreOpen] = useState(false);

  const previousPathRef = useRef(location.pathname);
  const previousPath = previousPathRef.current;
  useEffect(() => {
    previousPathRef.current = location.pathname;
  }, [location.pathname]);

  return (
    <div className="fixed inset-0 flex flex-col bg-background overflow-hidden">
      <SignalAmbientDots />

      {/* Desktop header — hidden on mobile */}
      <header className="flex-none bg-background/95 backdrop-blur-xl border-b border-border/10 z-30 hidden md:block" style={{ paddingTop: "var(--safe-top)" }}>
        <div className="container mx-auto flex items-center justify-between px-4 h-[52px]">
          <Link to="/" className="flex items-center flex-shrink-0 mr-6">
            <img src="/logos/Signal-purple-no-tagline.png" alt="Signal" className="h-8" />
          </Link>

          <nav className="flex items-center gap-1 flex-1 justify-center">
            <Link
              to="/"
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-body font-medium transition-all ${
                location.pathname === "/"
                  ? "bg-primary/15 text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              <Home className={`h-3.5 w-3.5 ${location.pathname === "/" ? "fill-primary" : ""}`} />
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
                      ? "bg-primary/15 text-primary font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  }`}
                >
                  <item.icon className={`h-3.5 w-3.5 ${active ? "fill-primary" : ""}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3 flex-shrink-0 ml-6">
            <div className={`flex items-center gap-2 rounded-full border px-3 py-1.5 ${PHASE_BORDER[info.phase]}`}>
              <span className="font-hand text-sm font-bold" style={{ color: `hsl(var(--phase-${info.phase}))` }}>
                day {info.cycleDay} · {PHASE_SHORT[info.phase].toLowerCase()}
              </span>
            </div>
            <Link
              to="/account"
              className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary/70 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            >
              <UserCircle className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile header */}
      <header className="flex-none bg-background/95 backdrop-blur-xl border-b border-border/10 z-30 md:hidden" style={{ paddingTop: "var(--safe-top)" }}>
        <div className="flex items-center justify-between px-5 h-[52px]">
          <Link to="/" className="flex items-center">
            <img src="/logos/Signal-purple-no-tagline.png" alt="Signal" className="h-7" />
          </Link>
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 ${PHASE_BORDER[info.phase]}`}>
              <span className="font-hand text-xs font-bold" style={{ color: `hsl(var(--phase-${info.phase}))` }}>
                D{info.cycleDay} · {PHASE_SHORT[info.phase].toLowerCase()}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Scrollable content area */}
      <main className="flex-1 overflow-hidden relative">
        {isMobile ? (
          <PageTransition previousPath={previousPath}>
            <div className="h-full overflow-y-auto overscroll-none">
              {children}
            </div>
          </PageTransition>
        ) : (
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="h-full overflow-y-auto overflow-x-hidden pb-8"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      {/* Mobile bottom tab bar — 5 fixed tabs */}
      {!keyboardVisible && (
        <nav
          className="flex-none z-40 md:hidden select-none"
          style={{
            paddingBottom: "var(--safe-bottom)",
            backgroundColor: 'hsl(var(--background) / 0.72)',
            backdropFilter: 'blur(12px) saturate(180%)',
            WebkitBackdropFilter: 'blur(12px) saturate(180%)',
            borderTop: '0.5px solid rgba(91, 45, 114, 0.1)',
          }}
        >
          <div className="flex items-stretch max-w-lg mx-auto">
            {PRIMARY_TABS.map(({ path, label, icon: Icon }) => {
              const isMore = path === "more";
              const isActive = isMore
                ? moreOpen || MORE_ITEMS.some(m => location.pathname === m.path || location.pathname.startsWith(m.path))
                : path === "/" ? location.pathname === "/" : (location.pathname === path || location.pathname.startsWith(path));
              return (
                <button
                  key={path}
                  onClick={() => {
                    haptic("light");
                    if (isMore) {
                      setMoreOpen(v => !v);
                    } else {
                      setMoreOpen(false);
                      navigate(path);
                    }
                  }}
                  className="flex-1 flex flex-col items-center justify-center gap-0.5 pt-2 pb-1 min-h-[56px] relative select-none"
                  style={{ WebkitTapHighlightColor: "transparent" }}
                >
                  {/* Active pill background */}
                  {isActive && (
                    <motion.div
                      layoutId="tab-pill"
                      className="absolute rounded-full"
                      style={{
                        width: 40,
                        height: 28,
                        top: 6,
                        backgroundColor: 'hsl(var(--primary) / 0.15)',
                      }}
                      transition={{ type: "spring", stiffness: 500, damping: 40 }}
                    />
                  )}
                  <motion.div
                    animate={{ scale: isActive ? 1.05 : 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    className="relative z-10"
                  >
                    <Icon
                      className="w-5 h-5 transition-colors duration-200"
                      style={{
                        color: isActive ? 'hsl(var(--primary))' : 'hsl(var(--foreground) / 0.35)',
                      }}
                      strokeWidth={isActive ? 2 : 1.5}
                    />
                  </motion.div>
                  <span
                    className="text-[10px] font-body tracking-wide transition-colors duration-200 relative z-10"
                    style={{
                      color: isActive ? 'hsl(var(--primary))' : 'hsl(var(--foreground) / 0.35)',
                    }}
                  >
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      )}

      {/* More menu overlay */}
      <AnimatePresence>
        {moreOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMoreOpen(false)}
            />
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-30 md:hidden"
              style={{ paddingBottom: "calc(56px + var(--safe-bottom))" }}
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
            >
              <div className="mx-4 mb-2 bg-card rounded-2xl border border-border/20 shadow-2xl overflow-hidden">
                {MORE_ITEMS.map(({ path, label, icon: Icon }) => {
                  const active = location.pathname === path || location.pathname.startsWith(path);
                  return (
                    <button
                      key={path}
                      onClick={() => {
                        haptic("light");
                        setMoreOpen(false);
                        navigate(path);
                      }}
                      className={`w-full flex items-center gap-3 px-5 py-3.5 transition-colors ${
                        active ? "bg-primary/10 text-primary" : "text-foreground hover:bg-secondary/50"
                      }`}
                      style={{ WebkitTapHighlightColor: "transparent" }}
                    >
                      <Icon className="w-5 h-5" strokeWidth={active ? 2 : 1.5} />
                      <span className="text-sm font-medium">{label}</span>
                      {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Give me a signal — panel only (no floating CTA) */}
      <SignalPanel
        open={signalOpen}
        onClose={closeSignal}
        initialPrompt={initialPrompt}
        pageContext={pageContext}
      />
    </div>
  );
}
