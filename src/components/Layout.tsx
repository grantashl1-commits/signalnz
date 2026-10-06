import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { UserCircle } from "lucide-react";
import { PRIMARY_NAV, PILLAR_COLOR, activePillar } from "@/lib/navigation";
import { useCycle } from "@/contexts/CycleContext";
import { PHASE_SHORT } from "@/lib/cycle-utils";
import { useIsMobile, useKeyboardVisible, haptic } from "@/hooks/use-mobile";
import { useRef, useEffect } from "react";
import SignalPanel from "@/components/signal/SignalPanel";
import { useSignalPanel } from "@/hooks/useSignalPanel";
import SignalAmbientDots from "@/components/SignalAmbientDots";

import PageTransition from "@/components/PageTransition";

const PHASE_COLOR = (phase: string) => `hsl(var(--phase-${phase}))`;

/** Cycle as a quiet lens: a small pill that opens the Cycle space. */
function PhaseLens({ phase, day }: { phase: string; day: number }) {
  return (
    <Link
      to="/cycle"
      className="group flex items-center gap-2 rounded-full border border-border/70 bg-card/70 backdrop-blur-xl pl-2 pr-3 py-1.5 transition-colors hover:border-foreground/20"
      aria-label={`Cycle: ${PHASE_SHORT[phase as keyof typeof PHASE_SHORT]} phase, day ${day}`}
    >
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full rounded-full opacity-50 animate-ping" style={{ backgroundColor: PHASE_COLOR(phase), animationDuration: "2.4s" }} />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PHASE_COLOR(phase) }} />
      </span>
      <span className="text-[12px] font-medium text-foreground/80">
        {PHASE_SHORT[phase as keyof typeof PHASE_SHORT]} <span className="text-muted-foreground">· day {day}</span>
      </span>
    </Link>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { currentPhase, currentCycleDay } = useCycle();
  const info = { phase: currentPhase, cycleDay: currentCycleDay, name: PHASE_SHORT[currentPhase] };
  const isMobile = useIsMobile();
  const keyboardVisible = useKeyboardVisible();
  const { open: signalOpen, openSignal, closeSignal, initialPrompt, pageContext } = useSignalPanel();
  const navigate = useNavigate();
  const pillar = activePillar(location.pathname);

  const previousPathRef = useRef(location.pathname);
  const previousPath = previousPathRef.current;
  useEffect(() => {
    previousPathRef.current = location.pathname;
  }, [location.pathname]);

  return (
    <div className="fixed inset-0 flex flex-col bg-background overflow-hidden">
      <SignalAmbientDots />

      {/* Desktop header — floating glass bar */}
      <header className="flex-none z-30 hidden md:block" style={{ paddingTop: "var(--safe-top)" }}>
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 h-[72px]">
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0" aria-label="Signal home">
            <img src="/logos/Signal-purple-no-tagline.png" alt="Signal" className="h-8 w-auto" />
          </Link>

          <nav className="relative flex items-center gap-1 rounded-full border border-border/70 bg-card/70 backdrop-blur-xl p-1 shadow-soft" aria-label="Primary">
            {PRIMARY_NAV.map((item) => {
              const active = pillar === item.pillar;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-medium transition-colors ${
                    active ? "text-background" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="desk-pill"
                      className="absolute inset-0 rounded-full bg-foreground"
                      transition={{ type: "spring", stiffness: 420, damping: 36 }}
                    />
                  )}
                  <item.icon className="relative z-10 h-4 w-4" strokeWidth={1.75} />
                  <span className="relative z-10">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 flex-shrink-0">
            <PhaseLens phase={info.phase} day={info.cycleDay} />
            <Link
              to="/account"
              aria-label="Account"
              className="flex items-center justify-center w-9 h-9 rounded-full border border-border/70 bg-card/70 text-muted-foreground hover:text-foreground transition-colors"
            >
              <UserCircle className="h-5 w-5" strokeWidth={1.5} />
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile header */}
      <header className="flex-none z-30 md:hidden bg-background/80 backdrop-blur-xl" style={{ paddingTop: "var(--safe-top)" }}>
        <div className="flex items-center justify-between px-5 h-[52px]">
          <Link to="/" className="flex items-center gap-2" aria-label="Signal home">
            <img src="/logos/Signal-purple-no-tagline.png" alt="Signal" className="h-7 w-auto" />
          </Link>
          <PhaseLens phase={info.phase} day={info.cycleDay} />
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

      {/* Mobile floating dock — Today · Eat · Move · Reflect · Explore */}
      {!keyboardVisible && (
        <nav
          className="flex-none z-40 md:hidden select-none px-3 pt-1.5"
          style={{ paddingBottom: "calc(var(--safe-bottom) + 8px)" }}
          aria-label="Primary"
        >
          <div className="relative flex items-stretch max-w-md mx-auto rounded-[22px] border border-border/60 bg-card/80 backdrop-blur-2xl shadow-elevated px-1.5 py-1.5">
            {PRIMARY_NAV.map(({ path, label, icon: Icon, pillar: p }) => {
              const isActive = pillar === p;
              return (
                <button
                  key={path}
                  onClick={() => { haptic("light"); navigate(path); }}
                  className="flex-1 flex flex-col items-center justify-center gap-1 min-h-[52px] relative rounded-2xl"
                  aria-current={isActive ? "page" : undefined}
                  style={{ WebkitTapHighlightColor: "transparent" }}
                >
                  {isActive && (
                    <motion.span
                      layoutId="dock-pill"
                      className="absolute inset-0 rounded-2xl bg-foreground"
                      transition={{ type: "spring", stiffness: 480, damping: 38 }}
                    />
                  )}
                  <Icon
                    className="relative z-10 w-[19px] h-[19px] transition-colors duration-200"
                    style={{ color: isActive ? (p === "today" ? "hsl(var(--background))" : PILLAR_COLOR[p]) : "hsl(var(--foreground) / 0.45)" }}
                    strokeWidth={isActive ? 2 : 1.6}
                  />
                  <span
                    className="relative z-10 text-[10px] font-medium tracking-wide transition-colors duration-200"
                    style={{ color: isActive ? "hsl(var(--background))" : "hsl(var(--foreground) / 0.5)" }}
                  >
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      )}

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
