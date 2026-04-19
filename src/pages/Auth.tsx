import { useEffect, useRef, useState } from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { isDisposableEmail } from "@/lib/disposable-emails";
import signalIcon from "@/assets/pwa-icon-512-purple.png";

// Minimum password length for new accounts. Combined with HIBP leaked-password check
// (enabled in auth settings), this stops credential-stuffing and weak passwords.
const MIN_PASSWORD_LENGTH = 10;
// Public hCaptcha site key — safe to ship in client bundle.
// The matching secret is configured in Cloud → Auth Settings → Bot and Abuse Protection.
const HCAPTCHA_SITE_KEY = "a1ba8d4e-2e56-43d6-9f54-1104cae809d4";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [signupComplete, setSignupComplete] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaRef = useRef<HCaptcha | null>(null);
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      navigate("/account", { replace: true });
    }
  }, [authLoading, user, navigate]);

  const resetCaptcha = () => {
    setCaptchaToken(null);
    captchaRef.current?.resetCaptcha();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaToken) {
      toast.error("Please complete the captcha");
      return;
    }
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
          options: { captchaToken },
        });
        if (error) throw error;
        toast.success("Welcome back!");
        navigate("/account", { replace: true });
      } else {
        // Anti-bot guards on signup (in priority order):
        //   1. hCaptcha challenge (verified server-side by Supabase Auth)
        //   2. Disposable / burner email blocklist (200+ domains)
        //   3. Strong password length (HIBP leaked-password check is server-side)
        //   4. Server side: email verification required, anonymous sign-ups disabled
        if (await isDisposableEmail(email)) {
          toast.error("Please use a permanent email address (no temporary or burner emails)");
          setLoading(false);
          resetCaptcha();
          return;
        }
        if (password.length < MIN_PASSWORD_LENGTH) {
          toast.error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
          setLoading(false);
          resetCaptcha();
          return;
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin, captchaToken },
        });
        if (error) {
          // Surface HIBP rejection nicely
          if (error.message?.toLowerCase().includes("compromised") || error.message?.toLowerCase().includes("pwned")) {
            toast.error("This password has appeared in a known data breach. Please choose a stronger one.");
          } else {
            throw error;
          }
          setLoading(false);
          resetCaptcha();
          return;
        }
        setSignupComplete(true);
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
      resetCaptcha();
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error("Enter your email address first");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth?mode=reset`,
    });
    if (!error) {
      toast.success("Password reset link sent — check your email");
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) throw result.error;
      if (!result.redirected) {
        toast.success("Welcome back!");
        navigate("/account", { replace: true });
      }
    } catch (err: any) {
      console.error("Google OAuth error:", err);
      if (err.message?.includes("cancelled") || err.message?.includes("popup")) {
        toast.error("Sign-in popup was blocked. Please allow popups for this site, or try again.");
      } else {
        toast.error(err.message || "Google sign-in failed");
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <img src={signalIcon} alt="Signal" className="h-20 w-20 mx-auto mb-4" />
          <h1 className="font-display text-2xl italic text-foreground">
            {signupComplete ? "check your email" : isLogin ? "Welcome back" : "Create account"}
          </h1>
          <p className="font-body text-sm text-muted-foreground mt-1">
            {signupComplete
              ? "We've sent a confirmation link. Click it to activate your account, then come back to sign in."
              : isLogin ? "Sign in to continue" : "Join Signal to get started"}
          </p>
        </div>

        {signupComplete ? (
          <motion.div
            className="text-center py-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <button
              onClick={() => { setSignupComplete(false); setIsLogin(true); }}
              className="font-body text-xs text-muted-foreground border border-border rounded-full px-4 py-2 hover:text-foreground transition-colors"
            >
              back to sign in
            </button>
          </motion.div>
        ) : (
          <>
            {/* Google Sign In */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 rounded-xl border border-border bg-card px-4 py-3 min-h-[52px] font-body text-sm font-semibold text-foreground active:opacity-90 transition-opacity disabled:opacity-50 mb-4"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-border" />
              <span className="font-body text-xs text-muted-foreground">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-border bg-card px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <div className="flex flex-col">
                <input
                  type="password"
                  placeholder={isLogin ? "Password" : `Password (min ${MIN_PASSWORD_LENGTH} characters)`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={isLogin ? 6 : MIN_PASSWORD_LENGTH}
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                {isLogin && (
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-[11px] font-body text-muted-foreground/50 hover:text-muted-foreground transition-colors self-end mt-1.5"
                  >
                    forgot password?
                  </button>
                )}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-primary px-4 py-3 min-h-[52px] font-body text-sm font-bold text-primary-foreground active:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? "Please wait…" : isLogin ? "Sign in" : "Create account"}
              </button>
            </form>

            <p className="text-center font-body text-sm text-muted-foreground mt-6">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary font-semibold underline-offset-2 hover:underline"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
}