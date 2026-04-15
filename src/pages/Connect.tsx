import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Link2, ArrowRight, Copy, Check, Users, Send, Bot, ArrowLeft, Loader2, MessageSquare } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { haptic } from "@/hooks/use-mobile";
import ReactMarkdown from "react-markdown";

type ConnectView = "intro" | "create" | "join" | "partner-pin" | "space";
type Message = { id: string; sender_role: string; content: string; created_at: string };

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
      toast.error("Please enter a 6-character code");
      return;
    }
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
  if (view === "space" && connectionId) {
    return (
      <div className="flex flex-col h-[calc(100vh-var(--header-height)-var(--nav-height))] bg-background">
        {/* Header */}
        <div className="flex-none px-4 py-3 border-b border-border flex items-center gap-3">
          <button onClick={() => { setView("intro"); setConnectionId(null); }} className="p-1.5 rounded-full hover:bg-muted">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
            <Heart className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">Signal Connect</p>
            <p className="text-[10px] text-muted-foreground">with {partnerDisplayName} · AI coaching active</p>
          </div>
          {generatedCode && (
            <button onClick={copyCode} className="text-[10px] text-muted-foreground bg-muted px-2 py-1 rounded-full flex items-center gap-1">
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {generatedCode}
            </button>
          )}
        </div>

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

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender_role === "ai" ? "justify-start" : msg.sender_role === "partner" ? "justify-end" : "justify-end"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                  msg.sender_role === "ai"
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
                {msg.sender_role === "ai" ? (
                  <div className="prose prose-sm text-sm [&_p]:mb-1 [&_ul]:mt-1">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm">{msg.content}</p>
                )}
                <p className={`text-[9px] mt-1 ${msg.sender_role === "ai" ? "text-muted-foreground/40" : "opacity-60"}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))}

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

            <h2 className="font-display text-2xl text-foreground text-center mb-2">
              Your partner code
            </h2>
            <p className="text-sm text-muted-foreground text-center max-w-xs mb-8">
              Share this code with your partner. They'll enter it on their Signal app to connect.
            </p>

            {/* Code display */}
            <div className="flex gap-2 mb-6">
              {generatedCode.split("").map((char, i) => (
                <div
                  key={i}
                  className="w-12 h-14 rounded-xl bg-card border-2 border-primary/20 flex items-center justify-center"
                >
                  <span className="text-2xl font-bold text-foreground tracking-wider">{char}</span>
                </div>
              ))}
            </div>

            <button
              onClick={copyCode}
              className="flex items-center gap-2 text-sm text-primary font-medium mb-10"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied!" : "Copy code"}
            </button>

            {/* PIN setup */}
            <div className="w-full max-w-xs">
              <p className="text-xs text-muted-foreground text-center mb-3">
                Set a 4-digit PIN for quick partner switching
              </p>
              <div className="flex justify-center gap-3 mb-8">
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
