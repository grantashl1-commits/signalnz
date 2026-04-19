import { useState, useEffect } from "react";
import { Eye, Lock, MapPin } from "lucide-react";
import { HandDrawnCamera } from "@/components/BotanicalElements";
import { Switch } from "@/components/ui/switch";
import { haptic } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "sonner";

interface CommunityProfileProps {
  /** Currently visible in the Nearby tab (DB-backed). */
  locationEnabled: boolean;
  /** Whether a user_locations row exists at all (i.e. they've completed GPS setup once). */
  hasLocationRow: boolean;
  /** Async toggle — returns true on success so we can revert the Switch on failure. */
  onToggleLocation: () => Promise<boolean> | boolean | void;
  /** Jump to the Nearby tab for first-time location setup. */
  onGoToNearby: () => void;
}

const FIELDS = [
  { key: "career", label: "What's your career background?", ph: "e.g. I've spent 15 years in healthcare, moved into project management…", rows: 2, hint: "Helps neighbours understand your experience.", sensitiveDefault: false },
  { key: "employer", label: "Who do you currently work for?", ph: "Or what kind of work are you doing right now?", rows: 1, hint: "This is sensitive — we suggest keeping it private unless you're comfortable.", sensitiveDefault: true },
  { key: "skills", label: "What skills or knowledge do you have?", ph: "Think beyond your job — cooking, building, music, therapy, growing food, coding…", rows: 3, hint: "Your skills are your gift to this community.", sensitiveDefault: false },
  { key: "offer", label: "What could you offer your community freely?", ph: "A skill, a service, your time, your space, your wisdom — what could you give?", rows: 3, hint: "This is the heart of your profile — make it visible.", sensitiveDefault: false },
  { key: "looking_for", label: "What are you looking to get from this community?", ph: "Connection, skills, support, accountability, friendship, collaboration…", rows: 2, hint: "Personal — your call whether to share this.", sensitiveDefault: true },
  { key: "community_vision", label: "In what ways could your community come together?", ph: "What would a thriving neighbourhood look like to you?", rows: 3, hint: "Great for sparking conversation with neighbours.", sensitiveDefault: false },
  { key: "barter", label: "What would you love to receive or learn in exchange?", ph: "What have you always wanted to learn? What help would you genuinely love?", rows: 2, hint: "Helps others know how they can contribute to you.", sensitiveDefault: true },
];

const DEFAULT_VISIBILITY: Record<string, boolean> = {
  career: true, employer: false, skills: true, offer: true,
  looking_for: false, community_vision: true, barter: false,
};

interface ProfileData {
  photo: string | null;
  form: Record<string, string>;
  visibility: Record<string, boolean>;
}

export default function CommunityProfile({ locationEnabled, hasLocationRow, onToggleLocation, onGoToNearby }: CommunityProfileProps) {
  const { user } = useAuth();
  const { avatarUrl } = useProfile();
  const [profileData, setProfileData] = useState<ProfileData>({
    photo: null,
    form: {},
    visibility: { ...DEFAULT_VISIBILITY },
  });
  const { photo, form, visibility } = profileData;
  const displayPhoto = avatarUrl || photo;
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [togglingLocation, setTogglingLocation] = useState(false);
  // Optimistic UI for the location switch — kept in sync with the DB-derived prop.
  const [optimisticLocation, setOptimisticLocation] = useState(locationEnabled);
  useEffect(() => { setOptimisticLocation(locationEnabled); }, [locationEnabled]);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("community_profiles" as any)
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      const d = data as any;
      setProfileData({
        photo: d.photo_url || null,
        form: {
          career: d.career || "",
          employer: d.employer || "",
          skills: d.skills || "",
          offer: d.offer || "",
          looking_for: d.looking_for || "",
          community_vision: d.community_vision || "",
          barter: d.barter || "",
        },
        visibility: (d.visibility && typeof d.visibility === "object") ? d.visibility : { ...DEFAULT_VISIBILITY },
      });
    } else {
      try {
        const raw = localStorage.getItem("signal_community_profile");
        if (raw) {
          const legacy = JSON.parse(raw);
          setProfileData({
            photo: legacy.photo || null,
            form: legacy.form || {},
            visibility: legacy.visibility || { ...DEFAULT_VISIBILITY },
          });
        }
      } catch {}
    }
    setLoading(false);
  };

  const updateField = (key: string, value: string) => {
    setProfileData(prev => ({ ...prev, form: { ...prev.form, [key]: value } }));
  };

  const toggleVisibility = (key: string) => {
    setProfileData(prev => ({ ...prev, visibility: { ...prev.visibility, [key]: !prev.visibility[key] } }));
  };

  const handleLocationToggle = async (next: boolean) => {
    if (togglingLocation) return;
    haptic("light");
    if (!hasLocationRow) {
      onGoToNearby();
      return;
    }
    setOptimisticLocation(next);
    setTogglingLocation(true);
    try {
      const result = await onToggleLocation();
      // If parent returns false (failure) revert the switch.
      if (result === false) setOptimisticLocation(!next);
    } finally {
      setTogglingLocation(false);
    }
  };

  const handleSave = async () => {
    haptic("medium");

    if (!user) {
      toast.error("Please sign in to save your profile");
      return;
    }

    try {
      const payload = {
        user_id: user.id,
        career: form.career || null,
        employer: form.employer || null,
        skills: form.skills || null,
        offer: form.offer || null,
        looking_for: form.looking_for || null,
        community_vision: form.community_vision || null,
        barter: form.barter || null,
        photo_url: photo,
        visibility,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("community_profiles" as any)
        .upsert(payload as any, { onConflict: "user_id" });

      if (error) throw error;

      localStorage.setItem("signal_community_profile", JSON.stringify(profileData));

      setSaved(true);
      toast.success("Profile saved");
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) {
      toast.error("Failed to save: " + (e.message || "Unknown error"));
    }
  };

  if (loading) {
    return (
      <div className="text-center pt-16">
        <p className="font-body text-xs text-muted-foreground">Loading profile…</p>
      </div>
    );
  }

  return (
    <div className="pb-10 space-y-3">
      {/* Photo + name header */}
      <div className="card-warm p-5 text-center">
        <div
          className="w-20 h-20 rounded-full mx-auto mb-3 border-2 flex items-center justify-center overflow-hidden"
          style={{ borderColor: displayPhoto ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.3)", background: displayPhoto ? "transparent" : "hsl(var(--primary) / 0.05)" }}
        >
          {displayPhoto ? (
            <img src={displayPhoto} alt="Profile" className="w-full h-full object-cover" width={80} height={80} loading="lazy" />
          ) : (
            <HandDrawnCamera size={28} color="hsl(var(--primary))" />
          )}
        </div>
        <p className="font-body text-xs text-muted-foreground mb-1">
          {displayPhoto ? "Photo from your account" : "Add a photo in Account settings"}
        </p>
      </div>

      {/* Who sees this? explainer */}
      <div className="card-warm p-4 bg-secondary/50 border-primary/10">
        <p className="font-body text-xs font-medium text-foreground mb-3">Who sees your answers?</p>
        <div className="flex rounded-full bg-secondary p-1 mb-3">
          <div className="flex-1 flex items-center justify-center gap-1.5 rounded-full bg-primary py-2.5 px-3">
            <Eye className="h-3.5 w-3.5 text-primary-foreground" />
            <span className="font-body text-xs font-semibold text-primary-foreground">On profile</span>
          </div>
          <div className="flex-1 flex items-center justify-center gap-1.5 rounded-full py-2.5 px-3">
            <Lock className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-body text-xs font-medium text-muted-foreground">Only me</span>
          </div>
        </div>
        <p className="font-body text-[11px] text-muted-foreground leading-relaxed">
          Toggle each field individually. You can change visibility at any time.
        </p>
      </div>

      {/* Nearby toggle — DB-backed */}
      <div className="card-warm p-4">
        <div className="flex justify-between items-start mb-2 gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="h-3.5 w-3.5 text-primary flex-shrink-0" />
              <p className="font-display text-[15px] italic text-foreground">
                {!hasLocationRow
                  ? "Location not set up"
                  : optimisticLocation
                    ? "Visible in Nearby"
                    : "Hidden from Nearby"}
              </p>
            </div>
            <p className="font-body text-[11px] text-muted-foreground leading-relaxed">
              {!hasLocationRow
                ? "Set up your suburb in the Nearby tab to share location with neighbours."
                : "Suburb-level only · your address is never shared"}
            </p>
          </div>
          {hasLocationRow ? (
            <Switch
              checked={optimisticLocation}
              disabled={togglingLocation}
              onCheckedChange={handleLocationToggle}
              aria-label="Toggle Nearby visibility"
              className="flex-shrink-0 mt-1"
            />
          ) : (
            <button
              onClick={onGoToNearby}
              className="touch-btn flex-shrink-0 mt-0.5 text-[11px] font-body font-medium px-3 py-1.5 rounded-full bg-primary text-primary-foreground active:scale-[0.97] whitespace-nowrap"
            >
              Set up
            </button>
          )}
        </div>
        {hasLocationRow && (
          <p className="font-display text-[11px] italic text-muted-foreground mt-2 leading-snug">
            {optimisticLocation
              ? "Other Signal members in your suburb can see your profile and message you."
              : "You can still browse Nearby — others just can't see you."}
          </p>
        )}
      </div>

      {/* Section label */}
      <p className="font-body text-[11px] text-foreground uppercase tracking-wider pt-1">Your profile</p>

      {/* Profile fields */}
      {FIELDS.map((f, idx) => {
        const vis = visibility[f.key];
        const ACCENT_COLORS = ["#B8A0C4", "#7AAFA0", "#D4A843", "#C49A9A"];
        const accent = ACCENT_COLORS[idx % ACCENT_COLORS.length];
        return (
          <div
            key={f.key}
            className="card-warm p-5 border-l-[3px]"
            style={{ borderLeftColor: accent }}
          >
            <div className="flex justify-between items-start gap-2.5 mb-2.5">
              <label className="font-display text-base italic text-foreground leading-snug flex-1">{f.label}</label>
              <button
                onClick={() => toggleVisibility(f.key)}
                className={`touch-btn flex items-center gap-1.5 rounded-full px-3 py-1.5 whitespace-nowrap flex-shrink-0 mt-0.5 text-[11px] font-body font-medium transition-colors ${
                  vis
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {vis ? <Eye className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                {vis ? "On profile" : "Only me"}
              </button>
            </div>
            <textarea
              rows={f.rows}
              value={form[f.key] || ""}
              onChange={(e) => updateField(f.key, e.target.value)}
              placeholder={f.ph}
              className={`w-full font-display text-sm italic text-foreground border rounded-[10px] px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 leading-relaxed placeholder:text-muted-foreground/40 ${
                vis ? "bg-secondary/30 border-border" : "bg-secondary/20 border-border/50"
              }`}
              style={{ fontSize: "16px" }}
              inputMode="text"
              autoComplete="off"
            />
            {f.hint && (
              <p className="font-display text-xs italic text-muted-foreground mt-1.5 leading-snug flex items-center gap-1">
                {vis ? <Eye className="h-3 w-3 text-muted-foreground" /> : <Lock className="h-3 w-3 text-muted-foreground" />}
                {f.hint}
              </p>
            )}
          </div>
        );
      })}

      <button
        onClick={handleSave}
        className="touch-btn w-full py-4 rounded-card bg-primary text-primary-foreground font-display text-[17px] italic active:scale-[0.97]"
      >
        {saved ? "Saved ✓" : "Save profile"}
      </button>
    </div>
  );
}
