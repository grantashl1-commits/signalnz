import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Flag, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type ReportContextType = "profile" | "message" | "post" | "comment" | "nearby";

interface ReportUserModalProps {
  open: boolean;
  reportedUserId: string;
  reportedUserName?: string;
  contextType: ReportContextType;
  /** ID of the message/post/comment being reported (omit for profile/nearby) */
  contextId?: string | null;
  onClose: () => void;
}

const REASONS = [
  "Spam or scam",
  "Harassment or bullying",
  "Hate speech or discrimination",
  "Inappropriate / sexual content",
  "Bot or fake account",
  "Self-harm or violence",
  "Misinformation",
  "Other",
];

export default function ReportUserModal({
  open,
  reportedUserId,
  reportedUserName,
  contextType,
  contextId,
  onClose,
}: ReportUserModalProps) {
  const { user } = useAuth();
  const [reason, setReason] = useState<string>("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Please sign in to report");
      return;
    }
    if (user.id === reportedUserId) {
      toast.error("You can't report yourself");
      return;
    }
    if (!reason) {
      toast.error("Pick a reason");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("user_reports" as any).insert({
      reporter_id: user.id,
      reported_user_id: reportedUserId,
      context_type: contextType,
      context_id: contextId ?? null,
      reason,
      details: details.trim() || null,
    } as any);
    setSubmitting(false);

    if (error) {
      // 23505 = unique violation = already reported this same context
      if ((error as any).code === "23505") {
        toast.info("You've already reported this — our team is reviewing it");
        onClose();
        return;
      }
      toast.error("Couldn't submit report. Please try again.");
      return;
    }
    toast.success("Report submitted. Our team will review it.");
    setReason("");
    setDetails("");
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center"
        >
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl border border-border"
          >
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-full bg-destructive/10">
                  <Flag className="h-4 w-4 text-destructive" />
                </div>
                <div>
                  <h2 className="font-display text-lg italic font-bold text-foreground">Report</h2>
                  {reportedUserName && (
                    <p className="font-body text-[11px] text-muted-foreground">{reportedUserName}</p>
                  )}
                </div>
              </div>
              <button onClick={onClose} className="touch-btn p-2 rounded-full bg-secondary">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="rounded-xl bg-secondary/40 p-3 flex gap-2.5">
                <AlertCircle className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <p className="font-body text-[11px] text-muted-foreground leading-relaxed">
                  Reports are private. Our team reviews every one. False or repeated abuse of the report system can result in your own account being suspended.
                </p>
              </div>

              <div>
                <p className="font-body text-xs font-semibold text-foreground mb-2">What's the issue?</p>
                <div className="space-y-1.5">
                  {REASONS.map((r) => (
                    <button
                      key={r}
                      onClick={() => setReason(r)}
                      className={`w-full text-left rounded-xl px-3.5 py-2.5 font-body text-sm transition-colors ${
                        reason === r
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary/50 text-foreground hover:bg-secondary"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="report-details" className="font-body text-xs font-semibold text-foreground mb-2 block">
                  More details <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <textarea
                  id="report-details"
                  rows={3}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Anything that helps our team understand…"
                  maxLength={500}
                  className="w-full rounded-xl border border-border bg-secondary/30 px-3 py-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  style={{ fontSize: "16px" }}
                />
                <p className="text-right text-[10px] text-muted-foreground mt-1">{details.length}/500</p>
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting || !reason}
                className="touch-btn w-full rounded-xl bg-destructive text-destructive-foreground py-3.5 font-display text-[15px] italic disabled:opacity-50 active:scale-[0.97] transition-transform"
              >
                {submitting ? "Submitting…" : "Submit report"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
