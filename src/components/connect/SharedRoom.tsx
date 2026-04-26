import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Shield, Send, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { haptic } from "@/hooks/use-mobile";
import { YochSentHeart, YOCH_ICON_MAP } from "./YochAppreciationIcons";
import type { ReflectionCard } from "./PrivateReflection";

interface Message {
  id: string;
  sender_role: string;
  content: string;
  created_at: string;
  metadata?: any;
}

interface SharedReflection {
  id: string;
  partner_role: string;
  cards: ReflectionCard[];
  shared_keys: string[];
  created_at: string;
}

interface TimelineItem {
  id: string;
  kind: "message" | "appreciation" | "reflection";
  sender_role: string;
  created_at: string;
  message?: Message;
  reflection?: SharedReflection;
}

interface Props {
  connectionId: string;
  partnerRole: "member" | "partner";
  partnerName: string;
  myName: string;
  messages: Message[];
  onSendMessage: (text: string) => Promise<void>;
}

export default function SharedRoom({ connectionId, partnerRole, partnerName, myName, messages, onSendMessage }: Props) {
  const [chatInput, setChatInput] = useState("");
  const [sending, setSending] = useState(false);
  const [reflections, setReflections] = useState<SharedReflection[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load shared reflections from DB
  useEffect(() => {
    if (!connectionId) return;
    (supabase.from("connect_reflections" as any) as any)
      .select("id, partner_role, cards, shared_keys, created_at")
      .eq("connection_id", connectionId)
      .order("created_at", { ascending: true })
      .then(({ data }: { data: SharedReflection[] | null }) => {
        if (data) setReflections(data);
      });
  }, [connectionId]);

  // Realtime for new reflections
  useEffect(() => {
    if (!connectionId) return;
    const channel = supabase
      .channel(`reflections-${connectionId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "connect_reflections",
        filter: `connection_id=eq.${connectionId}`,
      }, (payload) => {
        setReflections(prev => {
          if (prev.some(r => r.id === (payload.new as SharedReflection).id)) return prev;
          return [...prev, payload.new as SharedReflection];
        });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [connectionId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, reflections]);

  const handleSend = async () => {
    if (!chatInput.trim() || sending) return;
    const text = chatInput.trim();
    setChatInput("");
    setSending(true);
    haptic("light");
    try {
      await onSendMessage(text);
    } finally {
      setSending(false);
    }
  };

  // Build unified timeline — exclude AI messages
  const partnerMessages = messages.filter(m => m.sender_role !== "ai");

  const reflectionItems: TimelineItem[] = reflections.map(r => ({
    id: `ref-${r.id}`,
    kind: "reflection",
    sender_role: r.partner_role,
    created_at: r.created_at,
    reflection: r,
  }));

  const messageItems: TimelineItem[] = partnerMessages.map(m => ({
    id: m.id,
    kind: m.metadata?.type === "appreciation" ? "appreciation" : "message",
    sender_role: m.sender_role,
    created_at: m.created_at,
    message: m,
  }));

  const timeline = [...reflectionItems, ...messageItems].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const isMe = (senderRole: string) => senderRole === partnerRole;

  return (
    <div className="flex flex-col h-full">
      {/* Timeline */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {timeline.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Shield className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-sm font-medium text-muted-foreground mb-1">Your shared space</p>
            <p className="text-xs text-muted-foreground/60 max-w-xs">
              When you send a reflection or appreciation from the Reflect tab, it appears here for both of you.
            </p>
          </div>
        )}

        {timeline.map(item => {
          const mine = isMe(item.sender_role);
          const displayName = mine ? myName : partnerName;

          /* ── Reflection card ── */
          if (item.kind === "reflection" && item.reflection) {
            const cardsArray = Array.isArray(item.reflection.cards) ? item.reflection.cards : [];
            const sharedCards = cardsArray.filter(
              c => item.reflection!.shared_keys?.includes(c.key)
            );
            if (sharedCards.length === 0) return null;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex flex-col ${mine ? "items-end" : "items-start"}`}
              >
                <span className="text-[10px] text-muted-foreground mb-1.5 px-1">{displayName}</span>
                {sharedCards.map(card => (
                  <div
                    key={card.key}
                    className={`max-w-[85%] rounded-2xl border-2 p-4 mb-1.5 ${
                      mine
                        ? "border-primary/25 bg-primary/5"
                        : "border-violet-500/25 bg-violet-500/5"
                    }`}
                  >
                    {card.label && (
                      <span className={`text-[9px] font-semibold uppercase tracking-wider mb-2 block ${mine ? "text-primary" : "text-violet-500"}`}>
                        {card.label}
                      </span>
                    )}
                    <p className="font-body text-sm text-foreground/85 leading-relaxed">{card.text}</p>
                  </div>
                ))}
                <span className="text-[9px] text-muted-foreground/40 px-1">
                  {new Date(item.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </motion.div>
            );
          }

          /* ── Appreciation ── */
          if (item.kind === "appreciation" && item.message) {
            const msg = item.message;
            const phraseId = msg.metadata?.phrase_id as keyof typeof YOCH_ICON_MAP | undefined;
            const Icon = phraseId ? YOCH_ICON_MAP[phraseId] : YochSentHeart;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex justify-center"
              >
                <div className="max-w-[75%] bg-gradient-to-br from-primary/8 to-violet-500/8 border border-primary/20 rounded-2xl px-5 py-4 text-center">
                  <span className="text-[10px] text-muted-foreground block mb-2">{displayName} sent</span>
                  <Icon className="w-7 h-7 text-primary mx-auto mb-2" />
                  <p className="font-body text-sm font-semibold text-foreground">{msg.content}</p>
                  {msg.metadata?.subtext && (
                    <p className="font-body text-[10px] text-muted-foreground/70 italic mt-1">{msg.metadata.subtext}</p>
                  )}
                  <p className="text-[9px] text-muted-foreground/40 mt-2">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </motion.div>
            );
          }

          /* ── Direct message ── */
          if (item.kind === "message" && item.message) {
            const msg = item.message;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${mine ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                  mine
                    ? "bg-primary text-primary-foreground ml-8"
                    : "bg-card border border-border text-foreground mr-8"
                }`}>
                  {!mine && (
                    <p className="text-[9px] font-semibold text-violet-500 mb-0.5">{displayName}</p>
                  )}
                  <p className="font-body text-sm whitespace-pre-wrap">{msg.content}</p>
                  <p className={`text-[9px] mt-1 ${mine ? "opacity-60" : "text-muted-foreground/40"}`}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </motion.div>
            );
          }

          return null;
        })}

        <div ref={chatEndRef} />
      </div>

      {/* Message input */}
      <div className="flex-none px-4 py-3 border-t border-border bg-background" style={{ paddingBottom: "calc(0.75rem + var(--safe-bottom, 0px))" }}>
        <div className="flex items-end gap-2">
          <textarea
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
            }}
            placeholder={`Message ${partnerName}...`}
            rows={1}
            className="flex-1 resize-none rounded-2xl bg-card border border-border px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/30 transition-colors min-h-[44px] max-h-[120px]"
          />
          <button
            onClick={handleSend}
            disabled={!chatInput.trim() || sending}
            className="w-11 h-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 disabled:opacity-40 transition-opacity active:opacity-80"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
