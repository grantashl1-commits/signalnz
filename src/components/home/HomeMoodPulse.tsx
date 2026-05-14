/**
 * HomeMoodPulse — quick 3-dot "how are you arriving?" pulse.
 * One tap logs to localStorage cycle moods (matches mindcast_moods_<date> shape used elsewhere).
 */
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const DOTS = [
  { key: "heavy", label: "heavy", color: "hsl(var(--muted-foreground))" },
  { key: "steady", label: "steady", color: "hsl(var(--primary))" },
  { key: "light", label: "light", color: "hsl(var(--accent-foreground))" },
] as const;

export default function HomeMoodPulse() {
  const todayKey = `mindcast_moods_${new Date().toISOString().split("T")[0]}`;
  const [logged, setLogged] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(todayKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        setLogged(parsed?.pulse ?? null);
      }
    } catch {}
  }, [todayKey]);

  const log = (key: string) => {
    try {
      const existing = JSON.parse(localStorage.getItem(todayKey) || "{}");
      localStorage.setItem(todayKey, JSON.stringify({ ...existing, pulse: key, at: Date.now() }));
    } catch {}
    setLogged(key);
    toast("Held.");
  };

  return (
    <div className="rounded-[16px] bg-card px-4 py-3.5" style={{ boxShadow: "var(--shadow-soft)" }}>
      <p className="font-hand text-[12px] text-muted-foreground mb-2">how are you arriving?</p>
      <div className="flex items-center gap-3">
        {DOTS.map((d) => {
          const active = logged === d.key;
          return (
            <button
              key={d.key}
              onClick={() => log(d.key)}
              className="flex items-center gap-2 min-h-[44px] px-2 -mx-2 rounded-full transition-opacity active:opacity-60"
              aria-label={d.label}
            >
              <motion.span
                animate={{ scale: active ? 1.3 : 1, opacity: active ? 1 : 0.55 }}
                className="block rounded-full"
                style={{ width: 14, height: 14, backgroundColor: d.color }}
              />
              <span className={`font-body text-[11px] ${active ? "text-foreground" : "text-muted-foreground/70"}`}>
                {d.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
