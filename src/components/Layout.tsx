import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Moon, Salad, Dumbbell, Wind, PenLine, BookOpen, Crown } from "lucide-react";

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

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <Link to="/" className="font-display text-2xl font-bold tracking-wide text-foreground">
            MINDCAST
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "bg-secondary/20 text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <motion.main
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="container mx-auto px-4 py-8 pb-24 md:pb-8"
      >
        {children}
      </motion.main>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/90 backdrop-blur-md md:hidden">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.slice(0, 6).map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-0.5 rounded-lg px-2 py-1 text-xs transition-colors ${
                  active ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-[10px]">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
