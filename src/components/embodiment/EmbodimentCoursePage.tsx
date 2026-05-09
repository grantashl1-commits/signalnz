import { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Lock, CheckCircle2, ChevronRight, Clock, ArrowLeft } from "lucide-react";
import { EMBODIMENT_COURSE } from "@/data/embodiment-course";
import type { CourseModule, CourseLesson } from "@/data/connect-course";
import LessonPlayer from "@/components/connect/LessonPlayer";
import { Progress } from "@/components/ui/progress";
import { AtmosphericHero, ContentSection } from "@/components/AtmosphericSection";
import SignalPulse from "@/components/SignalPulse";
import { haptic } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { useFeatureGate } from "@/hooks/useFeatureGate";
import { supabase } from "@/integrations/supabase/client";
import { loadVault, saveVault, type VaultEntry } from "@/lib/journal-store";

const MODULE_COLORS = [
  "from-teal-500/20 to-emerald-400/10",
  "from-violet-500/20 to-purple-400/10",
  "from-amber-500/20 to-orange-400/10",
  "from-sky-500/20 to-blue-400/10",
  "from-rose-500/20 to-pink-400/10",
  "from-fuchsia-500/20 to-pink-400/10",
];

type View = "modules" | "lessons" | "lesson";

export default function EmbodimentCoursePage() {
  const { user } = useAuth();
  const { hasFeatureAccess } = useFeatureGate();
  const hasJournalAccess = hasFeatureAccess("journal_write");
  const [view, setView] = useState<View>("modules");
  const [selectedModule, setSelectedModule] = useState<CourseModule | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<CourseLesson | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [completedActivities, setCompletedActivities] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    (supabase.from("connect_course_progress" as any).select("activity_id, lesson_id, completed")
      .eq("user_id", user.id).eq("completed", true) as any)
      .then(({ data }: { data: any[] | null }) => {
        if (!data) return;
        const acts = new Set(data.map((r: any) => r.activity_id));
        // Filter to only embodiment activities
        const embActs = new Set([...acts].filter(id => id.startsWith("emb-")));
        setCompletedActivities(embActs);
        const lessonDone = new Set<string>();
        EMBODIMENT_COURSE.forEach(m => m.lessons.forEach(l => {
          if (l.activities.every(a => embActs.has(a.id))) lessonDone.add(l.id);
        }));
        setCompletedLessons(lessonDone);
      });
  }, [user]);

  const openModule = (mod: CourseModule) => {
    haptic("medium");
    setSelectedModule(mod);
    setView("lessons");
  };

  const openLesson = (lesson: CourseLesson) => {
    haptic("medium");
    setSelectedLesson(lesson);
    setView("lesson");
  };

  const handleSaveProgress = useCallback(async (activityId: string, response: any, saveToVaultFlag: boolean) => {
    setCompletedActivities(prev => new Set(prev).add(activityId));
    if (!user || !selectedModule || !selectedLesson) return;

    const activity = selectedLesson.activities.find(a => a.id === activityId);

    await (supabase.from("connect_course_progress" as any) as any).upsert({
      user_id: user.id,
      module_id: selectedModule.id,
      lesson_id: selectedLesson.id,
      activity_id: activityId,
      activity_type: activity?.type || "unknown",
      response,
      completed: true,
    }, { onConflict: "user_id,activity_id" });

    if (saveToVaultFlag && hasJournalAccess) {
      const responseText = typeof response === "string" ? response
        : response?.text || response?.answer || JSON.stringify(response);
      const vaultEntry: VaultEntry = {
        id: `embodiment-${activityId}-${Date.now()}`,
        entryId: activityId,
        category: "embodiment-course",
        title: `${selectedModule.title} — ${activity?.title || "Reflection"}`,
        preview: responseText.slice(0, 200),
        date: new Date().toISOString().split("T")[0],
        timestamp: Date.now(),
      };
      const currentVault = loadVault();
      saveVault([vaultEntry, ...currentVault]);

      await supabase.from("vault_entries").upsert({
        id: vaultEntry.id,
        user_id: user.id,
        entry_id: vaultEntry.entryId,
        category: vaultEntry.category,
        title: vaultEntry.title,
        preview: vaultEntry.preview,
        date: vaultEntry.date,
        timestamp: vaultEntry.timestamp,
      } as any);
    }
  }, [user, selectedModule, selectedLesson, hasJournalAccess]);

  const handleLessonComplete = (lessonId: string) => {
    haptic("medium");
    setCompletedLessons(prev => new Set(prev).add(lessonId));
    setView("lessons");
  };

  const getModuleProgress = (mod: CourseModule) => {
    const total = mod.lessons.reduce((sum, l) => sum + l.activities.length, 0);
    const done = mod.lessons.reduce((sum, l) =>
      sum + l.activities.filter(a => completedActivities.has(a.id)).length, 0);
    return total > 0 ? Math.round((done / total) * 100) : 0;
  };

  const totalProgress = useMemo(() => {
    const total = EMBODIMENT_COURSE.reduce((s, m) =>
      s + m.lessons.reduce((s2, l) => s2 + l.activities.length, 0), 0);
    return total > 0 ? Math.round((completedActivities.size / total) * 100) : 0;
  }, [completedActivities]);

  return (
    <div className="relative">
      <AtmosphericHero size="sm">
        <SignalPulse />
        <div className="text-center relative z-10">
          <p className="font-body text-xs uppercase tracking-[0.3em] text-primary-foreground/40 mb-4">embodiment</p>
          <h1 className="font-display text-[2rem] md:text-[2.5rem] font-extrabold text-primary-foreground leading-[1.02]">
            Nervous System Healing
          </h1>
          <p className="font-body text-sm text-primary-foreground/50 mt-2">6 modules · 18 lessons · 70 activities</p>
          {totalProgress > 0 && (
            <div className="mt-4 max-w-[200px] mx-auto">
              <Progress value={totalProgress} className="h-1.5" />
              <p className="font-body text-xs text-primary-foreground/40 mt-1">{totalProgress}% complete</p>
            </div>
          )}
        </div>
      </AtmosphericHero>

      <ContentSection className="px-4 md:px-4 max-w-3xl mx-auto pb-32">
        <AnimatePresence mode="wait">
          {view === "modules" && (
            <motion.div key="modules" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="grid gap-3">
                {EMBODIMENT_COURSE.map((mod, i) => {
                  const progress = getModuleProgress(mod);
                  const isUnlocked = i === 0 || getModuleProgress(EMBODIMENT_COURSE[i - 1]) >= 60;
                  return (
                    <motion.button key={mod.id} onClick={() => isUnlocked && openModule(mod)}
                      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      disabled={!isUnlocked}
                      className={`w-full text-left p-5 rounded-2xl border transition-all ${
                        isUnlocked
                          ? "border-border bg-card hover:border-primary/30 active:scale-[0.99]"
                          : "border-border/50 bg-card/50 opacity-60"
                      }`}>
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${MODULE_COLORS[i]} flex items-center justify-center shrink-0`}>
                          {progress === 100
                            ? <CheckCircle2 className="h-5 w-5 text-primary" />
                            : isUnlocked
                            ? <BookOpen className="h-5 w-5 text-primary" />
                            : <Lock className="h-5 w-5 text-muted-foreground" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-display text-sm font-bold text-foreground">{mod.title}</h3>
                          <p className="font-body text-xs text-muted-foreground mt-1 line-clamp-2">{mod.subtitle}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="font-body text-[10px] text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {mod.estimatedMinutes} min
                            </span>
                            <span className="font-body text-[10px] text-muted-foreground">
                              {mod.lessons.length} lessons
                            </span>
                          </div>
                          {progress > 0 && (
                            <div className="mt-2">
                              <Progress value={progress} className="h-1" />
                            </div>
                          )}
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/40 mt-1 shrink-0" />
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {view === "lessons" && selectedModule && (
            <motion.div key="lessons" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <button onClick={() => { setView("modules"); setSelectedModule(null); }}
                className="flex items-center gap-1 font-body text-xs text-muted-foreground mb-4 hover:text-foreground">
                <ArrowLeft className="h-3 w-3" /> All modules
              </button>
              <div className="mb-5">
                <h2 className="font-display text-xl font-bold text-foreground">{selectedModule.title}</h2>
                <p className="font-body text-sm text-muted-foreground mt-1">{selectedModule.description}</p>
                {selectedModule.sourceBooks && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {selectedModule.sourceBooks.map(s => (
                      <span key={s} className="px-2 py-0.5 rounded-full bg-primary/10 font-body text-[10px] text-primary">{s}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                {selectedModule.lessons.map((lesson, i) => {
                  const done = completedLessons.has(lesson.id);
                  const actDone = lesson.activities.filter(a => completedActivities.has(a.id)).length;
                  return (
                    <motion.button key={lesson.id} onClick={() => openLesson(lesson)}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="w-full text-left p-4 rounded-xl border border-border bg-card hover:border-primary/30 active:scale-[0.99] transition-all">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${done ? "bg-primary/20" : "bg-secondary"}`}>
                          {done
                            ? <CheckCircle2 className="h-4 w-4 text-primary" />
                            : <span className="font-body text-xs font-bold text-muted-foreground">{i + 1}</span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-display text-sm font-bold text-foreground">{lesson.title}</h4>
                          <p className="font-body text-xs text-muted-foreground mt-0.5">{lesson.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="font-body text-[10px] text-muted-foreground">{lesson.activities.length} activities</span>
                            {actDone > 0 && (
                              <span className="font-body text-[10px] text-primary">{actDone}/{lesson.activities.length} done</span>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {view === "lesson" && selectedLesson && (
            <motion.div key="lesson" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <LessonPlayer
                lesson={selectedLesson as any}
                onComplete={handleLessonComplete}
                onBack={() => setView("lessons")}
                onSaveProgress={handleSaveProgress}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </ContentSection>
    </div>
  );
}
