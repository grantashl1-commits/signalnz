import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Moon, Dumbbell, BookOpen, User, Zap, UserCircle, MoreHorizontal, Utensils, Leaf, Brain, Users, X } from "lucide-react";
import { useCycle } from "@/contexts/CycleContext";
import { PHASE_SHORT } from "@/lib/cycle-utils";
import { useIsMobile, useKeyboardVisible, haptic } from "@/hooks/use-mobile";
import { useRef, useEffect, useState } from "react";
import SignalFloatingCTA from "@/components/signal/SignalFloatingCTA";
import SignalPanel from "@/components/signal/SignalPanel";
import { useSignalPanel } from "@/hooks/useSignalPanel";
import SignalAmbientDots from "@/components/SignalAmbientDots";
import SignalAmbientRipple from "@/components/SignalAmbientRipple";
import { useAICredits } from "@/hooks/useAICredits";
import PageTransition from "@/components/PageTransition";

const navItems = [
  { path: "/my-practice", icon: Home, label: "Daily Habits" },
  { path: "/nutrition", icon: Home, label: "Nutrition" },
  { path: "/movement", icon: Dumbbell, label: "Movement" },
  { path: "/cycle", icon: Moon, label: "Cycle" },
  { path: "/mindfulness", icon: Home, label: "Mindfulness" },
  { path: "/journal", icon: BookOpen, label: "Journal" },
  { path: "/community", icon: Home, label: "Community" },
];

const PRIMARY_TABS = [
  { path: "/", label: "Home", icon: Home },
  { path: "/cycle", label: "Cycle", icon: Moon },
  { path: "/journal", label: "Journal", icon: BookOpen },
  { path: "/movement", label: "Move", icon: Dumbbell },
  { path: "more", label: "More", icon: MoreHorizontal },
];

const MORE_ITEMS = [
  { path: "/nutrition", label: "Nourish", icon: Utensils },
  { path: "/my-practice", label: "Daily Habits", icon: Leaf },
  { path: "/mindfulness", label: "Mindfulness", icon: Brain },
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
  const { creditsRemaining, tier } = useAICredits();
  const showCreditCounter = tier === "free";

  const previousPathRef = useRef(location.pathname);
  const previousPath = previousPathRef.current;
  useEffect(() => {
    previousPathRef.current = location.pathname;
  }, [location.pathname]);

  return (
    <div className="fixed inset-0 flex flex-col bg-background overflow-hidden">
      <SignalAmbientDots />
      <SignalAmbientRipple />

      {/* Desktop header — hidden on mobile */}
      <header className="flex-none bg-background/95 backdrop-blur-xl border-b border-border/10 z-30 hidden md:block" style={{ paddingTop: "var(--safe-top)" }}>
        <div className="container mx-auto flex items-center justify-between px-4 h-[52px]">
          <Link to="/" className="flex items-center gap-2 flex-shrink-0 mr-6">
            <img src="/logos/Icon.png" alt="Signal" className="h-8 w-8 object-contain" />
            <span className="font-display text-lg font-extrabold text-primary tracking-wide uppercase">Signal</span>
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
            {showCreditCounter && (
              <Link
                to="/membership"
                className="flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5"
              >
                <Zap className="h-3.5 w-3.5 text-primary" />
                <span className="font-mono text-xs font-bold text-primary">{creditsRemaining} left</span>
              </Link>
            )}
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
          <Link to="/" className="flex items-center gap-1.5">
            <img src="/logos/Icon.png" alt="Signal" className="h-7 w-7 object-contain" />
            <span className="font-display text-sm font-extrabold text-primary tracking-wide uppercase">Signal</span>
          </Link>
          <div className="flex items-center gap-2">
            {showCreditCounter && (
              <Link
                to="/membership"
                className="flex items-center gap-1 rounded-full border border-primary/20 bg-primary/5 px-2 py-1"
              >
                <Zap className="h-3 w-3 text-primary" />
                <span className="font-mono text-[10px] font-bold text-primary">{creditsRemaining}</span>
              </Link>
            )}
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
          className="flex-none bg-background/95 backdrop-blur-xl border-t border-border/10 z-40 md:hidden select-none"
          style={{ paddingBottom: "var(--safe-bottom)" }}
        >
          <div className="flex items-stretch max-w-lg mx-auto">
            {PRIMARY_TABS.map(({ path, label, icon: Icon }) => {
              const isActive = location.pathname === path ||
                (path !== "/" && location.pathname.startsWith(path));
              return (
                <button
                  key={path}
                  onClick={() => { haptic("light"); navigate(path); }}
                  className="flex-1 flex flex-col items-center justify-center gap-0.5 pt-2 pb-1 min-h-[56px] relative select-none"
                  style={{ WebkitTapHighlightColor: "transparent" }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="tab-indicator"
                      className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary"
                      transition={{ type: "spring", stiffness: 500, damping: 40 }}
                    />
                  )}
                  <motion.div
                    animate={{ scale: isActive ? 1.1 : 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  >
                    <Icon
                      className={`w-5 h-5 transition-colors duration-200 ${
                        isActive ? "text-primary" : "text-muted-foreground/40"
                      }`}
                      strokeWidth={isActive ? 2 : 1.5}
                    />
                  </motion.div>
                  <span
                    className={`text-[10px] font-mono tracking-wide transition-colors duration-200 ${
                      isActive ? "text-primary" : "text-muted-foreground/35"
                    }`}
                  >
                    {label}
                  </span>
                </button>
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
