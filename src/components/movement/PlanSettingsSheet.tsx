/**
 * Plan Settings — bottom-sheet editor for the user's Movement preferences.
 * Mirrors values into `profiles` so they survive across devices, matching the
 * "single source of truth" pattern used by My Week.
 */
import { useEffect, useState } from "react";
import { X, Save } from "lucide-react";
import BottomSheet from "@/components/BottomSheet";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { haptic } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const EQUIPMENT_OPTIONS = [
  { id: "none", label: "Bodyweight only" },
  { id: "home-some", label: "At home — bands + dumbbells" },
  { id: "gym", label: "Full gym" },
];

const FOCUS_OPTIONS = [
  { id: "glutes", label: "Glutes" },
  { id: "core", label: "Core" },
  { id: "upper-body", label: "Upper body" },
  { id: "legs", label: "Legs" },
  { id: "back", label: "Back & posture" },
  { id: "mobility", label: "Mobility" },
  { id: "nervous-system", label: "Nervous system" },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function PlanSettingsSheet({ open, onClose }: Props) {
  const [days, setDays] = useState<number>(3);
  const [equipment, setEquipment] = useState<string>("none");
  const [focus, setFocus] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Hydrate when opened
  useEffect(() => {
    if (!open) return;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("training_days_per_week, equipment_preference, body_focus_areas")
        .eq("user_id", user.id)
        .maybeSingle();
      const d = data as any;
      if (d?.training_days_per_week) setDays(d.training_days_per_week);
      if (d?.equipment_preference) setEquipment(d.equipment_preference);
      if (Array.isArray(d?.body_focus_areas)) setFocus(d.body_focus_areas);
      // Fall back to legacy localStorage body goals
      if (!d?.body_focus_areas?.length) {
        try {
          const raw = localStorage.getItem("signal_body_goals");
          if (raw) setFocus(JSON.parse(raw));
        } catch {}
      }
    })();
  }, [open]);

  const toggleFocus = (id: string) => {
    haptic("light");
    setFocus(f => f.includes(id) ? f.filter(x => x !== id) : [...f, id]);
  };

  const save = async () => {
    if (saving) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }
    const { error } = await supabase
      .from("profiles")
      .upsert({
        user_id: user.id,
        training_days_per_week: days,
        equipment_preference: equipment,
        body_focus_areas: focus,
      } as any, { onConflict: "user_id" });
    setSaving(false);
    if (error) {
      toast.error("That didn't land — try again in a moment.");
      return;
    }
    // Keep legacy localStorage in sync so existing readers (Nutrition, etc) see it.
    try { localStorage.setItem("signal_body_goals", JSON.stringify(focus)); } catch {}
    toast.success("Held.");
    onClose();
  };

  return (
    <BottomSheet isOpen={open} onClose={onClose}>
      <div className="px-5 pt-5 pb-2 flex items-center justify-between">
        <h2 className="font-display text-xl font-extrabold text-foreground">Plan settings</h2>
        <button onClick={onClose} className="text-muted-foreground"><X className="h-5 w-5" /></button>
      </div>
      <div className="px-5">
      <div className="space-y-6 pb-2">
        <p className="font-editorial text-sm italic text-muted-foreground">
          Shape your weeks. We'll thread these through every Movement page.
        </p>

        {/* Days per week */}
        <section className="space-y-2">
          <p className="font-hand text-xs uppercase tracking-[0.18em] text-primary">Days a week</p>
          <div className="flex gap-1.5">
            {[2,3,4,5,6].map(n => (
              <button
                key={n}
                onClick={() => { haptic("light"); setDays(n); }}
                className={cn(
                  "flex-1 min-h-[44px] rounded-xl font-display text-base font-bold transition-all",
                  days === n
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
                )}
              >{n}</button>
            ))}
          </div>
        </section>

        {/* Equipment */}
        <section className="space-y-2">
          <p className="font-hand text-xs uppercase tracking-[0.18em] text-primary">Equipment</p>
          <div className="space-y-1.5">
            {EQUIPMENT_OPTIONS.map(o => (
              <button
                key={o.id}
                onClick={() => { haptic("light"); setEquipment(o.id); }}
                className={cn(
                  "w-full min-h-[44px] rounded-xl px-4 text-left font-body text-sm transition-all",
                  equipment === o.id
                    ? "bg-primary/10 border border-primary text-foreground"
                    : "bg-secondary border border-transparent text-muted-foreground"
                )}
              >{o.label}</button>
            ))}
          </div>
        </section>

        {/* Body focus */}
        <section className="space-y-2">
          <p className="font-hand text-xs uppercase tracking-[0.18em] text-primary">Where to send the love</p>
          <div className="flex flex-wrap gap-1.5">
            {FOCUS_OPTIONS.map(o => {
              const on = focus.includes(o.id);
              return (
                <button
                  key={o.id}
                  onClick={() => toggleFocus(o.id)}
                  className={cn(
                    "rounded-full px-3.5 py-2 min-h-[40px] font-body text-xs font-medium transition-all",
                    on
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground"
                  )}
                >{o.label}</button>
              );
            })}
          </div>
          <p className="font-body text-[11px] text-muted-foreground/70">Pick as many as you like — or none.</p>
        </section>

        <div className="flex gap-2 pt-2">
          <button
            onClick={onClose}
            className="flex-1 h-11 rounded-full bg-secondary text-foreground font-body text-sm font-semibold inline-flex items-center justify-center gap-2"
          >
            <X className="h-4 w-4" /> Close
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="flex-1 h-11 rounded-full bg-primary text-primary-foreground font-body text-sm font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {saving ? <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" /> : <><Save className="h-4 w-4" /> Save</>}
          </button>
        </div>
      </div>
      </div>
    </BottomSheet>
  );
}
