import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Coffee, Sunrise, BookOpen, Heart, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CONNECT_COURSE } from "@/data/connect-course";
import { haptic } from "@/hooks/use-mobile";
import { toast } from "sonner";

interface Props {
  connectionId: string;
  partnerRole: "member" | "partner";
  partnerName: string;
  myName: string;
  onOpenCourse: () => void;
}

const RITUALS = [
  {
    id: "appreciation-3",
    title: "Three appreciations",
    desc: "Each name three small things you noticed about the other this week.",
    minutes: 5,
    icon: Heart,
    invite: "Want to do Three appreciations together? (5 min)",
  },
  {
    id: "morning-pause",
    title: "Morning pause",
    desc: "Tomorrow morning, sit together for two quiet minutes before talking.",
    minutes: 2,
    icon: Sunrise,
    invite: "Let's do a Morning pause tomorrow — 2 quiet minutes together.",
  },
  {
    id: "weekly-review",
    title: "Sunday review",
    desc: "Walk through the week — what felt close, what felt distant.",
    minutes: 15,
    icon: Coffee,
    invite: "Sunday review this weekend? Just a slow walk through the week.",
  },
];

export default function ConnectExtras({ connectionId, partnerRole, partnerName, myName, onOpenCourse }: Props) {
  const [progress, setProgress] = useState<any[]>([]);
  const [checkins, setCheckins] = useState<any[]>([]);
  const [reflectionCount, setReflectionCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);

  useEffect(() => {
    if (!connectionId) return;
    let cancel = false;

    Promise.all([
      (supabase.from("connect_partner_progress" as any).select("module_id, lesson_id, activity_id, completed, partner_role").eq("connection_id", connectionId) as any),
      (supabase.from("connect_checkins" as any).select("scores, created_at").eq("connection_id", connectionId).order("created_at", { ascending: false }).limit(8) as any),
      (supabase.from("connect_reflections" as any).select("id", { count: "exact", head: true }).eq("connection_id", connectionId) as any),
      (supabase.from("connect_messages" as any).select("id", { count: "exact", head: true }).eq("connection_id", connectionId) as any),
    ]).then(([p, c, r, m]: any[]) => {
      if (cancel) return;
      setProgress(p.data || []);
      setCheckins(c.data || []);
      setReflectionCount(r.count || 0);
      setMessageCount(m.count || 0);
    });

    return () => { cancel = true; };
  }, [connectionId]);

  // ── Connection strength (0–100) ──
  const strength = (() => {
    let score = 0;
    // Check-in average (max 35)
    if (checkins.length) {
      const recent = checkins.slice(0, 4);
      const flat: number[] = [];
      for (const c of recent) for (const v of Object.values(c.scores || {})) flat.push(Number(v) || 0);
      if (flat.length) {
        const avg = flat.reduce((s, v) => s + v, 0) / flat.length; // 1–10
        score += (avg / 10) * 35;
      }
    }
    // Reflection volume (max 25)
    score += Math.min(reflectionCount, 10) * 2.5;
    // Message volume (max 15)
    score += Math.min(messageCount, 30) * 0.5;
    // Course progress (max 25)
    const completed = progress.filter((p) => p.completed).length;
    score += Math.min(completed, 25);
    return Math.round(Math.max(8, Math.min(100, score)));
  })();

  const strengthLabel =
    strength >= 80 ? "Strong & steady" : strength >= 55 ? "Growing closer" : strength >= 30 ? "Finding your rhythm" : "Just beginning";

  // ── Next module to do together ──
  const nextLesson = (() => {
    for (const mod of CONNECT_COURSE) {
      for (const lesson of mod.lessons) {
        const lessonActivities = lesson.activities;
        const myDone = lessonActivities.every((a) =>
          progress.some((p) => p.activity_id === a.id && p.partner_role === partnerRole && p.completed)
        );
        if (!myDone) return { module: mod, lesson, totalActivities: lessonActivities.length };
      }
    }
    return null;
  })();

  const partnerDoneOnLesson = nextLesson
    ? nextLesson.lesson.activities.filter((a) =>
        progress.some((p) => p.activity_id === a.id && p.partner_role !== partnerRole && p.completed)
      ).length
    : 0;

  const startRitual = async (ritual: typeof RITUALS[number]) => {
    haptic("medium");
    await supabase.from("connect_messages").insert({
      connection_id: connectionId,
      sender_role: partnerRole,
      content: ritual.invite,
      metadata: { type: "ritual_invite", ritual_id: ritual.id, minutes: ritual.minutes },
    });
    toast.success(`Sent — ${partnerName} will see your invite.`);
  };

  return (
    <div className="px-4 pt-4 pb-2 space-y-3 border-b border-border/60">
      {/* ── Connection strength meter ── */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border bg-card p-4"
      >
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="font-hand text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Connection strength</p>
            <p className="font-display text-sm text-foreground">{strengthLabel}</p>
          </div>
          <span className="font-display text-2xl text-primary">{strength}</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${strength}%` }}
            transition={{ duration: 1.1, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-primary/60 to-primary"
          />
        </div>
        <p className="text-[10px] text-muted-foreground/70 mt-2 leading-relaxed">
          Built from check-ins, reflections, course progress, and the small messages between you.
        </p>
      </motion.div>

      {/* ── Next module together ── */}
      {nextLesson && (
        <motion.button
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => { haptic("light"); onOpenCourse(); }}
          className="w-full text-left rounded-2xl border border-primary/20 bg-primary/5 p-4 flex items-center gap-3 active:opacity-80"
        >
          <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-hand text-[10px] font-bold uppercase tracking-wider text-primary/70">Next together</p>
            <p className="font-display text-sm text-foreground truncate">{nextLesson.lesson.title}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {partnerDoneOnLesson > 0
                ? `${partnerName} has done ${partnerDoneOnLesson} of ${nextLesson.totalActivities} — your turn`
                : `${nextLesson.totalActivities} small activities · ~${nextLesson.lesson.estimatedMinutes ?? 10} min`}
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-primary/70 shrink-0" />
        </motion.button>
      )}

      {/* ── Do this together rituals ── */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border bg-card p-4"
      >
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <p className="font-hand text-[10px] font-bold uppercase tracking-wider text-primary/70">Do this together</p>
        </div>
        <div className="space-y-2">
          {RITUALS.map((r) => (
            <div key={r.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/40 transition">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <r.icon className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground">{r.title}</p>
                <p className="text-[10px] text-muted-foreground truncate">{r.desc}</p>
              </div>
              <button
                onClick={() => startRitual(r)}
                className="shrink-0 text-[10px] font-semibold text-primary px-2.5 py-1 rounded-full border border-primary/30 hover:bg-primary/10"
              >
                Start
              </button>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
