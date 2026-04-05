import { motion } from "framer-motion";
import { Clock, Calendar, Dumbbell, Target, ChevronRight, Zap, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TrainingProgram, ProgramPhase } from "@/hooks/useTrainingProgram";

interface Props {
  program: TrainingProgram;
  phases: ProgramPhase[];
  onStartProgram: () => void;
  onChangeGoal: () => void;
}

export default function ProgramOverview({ program, phases, onStartProgram, onChangeGoal }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Program hero */}
      <div className="rounded-2xl bg-primary/5 border border-primary/10 p-6 space-y-4">
        <div className="space-y-2">
          <p className="font-mono text-xs text-primary uppercase tracking-[0.15em]">Your program</p>
          <h2 className="font-display text-2xl font-extrabold text-foreground leading-tight">
            {program.title}
          </h2>
        </div>

        {program.description && (
          <p className="font-body text-sm text-muted-foreground leading-relaxed">
            {program.description}
          </p>
        )}

        {/* Stats row */}
        <div className="flex flex-wrap gap-4 pt-2">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="font-body text-sm text-foreground">{program.duration_weeks} weeks</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-primary" />
            <span className="font-body text-sm text-foreground">{program.sessions_per_week} days/week</span>
          </div>
          {program.intensity_level && (
            <div className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-primary" />
              <span className="font-body text-sm text-foreground">Intensity {program.intensity_level}/10</span>
            </div>
          )}
        </div>

        {/* Equipment */}
        {program.equipment_needed && program.equipment_needed.length > 0 && (
          <div className="pt-2">
            <p className="font-body text-xs text-muted-foreground mb-1.5 uppercase tracking-wider">Equipment</p>
            <div className="flex flex-wrap gap-1.5">
              {program.equipment_needed.map((eq) => (
                <span
                  key={eq}
                  className="inline-flex items-center gap-1 rounded-full bg-muted/30 px-2.5 py-1 font-body text-xs text-foreground"
                >
                  <Dumbbell className="h-3 w-3 text-muted-foreground" />
                  {eq.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          </div>
        )}

        {program.who_its_for && (
          <div className="pt-2 border-t border-primary/10">
            <p className="font-body text-xs text-muted-foreground mb-1 uppercase tracking-wider">Who it's for</p>
            <p className="font-body text-sm text-foreground leading-relaxed">{program.who_its_for}</p>
          </div>
        )}
      </div>

      {/* Phase overview */}
      {phases.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-display text-lg font-bold text-foreground">Program phases</h3>
          <div className="space-y-2">
            {phases.map((phase, i) => {
              const weekRange = phase.week_start && phase.week_end
                ? `Weeks ${phase.week_start}–${phase.week_end}`
                : null;
              return (
                <motion.div
                  key={phase.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="rounded-xl bg-card border border-border p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <span className="font-display text-sm font-bold text-primary">{phase.phase_number}</span>
                      </div>
                      <div>
                        <h4 className="font-display text-sm font-bold text-foreground">{phase.title}</h4>
                        <p className="font-body text-xs text-muted-foreground">
                          {weekRange}
                          {phase.rpe_target_min && phase.rpe_target_max && ` · RPE ${phase.rpe_target_min}–${phase.rpe_target_max}`}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                  {phase.phase_goal && (
                    <p className="font-body text-xs text-muted-foreground mt-2 leading-relaxed pl-11">
                      {phase.phase_goal}
                    </p>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Evidence basis */}
      {program.evidence_basis && (
        <div className="flex items-start gap-2 px-1">
          <BookOpen className="h-3.5 w-3.5 text-muted-foreground/50 mt-0.5 shrink-0" />
          <p className="font-body text-[11px] text-muted-foreground/60 italic leading-relaxed">
            {program.evidence_basis}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3 pt-2">
        <Button
          onClick={onStartProgram}
          className="w-full h-12 rounded-full font-display text-base font-semibold gap-2"
        >
          <Target className="h-4 w-4" />
          Start program
        </Button>
        <button
          onClick={onChangeGoal}
          className="w-full text-center font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Change goal
        </button>
      </div>
    </motion.div>
  );
}
