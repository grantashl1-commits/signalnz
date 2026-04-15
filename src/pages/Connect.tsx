import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Link2, ArrowRight, Copy, Check, Users, Send, Bot, ArrowLeft, Loader2, MessageSquare, BookOpen, PenLine } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { haptic } from "@/hooks/use-mobile";
import ReactMarkdown from "react-markdown";
import AppreciationPanel from "@/components/connect/AppreciationPanel";
import ConnectCourseView from "@/components/connect/ConnectCourseView";
import ReflectRoom from "@/components/connect/ReflectRoom";

type ConnectView = "intro" | "create" | "join" | "partner-pin" | "space";
type SpaceTab = "reflect" | "chat" | "course" | "appreciate";
type Message = { id: string; sender_role: string; content: string; created_at: string; metadata?: any };

// Simple hash for PIN (not crypto-grade, but fine for a 4-digit PIN check)
function hashPin(pin: string): string {
  let hash = 0;
  for (let i = 0; i < pin.length; i++) {
    const char = pin.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return String(hash);
}

export default function Connect() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState<ConnectView>("intro");
  const [joinCode, setJoinCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [pin, setPin] = useState(["", "", "", ""]);
  const [partnerName, setPartnerName] = useState("");
  const [loading, setLoading] = useState(false);
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [isPartnerSession, setIsPartnerSession] = useState(false);
  const [partnerDisplayName, setPartnerDisplayName] = useState("");

  // Chat state
  const [spaceTab, setSpaceTab] = useState<SpaceTab>("reflect");
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Check for existing connection on load
  useEffect(() => {
    if (!user) return;
    supabase
      .from("partner_connections_safe")
      .select("*")
      .eq("member_user_id", user.id)
      .eq("status", "linked")
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setConnectionId(data.id);
          setPartnerDisplayName(data.partner_name || "Partner");
          setGeneratedCode(data.join_code);
          setView("space");
        }
      });
  }, [user]);

  // Load messages when connection is active
  useEffect(() => {
    if (!connectionId) return;
    supabase
      .from("connect_messages")
      .select("*")
      .eq("connection_id", connectionId)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (data) setMessages(data as Message[]);
      });

    // Realtime subscription
    const channel = supabase
      .channel(`connect-${connectionId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "connect_messages",
        filter: `connection_id=eq.${connectionId}`,
      }, (payload) => {
        setMessages((prev) => {
          if (prev.some((m) => m.id === (payload.new as Message).id)) return prev;
          return [...prev, payload.new as Message];
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [connectionId]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Generate a random 6-char invite code
  const generateCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      haptic("light");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy — try manually");
    }
  };

  const handlePinChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newPin = [...pin];
    newPin[index] = value.replace(/\D/g, "");
    setPin(newPin);
    if (value && index < 3) {
      document.getElementById(`pin-${index + 1}`)?.focus();
    }
  };

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      document.getElementById(`pin-${index - 1}`)?.focus();
    }
  };

  // ─── Member creates a connection ───
  const handleCreateConnection = async () => {
    if (!user) return;
    const fullPin = pin.join("");
    if (fullPin.length !== 4 || !partnerName.trim()) {
      toast.error("Enter your partner's name and a 4-digit PIN");
      return;
    }
    setLoading(true);
    const code = generateCode();
    const { data, error } = await supabase
      .from("partner_connections")
      .insert({
        member_user_id: user.id,
        partner_name: partnerName.trim(),
        partner_pin_hash: hashPin(fullPin),
        join_code: code,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      toast.error("Something went wrong — try again");
      setLoading(false);
      return;
    }
    setGeneratedCode(code);
    setConnectionId(data.id);
    setView("create");
    setLoading(false);
    haptic("medium");
  };

  // ─── Partner enters join code ───
  const handlePartnerJoin = () => {
    if (joinCode.length !== 6) {
      toast.error("Enter the 6-character code from your partner");
      return;
    }
    haptic("light");
    setView("partner-pin");
  };

  // ─── Partner verifies PIN ───
  const handlePartnerPinVerify = async () => {
    const fullPin = pin.join("");
    if (fullPin.length !== 4) {
      toast.error("Enter the 4-digit PIN");
      return;
    }
    setLoading(true);

    // Use secure RPC to verify PIN without exposing hash
    const { data, error } = await supabase.rpc("verify_partner_pin", {
      _code: joinCode.toUpperCase(),
      _pin_hash: hashPin(fullPin),
    });

    if (error || !data || data.length === 0) {
      toast.error(error ? "Code not found — check with your partner" : "PIN doesn't match — try again");
      setLoading(false);
      return;
    }

    const match = data[0];

    // Link the connection
    if (match.connection_status === "pending") {
      await supabase
        .from("partner_connections")
        .update({ status: "linked", partner_user_id: user?.id || null })
        .eq("id", match.connection_id);
    }

    setConnectionId(match.connection_id);
    setPartnerDisplayName(match.partner_name || "Partner");
    setIsPartnerSession(true);
    setView("space");
    setLoading(false);
    haptic("medium");
    toast.success("Connected! 💜");
  };

  // ─── Send a chat message ───
  const sendMessage = async () => {
    if (!chatInput.trim() || !connectionId) return;
    const text = chatInput.trim();
    setChatInput("");
    const role = isPartnerSession ? "partner" : "member";

    // Optimistic local add
    const tempId = crypto.randomUUID();
    setMessages((prev) => [...prev, { id: tempId, sender_role: role, content: text, created_at: new Date().toISOString() }]);

    await supabase.from("connect_messages").insert({
      connection_id: connectionId,
      sender_role: role,
      content: text,
    });

    // Ask AI for coaching response
    setAiLoading(true);
    try {
      const recentHistory = messages.slice(-10).map((m) => `${m.sender_role}: ${m.content}`).join("\n");
      const { data, error } = await supabase.functions.invoke("connect-ai", {
        body: { message: text, history: recentHistory, connection_id: connectionId },
      });
      if (!error && data?.response) {
        await supabase.from("connect_messages").insert({
          connection_id: connectionId,
          sender_role: "ai",
          content: data.response,
        });
      }
    } catch {
      // Silent fail — AI is optional
    }
    setAiLoading(false);
  };


  // ═══ PARTNER ENTRY (no account needed) ═══
  if (!user) {
    return (
      <div className="min-h-screen pb-24 px-6">
        <div className="flex flex-col items-center pt-16 max-w-sm mx-auto">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <Heart className="w-9 h-9 text-primary" strokeWidth={1.5} />
          </div>
          <h1 className="font-display text-2xl text-foreground text-center mb-2">Signal Connect</h1>
          <p className="text-sm text-muted-foreground text-center mb-8">
            Two people. Two perspectives. One shared wellness journey.
          </p>

          {view === "intro" ? (
            <div className="w-full space-y-4">
              <button
                onClick={() => navigate("/auth")}
                className="w-full bg-primary text-primary-foreground py-3.5 rounded-full text-sm font-semibold"
              >
                Sign in to your Signal account
              </button>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">or</span>
                <div className="flex-1 h-px bg-border" />
              </div>
              <button
                onClick={() => { haptic("light"); setView("join"); }}
                className="w-full bg-card border border-border text-foreground py-3.5 rounded-full text-sm font-medium"
              >
                I have a code from my partner
              </button>
            </div>
          ) : view === "join" ? (
            <div className="w-full space-y-4">
              <p className="text-xs text-muted-foreground text-center">Enter the 6-character code your partner shared with you</p>
              <input
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6))}
                placeholder="ABC123"
                maxLength={6}
                className="w-full text-center text-2xl font-bold tracking-[0.3em] py-4 rounded-xl bg-card border-2 border-border text-foreground focus:border-primary focus:outline-none transition-colors placeholder:text-muted-foreground/30"
              />
              <button
                onClick={handlePartnerJoin}
                disabled={joinCode.length !== 6}
                className="w-full bg-primary text-primary-foreground py-3.5 rounded-full text-sm font-semibold disabled:opacity-40"
              >
                Next
              </button>
              <button onClick={() => setView("intro")} className="text-xs text-muted-foreground mx-auto block">← Back</button>
            </div>
          ) : view === "partner-pin" ? (
            <div className="w-full space-y-4">
              <p className="text-xs text-muted-foreground text-center">Enter your 4-digit PIN</p>
              <div className="flex justify-center gap-3">
                {pin.map((digit, i) => (
                  <input
                    key={i}
                    id={`pin-${i}`}
                    type="password"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handlePinChange(i, e.target.value)}
                    onKeyDown={(e) => handlePinKeyDown(i, e)}
                    className="w-14 h-14 rounded-xl bg-card border-2 border-border text-center text-2xl font-bold text-foreground focus:border-primary focus:outline-none transition-colors"
                  />
                ))}
              </div>
              <button
                onClick={handlePartnerPinVerify}
                disabled={loading || pin.some((d) => !d)}
                className="w-full bg-primary text-primary-foreground py-3.5 rounded-full text-sm font-semibold disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</> : "Enter Connect space"}
              </button>
              <button onClick={() => { setView("join"); setPin(["","","",""]); }} className="text-xs text-muted-foreground mx-auto block">← Back</button>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  // ═══ CONNECTED SPACE (chat) ═══
  // Share to partner callback for course activities
  const shareToPartner = async (text: string) => {
    if (!connectionId) return;
    const role = isPartnerSession ? "partner" : "member";
    await supabase.from("connect_messages").insert({
      connection_id: connectionId,
      sender_role: role,
      content: text,
      metadata: { type: "shared_activity" },
    });
  };

  if (view === "space" && connectionId) {
    const senderRole = isPartnerSession ? "partner" as const : "member" as const;

    return (
      <div className="flex flex-col h-[calc(100vh-var(--header-height)-var(--nav-height))] bg-background">
        {/* Header */}
        <div className="flex-none px-4 py-3 border-b border-border">
          <div className="flex items-center gap-3">
            <button onClick={() => { setView("intro"); setConnectionId(null); }} className="p-1.5 rounded-full hover:bg-muted">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
              <Heart className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">Signal Connect</p>
              <p className="text-[10px] text-muted-foreground">with {partnerDisplayName}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-3 bg-muted/50 rounded-full p-0.5">
            {([
              { key: "reflect" as SpaceTab, label: "Reflect", icon: PenLine },
              { key: "chat" as SpaceTab, label: "Coach", icon: MessageSquare },
              { key: "course" as SpaceTab, label: "Course", icon: BookOpen },
              { key: "appreciate" as SpaceTab, label: "💜", icon: null },
            ]).map((tab) => (
              <button
                key={tab.key}
                onClick={() => { haptic("light"); setSpaceTab(tab.key); }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full text-xs font-medium transition-all ${
                  spaceTab === tab.key
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.icon && <tab.icon className="w-3.5 h-3.5" />}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        {spaceTab === "reflect" && (
          <div className="flex-1 overflow-y-auto">
            <ReflectRoom
              connectionId={connectionId}
              partnerRole={senderRole}
              partnerName={partnerDisplayName}
            />
          </div>
        )}

        {spaceTab === "chat" && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.length === 0 && (
                <div className="text-center py-12">
                  <Bot className="w-10 h-10 text-primary/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground font-medium mb-1">Your coaching space</p>
                  <p className="text-xs text-muted-foreground/60 max-w-xs mx-auto">
                    Ask anything about your relationship, communication, or goals.
                    Your AI coach draws from relationship science and NLP.
                  </p>
                </div>
              )}

              {messages.map((msg) => {
                const isAppreciation = msg.metadata?.type === "appreciation";
                return (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender_role === "ai" ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                        isAppreciation
                          ? "bg-gradient-to-br from-primary/10 to-violet-500/10 border border-primary/20 text-foreground"
                          : msg.sender_role === "ai"
                          ? "bg-card border border-border text-foreground"
                          : msg.sender_role === "partner"
                          ? "bg-primary/20 text-foreground ml-8"
                          : "bg-primary text-primary-foreground ml-8"
                      }`}
                    >
                      {msg.sender_role === "ai" && (
                        <div className="flex items-center gap-1.5 mb-1">
                          <Bot className="w-3 h-3 text-primary" />
                          <span className="text-[10px] font-semibold text-primary">Coach</span>
                        </div>
                      )}
                      {isAppreciation ? (
                        <div className="text-center py-1">
                          <p className="text-sm font-semibold">{msg.content}</p>
                          {msg.metadata?.subtext && (
                            <p className="text-[10px] text-muted-foreground mt-1 italic">{msg.metadata.subtext}</p>
                          )}
                        </div>
                      ) : msg.sender_role === "ai" ? (
                        <div className="prose prose-sm text-sm [&_p]:mb-1 [&_ul]:mt-1">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      )}
                      <p className={`text-[9px] mt-1 ${msg.sender_role === "ai" ? "text-muted-foreground/40" : "opacity-60"}`}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                );
              })}

              {aiLoading && (
                <div className="flex justify-start">
                  <div className="bg-card border border-border rounded-2xl px-4 py-3 flex items-center gap-2">
                    <Bot className="w-3 h-3 text-primary" />
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="flex-none px-4 py-3 border-t border-border bg-background" style={{ paddingBottom: "calc(0.75rem + var(--safe-bottom))" }}>
              <div className="flex items-end gap-2">
                <textarea
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
                  }}
                  placeholder="Ask your coach anything..."
                  rows={1}
                  className="flex-1 resize-none rounded-2xl bg-card border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/30 transition-colors min-h-[44px] max-h-[120px]"
                />
                <button
                  onClick={sendMessage}
                  disabled={!chatInput.trim() || aiLoading}
                  className="w-11 h-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 disabled:opacity-40 transition-opacity"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}

        {spaceTab === "course" && (
          <div className="flex-1 overflow-y-auto">
            <ConnectCourseView
              connectionId={connectionId}
              partnerRole={senderRole}
              partnerName={partnerDisplayName}
              onShareToPartner={shareToPartner}
            />
          </div>
        )}

        {spaceTab === "appreciate" && (
          <div className="flex-1 overflow-y-auto">
            <AppreciationPanel connectionId={connectionId} senderRole={senderRole} />
          </div>
        )}
      </div>
    );
  }

  // ═══ MEMBER INTRO / CREATE ═══
  return (
    <div className="min-h-screen pb-24">
      <AnimatePresence mode="wait">
        {view === "intro" && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center px-6 pt-12 pb-12"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: "spring", damping: 20 }}
              className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-8"
            >
              <Heart className="w-10 h-10 text-primary" strokeWidth={1.5} />
            </motion.div>

            <h1 className="font-display text-3xl md:text-4xl text-foreground text-center mb-3">Signal Connect</h1>
            <p className="text-sm text-muted-foreground text-center max-w-sm mb-2 leading-relaxed">
              Two people. Two perspectives.{"\n"}One shared wellness journey.
            </p>
            <p className="text-xs text-muted-foreground/60 text-center max-w-xs mb-10">
              Invite your partner into a private coaching space — they don't need a Signal account. 
              Just share a code and PIN.
            </p>

            {/* Feature cards */}
            <div className="w-full max-w-sm space-y-3 mb-10">
              {[
                { icon: Users, title: "No account needed", desc: "Your partner joins with a code and 4-digit PIN — that's it" },
                { icon: Bot, title: "AI relationship coach", desc: "Trained on relationship science, NLP, and communication tools" },
                { icon: MessageSquare, title: "Private shared space", desc: "A safe place to reflect, communicate, and grow together" },
              ].map((f) => (
                <div key={f.title} className="flex items-start gap-4 p-4 rounded-2xl bg-card border border-border">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <f.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{f.title}</p>
                    <p className="text-xs text-muted-foreground">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>


            {/* Setup form */}
            <div className="w-full max-w-sm space-y-4">
              <input
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                placeholder="Your partner's name"
                className="w-full rounded-xl bg-card border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary/30 focus:outline-none transition-colors"
              />
              <div>
                <p className="text-xs text-muted-foreground mb-2 text-center">Set a 4-digit PIN for your partner</p>
                <div className="flex justify-center gap-3">
                  {pin.map((digit, i) => (
                    <input
                      key={i}
                      id={`pin-${i}`}
                      type="password"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handlePinChange(i, e.target.value)}
                      onKeyDown={(e) => handlePinKeyDown(i, e)}
                      className="w-14 h-14 rounded-xl bg-card border-2 border-border text-center text-2xl font-bold text-foreground focus:border-primary focus:outline-none transition-colors"
                    />
                  ))}
                </div>
              </div>
              <button
                onClick={handleCreateConnection}
                disabled={loading}
                className="w-full bg-primary text-primary-foreground py-3.5 rounded-full text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : <>Create Connect space <ArrowRight className="w-4 h-4" /></>}
              </button>
            </div>
          </motion.div>
        )}

        {view === "create" && (
          <motion.div
            key="create"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center px-6 pt-20 pb-12"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Link2 className="w-7 h-7 text-primary" />
            </div>
            <h2 className="font-display text-2xl text-foreground text-center mb-2">Share this with your partner</h2>
            <p className="text-sm text-muted-foreground text-center max-w-xs mb-8">
              They'll enter this code and the PIN you set to join your Connect space.
            </p>

            <div className="flex gap-2 mb-4">
              {generatedCode.split("").map((char, i) => (
                <div key={i} className="w-12 h-14 rounded-xl bg-card border-2 border-primary/20 flex items-center justify-center">
                  <span className="text-2xl font-bold text-foreground">{char}</span>
                </div>
              ))}
            </div>

            <button onClick={copyCode} className="flex items-center gap-2 text-sm text-primary font-medium mb-10">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied!" : "Copy code"}
            </button>

            <button
              onClick={() => setView("space")}
              className="bg-primary text-primary-foreground px-8 py-3.5 rounded-full text-sm font-semibold"
            >
              Enter Connect space
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
