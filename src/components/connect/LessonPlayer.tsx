import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, Lightbulb, Clock } from "lucide-react";
import type { CourseLesson } from "@/data/connect-course";
import ActivityRenderer from "./ActivityRenderer";
import { Progress } from "@/components/ui/progress";
import { haptic } from "@/hooks/use-mobile";

interface Props {
  lesson: CourseLesson;
  onComplete: (lessonId: string) => void;
  onBack: () => void;
  onSaveProgress: (activityId: string, response: any, saveToVault: boolean) => void;
}

export default function LessonPlayer({ lesson, onComplete, onBack, onSaveProgress }: Props) {
  const [activityIdx, setActivityIdx] = useState(0);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const activity = lesson.activities[activityIdx];
  const progress = (completed.size / lesson.activities.length) * 100;
  const allDone = completed.size === lesson.activities.length;

  const handleActivityComplete = (activityId: string, response: any) => {
    setCompleted(prev => new Set(prev).add(activityId));
    const act = lesson.activities.find(a => a.id === activityId);
    onSaveProgress(activityId, response, act?.saveToVault || false);
  };

  const next = () => {
    haptic("light");
    if (activityIdx < lesson.activities.length - 1) {
      setActivityIdx(prev => prev + 1);
    }
  };

  const prev = () => {
    haptic("light");
    if (activityIdx > 0) setActivityIdx(prev => prev - 1);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-full border border-border hover:bg-accent">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="font-display text-base font-bold text-foreground truncate">{lesson.title}</h2>
          <div className="flex items-center gap-2 mt-0.5">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="font-body text-xs text-muted-foreground">~{lesson.estimatedMinutes} min</span>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-1">
        <div className="flex justify-between">
          <span className="font-body text-xs text-muted-foreground">Activity {activityIdx + 1} of {lesson.activities.length}</span>
          <span className="font-body text-xs text-primary font-bold">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>

      {/* Activity */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activity.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <h3 className="font-display text-lg font-bold text-foreground">{activity.title}</h3>
            <p className="font-body text-sm text-muted-foreground leading-relaxed">{activity.instruction}</p>
          </div>

          <ActivityRenderer activity={activity} onComplete={handleActivityComplete} />

          {activity.tip && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-accent/30 border border-accent/50">
              <Lightbulb className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <p className="font-body text-xs text-muted-foreground leading-relaxed">{activity.tip}</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        <button onClick={prev} disabled={activityIdx === 0}
          className="flex items-center gap-1 px-4 py-2 rounded-xl border border-border font-body text-xs disabled:opacity-30">
          <ArrowLeft className="h-3 w-3" /> Previous
        </button>
        {activityIdx < lesson.activities.length - 1 ? (
          <button onClick={next}
            className={`flex items-center gap-1 px-4 py-2 rounded-xl font-body text-xs font-bold ${
              completed.has(activity.id) ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground"
            }`}>
            Next <ArrowRight className="h-3 w-3" />
          </button>
        ) : allDone ? (
          <button onClick={() => { haptic("medium"); onComplete(lesson.id); }}
            className="flex items-center gap-1 px-5 py-2 rounded-xl bg-primary text-primary-foreground font-body text-xs font-bold">
            <CheckCircle2 className="h-4 w-4" /> Complete Lesson
          </button>
        ) : (
          <span className="font-body text-xs text-muted-foreground">Complete all activities</span>
        )}
      </div>
    </div>
  );
}
