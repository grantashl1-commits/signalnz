import { motion } from "framer-motion";
import { User, Mail, Crown, Zap, Calendar, Brain, PenLine, Settings, LogOut, ArrowUpRight, RefreshCw, MessageSquareText, Check } from "lucide-react";
import FeedbackForm from "@/components/FeedbackForm";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { haptic } from "@/hooks/use-mobile";
import { useEffect, useState } from "react";
import { AtmosphericHero, ContentSection } from "@/components/AtmosphericSection";
import { BotanicalSprig } from "@/components/BotanicalElements";
import { useProfile } from "@/hooks/useProfile";

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
  const { displayName, updateDisplayName } = useProfile();
  const navigate = useNavigate();
  const [credits, setCredits] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [nameSaving, setNameSaving] = useState(false);
  const [nameEditing, setNameEditing] = useState(false);

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

  if (loading || !user) return null;

  const memberSince = user.created_at ? new Date(user.created_at).toLocaleDateString("en-NZ", { month: "long", year: "numeric" }) : "—";

  return (
    <div className="relative">
      <AtmosphericHero size="sm">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
            <User className="h-7 w-7 text-primary-foreground/70" />
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold italic text-primary-foreground">My Account</h1>
          <p className="font-body text-sm text-primary-foreground/60 mt-1">{user.email}</p>
        </div>
      </AtmosphericHero>

      <ContentSection className="px-5 md:px-4 max-w-2xl mx-auto space-y-5">
        {/* Subscription Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-warm p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg italic text-foreground flex items-center gap-2">
              <Crown className="h-4.5 w-4.5 text-primary" /> Subscription
            </h2>
            <button onClick={handleRefresh} disabled={refreshing} className="text-muted-foreground hover:text-foreground transition-colors">
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            </button>
          </div>

          <div className="flex items-center gap-3 mb-3">
            <span className={`font-display text-2xl font-bold italic ${TIER_COLORS[subscription.tier]}`}>
              {TIER_LABELS[subscription.tier]}
            </span>
            {subscription.subscribed && (
              <span className="rounded-full bg-phase-follicular/15 px-2.5 py-0.5 font-body text-[11px] font-semibold text-phase-follicular">
                Active
              </span>
            )}
          </div>

          {subscription.subscriptionEnd && (
            <p className="font-body text-xs text-muted-foreground mb-3">
              Renews {new Date(subscription.subscriptionEnd).toLocaleDateString("en-NZ", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          )}

          <div className="flex gap-2 flex-wrap">
            {subscription.subscribed ? (
              <button
                onClick={handleManage}
                className="inline-flex items-center gap-1.5 rounded-xl bg-secondary px-4 py-2.5 font-body text-sm font-semibold text-foreground active:bg-secondary/80 transition-opacity"
              >
                <Settings className="h-3.5 w-3.5" /> Manage billing
                <ArrowUpRight className="h-3 w-3 opacity-50" />
              </button>
            ) : (
              <button
                onClick={() => navigate("/membership")}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 font-body text-sm font-bold text-primary-foreground active:opacity-90 transition-opacity"
              >
                <Zap className="h-3.5 w-3.5" /> Upgrade plan
              </button>
            )}
            <button
              onClick={() => navigate("/membership")}
              className="inline-flex items-center gap-1.5 rounded-xl bg-secondary/60 px-4 py-2.5 font-body text-sm font-medium text-foreground active:bg-secondary/80 transition-opacity"
            >
              View plans
            </button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="grid grid-cols-2 gap-3"
        >
          <div className="card-warm p-4 text-center">
            <Brain className="h-5 w-5 text-primary mx-auto mb-2" />
            <p className="font-mono text-xl text-foreground">{credits ?? "—"}</p>
            <p className="font-body text-[11px] text-muted-foreground mt-0.5">AI credits left</p>
          </div>
          <div className="card-warm p-4 text-center">
            <Calendar className="h-5 w-5 text-primary mx-auto mb-2" />
            <p className="font-body text-sm font-semibold text-foreground">{memberSince}</p>
            <p className="font-body text-[11px] text-muted-foreground mt-0.5">Member since</p>
          </div>
        </motion.div>

        {/* Profile Info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          className="card-warm p-5"
        >
          <h2 className="font-display text-lg italic text-foreground mb-4 flex items-center gap-2">
            <Mail className="h-4.5 w-4.5 text-primary" /> Profile
          </h2>
          <div className="space-y-3">
            <div>
              <p className="font-body text-[11px] uppercase tracking-wider text-muted-foreground mb-0.5">Display name</p>
              {nameEditing ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Your name"
                    className="flex-1 rounded-lg border border-border bg-card px-3 py-1.5 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    autoFocus
                  />
                  <button
                    disabled={nameSaving}
                    onClick={async () => {
                      setNameSaving(true);
                      const err = await updateDisplayName(nameInput);
                      setNameSaving(false);
                      if (err) {
                        toast.error("Failed to save name");
                      } else {
                        toast.success("Name saved");
                        setNameEditing(false);
                      }
                    }}
                    className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 font-body text-xs font-semibold text-primary-foreground disabled:opacity-50"
                  >
                    <Check className="h-3 w-3" /> Save
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setNameInput(displayName || "");
                    setNameEditing(true);
                  }}
                  className="font-body text-sm text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
                >
                  {displayName || "Set your name"} <PenLine className="h-3 w-3 text-muted-foreground" />
                </button>
              )}
            </div>
            <div>
              <p className="font-body text-[11px] uppercase tracking-wider text-muted-foreground mb-0.5">Email</p>
              <p className="font-body text-sm text-foreground">{user.email}</p>
            </div>
            <div>
              <p className="font-body text-[11px] uppercase tracking-wider text-muted-foreground mb-0.5">User ID</p>
              <p className="font-mono text-xs text-muted-foreground">{user.id.slice(0, 8)}…</p>
            </div>
            {user.app_metadata?.provider && (
              <div>
                <p className="font-body text-[11px] uppercase tracking-wider text-muted-foreground mb-0.5">Sign-in method</p>
                <p className="font-body text-sm text-foreground capitalize">{user.app_metadata.provider}</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24 }}
          className="space-y-2"
        >
          <button
            onClick={() => navigate("/membership")}
            className="w-full card-warm p-4 flex items-center gap-3 text-left active:bg-secondary/80 transition-colors"
          >
            <Crown className="h-5 w-5 text-primary flex-shrink-0" />
            <div className="flex-1">
              <p className="font-display text-sm italic text-foreground">Membership plans</p>
              <p className="font-body text-[11px] text-muted-foreground">Compare tiers & upgrade</p>
            </div>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </button>

          <button
            onClick={() => navigate("/feedback")}
            className="w-full card-warm p-4 flex items-center gap-3 text-left active:bg-secondary/80 transition-colors"
          >
            <MessageSquareText className="h-5 w-5 text-primary flex-shrink-0" />
            <div className="flex-1">
              <p className="font-display text-sm italic text-foreground">Feedback dashboard</p>
              <p className="font-body text-[11px] text-muted-foreground">View all submitted feedback</p>
            </div>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </button>

          <button
            onClick={handleSignOut}
            className="w-full card-warm p-4 flex items-center gap-3 text-left active:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-5 w-5 text-destructive flex-shrink-0" />
            <div className="flex-1">
              <p className="font-display text-sm italic text-destructive">Sign out</p>
              <p className="font-body text-[11px] text-muted-foreground">Log out of your account</p>
            </div>
          </button>
        </motion.div>

        {/* Feedback Form */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <FeedbackForm />
        </motion.div>

        <BotanicalSprig width={140} className="mx-auto mt-6" />
      </ContentSection>
    </div>
  );
}
