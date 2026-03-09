import { useState, useRef } from "react";

interface CommunityProfileProps {
  locationEnabled: boolean;
  onToggleLocation: () => void;
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

export default function CommunityProfile({ locationEnabled, onToggleLocation }: CommunityProfileProps) {
  const [photo, setPhoto] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [visibility, setVisibility] = useState<Record<string, boolean>>({
    career: true, employer: false, skills: true, offer: true,
    looking_for: false, community_vision: true, barter: false,
  });
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhoto(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="pb-10 space-y-3">
      {/* Photo + name header */}
      <div className="card-warm p-5 text-center">
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
        <div
          onClick={() => fileRef.current?.click()}
          className="w-20 h-20 rounded-full mx-auto mb-3 border-2 border-dashed flex items-center justify-center cursor-pointer overflow-hidden"
          style={{ borderColor: photo ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.3)", background: photo ? "transparent" : "hsl(var(--primary) / 0.05)" }}
        >
          {photo ? (
            <img src={photo} alt="profile" className="w-full h-full object-cover" />
          ) : (
            <span className="text-[28px]">📷</span>
          )}
        </div>
        <p className="font-mono text-xs text-muted-foreground mb-1">
          {photo ? "tap to change photo" : "tap to add a photo"}
        </p>
        <p className="font-mono text-[11px] text-muted-foreground/60">your photo is always shown on your profile</p>
      </div>

      {/* Who sees this? explainer */}
      <div className="card-warm p-4 bg-secondary/50 border-primary/10">
        <p className="font-mono text-[11px] text-primary mb-2">who sees your answers?</p>
        <div className="flex gap-3 mb-2.5">
          <div className="flex-1 bg-phase-follicular/10 rounded-[10px] p-2.5">
            <p className="font-mono text-[11px] text-phase-follicular mb-0.5">on profile</p>
            <p className="font-display text-xs italic text-phase-follicular/80 leading-relaxed">
              Visible to any community member who taps your name. You choose which fields to share.
            </p>
          </div>
          <div className="flex-1 bg-secondary rounded-[10px] p-2.5">
            <p className="font-mono text-[11px] text-muted-foreground mb-0.5">only me</p>
            <p className="font-display text-xs italic text-muted-foreground leading-relaxed">
              Stored privately. Helps us personalise your experience but never shown to others.
            </p>
          </div>
        </div>
        <p className="font-mono text-[11px] text-muted-foreground leading-relaxed">
          Toggle each field individually. You can change visibility at any time.
        </p>
      </div>

      {/* Nearby toggle */}
      <div className="card-warm p-4">
        <div className="flex justify-between items-center mb-1.5">
          <div>
            <p className="font-display text-[15px] italic text-foreground mb-0.5">
              {locationEnabled ? "Visible in Nearby" : "Hidden from Nearby"}
            </p>
            <p className="font-mono text-[11px] text-muted-foreground">suburb-level only · your address is never shared</p>
          </div>
          <button
            onClick={onToggleLocation}
            className={`w-10 h-[22px] rounded-full relative transition-colors flex-shrink-0 ${locationEnabled ? "bg-primary" : "bg-muted-foreground/30"}`}
          >
            <div
              className="w-4 h-4 rounded-full bg-card absolute top-[3px] transition-[left] shadow-sm"
              style={{ left: locationEnabled ? 21 : 3 }}
            />
          </button>
        </div>
      </div>

      {/* Section label */}
      <p className="font-mono text-[11px] text-foreground uppercase tracking-wider pt-1">your profile</p>

      {/* Profile fields */}
      {FIELDS.map((f) => {
        const vis = visibility[f.key];
        return (
          <div key={f.key} className="card-warm p-5">
            <div className="flex justify-between items-start gap-2.5 mb-2.5">
              <label className="font-display text-base italic text-foreground leading-snug flex-1">{f.label}</label>
              <button
                onClick={() => setVisibility((v) => ({ ...v, [f.key]: !v[f.key] }))}
                className={`font-mono text-[11px] rounded-full px-3 py-1 whitespace-nowrap flex-shrink-0 mt-0.5 ${
                  vis ? "bg-phase-follicular/10 text-phase-follicular" : "bg-secondary text-muted-foreground"
                }`}
              >
                {vis ? "on profile" : "only me"}
              </button>
            </div>
            <textarea
              rows={f.rows}
              value={form[f.key] || ""}
              onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
              placeholder={f.ph}
              className={`w-full font-display text-sm italic text-foreground border rounded-[10px] px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 leading-relaxed placeholder:text-muted-foreground/40 ${
                vis ? "bg-secondary/30 border-border" : "bg-secondary/20 border-border/50"
              }`}
              style={{ fontSize: "16px" }}
            />
            {f.hint && (
              <p className="font-mono text-[10px] text-muted-foreground mt-1.5 leading-snug">
                {vis ? "👁 " : "🔒 "}{f.hint}
              </p>
            )}
          </div>
        );
      })}

      <button
        onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 3000); }}
        className="touch-btn w-full py-4 rounded-[14px] bg-primary text-primary-foreground font-display text-[17px] italic"
      >
        {saved ? "saved ✓" : "save profile →"}
      </button>
    </div>
  );
}
