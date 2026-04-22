import { useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Moon, Zap, AlertCircle } from "lucide-react";
import { getPhaseFromDay, getCycleDayForDate, Phase, PHASE_SHORT, getPeriodHistory } from "@/lib/cycle-utils";
import { getStructuredSymptoms } from "@/lib/cycle-symptom-utils";

interface Props {
  cycleStartDate: string;
}

interface Insight {
  icon: typeof TrendingUp;
  text: string;
  colour: string;
}

export default function CycleInsights({ cycleStartDate }: Props) {
  const history = useMemo(() => getPeriodHistory(), [cycleStartDate]);
  const stats = useMemo(() => {
    const records = history.slice(0, 6);
    const completed = records.filter((record) => record.lengthDays > 0);
    const average = (values: number[]) => values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : null;
    return {
      records,
      averagePeriod: average(completed.map((record) => record.lengthDays)),
      averageCycle: average(completed.map((record) => record.cycleLengthDays || 0).filter(Boolean)),
      totalSymptoms: completed.reduce((sum, record) => sum + record.symptomCount, 0),
      maxPeriod: Math.max(5, ...completed.map((record) => record.lengthDays)),
    };
  }, [history]);

  const insights = useMemo(() => {
    const result: Insight[] = [];
    const start = new Date(cycleStartDate);
    const today = new Date();
    const totalDays = Math.round((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    if (totalDays < 28) return result; // Need at least one full cycle

    // Analyze patterns
    const phaseSymptoms: Record<Phase, Record<string, number>> = {
      menstrual: {}, follicular: {}, ovulatory: {}, luteal: {},
    };
    const phaseFatigue: Record<Phase, number[]> = {
      menstrual: [], follicular: [], ovulatory: [], luteal: [],
    };
    const phaseMoods: Record<Phase, number[]> = {
      menstrual: [], follicular: [], ovulatory: [], luteal: [],
    };
    let loggedDays = 0;

    for (let i = 0; i < Math.min(totalDays, 84); i++) { // look back up to 3 cycles
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const cycleDay = getCycleDayForDate(cycleStartDate, d);
      const phase = getPhaseFromDay(cycleDay);
      const checkin = getStructuredSymptoms(dateStr);
      
      if (checkin) {
        loggedDays++;
        if (checkin.mood !== undefined) phaseMoods[phase].push(checkin.mood);
        checkin.symptoms.forEach((s) => {
          phaseSymptoms[phase][s.name] = (phaseSymptoms[phase][s.name] || 0) + 1;
          if (s.name.includes("Fatigue") || s.name.includes("energy")) {
            phaseFatigue[phase].push(s.severity);
          }
        });
      }
    }

    if (loggedDays < 7 && history.length === 0) return result; // Need minimum data

    // Insight: Luteal fatigue pattern
    const lutealFatigueCount = phaseSymptoms.luteal["Fatigue / low energy"] || 0;
    if (lutealFatigueCount >= 2) {
      result.push({
        icon: Moon,
        text: `Your luteal phase consistently shows higher fatigue — logged ${lutealFatigueCount} times. This is driven by progesterone and is expected.`,
        colour: "#9B89B4",
      });
    }

    // Insight: Energy peaks
    const follicularMood = phaseMoods.follicular.length > 0
      ? phaseMoods.follicular.reduce((a, b) => a + b, 0) / phaseMoods.follicular.length
      : 0;
    const ovulatoryMood = phaseMoods.ovulatory.length > 0
      ? phaseMoods.ovulatory.reduce((a, b) => a + b, 0) / phaseMoods.ovulatory.length
      : 0;

    if (follicularMood > 2 || ovulatoryMood > 2) {
      result.push({
        icon: Zap,
        text: "Your energy and mood tend to peak in your follicular and ovulatory phases. This is your superpower window.",
        colour: "#5C4A9E",
      });
    }

    // Insight: Headache patterns
    const menstrualHeadache = phaseSymptoms.menstrual["Headache / migraine"] || 0;
    if (menstrualHeadache >= 2) {
      result.push({
        icon: AlertCircle,
        text: `Headaches appear most commonly in your menstrual phase (${menstrualHeadache} times). This is linked to the oestrogen drop.`,
        colour: "#C4526E",
      });
    }

    // Insight: Average cycle length
    const cycleCount = Math.floor(totalDays / 28);
    if (cycleCount >= 1) {
      result.push({
        icon: TrendingUp,
        text: `You have logged ${loggedDays} days across ${cycleCount} cycle${cycleCount > 1 ? "s" : ""}. Keep logging for richer insights.`,
        colour: "#9B89B4",
      });
    }

    return result;
  }, [cycleStartDate, history.length]);

  if (insights.length === 0 && stats.records.length === 0) {
    return (
      <div className="card-warm p-5 text-center">
        <p className="font-display text-base italic text-foreground mb-1">your insights are building</p>
        <p className="font-body text-xs text-muted-foreground leading-relaxed">
          Log symptoms and moods daily for at least one full cycle to see personalised patterns appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="font-display text-base italic text-foreground">your cycle patterns</p>
      {stats.records.length > 0 && (
        <div className="card-warm p-4 space-y-4">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-background/60 border border-border/50 p-3">
              <p className="font-body text-[10px] uppercase tracking-wider text-muted-foreground">avg period</p>
              <p className="font-display text-xl font-bold text-foreground">{stats.averagePeriod ?? "—"}<span className="text-xs font-body text-muted-foreground">d</span></p>
            </div>
            <div className="rounded-xl bg-background/60 border border-border/50 p-3">
              <p className="font-body text-[10px] uppercase tracking-wider text-muted-foreground">avg cycle</p>
              <p className="font-display text-xl font-bold text-foreground">{stats.averageCycle ?? "—"}<span className="text-xs font-body text-muted-foreground">d</span></p>
            </div>
            <div className="rounded-xl bg-background/60 border border-border/50 p-3">
              <p className="font-body text-[10px] uppercase tracking-wider text-muted-foreground">symptoms</p>
              <p className="font-display text-xl font-bold text-foreground">{stats.totalSymptoms}</p>
            </div>
          </div>

          <div className="space-y-2">
            {stats.records.map((record) => (
              <div key={record.id} className="grid grid-cols-[minmax(0,1fr)_84px_42px] items-center gap-2 text-xs">
                <div className="min-w-0">
                  <p className="font-body text-foreground truncate">{record.startDate}</p>
                  <p className="font-body text-[10px] text-muted-foreground">{record.symptomDays} symptom days · {record.moodDays} mood days</p>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(10, (record.lengthDays / stats.maxPeriod) * 100)}%` }} />
                </div>
                <p className="font-body text-right text-muted-foreground">{record.lengthDays}d</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {insights.map((insight, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          className="card-warm p-4 flex items-start gap-3"
        >
          <div className="p-1.5 rounded-full shrink-0" style={{ backgroundColor: `${insight.colour}15` }}>
            <insight.icon className="h-4 w-4" style={{ color: insight.colour }} />
          </div>
          <p className="font-body text-xs text-foreground/80 leading-relaxed">{insight.text}</p>
        </motion.div>
      ))}
    </div>
  );
}
