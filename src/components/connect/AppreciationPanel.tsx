import { useState } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { haptic } from "@/hooks/use-mobile";
import { YOCH_ICON_MAP, YochSentHeart } from "./YochAppreciationIcons";

/* ─── Research-backed phrases ───
 * Sourced from Gottman's "turning toward" research, NVC needs,
 * and common themes in relationship counselling about what
 * partners wish they heard more often.
 */

export interface AppreciationPhrase {
  id: keyof typeof YOCH_ICON_MAP;
  phrase: string;
  subtext: string;
  /** Soft watercolor wash background */
  wash: string;
  /** Pen colour */
  ink: string;
  category: "safety" | "seen" | "valued" | "loved" | "gratitude";
}

export const APPRECIATION_PHRASES: AppreciationPhrase[] = [
  // What women wish they heard more
  { id: "see-you", phrase: "I see you", subtext: "I notice everything you do", wash: "bg-[hsl(270_35%_92%)]", ink: "text-[hsl(270_30%_40%)]", category: "seen" },
  { id: "enough", phrase: "You are enough", subtext: "Exactly as you are, right now", wash: "bg-[hsl(35_55%_90%)]", ink: "text-[hsl(25_45%_38%)]", category: "valued" },
  { id: "listening", phrase: "I'm listening", subtext: "Tell me more — I want to understand", wash: "bg-[hsl(200_40%_92%)]", ink: "text-[hsl(210_35%_38%)]", category: "seen" },
  { id: "not-alone", phrase: "You don't have to do it all", subtext: "Let me carry some of this with you", wash: "bg-[hsl(150_30%_90%)]", ink: "text-[hsl(160_30%_32%)]", category: "safety" },
  { id: "here-for-you", phrase: "I'm here for you", subtext: "No matter what — I'm not going anywhere", wash: "bg-[hsl(220_35%_92%)]", ink: "text-[hsl(225_35%_38%)]", category: "safety" },

  // What men wish they heard more
  { id: "proud", phrase: "I'm proud of you", subtext: "I see how hard you try", wash: "bg-[hsl(345_50%_92%)]", ink: "text-[hsl(345_40%_42%)]", category: "valued" },
  { id: "trust", phrase: "I trust you", subtext: "I believe in your judgment", wash: "bg-[hsl(140_30%_90%)]", ink: "text-[hsl(150_30%_32%)]", category: "valued" },
  { id: "safe", phrase: "You make me feel safe", subtext: "Being with you feels like home", wash: "bg-[hsl(355_50%_92%)]", ink: "text-[hsl(350_40%_42%)]", category: "loved" },
  { id: "believe", phrase: "I believe in you", subtext: "Even when you don't believe in yourself", wash: "bg-[hsl(45_60%_90%)]", ink: "text-[hsl(35_50%_38%)]", category: "valued" },
  { id: "thank-you", phrase: "Thank you for being you", subtext: "Not for what you do — for who you are", wash: "bg-[hsl(290_35%_92%)]", ink: "text-[hsl(285_30%_42%)]", category: "gratitude" },

  // Universal / Gottman-inspired
  { id: "love-unsaid", phrase: "I love you — even when I forget to say it", subtext: "It's always there, underneath everything", wash: "bg-[hsl(10_55%_92%)]", ink: "text-[hsl(355_45%_42%)]", category: "loved" },
  { id: "choose-you", phrase: "I'd choose you again", subtext: "Every single time", wash: "bg-[hsl(240_25%_92%)]", ink: "text-[hsl(245_30%_42%)]", category: "loved" },
];

interface Props {
  connectionId: string;
  senderRole: "member" | "partner";
}

export default function AppreciationPanel({ connectionId, senderRole }: Props) {
  const [sending, setSending] = useState<string | null>(null);
  const [sent, setSent] = useState<Set<string>>(new Set());

  const sendAppreciation = async (phrase: AppreciationPhrase) => {
    if (sending) return;
    setSending(phrase.id);
    haptic("medium");

    try {
      await supabase.from("connect_messages").insert({
        connection_id: connectionId,
        sender_role: senderRole,
        content: phrase.phrase,
        metadata: {
          type: "appreciation",
          phrase_id: phrase.id,
          subtext: phrase.subtext,
        },
      });
      setSent((prev) => new Set(prev).add(phrase.id));
      toast.success("Sent", {
        icon: <YochSentHeart className="w-5 h-5 text-primary" />,
      });
    } catch {
      toast.error("Couldn't send — try again");
    }
    setSending(null);
  };

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="text-center">
        <p className="font-display text-lg font-bold text-foreground">I appreciate you</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
          Sometimes the most powerful thing is hearing what usually goes unsaid. Tap to send.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {APPRECIATION_PHRASES.map((phrase) => {
          const isSent = sent.has(phrase.id);
          const isSending = sending === phrase.id;
          const Icon = YOCH_ICON_MAP[phrase.id];

          return (
            <motion.button
              key={phrase.id}
              onClick={() => sendAppreciation(phrase)}
              disabled={isSending}
              whileTap={{ scale: 0.95 }}
              className={`relative p-4 rounded-2xl border text-left transition-all ${
                isSent
                  ? "border-primary/30 bg-primary/5"
                  : "border-border bg-card hover:border-primary/20 active:scale-[0.98]"
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl ${phrase.wash} flex items-center justify-center mb-3`}>
                <Icon className={`w-7 h-7 ${phrase.ink}`} />
              </div>
              <p className="font-display text-sm font-bold text-foreground leading-tight">{phrase.phrase}</p>
              <p className="text-[10px] text-muted-foreground mt-1 leading-snug">{phrase.subtext}</p>

              {isSent && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center"
                >
                  <YochSentHeart className="w-5 h-5 text-primary" />
                </motion.div>
              )}

              {isSending && (
                <div className="absolute inset-0 rounded-2xl bg-background/50 flex items-center justify-center">
                  <Send className="w-4 h-4 text-primary animate-pulse" />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      <p className="text-[10px] text-muted-foreground/50 text-center italic">
        Based on Gottman's turning-toward research & what partners wish they heard more
      </p>
    </div>
  );
}
