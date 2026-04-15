import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Clock, MessageSquare, ArrowRight, Loader2, CheckCircle2, History, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { haptic } from "@/hooks/use-mobile";
import type { ReflectionCard } from "./PrivateReflection";

const ACKNOWLEDGEMENTS = [
  { label: "I hear this", icon: Heart },
  { label: "I need time", icon: Clock },
  { label: "I want to respond carefully", icon: MessageSquare },
];

const CATEGORIES = ["what_happened", "how_i_felt", "what_i_need", "what_i_want_to_say"];
const CATEGORY_LABELS: Record<string, string> = {
  what_happened: "what happened",
  how_i_felt: "how I felt",
  what_i_need: "what I need",
  what_i_want_to_say: "what I want to say",
};

interface Props {
  connectionId: string;
  partnerRole: "member" | "partner";
  partnerName: string;
  myName: string;
  myCards: ReflectionCard[];
  theirCards: ReflectionCard[];
}

export default function SharedRoom({ connectionId, partnerRole, partnerName, myName, myCards, theirCards }: Props) {
  const [acks, setAcks] = useState<Record<string, string>>({});
  const [myResponses, setMyResponses] = useState<Record<string, string>>({});
  const [theirResponses, setTheirResponses] = useState<Record<string, string>>({});
  const [submittedMine, setSubmittedMine] = useState<Record<string, boolean>>({});
  const [submittedTheirs, setSubmittedTheirs] = useState<Record<string, boolean>>({});
  const [nextStep, setNextStep] = useState<{ next_step: string; timeframe: string; why?: string } | null>(null);
  const [loadingStep, setLoadingStep] = useState(false);
  const [committed, setCommitted] = useState(false);
  const [commitments, setCommitments] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load existing commitments
  useEffect(() => {
    if (!connectionId) return;
    (supabase.from("connect_commitments" as any).select("*")
      .eq("connection_id", connectionId).order("committed_at", { ascending: false }) as any)
      .then(({ data }: { data: any[] | null }) => {
        if (data) setCommitments(data);
      });
  }, [connectionId, committed]);

  const pairedCategories = CATEGORIES.filter(
    key => myCards.some(c => c.key === key) || theirCards.some(c => c.key === key)
  );

  const allResponded = pairedCategories.length > 0 &&
    pairedCategories.every(key => submittedMine[key] && submittedTheirs[key]);

  const submitResponse = async (category: string, who: "mine" | "theirs") => {
    const text = who === "mine" ? myResponses[category] : theirResponses[category];
    if (!text?.trim()) return;
    haptic("light");

    if (who === "mine") setSubmittedMine(p => ({ ...p, [category]: true }));
    else setSubmittedTheirs(p => ({ ...p, [category]: true }));

    await (supabase.from("connect_shared_responses" as any) as any).insert({
      connection_id: connectionId,
      category,
      partner_role: who === "mine" ? partnerRole : (partnerRole === "member" ? "partner" : "member"),
      response_text: text,
    });
  };

  const getNextStep = async () => {
    setLoadingStep(true);
    haptic("medium");
    try {
      const summary = pairedCategories.map(key => {
        const myCard = myCards.find(c => c.key === key);
        const theirCard = theirCards.find(c => c.key === key);
        return `[${CATEGORY_LABELS[key]}]\n${myName}: ${myCard?.text || "Not shared"}\n${myName} response: ${myResponses[key] || ""}\n${partnerName}: ${theirCard?.text || "Not shared"}\n${partnerName} response: ${theirResponses[key] || ""}`;
      }).join("\n\n");

      const { data, error } = await supabase.functions.invoke("connect-reflect", {
        body: { journal_entry: summary, mode: "partnership", action: "next_step" },
      });
      if (error) throw error;
      setNextStep(data);
    } catch {
      toast.error("Something went wrong — let's try again");
    } finally {
      setLoadingStep(false);
    }
  };

  const commitToStep = async () => {
    if (!nextStep) return;
    haptic("medium");
    await (supabase.from("connect_commitments" as any) as any).insert({
      connection_id: connectionId,
      next_step: nextStep.next_step,
      timeframe: nextStep.timeframe,
      why: nextStep.why,
    });
    setCommitted(true);
  };

  if (myCards.length === 0 && theirCards.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <Shield className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-sm text-muted-foreground">
          Nothing shared yet. When both of you are ready, this is a safe place to start.
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-6">
      <div className="text-center">
        <p className="font-display text-lg font-bold text-foreground">{myName} & {partnerName}</p>
        <p className="text-xs text-muted-foreground mt-1">Only approved reflections appear here. Read each card and respond in turn.</p>
      </div>

      {/* Side by side cards */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span className="text-[10px] font-semibold text-primary">{myName}</span>
          </div>
          {myCards.length > 0 ? myCards.map(c => (
            <div key={c.key} className="p-3 rounded-xl bg-primary/5 border border-primary/10 mb-2">
              <span className="text-[9px] font-semibold text-primary uppercase tracking-wider">{c.label}</span>
              <p className="text-xs text-foreground/70 mt-1 leading-relaxed">{c.text}</p>
            </div>
          )) : (
            <p className="text-xs text-muted-foreground/60 italic p-3">Not shared yet</p>
          )}
        </div>
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
            <span className="text-[10px] font-semibold text-violet-500">{partnerName}</span>
          </div>
          {theirCards.length > 0 ? theirCards.map(c => (
            <div key={c.key} className="p-3 rounded-xl bg-violet-500/5 border border-violet-500/10 mb-2">
              <span className="text-[9px] font-semibold text-violet-500 uppercase tracking-wider">{c.label}</span>
              <p className="text-xs text-foreground/70 mt-1 leading-relaxed">{c.text}</p>
            </div>
          )) : (
            <p className="text-xs text-muted-foreground/60 italic p-3">Not shared yet</p>
          )}
        </div>
      </div>

      {/* Guided conversation */}
      {pairedCategories.length > 0 && (
        <div className="space-y-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Guided conversation</p>
          {pairedCategories.map(key => (
            <div key={key} className="p-4 rounded-2xl border border-border bg-card">
              <p className="text-xs font-semibold text-foreground mb-3">{CATEGORY_LABELS[key]}</p>

              {/* Acknowledgement chips */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {ACKNOWLEDGEMENTS.map(a => (
                  <button
                    key={a.label}
                    onClick={() => setAcks(p => ({ ...p, [key]: a.label }))}
                    className={`text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1 transition-all ${
                      acks[key] === a.label
                        ? "bg-primary/10 text-primary font-semibold border border-primary/20"
                        : "bg-muted text-muted-foreground border border-transparent"
                    }`}
                  >
                    <a.icon className="w-3 h-3" /> {a.label}
                  </button>
                ))}
              </div>

              {/* My response */}
              <div className="pl-3 border-l-2 border-primary/30 mb-3">
                <span className="text-[9px] font-semibold text-primary">{myName}</span>
                {!submittedMine[key] ? (
                  <div className="mt-1 space-y-1.5">
                    <textarea
                      value={myResponses[key] || ""}
                      onChange={e => setMyResponses(p => ({ ...p, [key]: e.target.value }))}
                      placeholder="Share your perspective..."
                      className="w-full rounded-xl bg-background border border-border px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/40 resize-none min-h-[60px] focus:outline-none focus:border-primary/30"
                    />
                    <button
                      onClick={() => submitResponse(key, "mine")}
                      disabled={!myResponses[key]?.trim()}
                      className="text-[10px] bg-primary text-primary-foreground px-3 py-1.5 rounded-full font-semibold disabled:opacity-30"
                    >
                      Send
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-foreground/60 mt-1">{myResponses[key]}</p>
                )}
              </div>

              {/* Their response — revealed after mine */}
              <AnimatePresence>
                {submittedMine[key] && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="pl-3 border-l-2 border-violet-500/30"
                  >
                    <span className="text-[9px] font-semibold text-violet-500">{partnerName}</span>
                    {!submittedTheirs[key] ? (
                      <div className="mt-1 space-y-1.5">
                        <textarea
                          value={theirResponses[key] || ""}
                          onChange={e => setTheirResponses(p => ({ ...p, [key]: e.target.value }))}
                          placeholder="Share your perspective..."
                          className="w-full rounded-xl bg-background border border-border px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/40 resize-none min-h-[60px] focus:outline-none focus:border-primary/30"
                        />
                        <button
                          onClick={() => submitResponse(key, "theirs")}
                          disabled={!theirResponses[key]?.trim()}
                          className="text-[10px] bg-violet-500 text-white px-3 py-1.5 rounded-full font-semibold disabled:opacity-30"
                        >
                          Send
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-foreground/60 mt-1">{theirResponses[key]}</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}

      {/* Get next step */}
      {allResponded && !nextStep && (
        <div className="text-center">
          <button
            onClick={getNextStep}
            disabled={loadingStep}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-full text-sm font-semibold flex items-center gap-2 mx-auto disabled:opacity-40"
          >
            {loadingStep ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Thinking carefully...</>
            ) : (
              <><ArrowRight className="w-4 h-4" /> Get our next step</>
            )}
          </button>
        </div>
      )}

      {/* Next step commitment */}
      {nextStep && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-violet-500/5 text-center"
        >
          <CheckCircle2 className="w-8 h-8 text-primary/40 mx-auto mb-3" />
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Your next step</p>
          <p className="font-display text-base font-bold text-foreground mb-1">{nextStep.next_step}</p>
          <p className="text-xs text-muted-foreground mb-1">{nextStep.timeframe}</p>
          {nextStep.why && <p className="text-xs text-muted-foreground/70 italic mb-4">{nextStep.why}</p>}
          {!committed ? (
            <button onClick={commitToStep} className="bg-primary text-primary-foreground px-6 py-2.5 rounded-full text-sm font-semibold">
              We commit to this
            </button>
          ) : (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm font-semibold text-primary"
            >
              Committed ✓
            </motion.p>
          )}
        </motion.div>
      )}

      {/* Commitment history */}
      {commitments.length > 0 && (
        <div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-xs text-muted-foreground flex items-center gap-1.5 hover:text-foreground"
          >
            <History className="w-3 h-3" /> Our history ({commitments.length})
          </button>
          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 mt-3"
              >
                {commitments.map((c: any) => (
                  <div key={c.id} className="p-3 rounded-xl border border-border bg-card">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] text-muted-foreground">
                        {new Date(c.committed_at).toLocaleDateString()}
                      </span>
                      <span className="text-[9px] text-muted-foreground">{c.timeframe}</span>
                    </div>
                    <p className="text-xs text-foreground">{c.next_step}</p>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-[9px] text-muted-foreground/50 text-center italic leading-relaxed">
        This AI assistant is not a licensed therapist. It organises your own words — it does not diagnose or advise.
        If you feel unsafe, please contact Women's Refuge (0800 733 843) or Need to Talk (1737).
      </p>
    </div>
  );
}
