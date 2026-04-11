import { motion } from "framer-motion";
import { useState as useStateLocal } from "react";
import { User, Mail, Crown, Zap, Calendar, Brain, PenLine, Settings, LogOut, ArrowUpRight, RefreshCw, Check, Dumbbell, ShoppingCart, ShieldCheck, Copy, Gift, ChevronRight, Moon, Utensils, Camera, MapPin, MessageSquarePlus, Flame } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import FeedbackForm from "@/components/FeedbackForm";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { haptic } from "@/hooks/use-mobile";
import { useEffect, useState, useMemo } from "react";
import { ContentSection } from "@/components/AtmosphericSection";
import { useProfile } from "@/hooks/useProfile";
import { useReferralStats } from "@/hooks/useReferral";
import { useCycle } from "@/contexts/CycleContext";
import { PHASE_SHORT } from "@/lib/cycle-utils";
import {
  FitnessGoal, FitnessLevel, Equipment,
  GOAL_LABELS, LEVEL_LABELS, EQUIPMENT_LABELS,
  getFitnessProfile, saveFitnessProfile,
  getSupermarket, saveSupermarket, SUPERMARKET_OPTIONS, SupermarketPreference,
} from "@/lib/fitness-profile";
import { getHabits, getHabitLog } from "@/data/self-care-rituals";
import { useHabitCompletions } from "@/hooks/useHabitCompletions";

const TIER_COLORS: Record<string, string> = { free: "text-muted-foreground", nourished: "text-primary", thriving: "text-primary" };
const TIER_LABELS: Record<string, string> = { free: "Free", nourished: "Nourished", thriving: "Thriving" };

export default function AccountPage() {
  const { user, session, subscription, refreshSubscription, loading } = useAuth();
  const profile = useProfile();
  const { displayName, avatarUrl, suburb, updateDisplayName, referralCode,
    dateOfBirth: profileDob, weightKg, heightCm, lastPeriodDate,
    dietaryPreferences, dietaryDislikes, calorieTarget, proteinTargetG, carbTargetG, fatTargetG, mealPrepDay,
    cycleMode,
  } = profile;
  const navigate = useNavigate();
  const { currentPhase, currentCycleDay } = useCycle();
  const habits = useMemo(() => getHabits(), []);
  const { history, historyLoading } = useHabitCompletions();
  const [credits, setCredits] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [nameSaving, setNameSaving] = useState(false);
  const [nameEditing, setNameEditing] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useStateLocal(false);

  // Fitness profile (localStorage)
  const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal>("general");
  const [fitnessLevel, setFitnessLevel] = useState<FitnessLevel>("beginner");
  const [fitnessEquipment, setFitnessEquipment] = useState<Equipment[]>(["none"]);
  const [fitnessInjuries, setFitnessInjuries] = useState("");
  const [fitnessEditing, setFitnessEditing] = useState(false);

  // Supermarket
  const [supermarket, setSupermarket] = useState<SupermarketPreference>(getSupermarket());

  // DOB editable
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [dobSaving, setDobSaving] = useState(false);

  // Cycle editable
  const [periodDate, setPeriodDate] = useState("");
  const [periodSaving, setPeriodSaving] = useState(false);

  useEffect(() => {
    const fp = getFitnessProfile();
    if (fp) { setFitnessGoal(fp.goal); setFitnessLevel(fp.level); setFitnessEquipment(fp.equipment); setFitnessInjuries(fp.injuries); }
  }, []);

  useEffect(() => { if (profileDob) setDateOfBirth(profileDob); }, [profileDob]);
  useEffect(() => { if (lastPeriodDate) setPeriodDate(lastPeriodDate); }, [lastPeriodDate]);

  useEffect(() => {
    if (!user) return;
    supabase.from("ai_credits").select("credits_remaining").eq("user_identifier", user.id).maybeSingle()
      .then(({ data }) => { if (data) setCredits(data.credits_remaining); });
  }, [user]);

  useEffect(() => { if (!loading && !user) navigate("/auth"); }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle()
      .then(({ data }) => setIsAdmin(!!data));
  }, [user]);

  const age = useMemo(() => {
    if (!dateOfBirth) return null;
    const diff = Date.now() - new Date(dateOfBirth).getTime();
    return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
  }, [dateOfBirth]);

  const handleManage = async () => {
    if (!session) return;
    haptic("medium");
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (err: any) { toast.error(err.message || "Could not open portal"); }
  };

  const handleRefresh = async () => { setRefreshing(true); await refreshSubscription(); setRefreshing(false); toast.success("Subscription refreshed"); };
  const handleSignOut = async () => { await supabase.auth.signOut(); toast.success("Signed out"); navigate("/"); };

  const saveDob = async () => {
    if (!user || !dateOfBirth) return;
    setDobSaving(true);
    await supabase.from("profiles").upsert({ user_id: user.id, date_of_birth: dateOfBirth } as any, { onConflict: "user_id" });
    setDobSaving(false); toast.success("Saved"); haptic("medium");
  };

  const savePeriod = async () => {
    if (!user || !periodDate) return;
    setPeriodSaving(true);
    await supabase.from("profiles").upsert({ user_id: user.id, last_period_date: periodDate } as any, { onConflict: "user_id" });
    setPeriodSaving(false); toast.success("Saved"); haptic("medium");
  };

  if (loading || !user) return null;

  const memberSince = user.created_at ? new Date(user.created_at).toLocaleDateString("en-NZ", { month: "long", year: "numeric" }) : "—";
  const locationLabel = suburb || null;

  return (
    <div className="relative">
      {/* ═══ PURPLE HEADER ═══ */}
      <div className="bg-primary pt-[max(env(safe-area-inset-top),12px)] pb-8 px-5">
        <div className="max-w-2xl mx-auto flex flex-col items-center text-center pt-6">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-primary-foreground/15 flex items-center justify-center mb-3 overflow-hidden border-2 border-primary-foreground/20">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="h-8 w-8 text-primary-foreground/60" />
            )}
          </div>
          <h1 className="font-display text-xl font-bold italic text-primary-foreground">
            {displayName || "My Account"}
          </h1>
          {locationLabel && (
            <p className="font-body text-sm text-primary-foreground/60 mt-0.5 flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {locationLabel}
            </p>
          )}
        </div>
      </div>

      <ContentSection className="px-5 md:px-4 max-w-2xl mx-auto space-y-[4.5rem] -mt-4">
        {/* Admin */}
        {isAdmin && (
          <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            onClick={() => { haptic("light"); navigate("/admin"); }}
            className="w-full card-warm p-4 flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-display text-base italic text-foreground">Admin Dashboard</p>
              <p className="font-body text-xs text-muted-foreground">Manage users, groups & stats</p>
            </div>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </motion.button>
        )}

        {/* ═══ SECTION: PERSONAL DETAILS ═══ */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-warm p-5 space-y-5">
          <h2 className="font-display text-lg italic text-foreground flex items-center gap-2">
            <User className="h-[1.125rem] w-[1.125rem] text-primary" /> Personal Details
          </h2>

          {/* Name */}
          <div>
            <p className="font-body text-[11px] uppercase tracking-wider text-muted-foreground mb-0.5">Display Name</p>
            {nameEditing ? (
              <div className="flex items-center gap-2">
                <input value={nameInput} onChange={(e) => setNameInput(e.target.value)} placeholder="Enter your name..." maxLength={50}
                  className="flex-1 rounded-xl bg-background border border-border px-3.5 py-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30" autoFocus
                  onKeyDown={(e) => { if (e.key === "Enter") { (async () => { setNameSaving(true); await updateDisplayName(nameInput); setNameEditing(false); setNameSaving(false); toast.success("Name updated"); })(); } }} />
                <button onClick={async () => { setNameSaving(true); await updateDisplayName(nameInput); setNameEditing(false); setNameSaving(false); toast.success("Name updated"); }}
                  disabled={nameSaving} className="inline-flex items-center gap-1 rounded-xl bg-primary px-3.5 py-2.5 font-body text-sm font-semibold text-primary-foreground">
                  <Check className="h-3.5 w-3.5" /> {nameSaving ? "..." : "Save"}
                </button>
              </div>
            ) : (
              <button onClick={() => { setNameInput(displayName || ""); setNameEditing(true); }}
                className="font-body text-sm text-foreground hover:text-primary transition-colors flex items-center gap-1.5">
                {displayName || "Set your name"} <PenLine className="h-3 w-3 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* DOB + Age */}
          <div>
            <p className="font-body text-[11px] uppercase tracking-wider text-muted-foreground mb-0.5">Date of Birth {age !== null && <span className="text-foreground font-medium">({age} years old)</span>}</p>
            <div className="flex items-center gap-2">
              <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)}
                className="flex-1 bg-secondary border border-border rounded-lg px-3 py-2 text-foreground font-body text-sm" />
              <button disabled={dobSaving || !dateOfBirth} onClick={saveDob}
                className="inline-flex items-center gap-1 rounded-xl bg-primary px-3 py-2 font-body text-xs font-semibold text-primary-foreground disabled:opacity-40">
                <Check className="h-3 w-3" /> {dobSaving ? "..." : "Save"}
              </button>
            </div>
          </div>

          {/* Email */}
          <div>
            <p className="font-body text-[11px] uppercase tracking-wider text-muted-foreground mb-0.5">Email</p>
            <p className="font-body text-sm text-foreground flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-muted-foreground" /> {user.email}</p>
          </div>

          {/* Location */}
          <div>
            <p className="font-body text-[11px] uppercase tracking-wider text-muted-foreground mb-0.5">Location</p>
            <p className="font-body text-sm text-foreground flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground" /> {suburb || <span className="text-muted-foreground">Set in Community tab</span>}
            </p>
          </div>
        </motion.div>

        {/* ═══ SECTION: YOUR BODY ═══ */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card-warm p-5 space-y-4">
          <h2 className="font-display text-lg italic text-foreground flex items-center gap-2">
            <Dumbbell className="h-[1.125rem] w-[1.125rem] text-primary" /> Your Body
          </h2>

          {/* Stats row */}
          {(weightKg || heightCm) && (
            <div className="flex gap-3">
              {weightKg && (
                <div className="rounded-xl bg-secondary/50 px-3 py-2">
                  <p className="font-body text-[10px] text-muted-foreground uppercase">Weight</p>
                  <p className="font-body text-sm font-semibold text-foreground">{weightKg} kg</p>
                </div>
              )}
              {heightCm && (
                <div className="rounded-xl bg-secondary/50 px-3 py-2">
                  <p className="font-body text-[10px] text-muted-foreground uppercase">Height</p>
                  <p className="font-body text-sm font-semibold text-foreground">{heightCm} cm</p>
                </div>
              )}
              {age !== null && (
                <div className="rounded-xl bg-secondary/50 px-3 py-2">
                  <p className="font-body text-[10px] text-muted-foreground uppercase">Age</p>
                  <p className="font-body text-sm font-semibold text-foreground">{age}</p>
                </div>
              )}
            </div>
          )}

          {!fitnessEditing && getFitnessProfile() ? (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-primary/10 px-3 py-1 font-body text-xs font-medium text-primary">{GOAL_LABELS[fitnessGoal]}</span>
                <span className="rounded-full bg-secondary px-3 py-1 font-body text-xs font-medium text-foreground">{LEVEL_LABELS[fitnessLevel]}</span>
                {fitnessEquipment.map(e => (
                  <span key={e} className="rounded-full bg-secondary px-3 py-1 font-body text-xs text-muted-foreground">{EQUIPMENT_LABELS[e]}</span>
                ))}
              </div>
              {fitnessInjuries && <p className="font-body text-xs text-muted-foreground">Injuries: {fitnessInjuries}</p>}
              <button onClick={() => setFitnessEditing(true)} className="inline-flex items-center gap-1 rounded-xl bg-secondary px-3 py-2 font-body text-xs font-semibold text-foreground">
                <PenLine className="h-3 w-3" /> Edit
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="font-body text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Fitness Goal</p>
                <select value={fitnessGoal} onChange={e => setFitnessGoal(e.target.value as FitnessGoal)} className="w-full rounded-xl border border-border bg-card px-3 py-2.5 font-body text-sm text-foreground">
                  {(Object.keys(GOAL_LABELS) as FitnessGoal[]).map(g => <option key={g} value={g}>{GOAL_LABELS[g]}</option>)}
                </select>
              </div>
              <div>
                <p className="font-body text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Experience Level</p>
                <div className="flex gap-2">
                  {(Object.keys(LEVEL_LABELS) as FitnessLevel[]).map(l => (
                    <button key={l} onClick={() => setFitnessLevel(l)} className={`flex-1 rounded-xl px-3 py-2.5 font-body text-xs font-medium transition-all ${fitnessLevel === l ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                      {LEVEL_LABELS[l]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="font-body text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Equipment</p>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(EQUIPMENT_LABELS) as Equipment[]).map(eq => {
                    const active = fitnessEquipment.includes(eq);
                    return (
                      <button key={eq} onClick={() => setFitnessEquipment(prev => active ? prev.filter(x => x !== eq) : [...prev, eq])}
                        className={`rounded-xl px-3 py-2.5 font-body text-xs font-medium transition-all ${active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                        {EQUIPMENT_LABELS[eq]}
                      </button>
                    );
                  })}
                </div>
              </div>
              <button onClick={() => { saveFitnessProfile({ goal: fitnessGoal, level: fitnessLevel, equipment: fitnessEquipment, injuries: fitnessInjuries }); setFitnessEditing(false); toast.success("Fitness profile saved"); haptic("medium"); }}
                className="inline-flex items-center gap-1 rounded-xl bg-primary px-4 py-2.5 font-body text-sm font-semibold text-primary-foreground">
                <Check className="h-3.5 w-3.5" /> Save Profile
              </button>
            </div>
          )}
        </motion.div>

        {/* ═══ SECTION: YOUR FOOD ═══ */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-warm p-5 space-y-4">
          <h2 className="font-display text-lg italic text-foreground flex items-center gap-2">
            <Utensils className="h-[1.125rem] w-[1.125rem] text-primary" /> Your Food
          </h2>

          {/* Dietary preferences */}
          {dietaryPreferences.length > 0 && (
            <div>
              <p className="font-body text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Dietary Preferences</p>
              <div className="flex flex-wrap gap-1.5">
                {dietaryPreferences.map(p => (
                  <span key={p} className="rounded-full bg-primary/10 px-2.5 py-1 font-body text-xs text-primary">{p}</span>
                ))}
              </div>
            </div>
          )}

          {dietaryDislikes.length > 0 && (
            <div>
              <p className="font-body text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Dislikes</p>
              <div className="flex flex-wrap gap-1.5">
                {dietaryDislikes.map(d => (
                  <span key={d} className="rounded-full bg-destructive/10 px-2.5 py-1 font-body text-xs text-destructive">{d}</span>
                ))}
              </div>
            </div>
          )}

          {/* Macro targets */}
          {calorieTarget && (
            <div>
              <p className="font-body text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Daily Targets</p>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-xl bg-secondary/50 px-3 py-1.5 font-body text-xs"><span className="font-semibold text-foreground">{calorieTarget}</span> <span className="text-muted-foreground">kcal</span></span>
                {proteinTargetG && <span className="rounded-xl bg-secondary/50 px-3 py-1.5 font-body text-xs"><span className="font-semibold text-foreground">{proteinTargetG}g</span> <span className="text-muted-foreground">protein</span></span>}
                {carbTargetG && <span className="rounded-xl bg-secondary/50 px-3 py-1.5 font-body text-xs"><span className="font-semibold text-foreground">{carbTargetG}g</span> <span className="text-muted-foreground">carbs</span></span>}
                {fatTargetG && <span className="rounded-xl bg-secondary/50 px-3 py-1.5 font-body text-xs"><span className="font-semibold text-foreground">{fatTargetG}g</span> <span className="text-muted-foreground">fat</span></span>}
              </div>
            </div>
          )}

          {mealPrepDay && (
            <div>
              <p className="font-body text-[11px] uppercase tracking-wider text-muted-foreground mb-0.5">Meal Prep Day</p>
              <p className="font-body text-sm text-foreground capitalize">{mealPrepDay}</p>
            </div>
          )}

          {!dietaryPreferences.length && !calorieTarget && (
            <p className="font-body text-sm text-muted-foreground">Set up your dietary preferences in the Nutrition tab.</p>
          )}
        </motion.div>

        {/* ═══ SECTION: YOUR CYCLE ═══ */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card-warm p-5 space-y-4">
          <h2 className="font-display text-lg italic text-foreground flex items-center gap-2">
            <Moon className="h-[1.125rem] w-[1.125rem] text-primary" /> Your Cycle
          </h2>

          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-primary/10 px-3 py-1 font-body text-xs font-medium text-primary capitalize">{cycleMode}</span>
            <span className="rounded-full bg-secondary px-3 py-1 font-body text-xs font-medium text-foreground">
              Day {currentCycleDay} · {PHASE_SHORT[currentPhase]}
            </span>
          </div>

          <div>
            <p className="font-body text-[11px] uppercase tracking-wider text-muted-foreground mb-0.5">First Day of Last Period</p>
            <div className="flex items-center gap-2">
              <input type="date" value={periodDate} onChange={(e) => setPeriodDate(e.target.value)}
                className="flex-1 bg-secondary border border-border rounded-lg px-3 py-2 text-foreground font-body text-sm" />
              <button disabled={periodSaving || !periodDate} onClick={savePeriod}
                className="inline-flex items-center gap-1 rounded-xl bg-primary px-3 py-2 font-body text-xs font-semibold text-primary-foreground disabled:opacity-40">
                <Check className="h-3 w-3" /> {periodSaving ? "..." : "Save"}
              </button>
            </div>
          </div>
        </motion.div>

        {/* ═══ SECTION: WEEKLY CONSISTENCY ═══ */}
        {habits.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.17 }} className="card-warm p-5 space-y-4">
            <h2 className="font-display text-lg italic text-foreground flex items-center gap-2">
              <Flame className="h-[1.125rem] w-[1.125rem] text-orange-500" /> Weekly Consistency
            </h2>

            {historyLoading ? (
              <div className="flex items-center justify-center py-6">
                <div className="h-5 w-5 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
              </div>
            ) : (() => {
              const last7: string[] = [];
              for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                last7.push(d.toISOString().split("T")[0]);
              }
              const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];

              const habitStats = habits.map(h => {
                const count = last7.filter(d => history[d]?.has(h.id)).length;
                return { ...h, count };
              });
              const totalPossible = habits.length * 7;
              const totalDone = habitStats.reduce((sum, h) => sum + h.count, 0);
              const overallPct = totalPossible > 0 ? Math.round((totalDone / totalPossible) * 100) : 0;

              // Daily completion rates
              const dailyPcts = last7.map(d => {
                const done = habits.filter(h => history[d]?.has(h.id)).length;
                return { date: d, pct: habits.length > 0 ? Math.round((done / habits.length) * 100) : 0 };
              });

              const phaseColor = currentPhase === "menstrual" ? "#C4526E" : currentPhase === "follicular" ? "#5C4A9E" : currentPhase === "ovulatory" ? "#C47A8A" : "#9B89B4";

              return (
                <>
                  {/* Overall stat */}
                  <div className="flex items-center justify-between">
                    <span className="font-body text-2xl font-bold text-foreground">{overallPct}%</span>
                    <span className="font-body text-xs text-muted-foreground">{totalDone}/{totalPossible} completed</span>
                  </div>

                  {/* Day circles */}
                  <div className="flex items-center gap-2 justify-between">
                    {dailyPcts.map((d, i) => {
                      const isToday = i === dailyPcts.length - 1;
                      const dow = new Date(d.date + "T12:00:00").getDay();
                      return (
                        <div key={d.date} className="flex flex-col items-center gap-1.5">
                          <div
                            className="h-8 w-8 rounded-full flex items-center justify-center border-2 transition-all"
                            style={{
                              borderColor: d.pct === 0 ? "hsl(var(--border))" : phaseColor,
                              backgroundColor: d.pct >= 80 ? phaseColor : d.pct > 0 ? `${phaseColor}66` : "transparent",
                              boxShadow: isToday ? `0 0 0 2px ${phaseColor}33` : undefined,
                            }}
                          >
                            {d.pct >= 80 && <Check className="h-3 w-3 text-white" />}
                          </div>
                          <span className={`font-body text-[10px] ${isToday ? "font-bold text-foreground" : "text-muted-foreground"}`}>
                            {dayLabels[dow]}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Top habits */}
                  <div className="space-y-1.5 pt-2 border-t border-border/30">
                    {habitStats.sort((a, b) => b.count - a.count).slice(0, 5).map(h => (
                      <div key={h.id} className="flex items-center justify-between">
                        <span className="font-body text-xs text-foreground truncate max-w-[180px]">{h.name}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-border overflow-hidden">
                            <div className="h-full rounded-full transition-all" style={{ width: `${(h.count / 7) * 100}%`, backgroundColor: phaseColor }} />
                          </div>
                          <span className="font-body text-[10px] text-muted-foreground w-8 text-right">{h.count}/7</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              );
            })()}
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card-warm p-5 space-y-3">
          <h2 className="font-display text-lg italic text-foreground flex items-center gap-2">
            <ShoppingCart className="h-[1.125rem] w-[1.125rem] text-primary" /> Linked Supermarket
          </h2>
          <div className="space-y-1">
            {SUPERMARKET_OPTIONS.map(s => (
              <button key={s.name} onClick={() => { setSupermarket(s); saveSupermarket(s); toast.success(`Set to ${s.name}`); haptic("light"); }}
                className={`w-full flex items-center justify-between rounded-xl px-4 py-2.5 text-sm font-body transition-all ${supermarket.name === s.name ? "bg-primary/10 text-primary font-semibold" : "bg-secondary/30 text-foreground hover:bg-secondary/50"}`}>
                <span>{s.name}</span>
                {supermarket.name === s.name && <Check className="h-4 w-4" />}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ═══ SECTION: MEMBERSHIP ═══ */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="card-warm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg italic text-foreground flex items-center gap-2">
              <Crown className="h-[1.125rem] w-[1.125rem] text-primary" /> Membership
            </h2>
            <button onClick={handleRefresh} disabled={refreshing} className="text-muted-foreground hover:text-foreground">
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className={`font-display text-2xl font-bold italic ${TIER_COLORS[subscription.tier]}`}>
              {TIER_LABELS[subscription.tier]}
            </span>
            {subscription.subscribed && (
              <span className="rounded-full bg-primary/15 px-2.5 py-0.5 font-body text-[11px] font-semibold text-primary">Active</span>
            )}
          </div>

          {subscription.subscriptionEnd && (
            <p className="font-body text-xs text-muted-foreground">
              Renews {new Date(subscription.subscriptionEnd).toLocaleDateString("en-NZ", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          )}

          <div className="flex gap-2 flex-wrap">
            {subscription.subscribed ? (
              <button onClick={handleManage} className="inline-flex items-center gap-1.5 rounded-xl bg-secondary px-4 py-2.5 font-body text-sm font-semibold text-foreground">
                <Settings className="h-3.5 w-3.5" /> Manage billing <ArrowUpRight className="h-3 w-3 opacity-50" />
              </button>
            ) : (
              <button onClick={() => navigate("/membership")} className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 font-body text-sm font-bold text-primary-foreground">
                <Zap className="h-3.5 w-3.5" /> Upgrade plan
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="text-center">
              <Brain className="h-4 w-4 text-primary mx-auto mb-1" />
              <p className="font-body text-lg text-foreground">{credits ?? "—"}</p>
              <p className="font-body text-[10px] text-muted-foreground">{subscription.tier === "free" ? "of 5 signals left" : "AI credits"}</p>
            </div>
            <div className="text-center">
              <Calendar className="h-4 w-4 text-primary mx-auto mb-1" />
              <p className="font-body text-xs font-semibold text-foreground">{memberSince}</p>
              <p className="font-body text-[10px] text-muted-foreground">Member since</p>
            </div>
          </div>

          {/* Referral */}
          {referralCode && (
            <div className="pt-3 border-t border-border/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-body text-[10px] text-muted-foreground/40 uppercase tracking-widest">refer a friend</p>
                  <p className="text-sm text-foreground/70 mt-0.5">{referralCode}</p>
                </div>
                <button onClick={() => { navigator.clipboard.writeText(`https://signalnz.lovable.app?ref=${referralCode}`); haptic("light"); toast.success("Link copied!"); }}
                  className="font-body text-[10px] border border-border rounded-full px-3 py-1.5 text-muted-foreground">copy</button>
              </div>
            </div>
          )}
        </motion.div>

        <button onClick={() => setFeedbackOpen(true)} className="flex items-center justify-between w-full py-3 border-b border-border/10">
          <span className="text-sm text-muted-foreground flex items-center gap-2">
            <MessageSquarePlus className="h-4 w-4" />
            Share feedback
          </span>
          <ChevronRight className="w-4 h-4 text-muted-foreground/25" />
        </button>

        <Sheet open={feedbackOpen} onOpenChange={setFeedbackOpen}>
          <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto rounded-t-2xl">
            <SheetHeader className="pb-2">
              <SheetTitle className="font-display text-lg">Share Feedback</SheetTitle>
              <p className="text-xs text-muted-foreground">Report a bug, suggest a feature, or tell us what you think.</p>
            </SheetHeader>
            <FeedbackForm onSubmitted={() => setFeedbackOpen(false)} />
          </SheetContent>
        </Sheet>

        {/* Sign out */}
        <button onClick={handleSignOut} className="w-full card-warm p-4 flex items-center gap-3 text-left active:bg-destructive/10 transition-colors">
          <LogOut className="h-5 w-5 text-destructive flex-shrink-0" />
          <p className="font-display text-sm italic text-destructive">Sign out</p>
        </button>
      </ContentSection>
    </div>
  );
}
