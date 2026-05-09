import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, Zap, Home, Dumbbell, Building2, Target, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { haptic } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface ProgramRow {
  id: string;
  goal_category_id: string;
  title: string;
  description: string | null;
  who_its_for: string | null;
  duration_weeks: number;
  sessions_per_week: number;
  intensity_level: number | null;
  equipment_needed: string[] | null;
  tags: string[] | null;
}

interface Props {
  selectedProgramId: string | null;
  onSelectProgram: (goalCategoryId: string, programId: string) => void;
}

type LocationFilter = "all" | "home" | "gym";
type EquipmentFilter = "all" | "none" | "some";

const GYM_EQUIPMENT = new Set([
  "barbell", "cable_machine", "cable machine", "cables", "bench", "squat_rack", "squat rack",
  "leg_press_machine", "leg press machine", "hip_abduction_machine", "hip abduction machine",
  "rack", "reformer",
]);

function isGym(eq: string[] | null): boolean {
  if (!eq) return false;
  return eq.some(e => GYM_EQUIPMENT.has(e.toLowerCase()));
}

function hasEquipment(eq: string[] | null): boolean {
  if (!eq || eq.length === 0) return false;
  const lc = eq.map(e => e.toLowerCase());
  if (lc.length === 1 && (lc[0] === "none" || lc[0] === "bodyweight")) return false;
  return true;
}

export default function ProgramLibrary({ selectedProgramId, onSelectProgram }: Props) {
  const [programs, setPrograms] = useState<ProgramRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [locFilter, setLocFilter] = useState<LocationFilter>("all");
  const [equipFilter, setEquipFilter] = useState<EquipmentFilter>("all");

  useEffect(() => {
    supabase
      .from("training_programs")
      .select("id, goal_category_id, title, description, who_its_for, duration_weeks, sessions_per_week, intensity_level, equipment_needed, tags")
      .order("title")
      .then(({ data }) => {
        if (data) setPrograms(data as ProgramRow[]);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    return programs.filter(p => {
      const gym = isGym(p.equipment_needed);
      const some = hasEquipment(p.equipment_needed);

      if (locFilter === "home" && gym) return false;
      if (locFilter === "gym" && !gym) return false;

      if (equipFilter === "none" && some) return false;
      if (equipFilter === "some" && !some) return false;

      return true;
    });
  }, [programs, locFilter, equipFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const locOptions: { id: LocationFilter; label: string; icon: typeof Home }[] = [
    { id: "all", label: "All", icon: Target },
    { id: "home", label: "At home", icon: Home },
    { id: "gym", label: "Gym", icon: Building2 },
  ];

  const equipOptions: { id: EquipmentFilter; label: string; icon: typeof Home }[] = [
    { id: "all", label: "Any equipment", icon: Target },
    { id: "none", label: "No equipment", icon: Home },
    { id: "some", label: "Some equipment", icon: Dumbbell },
  ];

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <h2 className="font-display text-2xl font-extrabold text-foreground">All training programs</h2>
        <p className="font-body text-sm text-muted-foreground">
          Browse the full library. Tap a program to make it your active plan.
        </p>
      </div>

      {/* Filters */}
      <div className="space-y-2">
        <div className="flex gap-1.5 flex-wrap">
          {locOptions.map(opt => {
            const Icon = opt.icon;
            const active = locFilter === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => { haptic("light"); setLocFilter(opt.id); }}
                className={cn(
                  "rounded-full px-3.5 py-2 font-body text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 min-h-[44px]",
                  active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                )}
              >
                <Icon className="h-3 w-3" />
                {opt.label}
              </button>
            );
          })}
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {equipOptions.map(opt => {
            const Icon = opt.icon;
            const active = equipFilter === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => { haptic("light"); setEquipFilter(opt.id); }}
                className={cn(
                  "rounded-full px-3.5 py-2 font-body text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 min-h-[44px]",
                  active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                )}
              >
                <Icon className="h-3 w-3" />
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Count */}
      <p className="font-body text-xs text-muted-foreground">
        {filtered.length} of {programs.length} programs
      </p>

      {/* Grid: 2 cols mobile, 4 cols desktop */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="font-body text-sm text-muted-foreground">No programs match these filters.</p>
          <button
            onClick={() => { setLocFilter("all"); setEquipFilter("all"); }}
            className="mt-2 font-body text-sm text-primary font-medium"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((p, i) => {
            const selected = selectedProgramId === p.id;
            const gym = isGym(p.equipment_needed);
            const some = hasEquipment(p.equipment_needed);
            return (
              <motion.button
                key={p.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.02, 0.3), duration: 0.25 }}
                onClick={() => { haptic("medium"); onSelectProgram(p.goal_category_id, p.id); }}
                className={cn(
                  "rounded-2xl border p-3 text-left transition-all flex flex-col gap-2 min-h-[44px]",
                  selected
                    ? "bg-primary/5 border-primary ring-1 ring-primary/30 shadow-sm"
                    : "bg-card border-border hover:bg-card/80"
                )}
              >
                {/* Header chip */}
                <div className="flex items-center gap-1">
                  {gym ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted/40 px-1.5 py-0.5 font-body text-[9px] uppercase tracking-wider text-muted-foreground">
                      <Building2 className="h-2.5 w-2.5" /> Gym
                    </span>
                  ) : some ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted/40 px-1.5 py-0.5 font-body text-[9px] uppercase tracking-wider text-muted-foreground">
                      <Dumbbell className="h-2.5 w-2.5" /> Some kit
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted/40 px-1.5 py-0.5 font-body text-[9px] uppercase tracking-wider text-muted-foreground">
                      <Home className="h-2.5 w-2.5" /> No kit
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="font-display text-sm font-bold text-foreground leading-tight line-clamp-2">
                  {p.title}
                </h3>

                {/* Description */}
                {p.description && (
                  <p className="font-body text-[11px] text-muted-foreground leading-snug line-clamp-3 flex-1">
                    {p.description}
                  </p>
                )}

                {/* Stats */}
                <div className="flex flex-wrap gap-x-2 gap-y-1 mt-auto">
                  <span className="inline-flex items-center gap-1 font-body text-[10px] text-muted-foreground">
                    <Calendar className="h-2.5 w-2.5" />
                    {p.duration_weeks}w
                  </span>
                  <span className="inline-flex items-center gap-1 font-body text-[10px] text-muted-foreground">
                    <Clock className="h-2.5 w-2.5" />
                    {p.sessions_per_week}d/wk
                  </span>
                  {p.intensity_level && (
                    <span className="inline-flex items-center gap-1 font-body text-[10px] text-muted-foreground">
                      <Zap className="h-2.5 w-2.5" />
                      {p.intensity_level}/10
                    </span>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
}
