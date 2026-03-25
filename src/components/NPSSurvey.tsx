import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";

const NPS_SHOWN_KEY = "signal_nps_shown";

export default function NPSSurvey() {
  const { user } = useAuth();
  const { displayName } = useProfile();
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [score, setScore] = useState<number | null>(null);
  const [comment, setComment] = useState("");

  const firstName = displayName?.split(" ")[0] || "there";

  useEffect(() => {
    if (!user) return;
    // Already shown?
    if (localStorage.getItem(NPS_SHOWN_KEY) === "true") return;

    // Check account age >= 7 days
    const createdAt = new Date(user.created_at);
    const daysSince = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince < 7) return;

    // Check if already submitted
    supabase
      .from("nps_responses")
      .select("id")
      .eq("user_id", user.id)
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) {
          localStorage.setItem(NPS_SHOWN_KEY, "true");
          return;
        }
        // Show after 3 seconds
        const timer = setTimeout(() => setVisible(true), 3000);
        return () => clearTimeout(timer);
      });
  }, [user]);

  const handleScore = (s: number) => {
    setScore(s);
    setStep(2);
  };

  const handleSubmit = async (skip = false) => {
    if (score === null || !user) return;
    await supabase.from("nps_responses").insert({
      user_id: user.id,
      score,
      comment: skip ? null : comment.trim() || null,
    });
    localStorage.setItem(NPS_SHOWN_KEY, "true");
    setStep(3);
  };

  const close = () => setVisible(false);

  if (!visible) return null;

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 bg-black/30 z-50"
          />
          {/* Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto"
          >
            <div className="mx-auto w-10 h-1 rounded-full bg-muted-foreground/20 mt-3 mb-2" />
            <div className="px-6 pb-8 pt-2">
              {step === 1 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                  <div>
                    <h2 className="font-display text-xl italic text-foreground">
                      Quick question for you, {firstName}
                    </h2>
                    <p className="font-body text-sm text-muted-foreground mt-1">
                      How likely are you to recommend Signal to a friend?
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex gap-1.5 justify-between">
                      {Array.from({ length: 11 }, (_, i) => (
                        <button
                          key={i}
                          onClick={() => handleScore(i)}
                          className={`w-9 h-9 rounded-full font-mono text-sm font-bold transition-all ${
                            score === i
                              ? "bg-primary text-primary-foreground scale-110"
                              : "bg-secondary text-foreground hover:bg-primary/20"
                          }`}
                        >
                          {i}
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-between">
                      <span className="font-body text-[10px] text-muted-foreground">Not likely</span>
                      <span className="font-body text-[10px] text-muted-foreground">Very likely</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                  <div>
                    <h2 className="font-display text-xl italic text-foreground">Thank you! One more thing.</h2>
                    <p className="font-body text-sm text-muted-foreground mt-1">
                      What's the main reason for your score?
                    </p>
                  </div>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Tell us what you think..."
                    maxLength={1000}
                    className="w-full rounded-xl border border-border bg-secondary/30 p-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[100px] resize-none"
                  />
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleSubmit(false)}
                      className="flex-1 rounded-xl bg-primary px-4 py-3 font-body text-sm font-bold text-primary-foreground"
                    >
                      Submit
                    </button>
                    <button
                      onClick={() => handleSubmit(true)}
                      className="font-body text-xs text-muted-foreground underline"
                    >
                      Skip
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5 text-center py-4">
                  <div>
                    <h2 className="font-display text-xl italic text-foreground">Thank you, {firstName}</h2>
                    <p className="font-body text-sm text-muted-foreground mt-1">
                      Your feedback helps us build Signal into exactly what you need.
                    </p>
                  </div>
                  <button
                    onClick={close}
                    className="rounded-xl bg-primary px-6 py-3 font-body text-sm font-bold text-primary-foreground"
                  >
                    Continue
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
