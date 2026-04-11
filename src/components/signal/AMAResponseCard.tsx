import { motion } from "framer-motion";
import { Lightbulb, ArrowRight, Pill, Leaf, ChefHat, Heart } from "lucide-react";
import type { AMAResponse } from "@/hooks/useAMASignal";
import ReactMarkdown from "react-markdown";
import { haptic } from "@/hooks/use-mobile";

interface Props {
  response: AMAResponse;
  onFollowUp: (question: string) => void;
}

const TYPE_ICONS: Record<string, typeof Pill> = {
  supplement: Pill,
  habit: Heart,
  recipe: ChefHat,
  practice: Leaf,
};

export default function AMAResponseCard({ response, onFollowUp }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-5"
    >
      {/* Answer */}
      <div className="prose prose-sm max-w-none">
        <ReactMarkdown
          components={{
            p: ({ children }) => (
              <p className="font-body text-sm text-foreground/80 leading-relaxed mb-2">{children}</p>
            ),
          }}
        >
          {response.answer}
        </ReactMarkdown>
      </div>

      {/* Insights */}
      {response.insights && response.insights.length > 0 && (
        <div className="rounded-2xl bg-primary/5 p-4 space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <Lightbulb className="h-3.5 w-3.5 text-primary" />
            <p className="font-body text-[10px] uppercase tracking-[0.15em] text-primary font-medium">
              From your data
            </p>
          </div>
          {response.insights.map((insight, i) => (
            <p key={i} className="font-body text-xs text-foreground/70 leading-relaxed pl-5">
              • {insight}
            </p>
          ))}
        </div>
      )}

      {/* Recommendations */}
      {response.recommendations && response.recommendations.length > 0 && (
        <div className="space-y-2">
          <p className="font-body text-[10px] uppercase tracking-[0.15em] text-primary font-medium">
            Try this
          </p>
          {response.recommendations.map((rec, i) => {
            const Icon = TYPE_ICONS[rec.type] || Leaf;
            return (
              <div
                key={i}
                className="flex items-start gap-3 rounded-xl bg-secondary/60 p-3"
              >
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-body text-sm font-medium text-foreground">{rec.name}</p>
                  <p className="font-body text-xs text-muted-foreground leading-relaxed">{rec.reason}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Follow-ups */}
      {response.followUps && response.followUps.length > 0 && (
        <div className="space-y-2 pt-1">
          <p className="font-body text-[10px] uppercase tracking-[0.15em] text-primary/60 font-medium">
            Keep asking
          </p>
          <div className="flex flex-wrap gap-1.5">
            {response.followUps.map((q, i) => (
              <button
                key={i}
                onClick={() => { haptic("light"); onFollowUp(q); }}
                className="group flex items-center gap-1 px-3 py-2 rounded-full bg-secondary border border-border text-foreground font-body text-[11px] leading-tight hover:border-primary/30 transition-all"
              >
                <span>{q}</span>
                <ArrowRight className="h-2.5 w-2.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
