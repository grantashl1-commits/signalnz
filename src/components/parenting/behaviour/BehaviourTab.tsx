import { useEffect, useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star, Check, AlertTriangle, Trash2, Pencil, Plus, History, Settings, Gift, X, ChevronRight, Sparkles, Users, Printer, RefreshCw, Info, Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { haptic } from "@/hooks/use-mobile";
import { CHARACTERS, CHARACTER_LIST, ACCENT_COLORS, type CharacterId } from "./characters";
import { playChime, playBuzz } from "./sounds";
import {
  DEFAULT_MUST_CHORES, DEFAULT_BONUS_CHORES, DEFAULT_BEHAVIOURS, DEFAULT_REWARDS,
} from "./defaults";
import { printWeeklyChart } from "./printChart";

type Child = {
  id: string;
  name: string;
  character_id: CharacterId;
  accent_color: string;
  age: number | null;
  points: number;
};
type Chore = { id: string; child_id: string | null; name: string; points: number; category: "must" | "bonus"; active: boolean; image_url?: string | null };
type Behaviour = { id: string; child_id: string | null; name: string; penalty: number; reset_to_zero: boolean; active: boolean };
type Reward = { id: string; child_id: string; name: string; target_points: number; achieved: boolean; active: boolean };
type Tx = { id: string; child_id: string; delta: number; reason: string; kind: string; created_at: string };

type View = "dashboard" | "admin" | "history" | "setup";

export default function BehaviourTab() {
  const { user } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [activeChildId, setActiveChildId] = useState<string | null>(null);
  const [chores, setChores] = useState<Chore[]>([]);
  const [behaviours, setBehaviours] = useState<Behaviour[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [transactions, setTransactions] = useState<Tx[]>([]);
  const [view, setView] = useState<View>("dashboard");
  const [loading, setLoading] = useState(true);

  // Floating point feedback
  const [floaters, setFloaters] = useState<{ id: number; value: number; positive: boolean }[]>([]);
  const [confetti, setConfetti] = useState(false);
  const [pendingPenalty, setPendingPenalty] = useState<Behaviour | null>(null);

  const activeChild = useMemo(() => children.find(c => c.id === activeChildId) || null, [children, activeChildId]);

  // ─── Load ───
  const loadAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [{ data: kids }, { data: ch }, { data: bh }, { data: rw }] = await Promise.all([
      supabase.from("parenting_children").select("*").order("created_at"),
      supabase.from("parenting_chores").select("*").eq("active", true).order("sort_order"),
      supabase.from("parenting_behaviours").select("*").eq("active", true).order("sort_order"),
      supabase.from("parenting_rewards").select("*").eq("active", true).order("created_at"),
    ]);
    setChildren((kids || []) as Child[]);
    setChores((ch || []) as Chore[]);
    setBehaviours((bh || []) as Behaviour[]);
    setRewards((rw || []) as Reward[]);
    if (kids && kids.length && !activeChildId) setActiveChildId(kids[0].id);
    setLoading(false);
  }, [user, activeChildId]);

  useEffect(() => { loadAll(); }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!activeChildId) { setTransactions([]); return; }
    supabase.from("parenting_transactions").select("*").eq("child_id", activeChildId)
      .order("created_at", { ascending: false }).limit(100)
      .then(({ data }) => setTransactions((data || []) as Tx[]));
  }, [activeChildId, children]);

  // ─── Mutations ───
  const addPoints = async (delta: number, reason: string, kind: Tx["kind"], sourceId?: string, opts?: { reset?: boolean; silent?: boolean }) => {
    if (!user || !activeChild) return;
    const newPoints = opts?.reset ? 0 : Math.max(0, activeChild.points + delta);
    const actualDelta = newPoints - activeChild.points;

    setChildren(prev => prev.map(c => c.id === activeChild.id ? { ...c, points: newPoints } : c));
    if (!opts?.silent) {
      const id = Date.now();
      setFloaters(f => [...f, { id, value: actualDelta, positive: actualDelta >= 0 }]);
      setTimeout(() => setFloaters(f => f.filter(x => x.id !== id)), 1200);
      if (actualDelta >= 0) playChime(); else playBuzz();
      haptic(actualDelta >= 0 ? "light" : "medium");
    }

    await supabase.from("parenting_children").update({ points: newPoints }).eq("id", activeChild.id);
    const { data: tx } = await supabase.from("parenting_transactions").insert({
      user_id: user.id, child_id: activeChild.id, delta: actualDelta, reason, kind, source_id: sourceId,
    }).select().single();
    if (tx) setTransactions(prev => [tx as Tx, ...prev].slice(0, 100));

    // Check reward unlock
    const justReached = rewards.find(r => !r.achieved && r.child_id === activeChild.id && newPoints >= r.target_points && activeChild.points < r.target_points);
    if (justReached) {
      setConfetti(true);
      setTimeout(() => setConfetti(false), 2400);
    }
  };

  const onChoreDone = (chore: Chore) =>
    addPoints(chore.points, chore.name, "chore", chore.id);

  const confirmPenalty = async () => {
    if (!pendingPenalty || !activeChild) return;
    const b = pendingPenalty;
    setPendingPenalty(null);
    if (b.reset_to_zero) {
      await addPoints(-activeChild.points, `${b.name} (reset)`, "reset", b.id, { reset: true });
    } else {
      await addPoints(-b.penalty, b.name, "behaviour", b.id);
    }
  };

  // ─── Onboarding (no children yet) ───
  const seedDefaultsForChild = async (childId: string) => {
    if (!user) return;
    const chorePayload = [
      ...DEFAULT_MUST_CHORES.map((c, i) => ({ user_id: user.id, child_id: childId, name: c.name, points: c.points, category: "must" as const, sort_order: i })),
      ...DEFAULT_BONUS_CHORES.map((c, i) => ({ user_id: user.id, child_id: childId, name: c.name, points: c.points, category: "bonus" as const, sort_order: i })),
    ];
    const behaviourPayload = DEFAULT_BEHAVIOURS.map((b, i) => ({ user_id: user.id, child_id: childId, name: b.name, penalty: b.penalty, reset_to_zero: b.reset_to_zero, sort_order: i }));
    const rewardPayload = DEFAULT_REWARDS.map(r => ({ user_id: user.id, child_id: childId, name: r.name, target_points: r.target_points }));
    const [{ data: insertedChores }] = await Promise.all([
      supabase.from("parenting_chores").insert(chorePayload).select(),
      supabase.from("parenting_behaviours").insert(behaviourPayload),
      supabase.from("parenting_rewards").insert(rewardPayload),
    ]);
    // Generate illustrations for each seeded chore in the background (non-blocking)
    if (insertedChores) {
      void Promise.all(
        insertedChores.map(async (row: any) => {
          try {
            const { data } = await supabase.functions.invoke("chore-illustration", { body: { name: row.name } });
            const url = (data as any)?.imageUrl;
            if (url) await supabase.from("parenting_chores").update({ image_url: url }).eq("id", row.id);
          } catch (e) { /* ignore */ }
        })
      ).then(() => loadAll());
    }
  };

  const createChild = async (data: { name: string; character_id: CharacterId; accent_color: string; age: number | null }) => {
    if (!user) return;
    const { data: kid } = await supabase.from("parenting_children")
      .insert({ user_id: user.id, ...data, points: 0 }).select().single();
    if (kid) {
      await seedDefaultsForChild(kid.id);
      await loadAll();
      setActiveChildId(kid.id);
      setView("dashboard");
    }
  };

  // Active reward (the lowest unmet target)
  const activeReward = useMemo(() => {
    if (!activeChild) return null;
    return rewards
      .filter(r => r.child_id === activeChild.id && !r.achieved)
      .sort((a, b) => a.target_points - b.target_points)[0] || null;
  }, [rewards, activeChild]);

  const childChores = useMemo(
    () => chores.filter(c => !c.child_id || c.child_id === activeChildId),
    [chores, activeChildId]
  );
  const childBehaviours = useMemo(
    () => behaviours.filter(b => !b.child_id || b.child_id === activeChildId),
    [behaviours, activeChildId]
  );

  if (loading) {
    return <div className="py-16 text-center text-sm text-muted-foreground">Loading…</div>;
  }

  if (!children.length || view === "setup") {
    return <ChildSetup onCreate={createChild} onCancel={children.length ? () => setView("dashboard") : undefined} />;
  }

  const character = activeChild ? CHARACTERS[activeChild.character_id] : CHARACTERS.triumph;

  return (
    <div className="space-y-4">
      {/* Child selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {children.map(c => {
          const ch = CHARACTERS[c.character_id];
          const isActive = c.id === activeChildId;
          return (
            <button
              key={c.id}
              onClick={() => { setActiveChildId(c.id); haptic("light"); }}
              className={`shrink-0 flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full border transition-all ${
                isActive ? "bg-card border-foreground/20 shadow-sm" : "bg-secondary/40 border-transparent text-muted-foreground"
              }`}
            >
              <div className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center">
                <img src={ch.image} alt="" className="w-full h-full object-contain" />
              </div>
              <span className="text-xs font-semibold">{c.name}</span>
            </button>
          );
        })}
        <button
          onClick={() => setView("setup")}
          className="shrink-0 flex items-center gap-1 px-3 py-2 rounded-full border border-dashed border-border text-xs text-muted-foreground hover:text-foreground"
        >
          <Plus className="h-3 w-3" /> Add child
        </button>
      </div>

      {/* Header tabs */}
      <div className="flex gap-1 p-1 bg-secondary/50 rounded-xl">
        {([
          { id: "dashboard", label: "Today", icon: Star },
          { id: "history", label: "History", icon: History },
          { id: "admin", label: "Admin", icon: Settings },
        ] as const).map(t => (
          <button key={t.id}
            onClick={() => setView(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
              view === t.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}>
            <t.icon className="h-3.5 w-3.5" /> {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {view === "dashboard" && activeChild && (
          <motion.div key="dash" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            {/* Hero card */}
            <div className="relative rounded-3xl p-5 overflow-hidden border border-border" style={{ background: `linear-gradient(135deg, ${activeChild.accent_color}22, ${activeChild.accent_color}05)` }}>
              <div className="flex items-center gap-4">
                <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} className="relative w-24 h-24 rounded-2xl overflow-hidden bg-white/40 flex items-center justify-center shrink-0">
                  <img src={character.image} alt={character.name} className="w-full h-full object-cover" />
                </motion.div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-foreground/50">Points</p>
                  <div className="flex items-baseline gap-1.5 relative">
                    <motion.div key={activeChild.points} initial={{ scale: 0.85 }} animate={{ scale: 1 }} className="font-display text-5xl font-extrabold text-foreground">
                      {activeChild.points}
                    </motion.div>
                    <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                    {/* Floaters land here */}
                    <AnimatePresence>
                      {floaters.map(f => (
                        <motion.span key={f.id}
                          initial={{ opacity: 0, y: 10, scale: 0.8 }}
                          animate={{ opacity: [0, 1, 1, 0], y: -40, scale: 1 }}
                          transition={{ duration: 1.2 }}
                          className={`absolute -top-2 left-12 font-display text-xl font-bold ${f.positive ? "text-emerald-500" : "text-rose-500"}`}>
                          {f.positive ? "+" : ""}{f.value}
                        </motion.span>
                      ))}
                    </AnimatePresence>
                  </div>
                  <p className="text-xs text-foreground/60 mt-1 italic">{character.trait}</p>
                </div>
              </div>

              {/* Reward bar */}
              {activeReward ? (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="flex items-center gap-1.5 text-foreground/70">
                      <Gift className="h-3.5 w-3.5" /> {activeReward.name}
                    </span>
                    <span className="font-semibold text-foreground/80">{Math.min(activeChild.points, activeReward.target_points)} / {activeReward.target_points}</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-foreground/10 overflow-hidden">
                    <motion.div
                      initial={false}
                      animate={{ width: `${Math.min(100, (activeChild.points / activeReward.target_points) * 100)}%` }}
                      transition={{ type: "spring", stiffness: 120, damping: 20 }}
                      className="h-full rounded-full"
                      style={{ background: `linear-gradient(90deg, ${activeChild.accent_color}, ${activeChild.accent_color}aa)` }}
                    />
                  </div>
                </div>
              ) : (
                <button onClick={() => setView("admin")} className="mt-4 w-full text-xs text-foreground/60 italic underline-offset-2 hover:underline">
                  Set a reward goal in Admin →
                </button>
              )}

              {/* Confetti burst */}
              <AnimatePresence>
                {confetti && (
                  <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 pointer-events-none">
                    {Array.from({ length: 24 }).map((_, i) => (
                      <motion.span key={i}
                        initial={{ x: "50%", y: "50%", opacity: 1 }}
                        animate={{ x: `${50 + (Math.random() - 0.5) * 200}%`, y: `${50 + (Math.random() - 0.5) * 200}%`, opacity: 0, rotate: Math.random() * 360 }}
                        transition={{ duration: 1.8, ease: "easeOut" }}
                        className="absolute w-2 h-2 rounded-sm"
                        style={{ background: ["#F2D67A", "#7BB7E0", "#E89274", "#A4C9A0", "#D4A5C5"][i % 5] }}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Print button */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => printWeeklyChart({
                  childName: activeChild.name,
                  characterImage: character.image,
                  accent: activeChild.accent_color,
                  must: childChores.filter(c => c.category === "must"),
                  bonus: childChores.filter(c => c.category === "bonus"),
                })}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-card border border-border text-xs font-medium text-foreground hover:bg-secondary/40"
              >
                <Printer className="h-3.5 w-3.5" />
                Print weekly chart (A4)
              </button>
            </div>

            {/* Must-do chores */}
            <ChoreSection title="Must-do chores" subtitle="Daily essentials" items={childChores.filter(c => c.category === "must")} onDone={onChoreDone} accent={activeChild.accent_color} />

            {/* Bonus chores */}
            <ChoreSection title="Bonus chores" subtitle="Extra effort earns extra points" items={childChores.filter(c => c.category === "bonus")} onDone={onChoreDone} accent={activeChild.accent_color} variant="bonus" />

            {/* Bad behaviours */}
            <section>
              <div className="flex items-center justify-between mb-2 px-1">
                <h3 className="font-display text-sm font-bold text-foreground">If something goes wrong</h3>
                <span className="text-[10px] text-muted-foreground italic">Calm. Neutral. Brief.</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {childBehaviours.map(b => (
                  <button key={b.id}
                    onClick={() => { setPendingPenalty(b); haptic("medium"); }}
                    className="text-left p-3 rounded-xl border border-rose-500/15 bg-rose-500/[0.04] hover:bg-rose-500/10 active:scale-[0.97] transition-all">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-semibold text-foreground leading-snug">{b.name}</span>
                      <AlertTriangle className="h-3.5 w-3.5 text-rose-500 shrink-0 mt-0.5" />
                    </div>
                    <p className="text-[10px] text-rose-600/80 mt-1.5 font-mono">
                      {b.reset_to_zero ? "Reset to 0" : `−${b.penalty} pts`}
                    </p>
                  </button>
                ))}
              </div>
            </section>

            {/* Why this works */}
            <WhyCard accent={activeChild.accent_color} />
          </motion.div>
        )}

        {view === "history" && activeChild && (
          <motion.div key="hist" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <HistoryView transactions={transactions} />
          </motion.div>
        )}

        {view === "admin" && activeChild && (
          <motion.div key="admin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <AdminPanel
              child={activeChild}
              chores={childChores}
              behaviours={childBehaviours}
              rewards={rewards.filter(r => r.child_id === activeChild.id)}
              onChange={loadAll}
              onEditChild={() => setView("setup")}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Penalty confirmation modal */}
      <AnimatePresence>
        {pendingPenalty && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-foreground/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
            onClick={() => setPendingPenalty(null)}>
            <motion.div onClick={e => e.stopPropagation()}
              initial={{ y: 40, scale: 0.96 }} animate={{ y: 0, scale: 1 }} exit={{ y: 40, scale: 0.96 }}
              className="w-full max-w-sm bg-card rounded-3xl p-6 border border-border shadow-2xl">
              <div className="w-12 h-12 rounded-full bg-rose-500/15 flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="h-5 w-5 text-rose-500" />
              </div>
              <h3 className="font-display text-lg font-bold text-center text-foreground">Confirm consequence</h3>
              <p className="text-sm text-muted-foreground text-center mt-1.5 leading-relaxed">
                "{pendingPenalty.name}" will {pendingPenalty.reset_to_zero ? "reset points to zero" : `cost ${pendingPenalty.penalty} points`}.
              </p>
              <div className="flex gap-2 mt-5">
                <button onClick={() => setPendingPenalty(null)} className="flex-1 py-2.5 rounded-xl bg-secondary text-foreground text-sm font-medium">Cancel</button>
                <button onClick={confirmPenalty} className="flex-1 py-2.5 rounded-xl bg-rose-500 text-white text-sm font-semibold">Apply</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────

function ChoreSection({ title, subtitle, items, onDone, accent, variant = "must" }: {
  title: string; subtitle: string; items: Chore[]; onDone: (c: Chore) => void; accent: string; variant?: "must" | "bonus";
}) {
  if (!items.length) return null;
  return (
    <section>
      <div className="flex items-baseline justify-between mb-2 px-1">
        <h3 className="font-display text-sm font-bold text-foreground">{title}</h3>
        <span className="text-[10px] text-muted-foreground">{subtitle}</span>
      </div>
      <div className="space-y-1.5">
        {items.map(c => (
          <motion.button key={c.id}
            whileTap={{ scale: 0.97 }}
            onClick={() => onDone(c)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
              variant === "bonus"
                ? "border-amber-500/20 bg-gradient-to-r from-amber-500/[0.06] to-transparent"
                : "border-border bg-card hover:bg-secondary/40"
            }`}>
            {c.image_url ? (
              <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 bg-white" style={{ background: accent + "11" }}>
                <img src={c.image_url} alt="" className="w-full h-full object-cover" loading="lazy" />
              </div>
            ) : (
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: accent + "22" }}>
                <Check className="h-4 w-4" style={{ color: accent }} />
              </div>
            )}
            <span className="flex-1 text-left text-sm font-medium text-foreground">{c.name}</span>
            <span className="text-xs font-mono font-semibold tabular-nums" style={{ color: accent }}>+{c.points}</span>
          </motion.button>
        ))}
      </div>
    </section>
  );
}

function WhyCard({ accent }: { accent: string }) {
  const [open, setOpen] = useState(false);
  return (
    <section className="rounded-2xl border border-border bg-card overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 p-3 text-left"
      >
        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: accent + "22" }}>
          <Info className="h-4 w-4" style={{ color: accent }} />
        </div>
        <span className="flex-1 font-display text-sm font-bold text-foreground">Why this works</span>
        <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-90" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 text-xs leading-relaxed text-foreground/80">
              <p>
                <strong className="text-foreground">Experiences over things.</strong>{" "}
                Picking the family movie, a friend over for a playdate, choosing a weekend
                activity — these rewards build connection and shared memories. Toys lose their
                shine within days; <em>"I picked the movie"</em> is told for years
                <span className="text-muted-foreground"> (Faber & Mazlish; Clarke-Fields).</span>
              </p>
              <p>
                <strong className="text-foreground">A neutral mechanism replaces nagging.</strong>{" "}
                The app — not you — awards or deducts points. Your child can't argue with a counter.
                You stay calm, the boundary stays firm
                <span className="text-muted-foreground"> (Ockwell-Smith, <em>Gentle Discipline</em>; Leman, <em>Have a New Kid by Friday</em>).</span>
              </p>
              <p>
                <strong className="text-foreground">Extrinsic rewards build intrinsic habits.</strong>{" "}
                Brushing teeth and getting ready for school start as point-earners. Within weeks
                they become <em>"things we just do"</em>. Graduate them off the chart and add
                the next stretch (e.g. unpacking the lunchbox). The points scaffold the habit;
                the habit eventually carries itself.
              </p>
              <p className="pt-2 border-t border-border text-muted-foreground italic">
                Tip from our founder: when a chore becomes automatic, retire it together —
                "You've mastered teeth-brushing, that one's free now" — and pick the next thing
                you're working on. Kids feel proud, the chart stays fresh.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function HistoryView({ transactions }: { transactions: Tx[] }) {
  if (!transactions.length) {
    return (
      <div className="py-12 text-center">
        <History className="h-8 w-8 mx-auto text-muted-foreground/40 mb-3" />
        <p className="text-sm text-muted-foreground">No activity yet today.</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Tap a chore on the Today tab to start.</p>
      </div>
    );
  }
  return (
    <div className="space-y-1.5">
      {transactions.map(tx => (
        <div key={tx.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
            tx.delta >= 0 ? "bg-emerald-500/15 text-emerald-600" : "bg-rose-500/15 text-rose-600"
          }`}>
            {tx.delta >= 0 ? <Star className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{tx.reason}</p>
            <p className="text-[10px] text-muted-foreground">{new Date(tx.created_at).toLocaleString(undefined, { weekday: "short", hour: "numeric", minute: "2-digit" })}</p>
          </div>
          <span className={`font-mono font-bold text-sm ${tx.delta >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
            {tx.delta > 0 ? "+" : ""}{tx.delta}
          </span>
        </div>
      ))}
    </div>
  );
}

function AdminPanel({ child, chores, behaviours, rewards, onChange, onEditChild }: {
  child: Child;
  chores: Chore[];
  behaviours: Behaviour[];
  rewards: Reward[];
  onChange: () => void;
  onEditChild: () => void;
}) {
  const { user } = useAuth();
  const [tab, setTab] = useState<"chores" | "behaviours" | "rewards">("chores");

  const removeChild = async () => {
    if (!confirm(`Remove ${child.name} and all their data?`)) return;
    await supabase.from("parenting_children").delete().eq("id", child.id);
    onChange();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 p-3 rounded-xl bg-secondary/40">
        <Users className="h-4 w-4 text-muted-foreground" />
        <span className="flex-1 text-sm font-medium">{child.name}</span>
        <button onClick={onEditChild} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
          <Pencil className="h-3 w-3" /> Edit
        </button>
        <button onClick={removeChild} className="text-xs text-rose-500 hover:text-rose-600 flex items-center gap-1">
          <Trash2 className="h-3 w-3" /> Remove
        </button>
      </div>

      <div className="flex gap-1 p-1 bg-secondary/50 rounded-xl">
        {(["chores", "behaviours", "rewards"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-xs font-medium capitalize ${tab === t ? "bg-card shadow-sm" : "text-muted-foreground"}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === "chores" && <ChoreEditor chores={chores} childId={child.id} onChange={onChange} />}
      {tab === "behaviours" && <BehaviourEditor behaviours={behaviours} childId={child.id} onChange={onChange} />}
      {tab === "rewards" && <RewardEditor rewards={rewards} childId={child.id} onChange={onChange} />}
    </div>
  );
}

async function generateChoreImage(name: string): Promise<string | null> {
  try {
    const { data, error } = await supabase.functions.invoke("chore-illustration", { body: { name } });
    if (error) {
      console.warn("chore-illustration failed:", error);
      return null;
    }
    return (data as any)?.imageUrl || null;
  } catch (e) {
    console.warn("chore-illustration error:", e);
    return null;
  }
}

function ChoreEditor({ chores, childId, onChange }: { chores: Chore[]; childId: string; onChange: () => void }) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [points, setPoints] = useState(1);
  const [category, setCategory] = useState<"must" | "bonus">("must");
  const [creating, setCreating] = useState(false);
  const [regenIds, setRegenIds] = useState<Set<string>>(new Set());

  const add = async () => {
    if (!name.trim() || !user) return;
    setCreating(true);
    const choreName = name.trim();
    // 1) Insert chore immediately so the parent sees it appear
    const { data: inserted } = await supabase
      .from("parenting_chores")
      .insert({ user_id: user.id, child_id: childId, name: choreName, points, category })
      .select()
      .single();
    setName(""); setPoints(1);
    onChange();
    // 2) Generate illustration in the background and patch row
    if (inserted?.id) {
      const url = await generateChoreImage(choreName);
      if (url) {
        await supabase.from("parenting_chores").update({ image_url: url }).eq("id", inserted.id);
        onChange();
      }
    }
    setCreating(false);
  };

  const regenerate = async (c: Chore) => {
    setRegenIds(s => new Set(s).add(c.id));
    const url = await generateChoreImage(c.name);
    if (url) {
      await supabase.from("parenting_chores").update({ image_url: url }).eq("id", c.id);
      onChange();
    }
    setRegenIds(s => { const n = new Set(s); n.delete(c.id); return n; });
  };

  const remove = async (id: string) => {
    await supabase.from("parenting_chores").update({ active: false }).eq("id", id);
    onChange();
  };

  return (
    <div className="space-y-3">
      <div className="p-3 rounded-xl bg-card border border-border space-y-2">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="New chore (e.g. Feed the dog)"
          className="w-full bg-transparent text-sm focus:outline-none" />
        <div className="flex items-center gap-2">
          <select value={category} onChange={e => setCategory(e.target.value as any)}
            className="text-xs bg-secondary rounded-lg px-2 py-1.5 focus:outline-none">
            <option value="must">Must-do</option>
            <option value="bonus">Bonus</option>
          </select>
          <input type="number" min={1} max={20} value={points} onChange={e => setPoints(Number(e.target.value))}
            className="w-16 text-xs bg-secondary rounded-lg px-2 py-1.5 focus:outline-none" />
          <span className="text-xs text-muted-foreground">pts</span>
          <button onClick={add} disabled={!name.trim() || creating}
            className="ml-auto flex items-center gap-1 px-3 py-1.5 rounded-lg bg-foreground text-background text-xs font-semibold disabled:opacity-40">
            {creating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
            {creating ? "Adding…" : "Add"}
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground italic">A small illustration is generated automatically so kids who can't read yet can recognise the chore.</p>
      </div>
      <div className="space-y-1.5">
        {chores.map(c => {
          const regen = regenIds.has(c.id);
          return (
            <div key={c.id} className="flex items-center gap-2 p-2.5 rounded-xl bg-card border border-border">
              {c.image_url ? (
                <img src={c.image_url} alt="" className="w-9 h-9 rounded-lg object-cover bg-secondary/30 shrink-0" />
              ) : (
                <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                  <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              )}
              <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${c.category === "must" ? "bg-secondary" : "bg-amber-500/15 text-amber-700"}`}>
                {c.category}
              </span>
              <span className="flex-1 text-sm truncate">{c.name}</span>
              <span className="text-xs font-mono">+{c.points}</span>
              <button onClick={() => regenerate(c)} disabled={regen} title="Regenerate illustration"
                className="text-muted-foreground hover:text-foreground disabled:opacity-50">
                {regen ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
              </button>
              <button onClick={() => remove(c.id)} className="text-muted-foreground hover:text-rose-500">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}


function BehaviourEditor({ behaviours, childId, onChange }: { behaviours: Behaviour[]; childId: string; onChange: () => void }) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [penalty, setPenalty] = useState(5);
  const [reset, setReset] = useState(false);

  const add = async () => {
    if (!name.trim() || !user) return;
    await supabase.from("parenting_behaviours").insert({ user_id: user.id, child_id: childId, name: name.trim(), penalty: reset ? 0 : penalty, reset_to_zero: reset });
    setName(""); setPenalty(5); setReset(false);
    onChange();
  };
  const remove = async (id: string) => {
    await supabase.from("parenting_behaviours").update({ active: false }).eq("id", id);
    onChange();
  };

  return (
    <div className="space-y-3">
      <div className="p-3 rounded-xl bg-card border border-border space-y-2">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Behaviour name (e.g. Hit sibling)"
          className="w-full bg-transparent text-sm focus:outline-none" />
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-xs">
            <input type="checkbox" checked={reset} onChange={e => setReset(e.target.checked)} />
            Reset to zero
          </label>
          {!reset && (
            <>
              <input type="number" min={1} max={50} value={penalty} onChange={e => setPenalty(Number(e.target.value))}
                className="w-16 text-xs bg-secondary rounded-lg px-2 py-1.5 focus:outline-none" />
              <span className="text-xs text-muted-foreground">pts off</span>
            </>
          )}
          <button onClick={add} disabled={!name.trim()}
            className="ml-auto flex items-center gap-1 px-3 py-1.5 rounded-lg bg-foreground text-background text-xs font-semibold disabled:opacity-40">
            <Plus className="h-3 w-3" /> Add
          </button>
        </div>
      </div>
      <div className="space-y-1.5">
        {behaviours.map(b => (
          <div key={b.id} className="flex items-center gap-2 p-2.5 rounded-xl bg-card border border-border">
            <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
            <span className="flex-1 text-sm">{b.name}</span>
            <span className="text-xs font-mono text-rose-600">{b.reset_to_zero ? "Reset" : `−${b.penalty}`}</span>
            <button onClick={() => remove(b.id)} className="text-muted-foreground hover:text-rose-500">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function RewardEditor({ rewards, childId, onChange }: { rewards: Reward[]; childId: string; onChange: () => void }) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [target, setTarget] = useState(25);

  const add = async () => {
    if (!name.trim() || !user) return;
    await supabase.from("parenting_rewards").insert({ user_id: user.id, child_id: childId, name: name.trim(), target_points: target });
    setName(""); setTarget(25);
    onChange();
  };
  const remove = async (id: string) => {
    await supabase.from("parenting_rewards").update({ active: false }).eq("id", id);
    onChange();
  };

  return (
    <div className="space-y-3">
      <div className="p-3 rounded-xl bg-card border border-border space-y-2">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Reward (e.g. Pick the movie)"
          className="w-full bg-transparent text-sm focus:outline-none" />
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Target</span>
          <input type="number" min={1} max={500} value={target} onChange={e => setTarget(Number(e.target.value))}
            className="w-20 text-xs bg-secondary rounded-lg px-2 py-1.5 focus:outline-none" />
          <span className="text-xs text-muted-foreground">pts</span>
          <button onClick={add} disabled={!name.trim()}
            className="ml-auto flex items-center gap-1 px-3 py-1.5 rounded-lg bg-foreground text-background text-xs font-semibold disabled:opacity-40">
            <Plus className="h-3 w-3" /> Add
          </button>
        </div>
      </div>
      <div className="space-y-1.5">
        {rewards.map(r => (
          <div key={r.id} className="flex items-center gap-2 p-2.5 rounded-xl bg-card border border-border">
            <Gift className="h-3.5 w-3.5 text-primary" />
            <span className="flex-1 text-sm">{r.name}</span>
            <span className="text-xs font-mono">{r.target_points} pts</span>
            <button onClick={() => remove(r.id)} className="text-muted-foreground hover:text-rose-500">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChildSetup({ onCreate, onCancel }: {
  onCreate: (data: { name: string; character_id: CharacterId; accent_color: string; age: number | null }) => Promise<void>;
  onCancel?: () => void;
}) {
  const [name, setName] = useState("");
  const [age, setAge] = useState<string>("");
  const [characterId, setCharacterId] = useState<CharacterId>("triumph");
  const [accent, setAccent] = useState(CHARACTERS.triumph.defaultColor);
  const [busy, setBusy] = useState(false);

  const character = CHARACTERS[characterId];

  return (
    <div className="space-y-5">
      <div className="text-center">
        <Sparkles className="h-6 w-6 mx-auto text-primary mb-2" />
        <h2 className="font-display text-xl font-bold">Add a child</h2>
        <p className="text-xs text-muted-foreground mt-1">Pick a buddy. Set the rules. Stay calm.</p>
      </div>

      <div>
        <p className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wider">Choose a buddy</p>
        <div className="grid grid-cols-5 gap-2">
          {CHARACTER_LIST.map(c => (
            <button key={c.id} onClick={() => { setCharacterId(c.id); setAccent(c.defaultColor); }}
              className={`aspect-square rounded-2xl transition-all flex items-center justify-center ${
                characterId === c.id
                  ? "ring-2 ring-foreground scale-105"
                  : "opacity-60 hover:opacity-90"
              }`}
              style={characterId === c.id ? { background: `${accent}1a` } : undefined}
            >
              <img src={c.image} alt={c.name} className="w-full h-full object-contain" />
            </button>
          ))}
        </div>
        {/* Caption: name + trait of selected buddy */}
        <motion.div
          key={characterId}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mt-3"
        >
          <p className="font-display text-base font-semibold text-foreground">{character.name}</p>
          <p className="text-xs text-muted-foreground italic mt-0.5">{character.trait}</p>
        </motion.div>
      </div>

      <div>
        <p className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wider">Accent colour</p>
        <div className="flex gap-2 flex-wrap">
          {ACCENT_COLORS.map(col => (
            <button key={col} onClick={() => setAccent(col)}
              className={`w-8 h-8 rounded-full border-2 transition-all ${accent === col ? "border-foreground scale-110" : "border-transparent"}`}
              style={{ background: col }} />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Child's name"
          className="w-full p-3 rounded-xl bg-card border border-border text-sm focus:outline-none focus:border-foreground/30" />
        <input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="Age (optional)" min={2} max={18}
          className="w-full p-3 rounded-xl bg-card border border-border text-sm focus:outline-none focus:border-foreground/30" />
      </div>

      <div className="flex gap-2">
        {onCancel && (
          <button onClick={onCancel} className="flex-1 py-3 rounded-xl bg-secondary text-foreground text-sm font-medium">Cancel</button>
        )}
        <button
          disabled={!name.trim() || busy}
          onClick={async () => {
            setBusy(true);
            await onCreate({ name: name.trim(), character_id: characterId, accent_color: accent, age: age ? Number(age) : null });
            setBusy(false);
          }}
          className="flex-1 py-3 rounded-xl bg-foreground text-background text-sm font-semibold disabled:opacity-40">
          {busy ? "Creating…" : "Add child"}
        </button>
      </div>
    </div>
  );
}
