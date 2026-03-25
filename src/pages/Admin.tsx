import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Users, DollarSign, TrendingUp, Shield, Clock, CheckCircle, XCircle,
  MessageSquare, Activity, ChevronDown, ChevronUp, MapPin, Star, AlertCircle,
  CreditCard, BarChart3, Loader2, Trash2, Archive, Info
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface AdminStats {
  stripe: {
    activeSubscriptions: number;
    canceledSubscriptions: number;
    mrr: number;
    monthlyRevenue: number;
    tierCounts: { nourished: number; thriving: number; other: number };
    recentCancellations: { email: string; canceledAt: string | null }[];
  } | null;
  community: {
    groups: any[];
    memberships: any[];
  };
  users: {
    totalProfiles: number;
    profiles: any[];
  };
  ai: {
    totalUsage: number;
    recentUsage: any[];
    credits: any[];
  };
  feedback: any[];
}

function StatCard({ icon: Icon, label, value, sub, color = "text-primary", tooltip }: {
  icon: any; label: string; value: string | number; sub?: string; color?: string; tooltip?: string;
}) {
  return (
    <div className="card-warm p-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-xl bg-secondary/50 ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
            {tooltip && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-muted-foreground/60 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[240px] text-xs">
                    {tooltip}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <p className="font-display text-2xl font-bold text-foreground">{value}</p>
          {sub && <p className="font-mono text-[10px] text-muted-foreground">{sub}</p>}
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { user, session } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "groups" | "members" | "feedback" | "ai" | "nps">("overview");
  const [updatingGroup, setUpdatingGroup] = useState<string | null>(null);

  // Check admin role
  useEffect(() => {
    if (!user) { setIsAdmin(false); return; }
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle()
      .then(({ data }) => setIsAdmin(!!data));
  }, [user]);

  const fetchStats = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-stats", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error;
      setStats(data);
    } catch (e: any) {
      toast.error(e.message || "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (isAdmin) fetchStats();
  }, [isAdmin, fetchStats]);

  const handleGroupAction = async (groupId: string, status: "approved" | "rejected") => {
    setUpdatingGroup(groupId);
    const { error } = await supabase
      .from("community_groups")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", groupId);
    if (error) {
      toast.error("Failed to update group");
    } else {
      toast.success(`Group ${status}`);
      fetchStats();
    }
    setUpdatingGroup(null);
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm("Are you sure you want to permanently delete this community group? This cannot be undone.")) return;
    setUpdatingGroup(groupId);
    await supabase.from("community_memberships").delete().eq("group_id", groupId);
    const { error } = await supabase.from("community_groups").delete().eq("id", groupId);
    if (error) {
      toast.error("Failed to delete group");
    } else {
      toast.success("Group deleted");
      fetchStats();
    }
    setUpdatingGroup(null);
  };

  const handleArchiveGroup = async (groupId: string) => {
    setUpdatingGroup(groupId);
    const { error } = await supabase
      .from("community_groups")
      .update({ status: "rejected", updated_at: new Date().toISOString() })
      .eq("id", groupId);
    if (error) {
      toast.error("Failed to archive group");
    } else {
      toast.success("Group archived");
      fetchStats();
    }
    setUpdatingGroup(null);
  };

  if (!user) return <Navigate to="/auth" replace />;
  if (isAdmin === null) return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (isAdmin === false) return <Navigate to="/" replace />;

  const pendingGroups = stats?.community.groups.filter(g => g.status === "pending") || [];
  const approvedGroups = stats?.community.groups.filter(g => g.status === "approved") || [];
  const rejectedGroups = stats?.community.groups.filter(g => g.status === "rejected") || [];

  const TABS = [
    { id: "overview" as const, label: "Overview" },
    { id: "groups" as const, label: `Groups${pendingGroups.length ? ` (${pendingGroups.length})` : ""}` },
    { id: "members" as const, label: "Members" },
    { id: "feedback" as const, label: "Feedback" },
    { id: "ai" as const, label: "AI Usage" },
    { id: "nps" as const, label: "NPS" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="h-6 w-6 text-primary" />
        <h1 className="font-display text-2xl font-bold text-foreground">Admin Dashboard</h1>
      </div>

      {/* Tabs */}
      <div className="flex bg-secondary/50 rounded-2xl p-1 mb-6 overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex-1 py-2.5 rounded-xl text-center font-display text-xs transition-all whitespace-nowrap min-w-0 ${
              activeTab === t.id
                ? "bg-card text-foreground shadow-sm font-medium"
                : "text-muted-foreground italic"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : stats && (
        <>
          {/* ═══ OVERVIEW ═══ */}
          {activeTab === "overview" && (
            <div className="space-y-4">
              {/* Revenue stats */}
              <p className="font-mono text-[11px] text-muted-foreground uppercase tracking-wider">Revenue</p>
              <div className="grid grid-cols-3 gap-3">
                <StatCard icon={DollarSign} label="MRR" value={`$${stats.stripe?.mrr?.toFixed(0) || 0}`} sub="Monthly recurring" color="text-phase-follicular" tooltip="Monthly Recurring Revenue — calculated from active subscription values. May differ from collected revenue if billing cycle falls outside this window." />
                <StatCard icon={TrendingUp} label="Collected (30 Days)" value={`$${stats.stripe?.monthlyRevenue?.toFixed(0) || 0}`} sub="Payments received in last 30 days" color="text-phase-follicular" />
                <StatCard icon={BarChart3} label="Lifetime Revenue" value="$0" sub="Lifetime total" color="text-phase-follicular" />
                <StatCard icon={CreditCard} label="Active Subs" value={stats.stripe?.activeSubscriptions || 0} sub={`${stats.stripe?.tierCounts.nourished || 0} nourished · ${stats.stripe?.tierCounts.thriving || 0} thriving`} />
                <StatCard icon={XCircle} label="Cancelled" value={stats.stripe?.canceledSubscriptions || 0} color="text-destructive" />
              </div>

              {/* Platform stats */}
              <p className="font-mono text-[11px] text-muted-foreground uppercase tracking-wider mt-6">Platform</p>
              <div className="grid grid-cols-2 gap-3">
                <StatCard icon={Users} label="Users" value={stats.users.totalProfiles} />
                <StatCard icon={MapPin} label="Communities" value={approvedGroups.length} sub={`${pendingGroups.length} pending`} />
                <StatCard icon={Activity} label="AI Requests" value={stats.ai.totalUsage} sub="Last 100 shown" />
                <StatCard icon={MessageSquare} label="Feedback" value={stats.feedback.length} sub={`${stats.feedback.filter(f => f.status === "open").length} open`} />
              </div>

              {/* Pending approvals quick view */}
              {pendingGroups.length > 0 && (
                <div className="mt-6">
                  <p className="font-mono text-[11px] text-muted-foreground uppercase tracking-wider mb-2">Pending Approvals</p>
                  {pendingGroups.slice(0, 3).map(g => (
                    <div key={g.id} className="card-warm p-4 mb-2 flex items-center gap-3">
                      <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-display text-sm font-bold italic text-foreground">{g.name}</p>
                        <p className="font-mono text-[10px] text-muted-foreground">{g.suburb} · {g.group_type}</p>
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleGroupAction(g.id, "approved")}
                          disabled={updatingGroup === g.id}
                          className="p-1.5 rounded-lg bg-phase-follicular/10 text-phase-follicular hover:bg-phase-follicular/20 transition-colors"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleGroupAction(g.id, "rejected")}
                          disabled={updatingGroup === g.id}
                          className="p-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {pendingGroups.length > 3 && (
                    <button onClick={() => setActiveTab("groups")} className="font-mono text-[11px] text-primary">
                      View all {pendingGroups.length} pending →
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ═══ GROUPS ═══ */}
          {activeTab === "groups" && (
            <div className="space-y-6">
              {/* Pending */}
              <div>
                <p className="font-mono text-[11px] text-muted-foreground uppercase tracking-wider mb-2">
                  Pending ({pendingGroups.length})
                </p>
                {pendingGroups.length === 0 ? (
                  <p className="font-display text-sm italic text-muted-foreground">No pending requests</p>
                ) : pendingGroups.map(g => (
                  <GroupCard key={g.id} group={g} onAction={handleGroupAction} updating={updatingGroup === g.id} showActions />
                ))}
              </div>

              {/* Approved */}
              <div>
                <p className="font-mono text-[11px] text-muted-foreground uppercase tracking-wider mb-2">
                  Active ({approvedGroups.length})
                </p>
                {approvedGroups.map(g => (
                  <GroupCard key={g.id} group={g} onAction={handleGroupAction} onDelete={handleDeleteGroup} onArchive={handleArchiveGroup} updating={updatingGroup === g.id} showManage />
                ))}
              </div>

              {/* Rejected */}
              {rejectedGroups.length > 0 && (
                <div>
                  <p className="font-mono text-[11px] text-muted-foreground uppercase tracking-wider mb-2">
                    Rejected ({rejectedGroups.length})
                  </p>
                  {rejectedGroups.map(g => (
                    <GroupCard key={g.id} group={g} onAction={handleGroupAction} onDelete={handleDeleteGroup} onArchive={handleArchiveGroup} updating={updatingGroup === g.id} showReapprove />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═══ MEMBERS ═══ */}
          {activeTab === "members" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 mb-4">
                <StatCard icon={CreditCard} label="Active Subs" value={stats.stripe?.activeSubscriptions || 0} />
                <StatCard icon={XCircle} label="Cancelled" value={stats.stripe?.canceledSubscriptions || 0} color="text-destructive" />
              </div>

              {/* Tier breakdown */}
              {stats.stripe && (
                <div className="card-warm p-4 mb-4">
                  <p className="font-mono text-[11px] text-muted-foreground uppercase tracking-wider mb-3">Subscription Tiers</p>
                  <div className="space-y-2">
                    <TierBar label="Nourished ($19/mo)" count={stats.stripe.tierCounts.nourished} total={stats.stripe.activeSubscriptions} color="bg-phase-follicular" />
                    <TierBar label="Thriving ($39/mo)" count={stats.stripe.tierCounts.thriving} total={stats.stripe.activeSubscriptions} color="bg-primary" />
                    {stats.stripe.tierCounts.other > 0 && (
                      <TierBar label="Other" count={stats.stripe.tierCounts.other} total={stats.stripe.activeSubscriptions} color="bg-muted-foreground" />
                    )}
                  </div>
                </div>
              )}

              {/* Recent cancellations */}
              {stats.stripe?.recentCancellations && stats.stripe.recentCancellations.length > 0 && (
                <div>
                  <p className="font-mono text-[11px] text-muted-foreground uppercase tracking-wider mb-2">Recent Cancellations</p>
                  {stats.stripe.recentCancellations.map((c, i) => (
                    <div key={i} className="card-warm p-3 mb-2 flex items-center gap-3">
                      <XCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-xs text-foreground truncate">{c.email}</p>
                        {c.canceledAt && (
                          <p className="font-mono text-[10px] text-muted-foreground">
                            {new Date(c.canceledAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* User profiles list */}
              <div>
                <p className="font-mono text-[11px] text-muted-foreground uppercase tracking-wider mb-2">
                  All Profiles ({stats.users.totalProfiles})
                </p>
                {stats.users.profiles.map((p: any) => (
                  <div key={p.id} className="card-warm p-3 mb-2 flex items-center gap-3">
                    <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-display text-sm italic text-foreground">{p.display_name || "Unnamed"}</p>
                      <p className="font-mono text-[10px] text-muted-foreground">
                        {p.suburb || "No suburb"} · Joined {new Date(p.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══ FEEDBACK ═══ */}
          {activeTab === "feedback" && (
            <div className="space-y-2">
              {stats.feedback.length === 0 ? (
                <p className="font-display text-sm italic text-muted-foreground text-center py-10">No feedback yet</p>
              ) : stats.feedback.map((f: any) => (
                <div key={f.id} className="card-warm p-4">
                  <div className="flex items-start gap-2 mb-1">
                    <span className={`font-mono text-[10px] px-2 py-0.5 rounded-full ${
                      f.status === "open" ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"
                    }`}>{f.status}</span>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{f.category}</span>
                  </div>
                  <p className="font-display text-sm font-bold italic text-foreground mt-2">{f.subject}</p>
                  <p className="font-display text-[13px] italic text-muted-foreground mt-1">{f.description}</p>
                  <p className="font-mono text-[10px] text-muted-foreground mt-2">
                    {f.user_email || "Anonymous"} · {new Date(f.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* ═══ AI USAGE ═══ */}
          {activeTab === "ai" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <StatCard icon={Activity} label="Total Requests" value={stats.ai.totalUsage} />
                <StatCard icon={BarChart3} label="Active Credits" value={stats.ai.credits.length} sub="Credit accounts" />
              </div>

              <div>
                <p className="font-mono text-[11px] text-muted-foreground uppercase tracking-wider mb-2">Recent AI Requests</p>
                {stats.ai.recentUsage.map((u: any) => (
                  <div key={u.id} className="card-warm p-3 mb-2 flex items-center gap-3">
                    <Activity className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-xs text-foreground">{u.function_name}</p>
                      <p className="font-mono text-[10px] text-muted-foreground">
                        {u.tokens_used || 0} tokens · {new Date(u.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────

function GroupCard({ group, onAction, onDelete, onArchive, updating, showActions, showReapprove, showManage }: {
  group: any; onAction: (id: string, status: "approved" | "rejected") => void;
  onDelete?: (id: string) => void; onArchive?: (id: string) => void;
  updating: boolean; showActions?: boolean; showReapprove?: boolean; showManage?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="card-warm p-4 mb-2">
      <div className="flex items-center gap-3">
        <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
        <div className="flex-1 min-w-0" onClick={() => setExpanded(!expanded)} role="button">
          <div className="flex items-center gap-2">
            <p className="font-display text-sm font-bold italic text-foreground">{group.name}</p>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
              {group.group_type}
            </span>
          </div>
          <p className="font-mono text-[10px] text-muted-foreground">
            {group.suburb} · {group.members_count || 0} members · {new Date(group.created_at).toLocaleDateString()}
          </p>
        </div>
        {showActions && (
          <div className="flex gap-1.5">
            <button onClick={() => onAction(group.id, "approved")} disabled={updating} className="p-1.5 rounded-lg bg-phase-follicular/10 text-phase-follicular hover:bg-phase-follicular/20 transition-colors">
              <CheckCircle className="h-4 w-4" />
            </button>
            <button onClick={() => onAction(group.id, "rejected")} disabled={updating} className="p-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors">
              <XCircle className="h-4 w-4" />
            </button>
          </div>
        )}
        {showManage && (
          <div className="flex gap-1.5">
            <button onClick={() => onArchive?.(group.id)} disabled={updating} title="Archive" className="p-1.5 rounded-lg bg-secondary hover:bg-muted-foreground/10 text-muted-foreground transition-colors">
              <Archive className="h-4 w-4" />
            </button>
            <button onClick={() => onDelete?.(group.id)} disabled={updating} title="Delete permanently" className="p-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
        {showReapprove && (
          <div className="flex gap-1.5">
            <button onClick={() => onAction(group.id, "approved")} disabled={updating} className="font-mono text-[11px] text-primary">
              Re-approve
            </button>
            <button onClick={() => onDelete?.(group.id)} disabled={updating} title="Delete permanently" className="p-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
        {!showActions && !showReapprove && !showManage && (
          expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
      {expanded && (
        <div className="mt-3 pl-7">
          <p className="font-display text-[13px] italic text-muted-foreground">{group.description}</p>
        </div>
      )}
    </div>
  );
}

function TierBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="font-mono text-[11px] text-foreground">{label}</span>
        <span className="font-mono text-[11px] text-muted-foreground">{count}</span>
      </div>
      <div className="h-2 rounded-full bg-secondary overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
