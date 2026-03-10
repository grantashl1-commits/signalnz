import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell } from "recharts";
import { Send } from "lucide-react";
import { BotanicalSprig, SeedGeometry, WildStar, CymatiSketch } from "@/components/BotanicalElements";
import { MOOD_ICONS } from "@/components/TrackingIcons";
import { supabase } from "@/integrations/supabase/client";
import {
  Phase, getPhaseFromDay, getLastPeriodStart, getCycleDayForDate, getCycleInfo,
  getSymptomFrequency, getMoodsByPhase, getDayIndicators, getRecentSymptoms,
  PHASE_SHORT, PHASE_LABELS,
} from "@/lib/cycle-utils";
import { haptic } from "@/hooks/use-mobile";

const PHASE_HEX: Record<Phase, string> = {
  menstrual: "#C4526E", follicular: "#5C4A9E", ovulatory: "#C47A8A", luteal: "#9B89B4",
};

const cardVariant = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: 0.08 * i, duration: 0.35 } }),
};

const SUGGESTED_QUESTIONS = [
  "why do I crave sugar before my period?",
  "is my luteal phase too long?",
  "what does my mood pattern tell me?",
];

export default function InsightsTab() {
  const lastPeriod = getLastPeriodStart();
  const info = getCycleInfo(lastPeriod);

  // Cycle Coach state
  const [coachOpen, setCoachOpen] = useState(false);
  const [coachMessages, setCoachMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [coachInput, setCoachInput] = useState("");
  const [coachLoading, setCoachLoading] = useState(false);

  // Cycle timeline data
  const timelineData = useMemo(() => {
    if (!lastPeriod) return [];
    return Array.from({ length: 28 }, (_, i) => {
      const day = i + 1;
      const phase = getPhaseFromDay(day);
      const date = new Date(lastPeriod);
      date.setDate(date.getDate() + day - 1);
      const dateStr = date.toISOString().split("T")[0];
      const indicators = getDayIndicators(dateStr, lastPeriod);
      return { day, phase, ...indicators };
    });
  }, [lastPeriod]);

  // Symptom frequency
  const symptomFreq = useMemo(() => getSymptomFrequency(), []);
  const symptomChartData = useMemo(() => {
    return Object.entries(symptomFreq)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([name, count]) => ({ name, count }));
  }, [symptomFreq]);
  const topSymptom = symptomChartData[0];

  // Mood by phase
  const moodsByPhase = useMemo(() => getMoodsByPhase(), []);

  // Cycle Coach
  const sendCoachMessage = async (text: string) => {
    if (!text.trim()) return;
    haptic("light");
    const userMsg = { role: "user" as const, content: text };
    const updatedMessages = [...coachMessages, userMsg];
    setCoachMessages(updatedMessages);
    setCoachInput("");
    setCoachLoading(true);

    try {
      // Add context to the first message
      const contextPrefix = updatedMessages.length === 1
        ? `[Context: Cycle day ${info.cycleDay}, ${PHASE_SHORT[info.phase]} phase. ${
            getRecentSymptoms(3).flatMap(s => s.symptoms).length > 0
              ? `Recent symptoms: ${getRecentSymptoms(3).flatMap(s => s.symptoms).join(", ")}.`
              : ""
          }]\n\n`
        : "";

      const messagesForAI = updatedMessages.map((m, i) => ({
        role: m.role,
        content: i === 0 ? contextPrefix + m.content : m.content,
      }));

      const { data, error } = await supabase.functions.invoke("cycle-ai", {
        body: { type: "cycle-coach", messages: messagesForAI },
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
      {/* Section A: This Cycle at a Glance */}
      <motion.div custom={0} initial="hidden" animate="visible" variants={cardVariant} className="card-warm p-5">
        <p className="font-hand text-sm font-bold text-primary mb-3">this cycle at a glance</p>
        <div className="flex gap-[2px] h-8 rounded-lg overflow-hidden">
          {timelineData.map((d) => (
            <div
              key={d.day}
              className="flex-1 relative flex flex-col items-center justify-end"
              style={{ backgroundColor: PHASE_HEX[d.phase] }}
              title={`Day ${d.day} — ${PHASE_SHORT[d.phase]}`}
            >
              {d.hasSymptoms && (
                <div className="absolute -top-2 w-1.5 h-1.5 rounded-full bg-foreground/60" />
              )}
              {d.hasMood && (
                <div className="absolute -bottom-2 w-1.5 h-1.5 rounded-full bg-foreground/40" />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between font-mono text-[9px] text-muted-foreground mt-3">
          <span>D1</span><span>D7</span><span>D14</span><span>D21</span><span>D28</span>
        </div>
        <div className="flex gap-3 mt-3 flex-wrap">
          {(["menstrual", "follicular", "ovulatory", "luteal"] as Phase[]).map((p) => (
            <div key={p} className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: PHASE_HEX[p] }} />
              <span className="font-body text-[9px] text-muted-foreground">{PHASE_SHORT[p]}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Section B: Symptom Frequency */}
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

      {/* Section D: Mood Patterns */}
      {Object.values(moodsByPhase).some((m) => Object.keys(m).length > 0) && (
        <motion.div custom={2} initial="hidden" animate="visible" variants={cardVariant} className="card-warm p-5">
          <p className="font-hand text-sm font-bold text-primary mb-3">mood patterns by phase</p>
          <div className="space-y-4">
            {(["menstrual", "follicular", "ovulatory", "luteal"] as Phase[]).map((phase) => {
              const moods = moodsByPhase[phase];
              const entries = Object.entries(moods).sort(([, a], [, b]) => b - a);
              if (entries.length === 0) return null;

              return (
                <div key={phase}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: PHASE_HEX[phase] }} />
                    <span className="font-hand text-xs font-bold" style={{ color: PHASE_HEX[phase] }}>
                      {PHASE_SHORT[phase].toLowerCase()}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {entries.slice(0, 4).map(([mood, count]) => {
                      const Icon = MOOD_ICONS[mood];
                      return (
                        <div key={mood} className="flex items-center gap-1 rounded-full bg-secondary px-2 py-1">
                          {Icon && <Icon size={14} color={PHASE_HEX[phase]} />}
                          <span className="font-hand text-[10px] text-foreground">{mood}</span>
                          <span className="font-mono text-[8px] text-muted-foreground">×{count}</span>
                        </div>
                      );
                    })}
                  </div>
                  {entries.length > 0 && (
                    <p className="font-body text-[10px] text-muted-foreground mt-1 italic">
                      In your {PHASE_SHORT[phase].toLowerCase()} phase you logged {entries[0][0]} {entries[0][1]} {entries[0][1] === 1 ? "time" : "times"}
                      {entries.length > 1 ? ` and ${entries[1][0]} ${entries[1][1]} ${entries[1][1] === 1 ? "time" : "times"}` : ""}.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Section E: Cycle Coach */}
      <motion.div custom={3} initial="hidden" animate="visible" variants={cardVariant}
        className="relative overflow-hidden card-warm"
        style={{ backgroundColor: `${PHASE_HEX[info.phase]}10` }}
      >
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <SeedGeometry size={200} opacity={0.06} />
        </div>

        <div className="relative z-10 p-5">
          <p className="font-display text-lg italic text-foreground mb-1">ask your cycle coach</p>
          <p className="font-hand text-sm text-muted-foreground mb-4">what would you like to understand?</p>

          {/* Suggested questions (before conversation starts) */}
          {coachMessages.length === 0 && (
            <div className="flex flex-col gap-2 mb-4">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendCoachMessage(q)}
                  className="touch-btn card-warm px-4 py-3 min-h-[44px] text-left font-body text-xs text-muted-foreground active:bg-secondary/80 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Conversation */}
          {coachMessages.length > 0 && (
            <div className="space-y-3 mb-4 max-h-[400px] overflow-y-auto">
              {coachMessages.map((msg, i) => (
                <div key={i} className={`${msg.role === "user" ? "ml-8" : "mr-4"}`}>
                  <div className={`rounded-2xl px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-primary/10 ml-auto"
                      : "bg-card border border-border"
                  }`}>
                    <p className={`font-body text-sm leading-relaxed ${
                      msg.role === "assistant" ? "font-display italic" : ""
                    } text-foreground`}>
                      {msg.content}
                    </p>
                  </div>
                  <p className="font-mono text-[8px] text-muted-foreground mt-0.5 px-1">
                    {msg.role === "user" ? "you" : "cycle coach"}
                  </p>
                </div>
              ))}
              {coachLoading && (
                <div className="mr-4">
                  <div className="rounded-2xl px-4 py-3 bg-card border border-border">
                    <div className="flex gap-1">
                      <div className="h-2 w-2 rounded-full bg-muted-foreground/30 animate-pulse" />
                      <div className="h-2 w-2 rounded-full bg-muted-foreground/30 animate-pulse" style={{ animationDelay: "150ms" }} />
                      <div className="h-2 w-2 rounded-full bg-muted-foreground/30 animate-pulse" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={coachInput}
              onChange={(e) => setCoachInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !coachLoading && sendCoachMessage(coachInput)}
              placeholder="ask anything about your cycle..."
              className="flex-1 rounded-xl border border-border bg-background px-4 py-3 min-h-[44px] font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              style={{ fontSize: "16px" }}
              disabled={coachLoading}
            />
            <button
              onClick={() => sendCoachMessage(coachInput)}
              disabled={coachLoading || !coachInput.trim()}
              className="touch-btn rounded-xl px-4 py-3 min-w-[44px] min-h-[44px] flex items-center justify-center active:opacity-90 disabled:opacity-30"
              style={{ backgroundColor: PHASE_HEX[info.phase] }}
            >
              <Send className="h-4 w-4 text-card" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Energy pattern chart */}
      <motion.div custom={4} initial="hidden" animate="visible" variants={cardVariant} className="card-warm p-5">
        <p className="font-hand text-sm font-bold text-primary mb-3">typical energy across cycle</p>
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
          <span>D1</span><span>D14</span><span>D28</span>
        </div>
      </motion.div>
    </div>
  );
}
