import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { CycleMode } from "@/components/cycle/CycleModeSelector";

export interface ProfileData {
  displayName: string | null;
  onboardingComplete: boolean | null;
  referralCode: string | null;
  cycleMode: CycleMode;
  avatarUrl: string | null;
  suburb: string | null;
  fitnessLevel: string | null;
  // Extended onboarding fields
  dateOfBirth: string | null;
  weightKg: number | null;
  heightCm: number | null;
  goalWeightKg: number | null;
  movementGoals: string[];
  dietaryPreferences: string[];
  dietaryDislikes: string[];
  calorieTarget: number | null;
  proteinTargetG: number | null;
  carbTargetG: number | null;
  fatTargetG: number | null;
  lastPeriodDate: string | null;
  cycleStatus: string | null;
  mealPrepDay: string | null;
  equipmentPreference: string | null;
}

export function useProfile() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [cycleMode, setCycleModeState] = useState<CycleMode>("cycling");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [suburb, setSuburb] = useState<string | null>(null);
  const [fitnessLevel, setFitnessLevel] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Extended fields
  const [dateOfBirth, setDateOfBirth] = useState<string | null>(null);
  const [weightKg, setWeightKg] = useState<number | null>(null);
  const [heightCm, setHeightCm] = useState<number | null>(null);
  const [goalWeightKg, setGoalWeightKg] = useState<number | null>(null);
  const [movementGoals, setMovementGoals] = useState<string[]>([]);
  const [dietaryPreferences, setDietaryPreferences] = useState<string[]>([]);
  const [dietaryDislikes, setDietaryDislikes] = useState<string[]>([]);
  const [calorieTarget, setCalorieTarget] = useState<number | null>(null);
  const [proteinTargetG, setProteinTargetG] = useState<number | null>(null);
  const [carbTargetG, setCarbTargetG] = useState<number | null>(null);
  const [fatTargetG, setFatTargetG] = useState<number | null>(null);
  const [lastPeriodDate, setLastPeriodDate] = useState<string | null>(null);
  const [cycleStatus, setCycleStatus] = useState<string | null>(null);
  const [mealPrepDay, setMealPrepDay] = useState<string | null>(null);
  const [equipmentPreference, setEquipmentPreference] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setDisplayName(null);
      setOnboardingComplete(null);
      setReferralCode(null);
      setCycleModeState("cycling");
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("profiles")
      .select(`
        display_name, onboarding_complete, referral_code, cycle_mode,
        avatar_url, suburb, fitness_level,
        date_of_birth, weight_kg, height_cm, goal_weight_kg,
        movement_goals, dietary_preferences, dietary_dislikes,
        calorie_target, protein_target_g, carb_target_g, fat_target_g,
        last_period_date, cycle_status, meal_prep_day, equipment_preference
      `)
      .eq("user_id", user.id)
      .maybeSingle();

    const d = data as any;
    setDisplayName(d?.display_name ?? null);
    setOnboardingComplete(d?.onboarding_complete ?? false);
    setReferralCode(d?.referral_code ?? null);
    setCycleModeState((d?.cycle_mode as CycleMode) ?? "cycling");
    setAvatarUrl(d?.avatar_url ?? null);
    setSuburb(d?.suburb ?? null);
    setFitnessLevel(d?.fitness_level ?? null);

    setDateOfBirth(d?.date_of_birth ?? null);
    setWeightKg(d?.weight_kg ?? null);
    setHeightCm(d?.height_cm ?? null);
    setGoalWeightKg(d?.goal_weight_kg ?? null);
    setMovementGoals(d?.movement_goals ?? []);
    setDietaryPreferences(d?.dietary_preferences ?? []);
    setDietaryDislikes(d?.dietary_dislikes ?? []);
    setCalorieTarget(d?.calorie_target ?? null);
    setProteinTargetG(d?.protein_target_g ?? null);
    setCarbTargetG(d?.carb_target_g ?? null);
    setFatTargetG(d?.fat_target_g ?? null);
    setLastPeriodDate(d?.last_period_date ?? null);
    setCycleStatus(d?.cycle_status ?? null);
    setMealPrepDay(d?.meal_prep_day ?? null);
    setEquipmentPreference(d?.equipment_preference ?? null);

    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateDisplayName = useCallback(
    async (name: string) => {
      if (!user) return;
      const trimmed = name.trim() || null;
      const { error } = await supabase
        .from("profiles")
        .upsert({ user_id: user.id, display_name: trimmed }, { onConflict: "user_id" });
      if (!error) setDisplayName(trimmed);
      return error;
    },
    [user],
  );

  const updateCycleMode = useCallback(
    async (mode: CycleMode) => {
      if (!user) {
        localStorage.setItem("cycleMode", mode);
        setCycleModeState(mode);
        return;
      }
      const { error } = await supabase
        .from("profiles")
        .upsert({ user_id: user.id, cycle_mode: mode } as any, { onConflict: "user_id" });
      if (!error) setCycleModeState(mode);
      return error;
    },
    [user],
  );

  // Load from localStorage for unauthenticated users
  useEffect(() => {
    if (!user) {
      const stored = localStorage.getItem("cycleMode") as CycleMode | null;
      if (stored) setCycleModeState(stored);
    }
  }, [user]);

  return {
    displayName,
    onboardingComplete,
    referralCode,
    cycleMode,
    avatarUrl,
    suburb,
    fitnessLevel,
    loading,
    // Extended fields
    dateOfBirth,
    weightKg,
    heightCm,
    goalWeightKg,
    movementGoals,
    dietaryPreferences,
    dietaryDislikes,
    calorieTarget,
    proteinTargetG,
    carbTargetG,
    fatTargetG,
    lastPeriodDate,
    cycleStatus,
    mealPrepDay,
    equipmentPreference,
    // Methods
    updateDisplayName,
    updateCycleMode,
    refetch: fetchProfile,
  };
}
