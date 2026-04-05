import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bug, MessageSquare, Lightbulb, ExternalLink, Loader2, Inbox, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface FeedbackRow {
  id: string;
  user_id: string | null;
  user_email: string | null;
  category: string;
  subject: string;
  description: string;
  screenshot_url: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  open: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  "in-progress": "bg-blue-500/15 text-blue-600 border-blue-500/30",
  resolved: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  closed: "bg-muted text-muted-foreground border-border",
};

const CAT_ICON: Record<string, typeof Bug> = {
  bug: Bug,
  feedback: MessageSquare,
  feature: Lightbulb,
};

export default function FeedbackDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [items, setItems] = useState<FeedbackRow[]>([]);
  const [items, setItems] = useState<FeedbackRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");

  const fetchFeedback = async () => {
    // Admin dashboard — we need a broader policy to read all feedback.
    // For now this reads only the user's own feedback due to RLS.
    // To see ALL feedback you'd need a service-role edge function or admin role.
    const { data, error } = await supabase
      .from("feedback")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load feedback");
      console.error(error);
    } else {
      setItems((data as FeedbackRow[]) || []);
    }
    setLoading(false);
  };

  // Check admin role
  useEffect(() => {
    if (!user) return;
    supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle()
      .then(({ data }) => setIsAdmin(!!data));
  }, [user]);

  useEffect(() => {
    if (!authLoading && isAdmin === true) fetchFeedback();
  }, [authLoading, isAdmin]);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("feedback")
      .update({ status })
      .eq("id", id);
    if (error) {
      toast.error("Failed to update status");
    } else {
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
      toast.success(`Status updated to ${status}`);
    }
  };

  const filtered = filterStatus === "all" ? items : items.filter((i) => i.status === filterStatus);

  const stats = {
    total: items.length,
    open: items.filter((i) => i.status === "open").length,
    inProgress: items.filter((i) => i.status === "in-progress").length,
    resolved: items.filter((i) => i.status === "resolved").length,
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Feedback Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Review and manage user-submitted feedback</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total", value: stats.total, color: "text-foreground" },
          { label: "Open", value: stats.open, color: "text-amber-500" },
          { label: "In Progress", value: stats.inProgress, color: "text-blue-500" },
          { label: "Resolved", value: stats.resolved, color: "text-emerald-500" },
        ].map((s) => (
          <Card key={s.label} className="border-border/50">
            <CardContent className="p-4 text-center">
              <p className={`text-2xl font-bold font-display ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground font-body">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground font-body">Filter:</span>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
          <Inbox className="h-10 w-10" />
          <p className="font-body text-sm">No feedback yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {filtered.map((item) => {
              const Icon = CAT_ICON[item.category] || MessageSquare;
              const expanded = expandedId === item.id;
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Card className="border-border/50 overflow-hidden">
                    <button
                      onClick={() => setExpandedId(expanded ? null : item.id)}
                      className="w-full text-left"
                    >
                      <CardHeader className="p-4 pb-2 flex flex-row items-start gap-3">
                        <Icon className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-body font-medium text-sm text-foreground truncate">
                              {item.subject}
                            </span>
                            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${STATUS_COLORS[item.status] || ""}`}>
                              {item.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {item.user_email || "Anonymous"} · {new Date(item.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        {expanded ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        )}
                      </CardHeader>
                    </button>

                    <AnimatePresence>
                      {expanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <CardContent className="px-4 pb-4 pt-0 space-y-3">
                            <p className="text-sm text-foreground/80 font-body whitespace-pre-wrap">
                              {item.description}
                            </p>

                            {item.screenshot_url && (
                              <a
                                href={item.screenshot_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block"
                              >
                                <img
                                  src={item.screenshot_url}
                                  alt="Screenshot"
                                  className="rounded-lg border border-border max-h-48 object-cover w-full"
                                />
                                <span className="text-xs text-primary flex items-center gap-1 mt-1">
                                  <ExternalLink className="h-3 w-3" /> View full size
                                </span>
                              </a>
                            )}

                            <div className="flex items-center gap-2 pt-2">
                              <span className="text-xs text-muted-foreground">Status:</span>
                              <Select
                                value={item.status}
                                onValueChange={(v) => updateStatus(item.id, v)}
                              >
                                <SelectTrigger className="h-7 w-32 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="open">Open</SelectItem>
                                  <SelectItem value="in-progress">In Progress</SelectItem>
                                  <SelectItem value="resolved">Resolved</SelectItem>
                                  <SelectItem value="closed">Closed</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </CardContent>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
