import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Lightbulb, Clock, BookOpen } from "lucide-react";
import type { CourseLesson } from "@/data/signal-couples-course";
import ActivityRenderer from "./ActivityRenderer";
import LessonMilestone from "./LessonMilestone";
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
  const [showMilestone, setShowMilestone] = useState(false);

  const activity = lesson.activities[activityIdx];
  const totalActivities = lesson.activities.length;
  const allDone = completed.size === totalActivities;

  const handleActivityComplete = (activityId: string, response: any) => {
    setCompleted(prev => new Set(prev).add(activityId));
    const act = lesson.activities.find(a => a.id === activityId);
    onSaveProgress(activityId, response, act?.saveToVault || false);
  };

  const next = () => {
    haptic("light");
    if (activityIdx < totalActivities - 1) setActivityIdx(prev => prev + 1);
  };

  const prev = () => {
    haptic("light");
    if (activityIdx > 0) setActivityIdx(prev => prev - 1);
  };

  const handleFinish = () => {
    haptic("medium");
    setShowMilestone(true);
  };

  const handleMilestoneContinue = () => {
    setShowMilestone(false);
    onComplete(lesson.id);
  };

  // Find a key insight: first open_response or carousel activity title, or lesson description
  const keyInsight = (lesson as any).keyInsight
    || lesson.activities.find(a => a.type === "open_response" || a.type === "carousel")?.title
    || lesson.description;

  return (
    <>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-full border border-border hover:bg-accent min-w-[36px] min-h-[36px] flex items-center justify-center"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="font-display text-base font-bold text-foreground leading-tight">{lesson.title}</h2>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="font-body text-[10px] text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" /> ~{lesson.estimatedMinutes} min
              </span>
              <span className="font-body text-[10px] text-muted-foreground flex items-center gap-1">
                <BookOpen className="h-3 w-3" /> {totalActivities} activities
              </span>
            </div>
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex items-center gap-1.5 justify-center">
          {lesson.activities.map((act, i) => {
            const isDone = completed.has(act.id);
            const isCurrent = i === activityIdx;
            return (
              <button
                key={act.id}
                onClick={() => { haptic("light"); setActivityIdx(i); }}
                className="transition-all"
              >
                <div className={`rounded-full transition-all ${
                  isDone ? "w-4 h-2.5 bg-primary"
                  : isCurrent ? "w-4 h-2.5 bg-primary/40"
                  : "w-2.5 h-2.5 bg-border hover:bg-border/80"
                }`} />
              </button>
            );
          })}
        </div>

        {/* Activity counter */}
        <div className="flex items-center justify-between px-1">
          <span className="font-body text-xs text-muted-foreground">
            Activity {activityIdx + 1} of {totalActivities}
          </span>
          <span className="font-body text-xs font-bold text-primary">
            {Math.round((completed.size / totalActivities) * 100)}% done
          </span>
        </div>

        {/* Activity */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.22 }}
            className="space-y-4"
          >
            {/* Activity header */}
            <div className="space-y-1.5">
              <div className="flex items-start gap-2">
                {completed.has(activity.id) && (
                  <span className="text-primary mt-0.5 shrink-0">✓</span>
                )}
                <h3 className="font-display text-lg font-bold text-foreground leading-snug">{activity.title}</h3>
              </div>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">{activity.instruction}</p>
            </div>

            <ActivityRenderer activity={activity} onComplete={handleActivityComplete} />

            {/* Tip */}
            {activity.tip && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-start gap-2 p-3.5 rounded-2xl bg-amber-500/8 border border-amber-500/20"
              >
                <Lightbulb className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                <p className="font-body text-xs text-foreground/80 leading-relaxed">{activity.tip}</p>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={prev}
            disabled={activityIdx === 0}
            className="flex items-center gap-1 px-4 py-2.5 rounded-xl border border-border font-body text-xs disabled:opacity-30 hover:bg-accent transition-colors min-h-[44px]"
          >
            <ArrowLeft className="h-3 w-3" /> Previous
          </button>

          {activityIdx < totalActivities - 1 ? (
            <button
              onClick={next}
              className={`flex items-center gap-1 px-5 py-2.5 rounded-xl font-body text-xs font-bold transition-all min-h-[44px] ${
                completed.has(activity.id)
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "border border-border text-muted-foreground"
              }`}
            >
              Next <ArrowRight className="h-3 w-3" />
            </button>
          ) : allDone ? (
            <button
              onClick={handleFinish}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-body text-xs font-bold shadow-sm min-h-[44px]"
            >
              Complete lesson ✓
            </button>
          ) : (
            <span className="font-body text-xs text-muted-foreground px-4">
              Complete all to finish
            </span>
          )}
        </div>
      </div>

      {/* Completion milestone overlay */}
      {showMilestone && (
        <LessonMilestone
          lessonTitle={lesson.title}
          insight={keyInsight}
          xp={lesson.activities.length * 10}
          onContinue={handleMilestoneContinue}
        />
      )}
    </>
  );
}
