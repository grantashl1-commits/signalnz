import { useState } from "react";
import { MOCK_GROUPS } from "@/data/community-data";

interface ChallengesPanelProps {
  joined: string[];
}

function ChallengeItem({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <div className={`card-warm p-3.5 mb-2 border-l-[3px] ${done ? "border-l-phase-follicular" : "border-l-primary"}`}>
      <div className="flex justify-between items-start gap-2.5">
        <p className={`font-display text-sm italic leading-relaxed flex-1 ${done ? "text-muted-foreground" : "text-foreground"}`}>{text}</p>
        <button
          onClick={() => setDone((d) => !d)}
          className={`touch-btn font-mono text-[11px] rounded-full px-3 py-1.5 flex-shrink-0 ${
            done ? "text-phase-follicular bg-phase-follicular/10" : "text-primary bg-primary/10"
          }`}
        >
          {done ? "done ✓" : "mark done"}
        </button>
      </div>
    </div>
  );
}

export default function ChallengesPanel({ joined }: ChallengesPanelProps) {
  const myGroups = MOCK_GROUPS.filter((g) => joined.includes(g.id));

  if (!myGroups.length) {
    return (
      <div className="text-center pt-16">
        <div className="text-[40px] mb-3">🏘️</div>
        <p className="font-display text-xl italic text-foreground mb-1.5">join a community first.</p>
        <p className="font-mono text-xs text-muted-foreground">then your challenges will appear here.</p>
      </div>
    );
  }

  return (
    <div className="pb-10">
      <div className="card-warm p-5 mb-4">
        <p className="font-display text-sm italic text-foreground leading-relaxed">
          Connection doesn't happen online — it begins there. These micro-challenges are designed to take your
          digital community into your physical world, one small act at a time.
        </p>
      </div>

      {myGroups.map((g) => (
        <div key={g.id} className="mb-5">
          <h3 className="font-display text-lg font-bold italic text-foreground mb-2.5">{g.suburb}</h3>
          {g.challenges.map((c, i) => <ChallengeItem key={i} text={c} />)}

          <div className="mt-3">
            <p className="font-mono text-[11px] text-muted-foreground mb-2">community questions</p>
            {g.questions.map((q, i) => (
              <div key={i} className="card-warm p-3.5 mb-2">
                <p className="font-display text-[15px] italic text-foreground mb-2">{q}</p>
                <textarea
                  rows={2}
                  placeholder="Your answer…"
                  className="w-full font-display text-[13px] italic text-foreground bg-secondary/30 border border-border rounded-lg px-2.5 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 leading-relaxed"
                  style={{ fontSize: "16px" }}
                  inputMode="text"
                  autoComplete="off"
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
