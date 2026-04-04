import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface GoalCategory {
  id: string;
  slug: string;
  label: string;
  description: string | null;
  intensity_min: number;
  intensity_max: number;
  hormonal_notes: string | null;
  sort_order: number;
}

export interface TrainingProgram {
  id: string;
  goal_category_id: string;
  title: string;
  description: string | null;
  who_its_for: string | null;
  duration_weeks: number;
  days_per_week: number;
  intensity_level: string | null;
  equipment: string[] | null;
}

export interface ProgramPhase {
  id: string;
  program_id: string;
  phase_number: number;
  name: string;
  duration_weeks: number;
  rpe_min: number | null;
  rpe_max: number | null;
  focus: string | null;
}

export interface WorkoutTemplate {
  id: string;
  phase_id: string;
  day_label: string;
  session_name: string;
  warmup_notes: string | null;
  cooldown_notes: string | null;
  session_notes: string | null;
  estimated_duration_min: number;
  sort_order: number;
}

export interface WorkoutExercise {
  id: string;
  workout_template_id: string;
  exercise_id: string;
  order_index: number;
  sets: number | null;
  reps: string | null;
  rest_seconds: number | null;
  rpe_target: number | null;
  load_guidance: string | null;
  progression_notes: string | null;
  is_superset: boolean;
  superset_group: string | null;
  exercise?: {
    id: string;
    name: string;
    body_part: string | null;
    target: string | null;
    equipment: string | null;
    instructions: any;
    cues: any;
    category: string | null;
    primary_muscles: any;
    difficulty: number | null;
    is_low_impact: boolean | null;
    is_somatic: boolean | null;
  };
}

export function useTrainingProgram() {
  const { user } = useAuth();
  const [goalCategoryId, setGoalCategoryId] = useState<string | null>(null);
  const [goals, setGoals] = useState<GoalCategory[]>([]);
  const [program, setProgram] = useState<TrainingProgram | null>(null);
  const [phases, setPhases] = useState<ProgramPhase[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch goals
  useEffect(() => {
    supabase
      .from("goal_categories")
      .select("*")
      .order("sort_order")
      .then(({ data }) => {
        if (data) setGoals(data as unknown as GoalCategory[]);
      });
  }, []);

  // Fetch user's selected goal
  useEffect(() => {
    if (!user) { setLoading(false); return; }
    supabase
      .from("profiles")
      .select("goal_category_id")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setGoalCategoryId((data as any)?.goal_category_id ?? null);
        setLoading(false);
      });
  }, [user]);

  // Fetch program when goal changes
  useEffect(() => {
    if (!goalCategoryId) { setProgram(null); setPhases([]); return; }
    
    supabase
      .from("training_programs")
      .select("*")
      .eq("goal_category_id", goalCategoryId)
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          const prog = data as unknown as TrainingProgram;
          setProgram(prog);
          // Fetch phases
          supabase
            .from("program_phases")
            .select("*")
            .eq("program_id", prog.id)
            .order("phase_number")
            .then(({ data: phaseData }) => {
              if (phaseData) setPhases(phaseData as unknown as ProgramPhase[]);
            });
        } else {
          setProgram(null);
          setPhases([]);
        }
      });
  }, [goalCategoryId]);

  const selectGoal = useCallback(async (goalId: string) => {
    if (!user) return;
    setGoalCategoryId(goalId);
    await supabase
      .from("profiles")
      .upsert({ user_id: user.id, goal_category_id: goalId } as any, { onConflict: "user_id" });
  }, [user]);

  // Fetch workouts for a specific phase
  const fetchWorkouts = useCallback(async (phaseId: string): Promise<WorkoutTemplate[]> => {
    const { data } = await supabase
      .from("workout_templates")
      .select("*")
      .eq("phase_id", phaseId)
      .order("sort_order");
    return (data as unknown as WorkoutTemplate[]) || [];
  }, []);

  // Fetch exercises for a specific workout
  const fetchWorkoutExercises = useCallback(async (templateId: string): Promise<WorkoutExercise[]> => {
    const { data } = await supabase
      .from("workout_exercises")
      .select("*, exercise:exercises(*)")
      .eq("workout_template_id", templateId)
      .order("order_index");
    return (data as unknown as WorkoutExercise[]) || [];
  }, []);

  return {
    goals,
    goalCategoryId,
    program,
    phases,
    loading,
    selectGoal,
    fetchWorkouts,
    fetchWorkoutExercises,
  };
}
