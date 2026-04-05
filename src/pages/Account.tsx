import { motion } from "framer-motion";
import { User, Mail, Crown, Zap, Calendar, Brain, PenLine, Settings, LogOut, ArrowUpRight, RefreshCw, MessageSquareText, Check, Dumbbell, ShoppingCart, ShieldCheck, Copy, Gift, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { haptic } from "@/hooks/use-mobile";
import { useEffect, useState } from "react";
import { AtmosphericHero, ContentSection } from "@/components/AtmosphericSection";
import { useProfile } from "@/hooks/useProfile";
import { useReferralStats } from "@/hooks/useReferral";
import {
  FitnessGoal, FitnessLevel, Equipment, FitnessProfile,
  GOAL_LABELS, LEVEL_LABELS, EQUIPMENT_LABELS,
  getFitnessProfile, saveFitnessProfile,
  getSupermarket, saveSupermarket, SUPERMARKET_OPTIONS, SupermarketPreference,
} from "@/lib/fitness-profile";

const TIER_COLORS: Record<string, string> = {
  free: "text-muted-foreground",
  nourished: "text-phase-follicular",
  thriving: "text-phase-ovulatory",
};

const TIER_LABELS: Record<string, string> = {
  free: "Free",
  nourished: "Nourished",
  thriving: "Thriving",
};

export default function AccountPage() {
  const { user, session, subscription, refreshSubscription, loading } = useAuth();
  const { displayName, updateDisplayName, referralCode } = useProfile();
  const navigate = useNavigate();
  const [credits, setCredits] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [nameSaving, setNameSaving] = useState(false);
  const [nameEditing, setNameEditing] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Fitness profile
  const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal>("general");
  const [fitnessLevel, setFitnessLevel] = useState<FitnessLevel>("beginner");
  const [fitnessEquipment, setFitnessEquipment] = useState<Equipment[]>(["none"]);
  const [fitnessInjuries, setFitnessInjuries] = useState("");
  const [fitnessEditing, setFitnessEditing] = useState(false);

  // Supermarket
  const [supermarket, setSupermarket] = useState<SupermarketPreference>(getSupermarket());

  // Date of birth
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [dobSaving, setDobSaving] = useState(false);

  useEffect(() => {
    const fp = getFitnessProfile();
    if (fp) {
      setFitnessGoal(fp.goal);
      setFitnessLevel(fp.level);
      setFitnessEquipment(fp.equipment);
      setFitnessInjuries(fp.injuries);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchCredits = async () => {
      const { data } = await supabase
        .from("ai_credits")
        .select("credits_remaining")
        .eq("user_identifier", user.id)
        .maybeSingle();
      if (data) setCredits(data.credits_remaining);
    };
    fetchCredits();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const fetchDob = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("date_of_birth")
        .eq("user_id", user.id)
        .maybeSingle();
      if ((data as any)?.date_of_birth) setDateOfBirth((data as any).date_of_birth);
    };
    fetchDob();
  }, [user]);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const handleManage = async () => {
    if (!session) return;
    haptic("medium");
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (err: any) {
      toast.error(err.message || "Could not open portal");
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshSubscription();
    setRefreshing(false);
    toast.success("Subscription refreshed");
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate("/");
  };

  useEffect(() => {
    if (!user) return;
    supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle()
      .then(({ data }) => setIsAdmin(!!data));
  }, [user]);

  if (loading || !user) return null;

  const memberSince = user.created_at ? new Date(user.created_at).toLocaleDateString("en-NZ", { month: "long", year: "numeric" }) : "—";

  return (
    <div className="relative">
      <AtmosphericHero size="sm">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
            <User className="h-7 w-7 text-primary-foreground/70" />
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold italic text-primary-foreground">
            {displayName || "My Account"}
          </h1>
          <p className="font-body text-sm text-primary-foreground/60 mt-1">{user.email}</p>
        </div>
      </AtmosphericHero>

      <ContentSection className="px-5 md:px-4 max-w-2xl mx-auto space-y-5">
        {/* Admin Button */}
        {isAdmin && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => { haptic("light"); navigate("/admin"); }}
            className="w-full card-warm p-4 flex items-center gap-3 text-left"
          >
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

        {/* ═══ SECTION 1: YOU ═══ */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-warm p-5 space-y-4">
          <h2 className="font-display text-lg italic text-foreground flex items-center gap-2">
            <User className="h-[1.125rem] w-[1.125rem] text-primary" /> You
          </h2>

          {/* Display Name */}
          <div>
            <p className="font-body text-[11px] uppercase tracking-wider text-muted-foreground mb-0.5">Display name</p>
            {nameEditing ? (
              <div className="flex items-center gap-2">
                <input
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Enter your name..."
                  maxLength={50}
                  className="flex-1 rounded-xl bg-background border border-border px-3.5 py-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      (async () => {
                        setNameSaving(true);
                        await updateDisplayName(nameInput);
                        setNameEditing(false);
                        setNameSaving(false);
                        toast.success("Name updated");
                      })();
                    }
                  }}
                />
                <button
                  onClick={async () => {
                    setNameSaving(true);
                    await updateDisplayName(nameInput);
                    setNameEditing(false);
                    setNameSaving(false);
                    toast.success("Name updated");
                  }}
                  disabled={nameSaving}
                  className="inline-flex items-center gap-1 rounded-xl bg-primary px-3.5 py-2.5 font-body text-sm font-semibold text-primary-foreground active:opacity-90 transition-opacity"
                >
                  <Check className="h-3.5 w-3.5" /> {nameSaving ? "..." : "Save"}
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setNameInput(displayName || ""); setNameEditing(true); }}
                className="font-body text-sm text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
              >
                {displayName || "Set your name"} <PenLine className="h-3 w-3 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* Date of Birth */}
          <div>
            <p className="font-body text-[11px] uppercase tracking-wider text-muted-foreground mb-0.5">Date of birth</p>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="flex-1 bg-secondary border border-border rounded-lg px-3 py-2 text-foreground font-body text-sm"
              />
              <button
                disabled={dobSaving || !dateOfBirth}
                onClick={async () => {
                  if (!user || !dateOfBirth) return;
                  setDobSaving(true);
                  await supabase
                    .from("profiles")
                    .upsert({ user_id: user.id, date_of_birth: dateOfBirth } as any, { onConflict: "user_id" });
                  setDobSaving(false);
                  toast.success("Saved");
                  haptic("medium");
                }}
                className="inline-flex items-center gap-1 rounded-xl bg-primary px-3 py-2 font-body text-xs font-semibold text-primary-foreground disabled:opacity-40"
              >
                <Check className="h-3 w-3" /> {dobSaving ? "..." : "Save"}
              </button>
            </div>
          </div>

          {/* Email (read only) */}
          <div>
            <p className="font-body text-[11px] uppercase tracking-wider text-muted-foreground mb-0.5">Email</p>
            <p className="font-body text-sm text-foreground">{user.email}</p>
          </div>
        </motion.div>

        {/* ═══ SECTION 2: YOUR BODY ═══ */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="card-warm p-5 space-y-4">
          <h2 className="font-display text-lg italic text-foreground flex items-center gap-2">
            <Dumbbell className="h-[1.125rem] w-[1.125rem] text-primary" /> Your Body
          </h2>

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
                      <button key={eq} onClick={() => setFitnessEquipment(prev => active ? prev.filter(x => x !== eq) : [...prev, eq])} className={`rounded-xl px-3 py-2.5 font-body text-xs font-medium transition-all ${active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                        {EQUIPMENT_LABELS[eq]}
                      </button>
                    );
                  })}
                </div>
              </div>
              <button
                onClick={() => {
                  saveFitnessProfile({ goal: fitnessGoal, level: fitnessLevel, equipment: fitnessEquipment, injuries: fitnessInjuries });
                  setFitnessEditing(false);
                  toast.success("Fitness profile saved");
                  haptic("medium");
                }}
                className="inline-flex items-center gap-1 rounded-xl bg-primary px-4 py-2.5 font-body text-sm font-semibold text-primary-foreground"
              >
                <Check className="h-3.5 w-3.5" /> Save Profile
              </button>
            </div>
          )}

          {/* Supermarket */}
          <div className="pt-3 border-t border-border/30">
            <p className="font-body text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Linked Supermarket</p>
            <div className="space-y-1">
              {SUPERMARKET_OPTIONS.map(s => (
                <button
                  key={s.name}
                  onClick={() => {
                    setSupermarket(s);
                    saveSupermarket(s);
                    toast.success(`Set to ${s.name}`);
                    haptic("light");
                  }}
                  className={`w-full flex items-center justify-between rounded-xl px-4 py-2.5 text-sm font-body transition-all ${
                    supermarket.name === s.name
                      ? "bg-primary/10 text-primary font-semibold"
                      : "bg-secondary/30 text-foreground hover:bg-secondary/50"
                  }`}
                >
                  <span>{s.name}</span>
                  {supermarket.name === s.name && <Check className="h-4 w-4" />}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ═══ SECTION 3: MEMBERSHIP ═══ */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="card-warm p-5 space-y-4">
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
              <span className="rounded-full bg-phase-follicular/15 px-2.5 py-0.5 font-body text-[11px] font-semibold text-phase-follicular">Active</span>
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
              <p className="font-mono text-lg text-foreground">{credits ?? "—"}</p>
              <p className="font-body text-[10px] text-muted-foreground">{subscription.tier === "free" ? "of 5 signals left" : "AI credits"}</p>
            </div>
            <div className="text-center">
              <Calendar className="h-4 w-4 text-primary mx-auto mb-1" />
              <p className="font-body text-xs font-semibold text-foreground">{memberSince}</p>
              <p className="font-body text-[10px] text-muted-foreground">Member since</p>
            </div>
          </div>

          {/* Referral — single row */}
          {referralCode && (
            <div className="pt-3 border-t border-border/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-[10px] text-muted-foreground/40 uppercase tracking-widest">refer a friend</p>
                  <p className="text-sm text-foreground/70 mt-0.5">{referralCode}</p>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`https://signalnz.lovable.app?ref=${referralCode}`);
                    haptic("light");
                    toast.success("Link copied!");
                  }}
                  className="font-mono text-[10px] border border-border rounded-full px-3 py-1.5 text-muted-foreground"
                >
                  copy
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Share feedback link */}
        <button onClick={() => navigate("/feedback")} className="flex items-center justify-between w-full py-3 border-b border-border/10">
          <span className="text-sm text-muted-foreground">Share feedback</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground/25" />
        </button>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="w-full card-warm p-4 flex items-center gap-3 text-left active:bg-destructive/10 transition-colors"
        >
          <LogOut className="h-5 w-5 text-destructive flex-shrink-0" />
          <p className="font-display text-sm italic text-destructive">Sign out</p>
        </button>
      </ContentSection>
    </div>
  );
}
