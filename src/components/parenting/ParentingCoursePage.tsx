import { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Lock, CheckCircle2, ChevronRight, Clock, ArrowLeft, Baby, Blocks, GraduationCap, ExternalLink, MessageCircleQuestion } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { AtmosphericHero, ContentSection } from "@/components/AtmosphericSection";
import SignalPulse from "@/components/SignalPulse";
import { haptic } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { BABY_COURSE, TODDLER_COURSE, KIDS_TEENS_COURSE, type WeeklySchedule } from "@/data/parenting-course";
import type { CourseModule, CourseLesson } from "@/data/connect-course";
import LessonPlayer from "@/components/connect/LessonPlayer";
import BabySleepSchedule from "@/components/parenting/BabySleepSchedule";

const TABS = [
  { id: "babies", label: "Babies", icon: Baby, course: BABY_COURSE },
  { id: "toddlers", label: "Toddlers", icon: Blocks, course: TODDLER_COURSE },
  { id: "kids-teens", label: "Kids & Teens", icon: GraduationCap, course: KIDS_TEENS_COURSE },
] as const;

type TabId = typeof TABS[number]["id"];

const MODULE_COLORS = [
  "from-rose-500/20 to-pink-400/10",
  "from-violet-500/20 to-purple-400/10",
  "from-sky-500/20 to-blue-400/10",
  "from-amber-500/20 to-orange-400/10",
  "from-emerald-500/20 to-teal-400/10",
  "from-fuchsia-500/20 to-pink-400/10",
];

type View = "modules" | "lessons" | "lesson" | "sleep-schedule";

export default function ParentingCoursePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>("babies");
  const [view, setView] = useState<View>("modules");
  const [selectedModule, setSelectedModule] = useState<CourseModule | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<CourseLesson | null>(null);
  const [completedActivities, setCompletedActivities] = useState<Set<string>>(new Set());
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());

  const currentTab = TABS.find(t => t.id === activeTab)!;
  const course = currentTab.course;

  // Load progress
  useEffect(() => {
    if (!user) return;
    (supabase.from("connect_course_progress" as any).select("activity_id, lesson_id, completed")
      .eq("user_id", user.id).eq("completed", true) as any)
      .then(({ data }: { data: any[] | null }) => {
        if (data) {
          setCompletedActivities(new Set(data.map(r => r.activity_id)));
          const lessonDone = new Set<string>();
          [...BABY_COURSE, ...TODDLER_COURSE, ...KIDS_TEENS_COURSE].forEach(m =>
            m.lessons.forEach(l => {
              if (l.activities.every(a => data.some(r => r.activity_id === a.id && r.completed))) {
                lessonDone.add(l.id);
              }
            })
          );
          setCompletedLessons(lessonDone);
        }
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

  const handleSaveProgress = useCallback(async (activityId: string, response: any) => {
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
  }, [user, selectedModule, selectedLesson]);

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

  const totalProgress = useMemo(() => {
    const total = course.reduce((s, m) => s + m.lessons.reduce((s2, l) => s2 + l.activities.length, 0), 0);
    const done = course.reduce((s, m) => s + m.lessons.reduce((s2, l) => s2 + l.activities.filter(a => completedActivities.has(a.id)).length, 0), 0);
    return total > 0 ? Math.round((done / total) * 100) : 0;
  }, [completedActivities, course]);

  const goBack = () => {
    if (view === "lesson") setView("lessons");
    else if (view === "lessons" || view === "sleep-schedule") { setView("modules"); setSelectedModule(null); }
  };

  return (
    <div className="relative">
      <AtmosphericHero size="sm">
        <SignalPulse />
        <div className="text-center relative z-10">
          <p className="font-body text-xs uppercase tracking-[0.3em] text-primary-foreground/40 mb-4">parenting</p>
          <h1 className="font-display text-[2rem] md:text-[2.5rem] font-extrabold text-primary-foreground leading-[1.02]">
            Parenting Guides
          </h1>
          <p className="font-body text-sm text-primary-foreground/50 mt-2">Evidence-based support for every stage</p>
        </div>
      </AtmosphericHero>

      <ContentSection className="px-4 md:px-4 max-w-3xl mx-auto pb-32">
        {/* Tab bar */}
        <div className="flex gap-1 p-1 bg-secondary/50 rounded-xl mb-6">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setView("modules"); setSelectedModule(null); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg font-body text-xs font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {view === "modules" && (
            <motion.div key={`modules-${activeTab}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Sleep schedule card for babies tab */}
              {activeTab === "babies" && (
                <motion.button
                  onClick={() => setView("sleep-schedule")}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full text-left p-5 rounded-2xl border border-primary/20 bg-gradient-to-br from-indigo-500/10 to-violet-400/5 mb-4 hover:border-primary/40 active:scale-[0.99] transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/15 flex items-center justify-center shrink-0">
                      <Clock className="h-5 w-5 text-indigo-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display text-sm font-bold text-foreground">Week-by-Week Sleep & Feed Guide</h3>
                      <p className="font-body text-xs text-muted-foreground mt-1">Structured daily schedules from birth to 6 months with feed amounts</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                  </div>
                </motion.button>
              )}

              {/* Course modules */}
              <div className="grid gap-3">
                {course.map((mod, i) => {
                  const progress = getModuleProgress(mod);
                  return (
                    <motion.button key={mod.id} onClick={() => openModule(mod)}
                      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="w-full text-left p-5 rounded-2xl border border-border bg-card hover:border-primary/30 active:scale-[0.99] transition-all"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${MODULE_COLORS[i % MODULE_COLORS.length]} flex items-center justify-center shrink-0`}>
                          {progress === 100
                            ? <CheckCircle2 className="h-5 w-5 text-primary" />
                            : <BookOpen className="h-5 w-5 text-primary" />}
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
                          {progress > 0 && <Progress value={progress} className="h-1 mt-2" />}
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/40 mt-1 shrink-0" />
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {view === "sleep-schedule" && (
            <motion.div key="sleep-schedule" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <button onClick={goBack} className="flex items-center gap-1 font-body text-xs text-muted-foreground mb-4 hover:text-foreground">
                <ArrowLeft className="h-3 w-3" /> Back
              </button>
              <h2 className="font-display text-xl font-bold text-foreground mb-1">Week-by-Week Sleep & Feed Guide</h2>
              <p className="font-body text-sm text-muted-foreground mb-5">Structured daily routines with sleep and feeding guidance from birth to 6 months</p>
              <BabySleepSchedule />
            </motion.div>
          )}

          {view === "lessons" && selectedModule && (
            <motion.div key="lessons" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <button onClick={goBack} className="flex items-center gap-1 font-body text-xs text-muted-foreground mb-4 hover:text-foreground">
                <ArrowLeft className="h-3 w-3" /> All modules
              </button>
              <div className="mb-5">
                <h2 className="font-display text-xl font-bold text-foreground">{selectedModule.title}</h2>
                <p className="font-body text-sm text-muted-foreground mt-1">{selectedModule.description}</p>
              </div>
              <div className="space-y-2">
                {selectedModule.lessons.map((lesson, i) => {
                  const done = completedLessons.has(lesson.id);
                  const actDone = lesson.activities.filter(a => completedActivities.has(a.id)).length;
                  return (
                    <motion.button key={lesson.id} onClick={() => openLesson(lesson)}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="w-full text-left p-4 rounded-xl border border-border bg-card hover:border-primary/30 active:scale-[0.99] transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${done ? "bg-primary/20" : "bg-secondary"}`}>
                          {done ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <span className="font-body text-xs font-bold text-muted-foreground">{i + 1}</span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-display text-sm font-bold text-foreground">{lesson.title}</h4>
                          <p className="font-body text-xs text-muted-foreground mt-0.5">{lesson.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="font-body text-[10px] text-muted-foreground">{lesson.activities.length} activities</span>
                            {actDone > 0 && <span className="font-body text-[10px] text-primary">{actDone}/{lesson.activities.length} done</span>}
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
      </ContentSection>
    </div>
  );
}
