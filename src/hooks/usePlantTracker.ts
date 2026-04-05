import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getISOWeek } from "@/lib/weekly-planner";

function getCurrentWeekKey(): string {
  return getISOWeek(new Date());
}

export function usePlantTracker() {
  const [plants, setPlants] = useState<string[]>([]);
  const [weekKey] = useState(getCurrentWeekKey);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Fallback to localStorage for non-auth users
        try {
          const stored = JSON.parse(localStorage.getItem(`plant_log_${weekKey}`) || "[]");
          setPlants(stored);
        } catch { /* empty */ }
        return;
      }
      const { data } = await supabase
        .from("plant_diversity_log")
        .select("plants")
        .eq("user_id", user.id)
        .eq("week_key", weekKey)
        .maybeSingle();
      if (data?.plants) setPlants(data.plants);
    };
    load();
  }, [weekKey]);

  const addPlant = useCallback(async (plantName: string) => {
    const trimmed = plantName.trim().toLowerCase();
    if (!trimmed || plants.includes(trimmed)) return;

    const updated = [...plants, trimmed];
    setPlants(updated);

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("plant_diversity_log")
        .upsert({
          user_id: user.id,
          week_key: weekKey,
          plants: updated,
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id,week_key" });
    } else {
      localStorage.setItem(`plant_log_${weekKey}`, JSON.stringify(updated));
    }
  }, [plants, weekKey]);

  const count = plants.length;

  const message = count >= 30
    ? "Thriving gut this week 🌿"
    : count >= 21
    ? "Almost there — one more day of variety"
    : count >= 11
    ? "Good diversity — keep going"
    : "Every plant counts — keep building";

  return { plants, count, message, addPlant, weekKey };
}
