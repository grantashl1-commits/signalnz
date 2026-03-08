import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Moon, Salad, Dumbbell, Wind, PenLine, BookOpen, Crown } from "lucide-react";
import { getCycleInfo, getLastPeriodStart, PHASE_SHORT } from "@/lib/cycle-utils";
import { CymaticMini } from "@/components/CymaticPatterns";

const navItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/cycle", icon: Moon, label: "Cycle" },
  { path: "/nutrition", icon: Salad, label: "Nutrition" },
  { path: "/movement", icon: Dumbbell, label: "Movement" },
  { path: "/breathwork", icon: Wind, label: "Breathwork" },
  { path: "/journal", icon: PenLine, label: "Journal" },
  { path: "/modules", icon: BookOpen, label: "Modules" },
  { path: "/membership", icon: Crown, label: "Membership" },
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

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <Link to="/" className="font-body text-lg font-bold tracking-wider text-foreground uppercase">
            MINDCAST
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
                    active
                      ? "bg-secondary text-cyan"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  }`}
                >
                  <item.icon className="h-3.5 w-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Phase indicator pill */}
          <div className={`hidden md:flex items-center gap-2 rounded-full border px-3 py-1.5 ${PHASE_BORDER[info.phase]}`}>
            <CymaticMini phase={info.phase} size={16} />
            <span className="font-body text-[10px] font-bold uppercase tracking-widest text-foreground">
              {PHASE_SHORT[info.phase]}
            </span>
            <span className="font-mono text-[10px] text-cyan">D{info.cycleDay}</span>
          </div>
        </div>
      </header>

      <motion.main
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="container mx-auto px-4 py-8 pb-24 md:pb-8"
      >
        {children}
      </motion.main>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-md md:hidden">
        <div className="flex items-center justify-around px-1 py-1.5">
          {navItems.slice(0, 6).map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-0.5 rounded-lg px-2 py-1 transition-all ${
                  active ? "text-cyan" : "text-muted-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span className="text-[9px] font-medium tracking-wider">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
