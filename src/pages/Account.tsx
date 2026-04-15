import { motion } from "framer-motion";
import { useState as useStateLocal } from "react";
import { User, Mail, Crown, Zap, Calendar, Brain, PenLine, Settings, LogOut, ArrowUpRight, RefreshCw, Check, Dumbbell, ShoppingCart, ShieldCheck, Copy, Gift, ChevronRight, Moon, Utensils, Camera, MapPin, MessageSquarePlus, Flame, Download, Trash2, AlertTriangle, X } from "lucide-react";
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
  getSupermarket, saveSupermarket, SUPERMARKET_OPTIONS, SupermarketPreference,
} from "@/lib/fitness-profile";
import { getHabits, getHabitLog } from "@/data/self-care-rituals";
import { useHabitCompletions } from "@/hooks/useHabitCompletions";

const TIER_COLORS: Record<string, string> = { free: "text-muted-foreground", nourished: "text-primary", thriving: "text-primary" };
const TIER_LABELS: Record<string, string> = { free: "Free", nourished: "Nourished", thriving: "Thriving" };

const MOVEMENT_GOALS = [
  { id: "strength", label: "Build strength" },
  { id: "fat_loss", label: "Lose fat / body recomp" },
  { id: "cardio", label: "Improve fitness & cardio" },
  { id: "stress", label: "Reduce stress & feel calmer" },
  { id: "consistency", label: "Build consistency" },
  { id: "mobility", label: "Flexibility & mobility" },
  { id: "event", label: "Train for an event" },
  { id: "recovery", label: "Recover from injury" },
];

const DIETARY_PREFERENCES = [
  { id: "omnivore", label: "Omnivore" },
  { id: "vegetarian", label: "Vegetarian" },
  { id: "vegan", label: "Vegan" },
  { id: "gluten_free", label: "Gluten-free" },
  { id: "dairy_free", label: "Dairy-free" },
  { id: "pescatarian", label: "Pescatarian" },
  { id: "low_carb", label: "Low-carb" },
  { id: "mediterranean", label: "Mediterranean" },
];

const FITNESS_LEVELS = [
  { id: "beginner", label: "Beginner" },
  { id: "intermediate", label: "Intermediate" },
  { id: "advanced", label: "Advanced" },
];

const EQUIPMENT_OPTIONS = [
  { id: "home-none", label: "No Equipment" },
  { id: "home-some", label: "Home Equipment" },
  { id: "gym", label: "Full Gym" },
];

const CYCLE_OPTIONS = [
  { id: "cycling", label: "Regular cycles" },
  { id: "perimenopause", label: "Perimenopause" },
  { id: "post_menopause", label: "Post-menopause" },
];

export default function AccountPage() {
  const { user, session, subscription, refreshSubscription, loading } = useAuth();
  const profile = useProfile();
  const { displayName, avatarUrl, suburb, updateDisplayName, referralCode,
    dateOfBirth: profileDob, weightKg, heightCm, lastPeriodDate,
    dietaryPreferences, dietaryDislikes, calorieTarget, proteinTargetG, carbTargetG, fatTargetG, mealPrepDay,
    cycleMode, fitnessLevel: profileFitnessLevel, equipmentPreference, movementGoals,
    goalWeightKg, cycleStatus,
    refetch,
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

  // Supermarket
  const [supermarket, setSupermarket] = useState<SupermarketPreference>(getSupermarket());

  // Editable body fields
  const [bodyEditing, setBodyEditing] = useState(false);
  const [editWeight, setEditWeight] = useState<string>("");
  const [editHeight, setEditHeight] = useState<string>("");
  const [editGoalWeight, setEditGoalWeight] = useState<string>("");
  const [editFitnessLevel, setEditFitnessLevel] = useState<string>("beginner");
  const [editEquipment, setEditEquipment] = useState<string>("home-some");
  const [editMovementGoals, setEditMovementGoals] = useState<string[]>([]);

  // Editable food fields
  const [foodEditing, setFoodEditing] = useState(false);
  const [editDietPrefs, setEditDietPrefs] = useState<string[]>([]);
  const [editDietDislikes, setEditDietDislikes] = useState<string>("");

  // Editable cycle fields
  const [cycleEditing, setCycleEditing] = useState(false);
  const [editCycleStatus, setEditCycleStatus] = useState<string>("cycling");
  const [editPeriodDate, setEditPeriodDate] = useState<string>("");
  const [editDob, setEditDob] = useState<string>("");

  const [saving, setSaving] = useState(false);

  // Sync edit fields from profile
  useEffect(() => {
    setEditWeight(weightKg?.toString() || "");
    setEditHeight(heightCm?.toString() || "");
    setEditGoalWeight(goalWeightKg?.toString() || "");
    setEditFitnessLevel(profileFitnessLevel || "beginner");
    setEditEquipment(equipmentPreference || "home-some");
    setEditMovementGoals(movementGoals || []);
    setEditDietPrefs(dietaryPreferences || []);
    setEditDietDislikes((dietaryDislikes || []).join(", "));
    setEditCycleStatus(cycleStatus || cycleMode || "cycling");
    setEditPeriodDate(lastPeriodDate || "");
    setEditDob(profileDob || "");
  }, [weightKg, heightCm, goalWeightKg, profileFitnessLevel, equipmentPreference, movementGoals, dietaryPreferences, dietaryDislikes, cycleStatus, cycleMode, lastPeriodDate, profileDob]);

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
    const dob = editDob || profileDob;
    if (!dob) return null;
    const diff = Date.now() - new Date(dob).getTime();
    return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
  }, [editDob, profileDob]);

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

  const saveBodyProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").upsert({
      user_id: user.id,
      weight_kg: editWeight ? parseFloat(editWeight) : null,
      height_cm: editHeight ? parseFloat(editHeight) : null,
      goal_weight_kg: editGoalWeight ? parseFloat(editGoalWeight) : null,
      fitness_level: editFitnessLevel,
      equipment_preference: editEquipment,
      movement_goals: editMovementGoals,
      date_of_birth: editDob || null,
    } as any, { onConflict: "user_id" });
    setSaving(false);
    if (!error) {
      toast.success("Body profile updated");
      setBodyEditing(false);
      refetch();
    } else toast.error("Failed to save");
  };

  const saveFoodProfile = async () => {
    if (!user) return;
    setSaving(true);
    const dislikes = editDietDislikes.split(",").map(s => s.trim()).filter(Boolean);
    const { error } = await supabase.from("profiles").upsert({
      user_id: user.id,
      dietary_preferences: editDietPrefs,
      dietary_dislikes: dislikes,
    } as any, { onConflict: "user_id" });
    setSaving(false);
    if (!error) {
      toast.success("Food preferences updated");
      setFoodEditing(false);
      refetch();
    } else toast.error("Failed to save");
  };

  const saveCycleProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").upsert({
      user_id: user.id,
      cycle_status: editCycleStatus,
      cycle_mode: editCycleStatus,
      last_period_date: editPeriodDate || null,
    } as any, { onConflict: "user_id" });
    setSaving(false);
    if (!error) {
      toast.success("Cycle info updated");
      setCycleEditing(false);
      refetch();
    } else toast.error("Failed to save");
  };

  if (loading || !user) return null;

  const memberSince = user.created_at ? new Date(user.created_at).toLocaleDateString("en-NZ", { month: "long", year: "numeric" }) : "—";
  const locationLabel = suburb || null;

  return (
    <div className="relative">
      {/* ═══ PURPLE HEADER ═══ */}
      <div className="bg-primary pt-[max(env(safe-area-inset-top),12px)] pb-8 px-5">
        <div className="max-w-2xl mx-auto flex flex-col items-center text-center pt-6">
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
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg italic text-foreground flex items-center gap-2">
              <Dumbbell className="h-[1.125rem] w-[1.125rem] text-primary" /> Your Body
            </h2>
            {!bodyEditing && (
              <button onClick={() => setBodyEditing(true)} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">
                <PenLine className="h-3 w-3" /> Edit
              </button>
            )}
          </div>

          {!bodyEditing ? (
            <div className="space-y-3">
              {/* Stats row */}
              <div className="flex flex-wrap gap-2">
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
                {goalWeightKg && (
                  <div className="rounded-xl bg-secondary/50 px-3 py-2">
                    <p className="font-body text-[10px] text-muted-foreground uppercase">Goal</p>
                    <p className="font-body text-sm font-semibold text-foreground">{goalWeightKg} kg</p>
                  </div>
                )}
              </div>

              {/* Fitness tags */}
              <div className="flex flex-wrap gap-1.5">
                {profileFitnessLevel && (
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 font-body text-xs text-primary capitalize">{profileFitnessLevel}</span>
                )}
                {equipmentPreference && (
                  <span className="rounded-full bg-secondary px-2.5 py-1 font-body text-xs text-foreground">
                    {EQUIPMENT_OPTIONS.find(e => e.id === equipmentPreference)?.label || equipmentPreference}
                  </span>
                )}
              </div>

              {/* Movement goals */}
              {movementGoals && movementGoals.length > 0 && (
                <div>
                  <p className="font-body text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Movement Goals</p>
                  <div className="flex flex-wrap gap-1.5">
                    {movementGoals.map(g => (
                      <span key={g} className="rounded-full bg-secondary/70 px-2.5 py-1 font-body text-xs text-foreground">
                        {MOVEMENT_GOALS.find(m => m.id === g)?.label || g}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* DOB */}
              {profileDob && (
                <div>
                  <p className="font-body text-[11px] uppercase tracking-wider text-muted-foreground mb-0.5">Date of Birth</p>
                  <p className="font-body text-sm text-foreground">{new Date(profileDob + "T12:00:00").toLocaleDateString("en-NZ", { day: "numeric", month: "long", year: "numeric" })} {age !== null && <span className="text-muted-foreground">({age} yrs)</span>}</p>
                </div>
              )}

              {!weightKg && !heightCm && !profileFitnessLevel && (
                <p className="font-body text-sm text-muted-foreground">Tap edit to add your body details.</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* DOB */}
              <div>
                <p className="font-body text-xs uppercase tracking-wider text-muted-foreground mb-1">Date of Birth</p>
                <input type="date" value={editDob} onChange={e => setEditDob(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-3 py-2.5 font-body text-sm text-foreground" />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="font-body text-xs uppercase tracking-wider text-muted-foreground mb-1">Weight (kg)</p>
                  <input type="number" value={editWeight} onChange={e => setEditWeight(e.target.value)} placeholder="65"
                    className="w-full rounded-xl border border-border bg-card px-3 py-2.5 font-body text-sm text-foreground" />
                </div>
                <div>
                  <p className="font-body text-xs uppercase tracking-wider text-muted-foreground mb-1">Height (cm)</p>
                  <input type="number" value={editHeight} onChange={e => setEditHeight(e.target.value)} placeholder="165"
                    className="w-full rounded-xl border border-border bg-card px-3 py-2.5 font-body text-sm text-foreground" />
                </div>
                <div>
                  <p className="font-body text-xs uppercase tracking-wider text-muted-foreground mb-1">Goal (kg)</p>
                  <input type="number" value={editGoalWeight} onChange={e => setEditGoalWeight(e.target.value)} placeholder="60"
                    className="w-full rounded-xl border border-border bg-card px-3 py-2.5 font-body text-sm text-foreground" />
                </div>
              </div>

              {/* Fitness Level */}
              <div>
                <p className="font-body text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Fitness Level</p>
                <div className="flex gap-2">
                  {FITNESS_LEVELS.map(l => (
                    <button key={l.id} onClick={() => setEditFitnessLevel(l.id)}
                      className={`flex-1 rounded-xl px-3 py-2.5 font-body text-xs font-medium transition-all ${editFitnessLevel === l.id ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Equipment */}
              <div>
                <p className="font-body text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Equipment</p>
                <div className="flex flex-wrap gap-2">
                  {EQUIPMENT_OPTIONS.map(eq => (
                    <button key={eq.id} onClick={() => setEditEquipment(eq.id)}
                      className={`rounded-xl px-3 py-2.5 font-body text-xs font-medium transition-all ${editEquipment === eq.id ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                      {eq.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Movement Goals */}
              <div>
                <p className="font-body text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Movement Goals</p>
                <div className="flex flex-wrap gap-2">
                  {MOVEMENT_GOALS.map(g => {
                    const active = editMovementGoals.includes(g.id);
                    return (
                      <button key={g.id} onClick={() => setEditMovementGoals(prev => active ? prev.filter(x => x !== g.id) : [...prev, g.id])}
                        className={`rounded-xl px-3 py-2 font-body text-xs font-medium transition-all ${active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                        {g.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={saveBodyProfile} disabled={saving}
                  className="inline-flex items-center gap-1 rounded-xl bg-primary px-4 py-2.5 font-body text-sm font-semibold text-primary-foreground disabled:opacity-50">
                  <Check className="h-3.5 w-3.5" /> {saving ? "Saving..." : "Save"}
                </button>
                <button onClick={() => setBodyEditing(false)} className="inline-flex items-center gap-1 rounded-xl bg-secondary px-4 py-2.5 font-body text-sm text-foreground">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* ═══ SECTION: YOUR FOOD ═══ */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-warm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg italic text-foreground flex items-center gap-2">
              <Utensils className="h-[1.125rem] w-[1.125rem] text-primary" /> Your Food
            </h2>
            {!foodEditing && (
              <button onClick={() => setFoodEditing(true)} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">
                <PenLine className="h-3 w-3" /> Edit
              </button>
            )}
          </div>

          {!foodEditing ? (
            <div className="space-y-3">
              {dietaryPreferences.length > 0 && (
                <div>
                  <p className="font-body text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Dietary Preferences</p>
                  <div className="flex flex-wrap gap-1.5">
                    {dietaryPreferences.map(p => (
                      <span key={p} className="rounded-full bg-primary/10 px-2.5 py-1 font-body text-xs text-primary">
                        {DIETARY_PREFERENCES.find(d => d.id === p)?.label || p}
                      </span>
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
                <p className="font-body text-sm text-muted-foreground">Tap edit to set your dietary preferences.</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="font-body text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Dietary Preferences</p>
                <div className="flex flex-wrap gap-2">
                  {DIETARY_PREFERENCES.map(p => {
                    const active = editDietPrefs.includes(p.id);
                    return (
                      <button key={p.id} onClick={() => setEditDietPrefs(prev => active ? prev.filter(x => x !== p.id) : [...prev, p.id])}
                        className={`rounded-xl px-3 py-2 font-body text-xs font-medium transition-all ${active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="font-body text-xs uppercase tracking-wider text-muted-foreground mb-1">Dislikes (comma-separated)</p>
                <input value={editDietDislikes} onChange={e => setEditDietDislikes(e.target.value)} placeholder="e.g. mushrooms, olives"
                  className="w-full rounded-xl border border-border bg-card px-3 py-2.5 font-body text-sm text-foreground" />
              </div>

              <div className="flex gap-2">
                <button onClick={saveFoodProfile} disabled={saving}
                  className="inline-flex items-center gap-1 rounded-xl bg-primary px-4 py-2.5 font-body text-sm font-semibold text-primary-foreground disabled:opacity-50">
                  <Check className="h-3.5 w-3.5" /> {saving ? "Saving..." : "Save"}
                </button>
                <button onClick={() => setFoodEditing(false)} className="inline-flex items-center gap-1 rounded-xl bg-secondary px-4 py-2.5 font-body text-sm text-foreground">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* ═══ SECTION: YOUR CYCLE ═══ */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card-warm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg italic text-foreground flex items-center gap-2">
              <Moon className="h-[1.125rem] w-[1.125rem] text-primary" /> Your Cycle
            </h2>
            {!cycleEditing && (
              <button onClick={() => setCycleEditing(true)} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">
                <PenLine className="h-3 w-3" /> Edit
              </button>
            )}
          </div>

          {!cycleEditing ? (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-primary/10 px-3 py-1 font-body text-xs font-medium text-primary capitalize">
                  {CYCLE_OPTIONS.find(c => c.id === (cycleStatus || cycleMode))?.label || cycleMode}
                </span>
                <span className="rounded-full bg-secondary px-3 py-1 font-body text-xs font-medium text-foreground">
                  Day {currentCycleDay} · {PHASE_SHORT[currentPhase]}
                </span>
              </div>

              {lastPeriodDate && (
                <div>
                  <p className="font-body text-[11px] uppercase tracking-wider text-muted-foreground mb-0.5">Last Period Start</p>
                  <p className="font-body text-sm text-foreground">{new Date(lastPeriodDate + "T12:00:00").toLocaleDateString("en-NZ", { day: "numeric", month: "long", year: "numeric" })}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="font-body text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Cycle Status</p>
                <div className="space-y-1.5">
                  {CYCLE_OPTIONS.map(c => (
                    <button key={c.id} onClick={() => setEditCycleStatus(c.id)}
                      className={`w-full text-left rounded-xl px-4 py-3 font-body text-sm transition-all ${editCycleStatus === c.id ? "bg-primary/10 text-primary font-semibold border border-primary/30" : "bg-secondary text-foreground"}`}>
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {editCycleStatus === "cycling" && (
                <div>
                  <p className="font-body text-xs uppercase tracking-wider text-muted-foreground mb-1">First Day of Last Period</p>
                  <input type="date" value={editPeriodDate} onChange={e => setEditPeriodDate(e.target.value)}
                    className="w-full rounded-xl border border-border bg-card px-3 py-2.5 font-body text-sm text-foreground" />
                </div>
              )}

              <div className="flex gap-2">
                <button onClick={saveCycleProfile} disabled={saving}
                  className="inline-flex items-center gap-1 rounded-xl bg-primary px-4 py-2.5 font-body text-sm font-semibold text-primary-foreground disabled:opacity-50">
                  <Check className="h-3.5 w-3.5" /> {saving ? "Saving..." : "Save"}
                </button>
                <button onClick={() => setCycleEditing(false)} className="inline-flex items-center gap-1 rounded-xl bg-secondary px-4 py-2.5 font-body text-sm text-foreground">
                  Cancel
                </button>
              </div>
            </div>
          )}
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

              const dailyPcts = last7.map(d => {
                const done = habits.filter(h => history[d]?.has(h.id)).length;
                return { date: d, pct: habits.length > 0 ? Math.round((done / habits.length) * 100) : 0 };
              });

              const phaseColor = currentPhase === "menstrual" ? "#C4526E" : currentPhase === "follicular" ? "#5C4A9E" : currentPhase === "ovulatory" ? "#C47A8A" : "#9B89B4";

              return (
                <>
                  <div className="flex items-center justify-between">
                    <span className="font-body text-2xl font-bold text-foreground">{overallPct}%</span>
                    <span className="font-body text-xs text-muted-foreground">{totalDone}/{totalPossible} completed</span>
                  </div>

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

        {/* Data & Privacy (GDPR) */}
        <div className="py-3 border-b border-border/10 space-y-3">
          <p className="font-body text-[10px] text-muted-foreground/40 uppercase tracking-widest">Data & Privacy</p>
          
          <button
            onClick={async () => {
              if (!session) return;
              haptic("light");
              toast.loading("Preparing your data export…", { id: "export" });
              try {
                const { data, error } = await supabase.functions.invoke("gdpr-export", {
                  headers: { Authorization: `Bearer ${session.access_token}` },
                });
                if (error) throw error;
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `signal-data-export-${new Date().toISOString().split("T")[0]}.json`;
                a.click();
                URL.revokeObjectURL(url);
                toast.success("Data exported!", { id: "export" });
              } catch {
                toast.error("Export failed. Please try again.", { id: "export" });
              }
            }}
            className="flex items-center justify-between w-full py-2"
          >
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download my data
            </span>
            <ChevronRight className="w-4 h-4 text-muted-foreground/25" />
          </button>

          <button
            onClick={() => {
              haptic("medium");
              const confirmed = window.confirm(
                "This will permanently delete your account and ALL your data. This action cannot be undone.\n\nAre you sure?"
              );
              if (!confirmed || !session) return;
              const doubleConfirm = window.prompt(
                'Type "DELETE" to permanently delete your account:'
              );
              if (doubleConfirm !== "DELETE") {
                toast.info("Account deletion cancelled.");
                return;
              }
              toast.loading("Deleting your account…", { id: "delete-account" });
              supabase.functions.invoke("gdpr-delete", {
                headers: { Authorization: `Bearer ${session.access_token}` },
                body: { confirm: "DELETE_MY_ACCOUNT" },
              }).then(({ error }) => {
                if (error) {
                  toast.error("Deletion failed. Please contact support.", { id: "delete-account" });
                  return;
                }
                toast.success("Account deleted.", { id: "delete-account" });
                supabase.auth.signOut();
                navigate("/");
              });
            }}
            className="flex items-center justify-between w-full py-2"
          >
            <span className="text-sm text-destructive flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              Delete my account
            </span>
            <AlertTriangle className="w-4 h-4 text-destructive/40" />
          </button>
        </div>

        {/* Legal & support links */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 py-3 border-b border-border/10">
          {[
            { label: "Terms", path: "/terms" },
            { label: "Privacy", path: "/privacy-policy" },
            { label: "Refunds", path: "/refund-policy" },
            { label: "Contact", path: "/contact" },
          ].map((l) => (
            <button key={l.path} onClick={() => navigate(l.path)} className="text-xs text-muted-foreground/60 hover:text-primary transition-colors">
              {l.label}
            </button>
          ))}
        </div>

        {/* Sign out */}
        <button onClick={handleSignOut} className="w-full card-warm p-4 flex items-center gap-3 text-left active:bg-destructive/10 transition-colors">
          <LogOut className="h-5 w-5 text-destructive flex-shrink-0" />
          <p className="font-display text-sm italic text-destructive">Sign out</p>
        </button>
      </ContentSection>
    </div>
  );
}