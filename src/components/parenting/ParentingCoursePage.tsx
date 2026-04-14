import { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Lock, CheckCircle2, ChevronRight, Clock, ArrowLeft, Baby, Blocks, GraduationCap, ExternalLink, MessageCircleQuestion, Search, X, Wrench, BookMarked, Lightbulb } from "lucide-react";
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

// ─── Quick Toolkit items for Kids & Teens ───
const TOOLKIT_ITEMS = [
  { label: "Exit Scripts", desc: "Pre-rehearsed phrases for peer pressure", moduleId: "kt-m6" },
  { label: "Code Word System", desc: "Text PIZZA = pick me up, no questions", moduleId: "kt-m6" },
  { label: "Calm-Down Kit", desc: "Age-appropriate regulation strategies", moduleId: "kt-m3" },
  { label: "Family Media Agreement", desc: "Screen time contract template", moduleId: "kt-m4" },
  { label: "Growth Mindset Poster", desc: "The 'YET' wall for the family", moduleId: "kt-m1" },
  { label: "Friendship Audit", desc: "5 questions to assess healthy friendships", moduleId: "kt-m11" },
  { label: "Safety Toolkit", desc: "Party safety checklist for teens", moduleId: "kt-m9" },
  { label: "Brave Ladder", desc: "Step-by-step approach for anxiety", moduleId: "kt-m3" },
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
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showToolkit, setShowToolkit] = useState(false);

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

  // Filtered modules/lessons for search
  const filteredCourse = useMemo(() => {
    if (!searchQuery.trim()) return course;
    const q = searchQuery.toLowerCase();
    return course
      .map(mod => {
        const modMatch = mod.title.toLowerCase().includes(q) || mod.subtitle.toLowerCase().includes(q) || mod.description.toLowerCase().includes(q);
        const matchedLessons = mod.lessons.filter(l =>
          l.title.toLowerCase().includes(q) || l.description.toLowerCase().includes(q)
        );
        if (modMatch) return mod;
        if (matchedLessons.length > 0) return { ...mod, lessons: matchedLessons };
        return null;
      })
      .filter(Boolean) as CourseModule[];
  }, [course, searchQuery]);

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

  // Jump to a module from toolkit
  const jumpToModule = (moduleId: string) => {
    const mod = course.find(m => m.id === moduleId);
    if (mod) {
      setShowToolkit(false);
      openModule(mod);
    }
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
        <div className="flex gap-1 p-1 bg-secondary/50 rounded-xl mb-4">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setView("modules"); setSelectedModule(null); setSearchQuery(""); setShowToolkit(false); }}
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

        {/* Search + Toolkit bar (modules view only) */}
        {view === "modules" && (
          <div className="flex items-center gap-2 mb-4">
            {showSearch ? (
              <div className="flex-1 flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2">
                <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search modules & lessons..."
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
                />
                <button onClick={() => { setShowSearch(false); setSearchQuery(""); }}>
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setShowSearch(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground text-xs font-medium transition-colors"
                >
                  <Search className="h-3.5 w-3.5" /> Search
                </button>
                {activeTab === "kids-teens" && (
                  <button
                    onClick={() => setShowToolkit(!showToolkit)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-colors ${
                      showToolkit ? "bg-primary/10 border-primary/30 text-primary" : "bg-card border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Wrench className="h-3.5 w-3.5" /> Quick Toolkit
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {/* Quick Toolkit panel */}
        <AnimatePresence>
          {showToolkit && view === "modules" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-4"
            >
              <div className="p-4 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/[0.02]">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="h-4 w-4 text-primary" />
                  <h3 className="font-display text-sm font-bold text-foreground">Quick Toolkit</h3>
                  <span className="text-[10px] text-muted-foreground ml-auto">Tap to jump to module</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {TOOLKIT_ITEMS.map(item => (
                    <button
                      key={item.label}
                      onClick={() => jumpToModule(item.moduleId)}
                      className="text-left p-3 rounded-xl bg-card border border-border hover:border-primary/30 active:scale-[0.98] transition-all"
                    >
                      <p className="font-body text-xs font-semibold text-foreground">{item.label}</p>
                      <p className="font-body text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{item.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {view === "modules" && (
            <motion.div key={`modules-${activeTab}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Sleep schedule card for babies tab */}
              {activeTab === "babies" && !searchQuery && (
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

              {/* Little Minds tool card for kids-teens tab */}
              {activeTab === "kids-teens" && !searchQuery && (
                <motion.a
                  href="https://littleminds.mindcast.co.nz/"
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="block w-full text-left p-5 rounded-2xl border border-primary/20 bg-gradient-to-br from-amber-500/10 to-orange-400/5 mb-4 hover:border-primary/40 active:scale-[0.99] transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
                      <MessageCircleQuestion className="h-5 w-5 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display text-sm font-bold text-foreground">Little Minds Big Questions</h3>
                      <p className="font-body text-xs text-muted-foreground mt-1">When your child asks a tricky question, get a gentle metaphor-based story to help them understand</p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                  </div>
                </motion.a>
              )}

              {/* Search results info */}
              {searchQuery && (
                <p className="font-body text-xs text-muted-foreground mb-3">
                  {filteredCourse.length} {filteredCourse.length === 1 ? "result" : "results"} for "{searchQuery}"
                </p>
              )}

              {/* Course modules */}
              <div className="grid gap-3">
                {filteredCourse.map((mod, i) => {
                  const progress = getModuleProgress(mod);
                  const modAny = mod as any;
                  const sourceBooks: string[] | undefined = modAny.sourceBooks;
                  return (
                    <motion.button key={mod.id} onClick={() => openModule(mod)}
                      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
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
                          {/* Source book badges */}
                          {sourceBooks && sourceBooks.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {sourceBooks.slice(0, 3).map(book => {
                                const shortName = book.split("—")[0].trim();
                                return (
                                  <span key={book} className="inline-flex items-center gap-0.5 text-[9px] bg-primary/8 text-primary/70 px-1.5 py-0.5 rounded-full">
                                    <BookMarked className="h-2.5 w-2.5" />
                                    {shortName}
                                  </span>
                                );
                              })}
                              {sourceBooks.length > 3 && (
                                <span className="text-[9px] text-muted-foreground/50 px-1">+{sourceBooks.length - 3}</span>
                              )}
                            </div>
                          )}
                          {progress > 0 && <Progress value={progress} className="h-1 mt-2" />}
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/40 mt-1 shrink-0" />
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* No results */}
              {searchQuery && filteredCourse.length === 0 && (
                <div className="text-center py-12">
                  <Search className="h-8 w-8 text-muted-foreground/20 mx-auto mb-3" />
                  <p className="font-body text-sm text-muted-foreground">No modules or lessons match "{searchQuery}"</p>
                  <button onClick={() => setSearchQuery("")} className="font-body text-xs text-primary mt-2">Clear search</button>
                </div>
              )}
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
                {/* Source books in lesson view */}
                {(selectedModule as any).sourceBooks && (
                  <div className="mt-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
                    <p className="font-body text-[10px] uppercase tracking-wider text-primary/60 mb-1.5 flex items-center gap-1">
                      <BookMarked className="h-3 w-3" /> Reference Books
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {((selectedModule as any).sourceBooks as string[]).map(book => (
                        <span key={book} className="font-body text-[10px] text-primary/80 bg-primary/10 px-2 py-0.5 rounded-full">
                          {book}
                        </span>
                      ))}
                    </div>
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
