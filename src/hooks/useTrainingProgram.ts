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
  sessions_per_week: number;
  intensity_level: number | null;
  equipment_needed: string[] | null;
  slug: string | null;
  phase_structure: string | null;
  evidence_basis: string | null;
  tags: string[] | null;
}

export interface ProgramPhase {
  id: string;
  program_id: string;
  phase_number: number;
  title: string;
  week_start: number | null;
  week_end: number | null;
  rpe_target_min: number | null;
  rpe_target_max: number | null;
  phase_goal: string | null;
}

export interface WorkoutTemplate {
  id: string;
  phase_id: string;
  program_id: string | null;
  session_number: number | null;
  title: string;
  day_label: string | null;
  session_type: string | null;
  warmup_notes: string | null;
  cooldown_notes: string | null;
  session_notes: string | null;
  estimated_duration_mins: number;
}

export interface WorkoutExercise {
  id: string;
  workout_id: string;
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
    equipment: string[] | null;
    instructions: string | null;
    cues: string[] | null;
    category: string | null;
    primary_muscles: string[] | null;
    secondary_muscles: string[] | null;
    difficulty: number | null;
    is_low_impact: boolean | null;
    is_somatic: boolean | null;
    evidence_source: string | null;
    illustration_url: string | null;
    gif_url: string | null;
  };
}

export function useTrainingProgram() {
  const { user } = useAuth();
  const [goalCategoryId, setGoalCategoryId] = useState<string | null>(null);
  const [trainingProgramId, setTrainingProgramId] = useState<string | null>(null);
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

  // Fetch user's selected goal + program
  useEffect(() => {
    if (!user) { setLoading(false); return; }
    supabase
      .from("profiles")
      .select("goal_category_id, training_program_id")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setGoalCategoryId((data as any)?.goal_category_id ?? null);
        setTrainingProgramId((data as any)?.training_program_id ?? null);
        setLoading(false);
      });
  }, [user]);

  // Fetch program — prefer explicit program_id, fallback to first program for goal
  useEffect(() => {
    if (!goalCategoryId && !trainingProgramId) { setProgram(null); setPhases([]); return; }

    const query = trainingProgramId
      ? supabase.from("training_programs").select("*").eq("id", trainingProgramId).maybeSingle()
      : supabase.from("training_programs").select("*").eq("goal_category_id", goalCategoryId!).limit(1).maybeSingle();

    query.then(({ data }) => {
      if (data) {
        const prog = data as unknown as TrainingProgram;
        setProgram(prog);
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
  }, [goalCategoryId, trainingProgramId]);

  const selectGoal = useCallback(async (goalId: string, programId?: string) => {
    if (!user) return;
    setGoalCategoryId(goalId);
    setTrainingProgramId(programId ?? null);
    await supabase
      .from("profiles")
      .upsert(
        { user_id: user.id, goal_category_id: goalId, training_program_id: programId ?? null } as any,
        { onConflict: "user_id" }
      );
  }, [user]);

  const fetchWorkouts = useCallback(async (phaseId: string): Promise<WorkoutTemplate[]> => {
    const { data } = await supabase
      .from("workout_templates")
      .select("*")
      .eq("phase_id", phaseId)
      .order("session_number");
    return (data as unknown as WorkoutTemplate[]) || [];
  }, []);

  const fetchWorkoutExercises = useCallback(async (templateId: string): Promise<WorkoutExercise[]> => {
    const { data } = await supabase
      .from("workout_exercises")
      .select(`*, exercise:exercises(*)`)
      .eq("workout_id", templateId)
      .order("order_index");
    return (data as unknown as WorkoutExercise[]) || [];
  }, []);

  /**
   * Returns the user's next workout in the active program based on their
   * cumulative `workout_logs` history. Walks every phase in order, then every
   * workout (by session_number) within each phase. The next workout is the
   * first one that does not yet appear in completed logs (counting duplicates
   * so repeating a session moves you forward, not back to D1).
   *
   * Falls back to the very first workout if there are no logs yet.
   * Returns `null` once the entire programme has been completed.
   */
  const getNextProgramWorkout = useCallback(async (): Promise<{
    workout: WorkoutTemplate;
    phase: ProgramPhase;
    completedCount: number;
    totalCount: number;
  } | null> => {
    if (!program || phases.length === 0) return null;

    // Pull every workout in the programme in canonical order (phase, then session).
    const allWorkouts: { workout: WorkoutTemplate; phase: ProgramPhase }[] = [];
    for (const ph of phases) {
      const wts = await fetchWorkouts(ph.id);
      for (const wt of wts) allWorkouts.push({ workout: wt, phase: ph });
    }
    if (allWorkouts.length === 0) return null;

    // Count how many sessions for THIS programme the user has completed.
    const templateIds = allWorkouts.map(x => x.workout.id);
    let completedCount = 0;
    if (user) {
      const { data } = await supabase
        .from("workout_logs")
        .select("workout_template_id")
        .eq("user_id", user.id)
        .eq("completed", true)
        .in("workout_template_id", templateIds);
      completedCount = data?.length || 0;
    }

    const totalCount = allWorkouts.length;
    if (completedCount >= totalCount) {
      // Programme finished — surface the final session so user can repeat or move on.
      const last = allWorkouts[totalCount - 1];
      return { workout: last.workout, phase: last.phase, completedCount, totalCount };
    }

    const next = allWorkouts[completedCount];
    return { workout: next.workout, phase: next.phase, completedCount, totalCount };
  }, [program, phases, fetchWorkouts, user]);

  return {
    goals,
    goalCategoryId,
    program,
    phases,
    loading,
    selectGoal,
    fetchWorkouts,
    fetchWorkoutExercises,
    getNextProgramWorkout,
  };
}
