import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { X } from "lucide-react";

interface MemberProfileSheetProps {
  userId: string;
  displayName: string;
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

export default function MemberProfileSheet({ userId, displayName, onClose }: MemberProfileSheetProps) {
  const [profile, setProfile] = useState<CommunityProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("community_profiles")
        .select("career, employer, skills, offer, looking_for, community_vision, barter, visibility")
        .eq("user_id", userId)
        .single();
      setProfile(data as CommunityProfile | null);
      setLoading(false);
    })();
  }, [userId]);

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
            <p className="font-mono text-[10px] text-muted-foreground">Community member</p>
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
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{f.label}</p>
                <p className="font-display text-sm italic text-foreground">{f.value}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
