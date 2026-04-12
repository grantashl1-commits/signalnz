import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Link2, ArrowRight, Copy, Check, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { haptic } from "@/hooks/use-mobile";
import SignalLogo from "@/components/SignalLogo";

type ConnectStep = "intro" | "create" | "join" | "linked";

export default function Connect() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<ConnectStep>("intro");
  const [joinCode, setJoinCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [pin, setPin] = useState(["", "", "", ""]);

  // Generate a random 6-char invite code
  const generateCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
    setGeneratedCode(code);
    setStep("create");
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
    // Auto-focus next input
    if (value && index < 3) {
      const next = document.getElementById(`pin-${index + 1}`);
      next?.focus();
    }
  };

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      const prev = document.getElementById(`pin-${index - 1}`);
      prev?.focus();
    }
  };

  const handleJoinSubmit = () => {
    if (joinCode.length !== 6) {
      toast.error("Please enter a 6-character code");
      return;
    }
    haptic("medium");
    // TODO: Validate join code against database
    toast.success("Partner linked! 🎉");
    setStep("linked");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 pb-24">
        <SignalLogo size={80} color="hsl(284, 22%, 44%)" />
        <h2 className="font-display text-xl text-foreground mt-6 mb-2">Sign in to Connect</h2>
        <p className="text-sm text-muted-foreground text-center mb-6">
          You need an account to link with your partner.
        </p>
        <button
          onClick={() => navigate("/auth")}
          className="bg-primary text-primary-foreground px-6 py-3 rounded-full text-sm font-medium"
        >
          Sign in or Sign up
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <AnimatePresence mode="wait">
        {/* ═══ INTRO ═══ */}
        {step === "intro" && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center px-6 pt-16 pb-12"
          >
            {/* Hero */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: "spring", damping: 20 }}
              className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-8"
            >
              <Heart className="w-10 h-10 text-primary" strokeWidth={1.5} />
            </motion.div>

            <motion.h1
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="font-display text-3xl md:text-4xl text-foreground text-center mb-3"
            >
              Signal Connect
            </motion.h1>

            <motion.p
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-sm text-muted-foreground text-center max-w-sm mb-2 leading-relaxed"
            >
              Two people. Two perspectives.{"\n"}One shared wellness journey.
            </motion.p>

            <motion.p
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xs text-muted-foreground/60 text-center max-w-xs mb-10"
            >
              Link your Signal account with your partner so you can share insights,
              track together, and support each other's goals.
            </motion.p>

            {/* Feature cards */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="w-full max-w-sm space-y-3 mb-10"
            >
              {[
                { icon: Users, title: "Separate accounts", desc: "Each partner has their own private Signal experience" },
                { icon: Heart, title: "Shared insights", desc: "Optionally share cycle, mood, and wellness data" },
                { icon: Link2, title: "Quick switch", desc: "Use a PIN to switch between partner views on one device" },
              ].map((f, i) => (
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
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="w-full max-w-sm space-y-3"
            >
              <button
                onClick={() => { haptic("light"); generateCode(); }}
                className="w-full bg-primary text-primary-foreground py-3.5 rounded-full text-sm font-semibold flex items-center justify-center gap-2"
              >
                Create a link code <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => { haptic("light"); setStep("join"); }}
                className="w-full bg-card border border-border text-foreground py-3.5 rounded-full text-sm font-medium"
              >
                I have a code from my partner
              </button>
            </motion.div>
          </motion.div>
        )}

        {/* ═══ CREATE — share code ═══ */}
        {step === "create" && (
          <motion.div
            key="create"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center px-6 pt-20 pb-12"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Link2 className="w-7 h-7 text-primary" />
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
                onClick={() => {
                  if (pin.some((d) => !d)) {
                    toast.error("Enter a 4-digit PIN");
                    return;
                  }
                  haptic("medium");
                  toast.success("Code created! Share it with your partner.");
                }}
                className="w-full bg-primary text-primary-foreground py-3.5 rounded-full text-sm font-semibold"
              >
                Done
              </button>
            </div>

            <button
              onClick={() => setStep("intro")}
              className="mt-6 text-xs text-muted-foreground"
            >
              ← Back
            </button>
          </motion.div>
        )}

        {/* ═══ JOIN — enter code ═══ */}
        {step === "join" && (
          <motion.div
            key="join"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center px-6 pt-20 pb-12"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Users className="w-7 h-7 text-primary" />
            </div>

            <h2 className="font-display text-2xl text-foreground text-center mb-2">
              Enter your partner's code
            </h2>
            <p className="text-sm text-muted-foreground text-center max-w-xs mb-8">
              Ask your partner for their 6-character connect code.
            </p>

            <input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6))}
              placeholder="ABC123"
              maxLength={6}
              className="w-full max-w-[280px] text-center text-3xl font-bold tracking-[0.3em] py-4 px-6 rounded-xl bg-card border-2 border-border text-foreground focus:border-primary focus:outline-none transition-colors mb-4 placeholder:text-muted-foreground/30"
            />

            <p className="text-xs text-muted-foreground mb-8">{joinCode.length}/6 characters</p>

            {/* PIN setup */}
            <div className="w-full max-w-xs mb-8">
              <p className="text-xs text-muted-foreground text-center mb-3">
                Set your 4-digit PIN
              </p>
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
              onClick={handleJoinSubmit}
              disabled={joinCode.length !== 6 || pin.some((d) => !d)}
              className="w-full max-w-xs bg-primary text-primary-foreground py-3.5 rounded-full text-sm font-semibold disabled:opacity-40 transition-opacity"
            >
              Connect with partner
            </button>

            <button
              onClick={() => setStep("intro")}
              className="mt-6 text-xs text-muted-foreground"
            >
              ← Back
            </button>
          </motion.div>
        )}

        {/* ═══ LINKED — success ═══ */}
        {step === "linked" && (
          <motion.div
            key="linked"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center px-6 pt-20 pb-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 15, delay: 0.1 }}
              className="w-20 h-20 rounded-full bg-primary/15 flex items-center justify-center mb-6"
            >
              <Heart className="w-9 h-9 text-primary fill-primary/30" />
            </motion.div>

            <h2 className="font-display text-2xl text-foreground text-center mb-2">
              You're connected! 💜
            </h2>
            <p className="text-sm text-muted-foreground text-center max-w-xs mb-8">
              Your wellness journeys are now linked. You can share insights and support each other.
            </p>

            <button
              onClick={() => navigate("/")}
              className="bg-primary text-primary-foreground px-8 py-3.5 rounded-full text-sm font-semibold"
            >
              Go to Home
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
