import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Send, Sparkles } from "lucide-react";
import { SeedGeometry, CymatiSketch } from "@/components/BotanicalElements";
import { supabase } from "@/integrations/supabase/client";
import { useCycle } from "@/contexts/CycleContext";
import {
  Phase, getPhaseFromDay,
  getSymptomFrequency, getRecentSymptoms,
  PHASE_SHORT,
} from "@/lib/cycle-utils";
import { getRecentStructuredCheckins } from "@/lib/cycle-symptom-utils";
import { useProfile } from "@/hooks/useProfile";
import { haptic } from "@/hooks/use-mobile";

const PHASE_HEX: Record<Phase, string> = {
  menstrual: "#C4526E", follicular: "#5C4A9E", ovulatory: "#C47A8A", luteal: "#9B89B4",
};

const cardVariant = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: 0.08 * i, duration: 0.35 } }),
};

const PHASE_CHIPS: Record<Phase, string[]> = {
  menstrual: [
    "Why am I so exhausted?",
    "Why do I feel emotional?",
    "Is it okay to skip training today?",
  ],
  follicular: [
    "What should I focus on this week?",
    "Why do I feel so good?",
    "What's the best training for right now?",
  ],
  ovulatory: [
    "Why am I so confident this week?",
    "What's the injury risk I should know about?",
    "Why is my appetite lower?",
  ],
  luteal: [
    "Why are my cravings so high?",
    "Why can't I sleep even though I'm tired?",
    "Why do I feel anxious for no reason?",
    "Why did my workout feel so hard?",
  ],
};

const PERI_CHIPS = [
  "Why do I feel rage out of nowhere?",
  "Why are my joints sore?",
  "Why is my memory worse?",
  "What can I do about hot flushes?",
];

export default function InsightsTab() {
  const { cycleStartDate: lastPeriod, currentPhase, currentCycleDay } = useCycle();
  const { cycleMode } = useProfile();
  const info = { phase: currentPhase, cycleDay: currentCycleDay };

  const [coachMessages, setCoachMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [coachInput, setCoachInput] = useState("");
  const [coachLoading, setCoachLoading] = useState(false);

  // Phase-aware suggested questions
  const suggestedChips = useMemo(() => {
    const base = PHASE_CHIPS[info.phase] || [];
    if (cycleMode === "perimenopause") return [...base.slice(0, 2), ...PERI_CHIPS.slice(0, 3)];
    return base;
  }, [info.phase, cycleMode]);

  // Symptom frequency
  const symptomFreq = useMemo(() => getSymptomFrequency(), []);
  const symptomChartData = useMemo(() => {
    return Object.entries(symptomFreq)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([name, count]) => ({ name, count }));
  }, [symptomFreq]);
  const topSymptom = symptomChartData[0];

  // Cycle Coach — pass richer context
  const sendCoachMessage = async (text: string) => {
    if (!text.trim()) return;
    haptic("light");
    const userMsg = { role: "user" as const, content: text };
    const updatedMessages = [...coachMessages, userMsg];
    setCoachMessages(updatedMessages);
    setCoachInput("");
    setCoachLoading(true);

    try {
      // Gather recent structured symptoms
      const recentCheckins = getRecentStructuredCheckins(3);
      const recentSymptomNames = recentCheckins.flatMap(c => c.data.symptoms.map(s => s.name));
      const legacySymptoms = getRecentSymptoms(3).flatMap(s => s.symptoms);
      const allRecentSymptoms = [...new Set([...recentSymptomNames, ...legacySymptoms])];

      const contextPrefix = updatedMessages.length === 1
        ? `[Context: Cycle day ${info.cycleDay}, ${PHASE_SHORT[info.phase]} phase. Mode: ${cycleMode}. ${
            allRecentSymptoms.length > 0
              ? `Recent symptoms: ${allRecentSymptoms.join(", ")}.`
              : ""
          }]\n\n`
        : "";

      const messagesForAI = updatedMessages.map((m, i) => ({
        role: m.role,
        content: i === 0 ? contextPrefix + m.content : m.content,
      }));

      const { data, error } = await supabase.functions.invoke("cycle-ai", {
        body: {
          type: "cycle-coach",
          messages: messagesForAI,
          cycle_mode: cycleMode,
          current_phase: info.phase,
          cycle_day: info.cycleDay,
          recent_symptoms: allRecentSymptoms,
        },
      });

      if (error) throw error;

      setCoachMessages([...updatedMessages, { role: "assistant", content: data?.message || "I'm sorry, I couldn't generate a response. Please try again." }]);
    } catch (err) {
      console.error("Coach error:", err);
      setCoachMessages([...updatedMessages, { role: "assistant", content: "Something went wrong. Please try again in a moment." }]);
    } finally {
      setCoachLoading(false);
    }
  };

  if (!lastPeriod) {
    return (
      <div className="card-warm p-6 text-center">
        <CymatiSketch phase="follicular" size={80} opacity={0.15} className="mx-auto mb-4" />
        <p className="font-display text-lg italic text-foreground mb-2">your insights are building</p>
        <p className="font-body text-sm text-muted-foreground">
          Start logging your cycle, moods, and symptoms to see personalised patterns appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cycle Coach — premium dark card */}
      <motion.div custom={0} initial="hidden" animate="visible" variants={cardVariant}
        className="relative overflow-hidden"
        style={{
          backgroundColor: '#1A0F2E',
          borderRadius: 'var(--radius-card)',
          boxShadow: '0 4px 32px rgba(26, 15, 46, 0.25)',
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <SeedGeometry size={200} opacity={0.04} color="hsl(30 33% 98%)" />
        </div>

        <div className="relative z-10" style={{ padding: 'var(--card-padding)' }}>
          {/* AI-powered label */}
          <div className="flex items-center gap-1.5 mb-3">
            <Sparkles className="h-3 w-3" style={{ color: 'hsl(var(--primary-glow))' }} />
            <span className="font-body text-[10px] uppercase tracking-[0.15em] font-medium" style={{ color: 'hsl(var(--primary-glow))' }}>
              AI-powered
            </span>
          </div>

          <p className="font-display text-card-title italic mb-1" style={{ color: '#FDFCFB' }}>ask your cycle coach</p>
          <p className="font-hand text-sm mb-5" style={{ color: 'rgba(253, 252, 251, 0.5)' }}>what would you like to understand?</p>

          {coachMessages.length === 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {suggestedChips.map((q) => (
                <button
                  key={q}
                  onClick={() => sendCoachMessage(q)}
                  className="touch-btn px-3.5 py-2.5 min-h-[40px] text-left font-body text-xs transition-all rounded-full active:scale-95"
                  style={{
                    color: 'rgba(253, 252, 251, 0.7)',
                    border: '1px solid hsl(var(--primary-soft) / 0.4)',
                    backgroundColor: 'transparent',
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {coachMessages.length > 0 && (
            <div className="space-y-3 mb-4 max-h-[400px] overflow-y-auto">
              {coachMessages.map((msg, i) => (
                <div key={i} className={`${msg.role === "user" ? "ml-8" : "mr-4"}`}>
                  <div className={`rounded-2xl px-4 py-3 ${
                    msg.role === "user"
                      ? "ml-auto"
                      : ""
                  }`}
                  style={{
                    backgroundColor: msg.role === "user" ? 'rgba(127, 91, 135, 0.25)' : 'rgba(253, 252, 251, 0.08)',
                    border: msg.role === "assistant" ? '1px solid rgba(253, 252, 251, 0.1)' : 'none',
                  }}>
                    <p className={`font-body text-sm leading-relaxed ${
                      msg.role === "assistant" ? "font-display italic" : ""
                    }`} style={{ color: '#FDFCFB' }}>
                      {msg.content}
                    </p>
                  </div>
                  <p className="font-mono text-[8px] mt-0.5 px-1" style={{ color: 'rgba(253, 252, 251, 0.3)' }}>
                    {msg.role === "user" ? "you" : "cycle coach"}
                  </p>
                </div>
              ))}
              {coachLoading && (
                <div className="mr-4">
                  <div className="rounded-2xl px-4 py-3" style={{ backgroundColor: 'rgba(253, 252, 251, 0.08)', border: '1px solid rgba(253, 252, 251, 0.1)' }}>
                    <div className="flex gap-1">
                      <div className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: 'rgba(253, 252, 251, 0.3)' }} />
                      <div className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: 'rgba(253, 252, 251, 0.3)', animationDelay: '150ms' }} />
                      <div className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: 'rgba(253, 252, 251, 0.3)', animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="text"
              value={coachInput}
              onChange={(e) => setCoachInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !coachLoading && sendCoachMessage(coachInput)}
              placeholder="ask anything about your cycle..."
              className="flex-1 rounded-xl px-4 py-3 min-h-[44px] font-body text-sm placeholder:opacity-40 focus:outline-none transition-shadow"
              style={{
                fontSize: '16px',
                backgroundColor: 'rgba(253, 252, 251, 0.08)',
                border: '1px solid rgba(253, 252, 251, 0.15)',
                color: '#FDFCFB',
                boxShadow: 'none',
              }}
              onFocus={(e) => { e.currentTarget.style.boxShadow = '0 0 0 2px hsl(284 22% 44%), 0 0 16px rgba(127, 91, 135, 0.3)'; e.currentTarget.style.borderColor = 'hsl(284 22% 44%)'; }}
              onBlur={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'rgba(253, 252, 251, 0.15)'; }}
              disabled={coachLoading}
            />
            <button
              onClick={() => sendCoachMessage(coachInput)}
              disabled={coachLoading || !coachInput.trim()}
              className="touch-btn rounded-xl px-4 py-3 min-w-[44px] min-h-[44px] flex items-center justify-center active:opacity-90 disabled:opacity-30"
              style={{ backgroundColor: 'hsl(var(--primary))' }}
            >
              <Send className="h-4 w-4" style={{ color: '#FDFCFB' }} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Two-column grid for remaining insight cards */}
      <div className="grid grid-cols-1 min-[480px]:grid-cols-2 gap-4">
        {/* Symptom Frequency */}
        {symptomChartData.length > 0 && (
          <motion.div custom={1} initial="hidden" animate="visible" variants={cardVariant} className="card-warm p-5">
            <p className="font-hand text-sm font-bold text-primary mb-1">symptom frequency this cycle</p>
            {topSymptom && (
              <p className="font-body text-xs text-muted-foreground mb-4">
                most logged: <span className="text-foreground font-medium">{topSymptom.name}</span> — {topSymptom.count} times
              </p>
            )}
            <div className="space-y-1.5">
              {symptomChartData.map((d) => (
                <div key={d.name} className="flex items-center gap-2">
                  <span className="font-hand text-[10px] text-muted-foreground w-16 text-right truncate">{d.name}</span>
                  <div className="flex-1 h-3 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(d.count / (topSymptom?.count || 1)) * 100}%`,
                        backgroundColor: PHASE_HEX.menstrual,
                        opacity: 0.7,
                      }}
                    />
                  </div>
                  <span className="font-mono text-[9px] text-muted-foreground w-4">{d.count}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Energy pattern chart */}
        <motion.div custom={2} initial="hidden" animate="visible" variants={cardVariant} className="card-warm p-5">
          <p className="font-hand text-sm font-bold text-primary mb-1">typical energy across cycle</p>
          <p className="font-body text-[11px] text-muted-foreground mb-4 leading-relaxed">
            Estimated energy levels across a 28-day cycle based on hormonal patterns.
          </p>

          <div className="flex gap-2">
            <div className="flex flex-col justify-between py-1 shrink-0">
              <span className="font-mono text-[8px] text-muted-foreground">High</span>
              <span className="font-mono text-[8px] text-muted-foreground">Low</span>
            </div>
            <div className="flex-1">
              <div className="flex items-end gap-[2px] h-24">
                {Array.from({ length: 28 }, (_, i) => {
                  const day = i + 1;
                  const phase = getPhaseFromDay(day);
                  const heights: Record<Phase, number[]> = {
                    menstrual: [30, 25, 20, 25, 30],
                    follicular: [35, 45, 55, 65, 70, 75, 80, 85],
                    ovulatory: [95, 100, 95],
                    luteal: [80, 75, 70, 65, 60, 55, 50, 45, 40, 35, 30, 30],
                  };
                  const phaseDay = phase === "menstrual" ? day - 1 : phase === "follicular" ? day - 6 : phase === "ovulatory" ? day - 14 : day - 17;
                  const h = heights[phase][phaseDay] || 40;

                  return (
                    <div key={day} className="flex-1 rounded-t"
                      style={{ height: `${h}%`, backgroundColor: PHASE_HEX[phase], opacity: 0.6 }}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between font-mono text-[9px] text-muted-foreground mt-1">
                <span>Day 1</span><span>Day 14</span><span>Day 28</span>
              </div>
              <p className="font-mono text-[8px] text-muted-foreground text-center mt-0.5">Day of cycle</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-3 justify-center">
            {(["menstrual", "follicular", "ovulatory", "luteal"] as Phase[]).map(p => (
              <div key={p} className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PHASE_HEX[p], opacity: 0.6 }} />
                <span className="font-body text-[10px] text-muted-foreground capitalize">{p}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
