import { useState } from "react";

interface CommunityProfileProps {
  locationEnabled: boolean;
  onToggleLocation: () => void;
}

const FIELDS = [
  { key: "career", label: "What's your career background?", ph: "e.g. I've spent 15 years in healthcare, moved into project management…", rows: 2 },
  { key: "employer", label: "Who do you currently work for?", ph: "Or what kind of work are you doing right now?", rows: 1 },
  { key: "skills", label: "What skills or knowledge do you have?", ph: "Think beyond your job — cooking, building, music, therapy, growing food, coding…", rows: 3 },
  { key: "offer", label: "What could you offer your community freely?", ph: "A skill, a service, your time, your space, your wisdom — what could you give?", rows: 3 },
  { key: "looking_for", label: "What are you looking to get from this community?", ph: "Connection, skills, support, accountability, friendship, collaboration…", rows: 2 },
  { key: "community_vision", label: "In what ways could your community come together?", ph: "What would a thriving neighbourhood look like to you?", rows: 3 },
  { key: "barter", label: "What would you love to receive or learn in exchange?", ph: "What have you always wanted to learn? What help would you genuinely love?", rows: 2 },
];

export default function CommunityProfile({ locationEnabled, onToggleLocation }: CommunityProfileProps) {
  const [form, setForm] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  return (
    <div className="pb-10 space-y-3">
      {/* Location toggle */}
      <div className="card-warm p-5">
        <p className="font-mono text-[11px] text-primary mb-1.5">nearby visibility</p>
        <div className="flex justify-between items-center mb-2">
          <div>
            <p className="font-display text-base italic text-foreground mb-0.5">
              {locationEnabled ? "Showing in Nearby" : "Hidden from Nearby"}
            </p>
            <p className="font-mono text-[11px] text-muted-foreground">suburb-level only · never your address</p>
          </div>
          <button
            onClick={onToggleLocation}
            className={`w-[46px] h-[26px] rounded-full relative transition-colors ${locationEnabled ? "bg-primary" : "bg-muted-foreground/30"}`}
          >
            <div
              className="w-5 h-5 rounded-full bg-card absolute top-[3px] transition-[left] shadow-sm"
              style={{ left: locationEnabled ? 23 : 3 }}
            />
          </button>
        </div>
        <p className="font-mono text-[11px] text-muted-foreground leading-relaxed">
          When enabled, others in your suburb can see your first name, skills and what you offer. Your exact address and GPS coordinates are never shared.
        </p>
      </div>

      {/* Vision */}
      <div className="card-warm p-4">
        <p className="font-display text-sm italic text-foreground leading-relaxed">
          The economy is changing fast. The most resilient communities will be the ones who know what each person carries — and can trade it freely.
          Your skills are your currency. Your knowledge is your contribution.
        </p>
      </div>

      {/* Profile fields */}
      {FIELDS.map((f) => (
        <div key={f.key} className="card-warm p-5">
          <label className="block font-display text-[17px] italic text-foreground mb-2.5">{f.label}</label>
          <textarea
            rows={f.rows}
            value={form[f.key] || ""}
            onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
            placeholder={f.ph}
            className="w-full font-display text-sm italic text-foreground bg-secondary/30 border border-border rounded-[10px] px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 leading-relaxed placeholder:text-muted-foreground/40"
            style={{ fontSize: "16px" }}
          />
        </div>
      ))}

      <button
        onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 3000); }}
        className="touch-btn w-full py-4 rounded-[14px] bg-primary text-primary-foreground font-display text-[17px] italic"
      >
        {saved ? "saved ✓" : "save profile →"}
      </button>
    </div>
  );
}
