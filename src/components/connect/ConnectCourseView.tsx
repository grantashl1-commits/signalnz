import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Lock, CheckCircle2, ChevronRight, Clock, ArrowLeft, Share2 } from "lucide-react";
import { CONNECT_COURSE, type CourseModule, type CourseLesson } from "@/data/connect-course";
import LessonPlayer from "@/components/connect/LessonPlayer";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { haptic } from "@/hooks/use-mobile";
import { toast } from "sonner";

const MODULE_COLORS = [
  "from-rose-500/20 to-pink-400/10",
  "from-violet-500/20 to-purple-400/10",
  "from-sky-500/20 to-blue-400/10",
  "from-amber-500/20 to-orange-400/10",
  "from-emerald-500/20 to-teal-400/10",
  "from-fuchsia-500/20 to-pink-400/10",
  "from-cyan-500/20 to-sky-400/10",
  "from-lime-500/20 to-green-400/10",
  "from-indigo-500/20 to-violet-400/10",
  "from-red-500/20 to-rose-400/10",
];

type View = "modules" | "lessons" | "lesson";

interface Props {
  connectionId: string;
  partnerRole: "member" | "partner";
  partnerName: string;
  onShareToPartner?: (text: string) => void;
}

export default function ConnectCourseView({ connectionId, partnerRole, partnerName, onShareToPartner }: Props) {
  const [view, setView] = useState<View>("modules");
  const [selectedModule, setSelectedModule] = useState<CourseModule | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<CourseLesson | null>(null);
  const [completedActivities, setCompletedActivities] = useState<Set<string>>(new Set());
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [partnerCompletedActivities, setPartnerCompletedActivities] = useState<Set<string>>(new Set());

  // Load progress
  useEffect(() => {
    if (!connectionId) return;
    (supabase.from("connect_partner_progress" as any)
      .select("activity_id, partner_role, completed")
      .eq("connection_id", connectionId)
      .eq("completed", true) as any)
      .then(({ data }: { data: any[] | null }) => {
        if (!data) return;
        const mine = new Set<string>();
        const theirs = new Set<string>();
        data.forEach((r: any) => {
          if (r.partner_role === partnerRole) mine.add(r.activity_id);
          else theirs.add(r.activity_id);
        });
        setCompletedActivities(mine);
        setPartnerCompletedActivities(theirs);

        // Derive completed lessons
        const lessonDone = new Set<string>();
        CONNECT_COURSE.forEach(m => m.lessons.forEach(l => {
          if (l.activities.every(a => mine.has(a.id))) lessonDone.add(l.id);
        }));
        setCompletedLessons(lessonDone);
      });
  }, [connectionId, partnerRole]);

  const handleSaveProgress = useCallback(async (activityId: string, response: any, saveToVault: boolean) => {
    setCompletedActivities(prev => new Set(prev).add(activityId));
    if (!selectedModule || !selectedLesson) return;

    const activity = selectedLesson.activities.find(a => a.id === activityId);

    await (supabase.from("connect_partner_progress" as any) as any).upsert({
      connection_id: connectionId,
      partner_role: partnerRole,
      module_id: selectedModule.id,
      lesson_id: selectedLesson.id,
      activity_id: activityId,
      activity_type: activity?.type || "unknown",
      response,
      completed: true,
    }, { onConflict: "connection_id,partner_role,activity_id" });

    // If this is a shareable activity, offer to share
    if (saveToVault && onShareToPartner) {
      const responseText = typeof response === "string" ? response
        : response?.text || response?.answer || JSON.stringify(response);
      onShareToPartner(`📝 From "${selectedModule.title}" — ${activity?.title || "Activity"}:\n\n${responseText}`);
      toast.success("Shared with your partner 💜");
    }
  }, [connectionId, partnerRole, selectedModule, selectedLesson, onShareToPartner]);

  const handleLessonComplete = (lessonId: string) => {
    haptic("medium");
    setCompletedLessons(prev => new Set(prev).add(lessonId));
    setView("lessons");
  };

  const getModuleProgress = (mod: CourseModule) => {
    const total = mod.lessons.reduce((sum, l) => sum + l.activities.length, 0);
    const done = mod.lessons.reduce((sum, l) => sum + l.activities.filter(a => completedActivities.has(a.id)).length, 0);
    return total > 0 ? Math.round((done / total) * 100) : 0;
  };

  const getPartnerModuleProgress = (mod: CourseModule) => {
    const total = mod.lessons.reduce((sum, l) => sum + l.activities.length, 0);
    const done = mod.lessons.reduce((sum, l) => sum + l.activities.filter(a => partnerCompletedActivities.has(a.id)).length, 0);
    return total > 0 ? Math.round((done / total) * 100) : 0;
  };

  const totalProgress = useMemo(() => {
    const total = CONNECT_COURSE.reduce((s, m) => s + m.lessons.reduce((s2, l) => s2 + l.activities.length, 0), 0);
    return total > 0 ? Math.round((completedActivities.size / total) * 100) : 0;
  }, [completedActivities]);

  return (
    <div className="px-4 py-4">
      <AnimatePresence mode="wait">
        {view === "modules" && (
          <motion.div key="modules" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="text-center mb-5">
              <p className="font-display text-lg font-bold text-foreground">Couples Course</p>
              <p className="text-xs text-muted-foreground mt-1">10 modules · work through together</p>
              {totalProgress > 0 && (
                <div className="mt-3 max-w-[200px] mx-auto">
                  <Progress value={totalProgress} className="h-1.5" />
                  <p className="text-[10px] text-muted-foreground mt-1">{totalProgress}% complete (you)</p>
                </div>
              )}
            </div>

            <div className="space-y-2.5">
              {CONNECT_COURSE.map((mod, i) => {
                const myProgress = getModuleProgress(mod);
                const theirProgress = getPartnerModuleProgress(mod);
                const isUnlocked = i === 0 || getModuleProgress(CONNECT_COURSE[i - 1]) >= 60;

                return (
                  <motion.button
                    key={mod.id}
                    onClick={() => { if (isUnlocked) { haptic("medium"); setSelectedModule(mod); setView("lessons"); }}}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    disabled={!isUnlocked}
                    className={`w-full text-left p-4 rounded-2xl border transition-all ${
                      isUnlocked ? "border-border bg-card hover:border-primary/30" : "border-border/50 bg-card/50 opacity-60"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${MODULE_COLORS[i]} flex items-center justify-center shrink-0`}>
                        {myProgress === 100 ? <CheckCircle2 className="h-4 w-4 text-primary" /> :
                         isUnlocked ? <BookOpen className="h-4 w-4 text-primary" /> :
                         <Lock className="h-4 w-4 text-muted-foreground" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display text-sm font-bold text-foreground">{mod.title}</h3>
                        <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{mod.subtitle}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {mod.estimatedMinutes} min
                          </span>
                          <span className="text-[10px] text-muted-foreground">{mod.lessons.length} lessons</span>
                        </div>
                        {(myProgress > 0 || theirProgress > 0) && (
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex-1">
                              <Progress value={myProgress} className="h-1" />
                              <p className="text-[9px] text-muted-foreground mt-0.5">You: {myProgress}%</p>
                            </div>
                            <div className="flex-1">
                              <Progress value={theirProgress} className="h-1" />
                              <p className="text-[9px] text-muted-foreground mt-0.5">{partnerName}: {theirProgress}%</p>
                            </div>
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
              className="flex items-center gap-1 text-xs text-muted-foreground mb-4 hover:text-foreground">
              <ArrowLeft className="h-3 w-3" /> All modules
            </button>
            <div className="mb-4">
              <h2 className="font-display text-lg font-bold text-foreground">{selectedModule.title}</h2>
              <p className="text-xs text-muted-foreground mt-1">{selectedModule.description}</p>
            </div>
            <div className="space-y-2">
              {selectedModule.lessons.map((lesson, i) => {
                const done = completedLessons.has(lesson.id);
                const myDone = lesson.activities.filter(a => completedActivities.has(a.id)).length;
                const theirDone = lesson.activities.filter(a => partnerCompletedActivities.has(a.id)).length;
                return (
                  <motion.button key={lesson.id}
                    onClick={() => { haptic("medium"); setSelectedLesson(lesson); setView("lesson"); }}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="w-full text-left p-3.5 rounded-xl border border-border bg-card hover:border-primary/30 transition-all">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${done ? "bg-primary/20" : "bg-secondary"}`}>
                        {done ? <CheckCircle2 className="h-4 w-4 text-primary" /> :
                         <span className="text-xs font-bold text-muted-foreground">{i + 1}</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-display text-sm font-bold text-foreground">{lesson.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-muted-foreground">{lesson.activities.length} activities</span>
                          {myDone > 0 && <span className="text-[10px] text-primary">You: {myDone}/{lesson.activities.length}</span>}
                          {theirDone > 0 && <span className="text-[10px] text-violet-500">{partnerName}: {theirDone}/{lesson.activities.length}</span>}
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
              lesson={selectedLesson}
              onComplete={handleLessonComplete}
              onBack={() => setView("lessons")}
              onSaveProgress={handleSaveProgress}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
