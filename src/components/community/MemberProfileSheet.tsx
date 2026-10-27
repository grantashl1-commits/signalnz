import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { X } from "lucide-react";
import { toast } from "sonner";
import { useBlockedMembers } from "@/hooks/useBlockedMembers";
import { REPORT_REASONS, blockMember, reportMember, unblockMember } from "@/lib/community-safety";

interface MemberProfileSheetProps {
  userId: string;
  displayName: string;
  /** The message she tapped from, so a report points at it. */
  messageId?: string;
  onClose: () => void;
}

interface CommunityProfile {
  career?: string | null;
  employer?: string | null;
  skills?: string | null;
  offer?: string | null;
  looking_for?: string | null;
  community_vision?: string | null;
  barter?: string | null;
  visibility?: Record<string, boolean>;
}

export default function MemberProfileSheet({ userId, displayName, messageId, onClose }: MemberProfileSheetProps) {
  const [profile, setProfile] = useState<CommunityProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const blocked = useBlockedMembers().has(userId);
  const [reporting, setReporting] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      // Only the fields she has chosen to show come back from the server.
      const { data } = await supabase.rpc("get_community_profile" as never, { target: userId } as never);
      setProfile(((data as CommunityProfile[] | null)?.[0]) ?? null);
      setLoading(false);
    })();
  }, [userId]);

  const toggleBlock = async () => {
    setBusy(true);
    try {
      if (blocked) { await unblockMember(userId); toast.success(`${displayName} is unblocked.`); }
      else { await blockMember(userId); toast.success(`You won't see ${displayName}'s messages.`); onClose(); }
    } catch {
      toast.error("That didn't save. Please try again.");
    }
    setBusy(false);
  };

  const report = async (reason: string) => {
    setBusy(true);
    try {
      await reportMember({ targetUserId: userId, messageId, reason });
      toast.success("Thank you. We'll review this.");
      setReporting(false);
    } catch {
      toast.error("That report didn't send. Please try again.");
    }
    setBusy(false);
  };

  const vis = (profile?.visibility as Record<string, boolean>) || {};

  const fields = [
    { key: "career", label: "Career", value: profile?.career },
    { key: "employer", label: "Employer", value: profile?.employer },
    { key: "skills", label: "Skills", value: profile?.skills },
    { key: "offer", label: "What I offer", value: profile?.offer },
    { key: "looking_for", label: "Looking for", value: profile?.looking_for },
    { key: "community_vision", label: "Community vision", value: profile?.community_vision },
    { key: "barter", label: "Open to barter", value: profile?.barter },
  ].filter(f => f.value && vis[f.key] !== false);

  return (
    <div className="fixed inset-0 z-[90] bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center" onClick={onClose}>
      <div
        className="bg-card rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[80vh] overflow-y-auto shadow-2xl border border-border"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h2 className="font-display text-lg italic font-bold text-foreground">{displayName}</h2>
            <p className="font-body text-[10px] text-muted-foreground">Community member</p>
          </div>
          <button onClick={onClose} className="touch-btn p-2 rounded-full bg-secondary">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {loading ? (
            <p className="font-body text-sm text-muted-foreground text-center py-8">Loading profile…</p>
          ) : fields.length === 0 ? (
            <div className="text-center py-8">
              <p className="font-display text-sm italic text-muted-foreground">
                This member hasn't shared their profile details yet.
              </p>
            </div>
          ) : (
            fields.map(f => (
              <div key={f.key}>
                <p className="font-body text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{f.label}</p>
                <p className="font-display text-sm italic text-foreground">{f.value}</p>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-border p-5 space-y-3">
          {reporting ? (
            <div className="space-y-2">
              <p className="font-body text-xs text-muted-foreground">What's wrong?{messageId ? " We'll include the message you tapped." : ""}</p>
              {REPORT_REASONS.map(reason => (
                <button key={reason} disabled={busy} onClick={() => report(reason)} className="w-full rounded-xl border border-border px-4 py-2.5 text-left font-body text-sm text-foreground hover:bg-secondary disabled:opacity-50">
                  {reason}
                </button>
              ))}
              <button onClick={() => setReporting(false)} className="w-full font-body text-xs text-muted-foreground py-1">Cancel</button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button disabled={busy} onClick={() => setReporting(true)} className="flex-1 rounded-full border border-border py-2.5 font-body text-sm text-foreground disabled:opacity-50">
                Report
              </button>
              <button disabled={busy} onClick={toggleBlock} className="flex-1 rounded-full border border-destructive/40 py-2.5 font-body text-sm text-destructive disabled:opacity-50">
                {blocked ? "Unblock" : "Block"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
