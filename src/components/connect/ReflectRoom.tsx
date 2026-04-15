import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, Check, X, PenLine, Shield, Heart, Sparkles, Pause, CheckCircle2, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { haptic } from "@/hooks/use-mobile";
import ReactMarkdown from "react-markdown";
import { isPartnerSession, partnerProxy } from "@/hooks/usePartnerProxy";

interface ReflectRoomProps {
  connectionId: string;
  partnerRole: "member" | "partner";
  partnerName: string;
}

type ReflectStep =
  | "idle"            // No active thread — write new or view past
  | "writing"         // Partner is writing raw text
  | "processing"      // AI is rewriting
  | "review"          // Sender reviews AI rewrite, approve/edit
  | "waiting"         // Sent — waiting for other partner to respond
  | "received"        // Other partner's rewritten message arrived — read & respond
  | "resolved"        // Both marked resolved
  | "space"           // One partner said "I need space"
  | "insight";        // Viewing personal AI insight

interface ThreadMessage {
  id: string;
  sender_role: string;
  raw_text: string;
  rewritten_text: string;
  validation: string;
  explanation: string;
  emotional_flags: string[];
  approved: boolean;
  created_at: string;
}

interface PersonalInsight {
  reflection: string;
  parts_identified: { part: string; behaviour: string; need: string }[];
  question: string;
  affirmation: string;
}

export default function ReflectRoom({ connectionId, partnerRole, partnerName }: ReflectRoomProps) {
  const [step, setStep] = useState<ReflectStep>("idle");
  const [rawText, setRawText] = useState("");
  const [aiResult, setAiResult] = useState<any>(null);
  const [editedRewrite, setEditedRewrite] = useState("");
  const [thread, setThread] = useState<ThreadMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState<PersonalInsight | null>(null);
  const [threadStatus, setThreadStatus] = useState<"active" | "resolved" | "space">("active");
  const scrollRef = useRef<HTMLDivElement>(null);

  const otherRole = partnerRole === "member" ? "partner" : "member";

  // Load existing thread
  useEffect(() => {
    loadThread();

    // Realtime for new messages
    const channel = supabase
      .channel(`reflect-${connectionId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "connect_reflections",
        filter: `connection_id=eq.${connectionId}`,
      }, () => {
        loadThread();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [connectionId]);

  const loadThread = async () => {
    let data: any[] | null = null;
    if (isPartnerSession()) {
      data = await partnerProxy("load_reflections");
    } else {
      const res = await supabase
        .from("connect_reflections")
        .select("*")
        .eq("connection_id", connectionId)
        .order("created_at", { ascending: true });
      data = res.data;
    }

    if (data && data.length > 0) {
      const mapped: ThreadMessage[] = data.map((d: any) => {
        const cards = typeof d.cards === "string" ? JSON.parse(d.cards) : d.cards;
        return {
          id: d.id,
          sender_role: d.partner_role,
          raw_text: d.raw_entry,
          rewritten_text: cards?.rewritten || "",
          validation: cards?.validation || "",
          explanation: cards?.explanation || "",
          emotional_flags: cards?.emotional_flags || [],
          approved: d.shared_keys?.includes("approved") || false,
          created_at: d.created_at,
        };
      });
      setThread(mapped);

      // Check if there's a status marker
      const lastMsg = data[data.length - 1];
      const lastCards = typeof lastMsg.cards === "string" ? JSON.parse(lastMsg.cards) : lastMsg.cards;

      if (lastCards?.status === "resolved") {
        setThreadStatus("resolved");
        setStep("resolved");
      } else if (lastCards?.status === "space") {
        setThreadStatus("space");
        setStep("space");
      } else {
        // Determine what step we're at based on whose turn it is
        const lastSender = lastMsg.partner_role;
        const lastApproved = lastMsg.shared_keys?.includes("approved");
        if (lastSender === partnerRole && lastApproved) {
          // We sent last and it was approved — waiting for them
          setStep("waiting");
        } else if (lastSender === otherRole && lastApproved) {
          // They sent last — our turn to read and respond
          setStep("received");
        } else {
          setStep("idle");
        }
      }
    }
  };

  // Scroll to bottom on thread change
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread, step]);

  // ─── Write and submit raw text to AI ───
  const handleSubmitRaw = async () => {
    if (!rawText.trim()) return;
    setLoading(true);
    setStep("processing");
    haptic("light");

    try {
      const conversationHistory = thread
        .filter(m => m.approved)
        .map(m => `${m.sender_role === "member" ? "Partner A" : "Partner B"}: ${m.rewritten_text}`)
        .join("\n");

      const { data, error } = await supabase.functions.invoke("connect-reflect", {
        body: {
          mode: "rewrite",
          raw_text: rawText,
          conversation_history: conversationHistory || null,
          partner_role: partnerRole === "member" ? "Partner A" : "Partner B",
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setAiResult(data);
      setEditedRewrite(data.rewritten || "");
      setStep("review");
    } catch (e: any) {
      toast.error(e.message || "AI couldn't process — try again");
      setStep("writing");
    }
    setLoading(false);
  };

  // ─── Approve and send rewritten message ───
  const handleApproveAndSend = async () => {
    if (!editedRewrite.trim()) return;
    setLoading(true);
    haptic("medium");

    const cards = {
      validation: aiResult?.validation || "",
      rewritten: editedRewrite,
      explanation: aiResult?.explanation || "",
      emotional_flags: aiResult?.emotional_flags || [],
    };

    if (isPartnerSession()) {
      await partnerProxy("insert_reflection", {
        partner_role: partnerRole,
        raw_entry: rawText,
        cards,
        shared_keys: ["approved"],
      });
    } else {
      await supabase.from("connect_reflections").insert({
        connection_id: connectionId,
        partner_role: partnerRole,
        raw_entry: rawText,
        cards,
        shared_keys: ["approved"],
      });
    }

    setRawText("");
    setAiResult(null);
    setStep("waiting");
    setLoading(false);
    toast.success("Sent to " + partnerName);
  };

  // ─── Mark as resolved ───
  const handleResolve = async () => {
    haptic("medium");
    const resolvePayload = {
      partner_role: partnerRole,
      raw_entry: `[${partnerRole} marked as resolved]`,
      cards: { status: "resolved" },
      shared_keys: ["status"],
    };
    if (isPartnerSession()) {
      await partnerProxy("insert_reflection", resolvePayload);
    } else {
      await supabase.from("connect_reflections").insert({
        connection_id: connectionId,
        ...resolvePayload,
      });
    }
    setThreadStatus("resolved");
    setStep("resolved");
    generateInsight();
  };

  // ─── Need space ───
  const handleNeedSpace = async () => {
    haptic("light");
    const spacePayload = {
      partner_role: partnerRole,
      raw_entry: `[${partnerRole} needs space]`,
      cards: { status: "space" },
      shared_keys: ["status"],
    };
    if (isPartnerSession()) {
      await partnerProxy("insert_reflection", spacePayload);
    } else {
      await supabase.from("connect_reflections").insert({
        connection_id: connectionId,
        ...spacePayload,
      });
    }
    setThreadStatus("space");
    setStep("space");
    generateInsight();
  };

  // ─── Generate personal IFS/inner child insight ───
  const generateInsight = async () => {
    setLoading(true);
    try {
      const myMessages = thread
        .filter(m => m.sender_role === partnerRole)
        .map(m => m.raw_text)
        .join("\n\n");

      const fullConversation = thread
        .filter(m => m.approved)
        .map(m => `${m.sender_role === "member" ? "Partner A" : "Partner B"}: ${m.rewritten_text}`)
        .join("\n");

      const { data, error } = await supabase.functions.invoke("connect-reflect", {
        body: {
          mode: "insight",
          raw_text: myMessages,
          conversation_history: fullConversation,
          partner_role: partnerRole === "member" ? "Partner A" : "Partner B",
        },
      });

      if (!error && data && !data.error) {
        setInsight(data);
        setStep("insight");
      }
    } catch {
      // Insight is a bonus — silent fail is OK
    }
    setLoading(false);
  };

  // ─── Start a new thread (clear old) ───
  const handleNewThread = async () => {
    if (isPartnerSession()) {
      await partnerProxy("delete_reflections");
    } else {
      await supabase
        .from("connect_reflections")
        .delete()
        .eq("connection_id", connectionId);
    }
    setThread([]);
    setThreadStatus("active");
    setInsight(null);
    setStep("writing");
    haptic("light");
  };

  // ═══ RENDER ═══

  // --- IDLE: No active thread ---
  if (step === "idle") {
    return (
      <div className="px-4 py-8 flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <PenLine className="w-7 h-7 text-primary" />
        </div>
        <h3 className="font-display text-xl text-foreground mb-2 text-center">Reflect Together</h3>
        <p className="text-sm text-muted-foreground text-center max-w-xs mb-2 leading-relaxed">
          Write what you're feeling in your own raw words. AI will validate you, then help you express it in a way your partner can truly hear.
        </p>
        <p className="text-xs text-muted-foreground/60 text-center max-w-xs mb-8">
          Nothing gets sent until you approve it. Your raw words stay private.
        </p>
        <button
          onClick={() => { setStep("writing"); haptic("light"); }}
          className="bg-primary text-primary-foreground px-8 py-3 rounded-full text-sm font-semibold"
        >
          Start a reflection
        </button>

        {/* Show received message if waiting for us */}
        {thread.length > 0 && thread[thread.length - 1].sender_role === otherRole && thread[thread.length - 1].approved && (
          <div className="mt-6 w-full max-w-sm">
            <div className="bg-card border border-primary/20 rounded-2xl p-4">
              <p className="text-[10px] text-primary font-semibold mb-2 uppercase tracking-wide">Message from {partnerName}</p>
              <p className="text-sm text-foreground leading-relaxed">{thread[thread.length - 1].rewritten_text}</p>
            </div>
            <button
              onClick={() => setStep("writing")}
              className="mt-3 w-full bg-primary/10 text-primary py-2.5 rounded-full text-sm font-medium"
            >
              Respond
            </button>
          </div>
        )}
      </div>
    );
  }

  // --- WRITING: Raw emotional input ---
  if (step === "writing") {
    return (
      <div className="px-4 py-6 flex flex-col h-full">
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4 text-primary" />
            <p className="text-xs font-semibold text-primary">Private — only you see this</p>
          </div>
          <p className="text-sm text-muted-foreground">
            Write exactly what you're feeling. Don't filter. Don't edit. Let it all out. AI will help you express it safely.
          </p>
        </div>

        {/* Show conversation so far */}
        {thread.filter(m => m.approved).length > 0 && (
          <div className="mb-4 space-y-2 max-h-40 overflow-y-auto">
            {thread.filter(m => m.approved).map((msg) => (
              <div key={msg.id} className={`rounded-xl p-3 text-sm ${
                msg.sender_role === partnerRole
                  ? "bg-primary/10 ml-6"
                  : "bg-card border border-border mr-6"
              }`}>
                <p className="text-[10px] text-muted-foreground mb-1">
                  {msg.sender_role === partnerRole ? "You" : partnerName}
                </p>
                <p className="text-foreground">{msg.rewritten_text}</p>
              </div>
            ))}
          </div>
        )}

        <textarea
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          placeholder="Say what you really feel..."
          autoFocus
          className="flex-1 min-h-[180px] w-full resize-none rounded-2xl bg-card border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/30 transition-colors"
        />

        <div className="flex gap-2 mt-4">
          <button
            onClick={() => { setStep(thread.length > 0 ? "idle" : "idle"); setRawText(""); }}
            className="flex-1 py-3 rounded-full text-sm text-muted-foreground border border-border"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmitRaw}
            disabled={!rawText.trim() || loading}
            className="flex-1 bg-primary text-primary-foreground py-3 rounded-full text-sm font-semibold disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Let AI help me say this
          </button>
        </div>

        {/* Resolve / Space buttons if conversation is active */}
        {thread.filter(m => m.approved).length > 0 && (
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleResolve}
              className="flex-1 py-2.5 rounded-full text-xs font-medium text-primary bg-primary/5 flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> We're good
            </button>
            <button
              onClick={handleNeedSpace}
              className="flex-1 py-2.5 rounded-full text-xs font-medium text-muted-foreground bg-muted/50 flex items-center justify-center gap-1.5"
            >
              <Pause className="w-3.5 h-3.5" /> I need space
            </button>
          </div>
        )}
      </div>
    );
  }

  // --- PROCESSING: AI working ---
  if (step === "processing") {
    return (
      <div className="px-4 py-16 flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 animate-pulse">
          <Sparkles className="w-7 h-7 text-primary" />
        </div>
        <p className="text-sm text-foreground font-medium mb-2">Listening to you...</p>
        <p className="text-xs text-muted-foreground text-center max-w-xs">
          AI is reading what you wrote, validating your feelings, and finding a way to express this that your partner can hear.
        </p>
      </div>
    );
  }

  // --- REVIEW: See validation + rewrite, approve or edit ---
  if (step === "review" && aiResult) {
    return (
      <div className="px-4 py-6 overflow-y-auto">
        {/* Validation */}
        <div className="bg-gradient-to-br from-primary/5 to-violet-500/5 border border-primary/15 rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-1.5 mb-2">
            <Heart className="w-3.5 h-3.5 text-primary" />
            <p className="text-xs font-semibold text-primary">How you feel is valid</p>
          </div>
          <p className="text-sm text-foreground leading-relaxed">{aiResult.validation}</p>
        </div>

        {/* Emotional flags */}
        {aiResult.emotional_flags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {aiResult.emotional_flags.map((flag: string) => (
              <span key={flag} className="px-2.5 py-1 rounded-full bg-muted text-[10px] text-muted-foreground font-medium">
                {flag}
              </span>
            ))}
          </div>
        )}

        {/* Rewrite */}
        <div className="mb-4">
          <p className="text-xs text-muted-foreground mb-2 font-medium">What {partnerName} will see:</p>
          <textarea
            value={editedRewrite}
            onChange={(e) => setEditedRewrite(e.target.value)}
            className="w-full min-h-[100px] resize-none rounded-2xl bg-card border-2 border-primary/20 px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary/40 transition-colors"
          />
          <p className="text-[10px] text-muted-foreground/60 mt-1 italic">You can edit this before sending</p>
        </div>

        {/* Explanation */}
        <div className="bg-muted/30 rounded-xl p-3 mb-6">
          <p className="text-[10px] text-muted-foreground font-semibold mb-1 uppercase tracking-wide">What AI changed</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{aiResult.explanation}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => { setStep("writing"); }}
            className="flex-1 py-3 rounded-full text-sm text-muted-foreground border border-border flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Rewrite
          </button>
          <button
            onClick={handleApproveAndSend}
            disabled={loading || !editedRewrite.trim()}
            className="flex-1 bg-primary text-primary-foreground py-3 rounded-full text-sm font-semibold disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Send to {partnerName}
          </button>
        </div>
      </div>
    );
  }

  // --- WAITING: Sent, waiting for partner ---
  if (step === "waiting") {
    return (
      <div className="px-4 py-8 flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <Check className="w-7 h-7 text-primary" />
        </div>
        <h3 className="font-display text-lg text-foreground mb-2">Sent</h3>
        <p className="text-sm text-muted-foreground text-center max-w-xs mb-6">
          Your message has been delivered to {partnerName}. You'll see their response when they're ready.
        </p>
        <p className="text-xs text-muted-foreground/50 text-center">
          Take a breath. You showed up. That takes courage.
        </p>

        {/* Conversation thread so far */}
        <div className="w-full max-w-sm mt-6 space-y-2">
          {thread.filter(m => m.approved).map((msg) => (
            <div key={msg.id} className={`rounded-xl p-3 text-sm ${
              msg.sender_role === partnerRole
                ? "bg-primary/10 ml-6"
                : "bg-card border border-border mr-6"
            }`}>
              <p className="text-[10px] text-muted-foreground mb-1">
                {msg.sender_role === partnerRole ? "You" : partnerName}
              </p>
              <p className="text-foreground">{msg.rewritten_text}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mt-6 w-full max-w-sm">
          <button
            onClick={handleResolve}
            className="flex-1 py-2.5 rounded-full text-xs font-medium text-primary bg-primary/5 flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> We're good
          </button>
          <button
            onClick={handleNeedSpace}
            className="flex-1 py-2.5 rounded-full text-xs font-medium text-muted-foreground bg-muted/50 flex items-center justify-center gap-1.5"
          >
            <Pause className="w-3.5 h-3.5" /> I need space
          </button>
        </div>
      </div>
    );
  }

  // --- RECEIVED: Partner's message arrived ---
  if (step === "received") {
    const lastFromPartner = [...thread].reverse().find(m => m.sender_role === otherRole && m.approved);
    return (
      <div className="px-4 py-6">
        {/* Full thread */}
        <div className="space-y-2 mb-4">
          {thread.filter(m => m.approved).map((msg) => (
            <div key={msg.id} className={`rounded-xl p-3 text-sm ${
              msg.sender_role === partnerRole
                ? "bg-primary/10 ml-6"
                : "bg-card border border-border mr-6"
            }`}>
              <p className="text-[10px] text-muted-foreground mb-1">
                {msg.sender_role === partnerRole ? "You" : partnerName}
              </p>
              <p className="text-foreground">{msg.rewritten_text}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setStep("writing")}
            className="flex-1 bg-primary text-primary-foreground py-3 rounded-full text-sm font-semibold"
          >
            Respond
          </button>
          <button
            onClick={handleResolve}
            className="py-3 px-5 rounded-full text-xs font-medium text-primary bg-primary/5 flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
          </button>
          <button
            onClick={handleNeedSpace}
            className="py-3 px-4 rounded-full text-xs text-muted-foreground bg-muted/50"
          >
            <Pause className="w-3.5 h-3.5" />
          </button>
        </div>
        <div ref={scrollRef} />
      </div>
    );
  }

  // --- RESOLVED ---
  if (step === "resolved" || step === "space") {
    const isResolved = step === "resolved";
    return (
      <div className="px-4 py-8 flex flex-col items-center">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
          isResolved ? "bg-green-500/10" : "bg-muted"
        }`}>
          {isResolved
            ? <CheckCircle2 className="w-7 h-7 text-green-600" />
            : <Pause className="w-7 h-7 text-muted-foreground" />
          }
        </div>
        <h3 className="font-display text-lg text-foreground mb-2">
          {isResolved ? "Conversation resolved" : "Taking space"}
        </h3>
        <p className="text-sm text-muted-foreground text-center max-w-xs mb-6">
          {isResolved
            ? "You both showed up. That's what matters."
            : "That's OK. Coming back when you're ready is a sign of strength, not weakness."
          }
        </p>

        {/* Personal insight */}
        {loading && !insight && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
            <Loader2 className="w-3 h-3 animate-spin" /> Preparing your personal reflection...
          </div>
        )}

        {insight && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-sm space-y-4 mb-6"
          >
            <div className="bg-gradient-to-br from-violet-500/5 to-primary/5 border border-primary/10 rounded-2xl p-5">
              <div className="flex items-center gap-1.5 mb-3">
                <Sparkles className="w-4 h-4 text-primary" />
                <p className="text-xs font-semibold text-primary">Just for you — tuning in</p>
              </div>
              <p className="text-sm text-foreground leading-relaxed mb-4">{insight.reflection}</p>

              {insight.parts_identified?.length > 0 && (
                <div className="space-y-2 mb-4">
                  {insight.parts_identified.map((part, i) => (
                    <div key={i} className="bg-background/60 rounded-xl p-3">
                      <p className="text-xs font-semibold text-foreground mb-0.5">{part.part}</p>
                      <p className="text-[11px] text-muted-foreground mb-1">{part.behaviour}</p>
                      <p className="text-[11px] text-primary/80 italic">Needs: {part.need}</p>
                    </div>
                  ))}
                </div>
              )}

              {insight.question && (
                <div className="bg-background/40 rounded-xl p-3 mb-3 border-l-2 border-primary/30">
                  <p className="text-xs text-muted-foreground font-medium mb-1">Sit with this:</p>
                  <p className="text-sm text-foreground italic">{insight.question}</p>
                </div>
              )}

              {insight.affirmation && (
                <div className="text-center pt-2 border-t border-primary/10">
                  <p className="text-sm text-primary font-medium italic">"{insight.affirmation}"</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        <button
          onClick={handleNewThread}
          className="bg-primary text-primary-foreground px-8 py-3 rounded-full text-sm font-semibold"
        >
          Start new reflection
        </button>
      </div>
    );
  }

  // --- INSIGHT standalone ---
  if (step === "insight" && insight) {
    return (
      <div className="px-4 py-8 flex flex-col items-center">
        {/* Same insight display as resolved */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm space-y-4"
        >
          <div className="bg-gradient-to-br from-violet-500/5 to-primary/5 border border-primary/10 rounded-2xl p-5">
            <div className="flex items-center gap-1.5 mb-3">
              <Sparkles className="w-4 h-4 text-primary" />
              <p className="text-xs font-semibold text-primary">Your personal insight</p>
            </div>
            <p className="text-sm text-foreground leading-relaxed mb-4">{insight.reflection}</p>
            {insight.parts_identified?.map((part, i) => (
              <div key={i} className="bg-background/60 rounded-xl p-3 mb-2">
                <p className="text-xs font-semibold text-foreground mb-0.5">{part.part}</p>
                <p className="text-[11px] text-muted-foreground">{part.behaviour}</p>
                <p className="text-[11px] text-primary/80 italic">Needs: {part.need}</p>
              </div>
            ))}
            {insight.question && (
              <div className="bg-background/40 rounded-xl p-3 mb-3 border-l-2 border-primary/30">
                <p className="text-sm text-foreground italic">{insight.question}</p>
              </div>
            )}
            {insight.affirmation && (
              <p className="text-center text-sm text-primary font-medium italic pt-2 border-t border-primary/10">
                "{insight.affirmation}"
              </p>
            )}
          </div>
        </motion.div>
        <button
          onClick={handleNewThread}
          className="mt-6 bg-primary text-primary-foreground px-8 py-3 rounded-full text-sm font-semibold"
        >
          Start new reflection
        </button>
      </div>
    );
  }

  return null;
}
